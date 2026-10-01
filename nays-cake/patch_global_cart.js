const fs = require('fs');
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

// Tambahkan import FloatingCart jika belum ada
if (!content.includes('import FloatingCart')) {
  content = content.replace(
    /import MobileNav from "@\/components\/MobileNav";/,
    'import MobileNav from "@/components/MobileNav";\nimport FloatingCart from "@/components/FloatingCart";'
  );
}

// Injeksi FloatingCart di bawah MobileNav
if (!content.includes('<FloatingCart />')) {
  content = content.replace(
    /<MobileNav \/>/,
    '<MobileNav />\n        <FloatingCart />'
  );
}

fs.writeFileSync('src/app/layout.tsx', content);
