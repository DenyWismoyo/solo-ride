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

        // We need to find places where we have:
        // const isPending = ...;
        //   <div
        //     key={order.id}
        // or similar (missing return () )

        if (!content.includes('return (\n              <div\n                key={order.id}')) {
          content = content.replace(/\n\s*<div\n\s*key={order\.id}/g, '\n            return (\n              <div\n                key={order.id}');
          fs.writeFileSync(filePath, content);
          console.log("Fixed return in " + file);
        }
      }
    });
  }
});
