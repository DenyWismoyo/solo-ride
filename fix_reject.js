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

        // Check if there is a misplaced handleReject
        // We look for '  const handleReject = async (orderId: string) => {'
        const rejectStr = `  const handleReject = async (orderId: string) => {
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
  };`;

        if (content.includes(rejectStr)) {
           // Remove all instances of it
           content = content.replace(new RegExp(rejectStr.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), '');

           // Now properly insert it
           // Look for the first "return (" that belongs to the component.
           // A safe way is to find "const handle" and insert it before the last "return (" ? No, the first "return ("
           // The component return is usually the first "return (" that is not inside another function.
           // Let's find "return (" and ensure it's the one preceded by some component code.
           // Actually, finding `const [dispatchingId, setDispatchingId] = useState` and inserting after it is safer.
           const insertIndex = content.indexOf('const [dispatchingId, setDispatchingId] = useState');
           if (insertIndex !== -1) {
              const endOfLine = content.indexOf('\n', insertIndex);
              content = content.slice(0, endOfLine + 1) + '\n' + rejectStr + '\n' + content.slice(endOfLine + 1);
           }
           
           // Clean up leftover "return (" if any
           content = content.replace(/\n\s*return \(\n\s*<div\n\s*key={order\.id}/g, '\n              <div\n                key={order.id}');

           fs.writeFileSync(filePath, content);
           console.log("Fixed " + file);
        }
      }
    });
  }
});
