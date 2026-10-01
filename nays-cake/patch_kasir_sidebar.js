const fs = require('fs');

const file = 'src/app/dashboard/kasir/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Sidebar import
content = content.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport { Sidebar } from '@/components/dashboard/sidebar';");

// Modify loading return
content = content.replace('if (loading) return <div className="p-8 text-center text-sm font-medium text-gray-500">Memuat Sistem Kasir...</div>;', 'if (loading) return <Sidebar><div className="p-8 text-center text-sm font-medium text-gray-500">Memuat Sistem Kasir...</div></Sidebar>;');

// Wrap main return with Sidebar
content = content.replace('return (\n    <div className="min-h-screen', 'return (\n    <Sidebar>\n    <div className="min-h-screen');

// We also need to find the final closing tag for the main component to add </Sidebar>
// The file is KasirNayscake component, so we just append </Sidebar> before the very last `)` or `);` or `}`? No, wait. 
// A safer way is to just replace the very last `</div>` or whatever closes the return.
