const fs = require('fs');

const file = 'src/components/dashboard/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Calculator to imports
content = content.replace('ClipboardList\n} from "lucide-react";', 'ClipboardList,\n  Calculator\n} from "lucide-react";');

// Add Kasir to navigation
const navArrayStart = 'const navigation = [';
const navItem = '  { name: "Kasir", href: "/dashboard/kasir", icon: Calculator },\n';
content = content.replace(navArrayStart, navArrayStart + '\n' + navItem);

fs.writeFileSync(file, content);
