const fs = require('fs');

function revertNav(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  const oldLogic = `...(isAdmin \n      ? [{ name: "Kasir", href: "/dashboard/kasir", icon: PackageSearch }]\n      : [{ name: "Katalog", href: "/catalog", icon: PackageSearch }]),`;
  const oldLogicFallback = `...(isAdmin \n      ? [{ name: "Kasir", href: "/dashboard/kasir", icon: PackageSearch }]\n      : [{ name: "Katalog", href: "/catalog", icon: PackageSearch }])`;
  
  const newLogic = `{ name: "Katalog", href: "/catalog", icon: PackageSearch },`;

  if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
  } else if (content.includes(oldLogicFallback)) {
    content = content.replace(oldLogicFallback, newLogic);
  }
  
  fs.writeFileSync(file, content);
}

revertNav('src/components/MobileNav.tsx');
revertNav('src/components/DesktopNav.tsx');
