const fs = require('fs');
const file = 'src/app/dashboard/kasir/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/    <\/div>\n  \);\n}/g, '    </div>\n    </Sidebar>\n  );\n}');

fs.writeFileSync(file, content);
