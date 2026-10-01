const fs = require('fs');
const file = 'src/app/dashboard/kasir/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace loading
content = content.replace(
  'if (loading) return <div className="p-8 text-center text-sm font-medium text-gray-500">Memuat Sistem Kasir...</div>;',
  'if (loading) return <Sidebar><div className="p-8 text-center text-sm font-medium text-gray-500">Memuat Sistem Kasir...</div></Sidebar>;'
);

// Replace main return
content = content.replace(
  'return (\n    <div className="min-h-screen',
  'return (\n    <Sidebar>\n    <div className="min-h-screen'
);

fs.writeFileSync(file, content);
