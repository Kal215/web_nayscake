const fs = require('fs');
let content = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!content.includes('DesktopNav')) {
  content = content.replace(
    'import MobileNav from "@/components/MobileNav";',
    'import MobileNav from "@/components/MobileNav";\nimport DesktopNav from "@/components/DesktopNav";'
  );
  content = content.replace(
    '{/* Konten Utama */}',
    '<DesktopNav />\n          {/* Konten Utama */}'
  );
  // Beri margin atas pada main agar tidak tertutup navbar (khusus lg/desktop)
  content = content.replace(
    '<main className="flex-1 w-full">',
    '<main className="flex-1 w-full lg:pt-16">'
  );
  fs.writeFileSync('src/app/layout.tsx', content);
}
