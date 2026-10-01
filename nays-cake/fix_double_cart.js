const fs = require('fs');
let content = fs.readFileSync('src/app/catalog/page.tsx', 'utf8');

if (content.includes('<FloatingCart />')) {
  content = content.replace(/<FloatingCart \/>/g, '');
  fs.writeFileSync('src/app/catalog/page.tsx', content);
}
