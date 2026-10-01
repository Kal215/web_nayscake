const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Cari menu Desktop di Navbar (Katalog)
if (content.includes('href="/catalog"')) {
  // Tambahkan menu Keranjang di sebelahnya
  content = content.replace(
    '<Link href="/catalog" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Katalog</Link>',
    '<Link href="/catalog" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Katalog</Link>\n                <Link href="/keranjang" className="text-gray-600 hover:text-amber-600 font-medium transition-colors">Keranjang</Link>'
  );
  fs.writeFileSync('src/app/page.tsx', content);
  console.log("Navbar PC berhasil di-patch dengan menu Keranjang!");
} else {
  console.log("Gagal menemukan target patch di Navbar PC.");
}
