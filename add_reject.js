const fs = require('fs');
const path = require('path');

const workspacesDir = path.join(__dirname, 'src', 'components', 'government', 'workspaces');
const workspaces = fs.readdirSync(workspacesDir);

workspaces.forEach(ws => {
  const wsPath = path.join(workspacesDir, ws);
  if (fs.statSync(wsPath).isDirectory()) {
    const files = fs.readdirSync(wsPath);
    files.forEach(file => {
      if (file.endsWith('Workspace.tsx')) {
        const filePath = path.join(wsPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if handleReject already exists
        if (!content.includes('const handleReject')) {
          // Find the dispatchingId state declaration to insert handleReject after
          // Wait, better to insert it right before the return statement of the component
          
          const handleRejectCode = `
  const handleReject = async (orderId: string) => {
    const reason = prompt("Masukkan alasan penolakan:");
    if (!reason) return;
    
    setDispatchingId(orderId);
    try {
      await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
        status: "cancelled",
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
      alert("Permohonan berhasil ditolak.");
    } catch (err: any) {
      alert(\`Gagal menolak: \${err.message || err}\`);
    } finally {
      setDispatchingId(null);
    }
  };
`;

          // find return (
          const returnIndex = content.lastIndexOf('return (');
          if (returnIndex !== -1 && content.includes('setDispatchingId')) {
             content = content.slice(0, returnIndex) + handleRejectCode + '\n  ' + content.slice(returnIndex);
          }

          // Insert XCircle to lucide-react import
          if (!content.includes('XCircle')) {
             content = content.replace(/import {([^}]+)} from "lucide-react";/, (match, p1) => {
                return `import {${p1}, XCircle} from "lucide-react";`;
             });
          }

          // Insert Reject button
          // Find the verification button
          // Example:
          // <Button
          //   size="sm"
          //   onClick={() => order.id && handleApproveAndDispatch(order.id)}
          const rejectBtn = `
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => order.id && handleReject(order.id)}
                      disabled={dispatchingId === order.id}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Tolak
                    </Button>
`;
          content = content.replace(/(<Button[^>]+onClick={\(\) => order\.id && handle[A-Za-z0-9_]+\(order\.id(,\s*[^)]+)?\)}[^>]*>[\s\S]*?<\/Button>)/, (match) => {
             // ensure we only insert it for the main approve button that has dispatchingId
             if (match.includes('dispatchingId === order.id') && !match.includes('Tolak')) {
                return rejectBtn + match;
             }
             return match;
          });

          fs.writeFileSync(filePath, content);
          console.log("Updated " + file);
        }
      }
    });
  }
});
