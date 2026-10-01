const fs = require('fs');

const files = [
  'src/lib/api.ts',
  'src/app/profil/page.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/auth-sync/page.tsx',
  'src/components/MobileNav.tsx',
  'src/components/AuthButton.tsx',
  'src/components/DesktopNav.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Menambahkan email ketiga ke dalam Array includes
    content = content.replace(
      /\["riskalfadhilla215@gmail\.com", "nayscake16@gmail\.com"\]/g,
      '["riskalfadhilla215@gmail.com", "nayscake16@gmail.com", "atinayscake@gmail.com"]'
    );

    fs.writeFileSync(file, content);
    console.log(`Updated Admin Array: ${file}`);
  }
});
