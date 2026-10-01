const fs = require('fs');

function patchMobileNav() {
  const file = 'src/components/MobileNav.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Add useUser to import
  content = content.replace('useAuth, useClerk, SignIn', 'useAuth, useClerk, SignIn, useUser');
  
  // Extract user inside the component
  content = content.replace('const clerk = useClerk();', 'const clerk = useClerk();\n  const { user } = useUser();\n  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";');
  
  // Conditionally replace Katalog with Kasir
  const navItemsOld = `{ name: "Katalog", href: "/catalog", icon: PackageSearch },`;
  const navItemsNew = `...(isAdmin 
      ? [{ name: "Kasir", href: "/dashboard/kasir", icon: PackageSearch }]
      : [{ name: "Katalog", href: "/catalog", icon: PackageSearch }]),`;
  content = content.replace(navItemsOld, navItemsNew);
  
  fs.writeFileSync(file, content);
}

function patchDesktopNav() {
  const file = 'src/components/DesktopNav.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Add useUser to import
  content = content.replace('useAuth, UserButton, useClerk', 'useAuth, UserButton, useClerk, useUser');
  
  // Extract user inside the component
  content = content.replace('const { openSignIn } = useClerk();', 'const { openSignIn } = useClerk();\n  const { user } = useUser();\n  const isAdmin = user?.primaryEmailAddress?.emailAddress === "riskalfadhilla215@gmail.com";');
  
  // Conditionally replace Katalog with Kasir
  const navItemsOld = `{ name: "Katalog", href: "/catalog", icon: PackageSearch },`;
  const navItemsNew = `...(isAdmin 
      ? [{ name: "Kasir", href: "/dashboard/kasir", icon: PackageSearch }]
      : [{ name: "Katalog", href: "/catalog", icon: PackageSearch }]),`;
  content = content.replace(navItemsOld, navItemsNew);
  
  fs.writeFileSync(file, content);
}

patchMobileNav();
patchDesktopNav();
