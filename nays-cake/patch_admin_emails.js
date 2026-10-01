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

    // Pola 1: primaryEmail === "riskalfadhilla215@gmail.com"
    content = content.replace(
      /primaryEmail === "riskalfadhilla215@gmail\.com"/g,
      '["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(primaryEmail)'
    );

    // Pola 2: primaryEmail !== "riskalfadhilla215@gmail.com"
    content = content.replace(
      /primaryEmail !== "riskalfadhilla215@gmail\.com"/g,
      '!["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(primaryEmail)'
    );

    // Pola 3: user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com"
    content = content.replace(
      /user\?\.primaryEmailAddress\?\.emailAddress === "riskalfadhilla215@gmail\.com"/g,
      '["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(user?.primaryEmailAddress?.emailAddress || "")'
    );

    fs.writeFileSync(file, content);
    console.log(`Patched: ${file}`);
  }
});
