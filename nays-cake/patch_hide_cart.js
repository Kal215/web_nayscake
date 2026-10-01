const fs = require('fs');

const file = 'src/components/FloatingCart.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Menghapus blok UI khusus Mobile (yang <div className="lg:hidden ..."> sampai sebelum {/* Di Desktop/Laptop: ... */})
  const startTag = '{/* Di HP: Klik tombol langsung lompat ke halaman /keranjang */}';
  const endTag = '{/* Di Desktop/Laptop: Tampilkan Tombol Floating yang memanggil Drawer Laci */}';
  
  if (content.includes(startTag) && content.includes(endTag)) {
    const part1 = content.split(startTag)[0];
    const part2 = content.split(endTag)[1];
    content = part1 + endTag + part2;
  }
  
  // Mengubah hidden lg:block menjadi hidden md:block agar Tablet juga dapat porsi yang sama dengan PC
  content = content.replace('<div className="hidden lg:block">', '<div className="hidden md:block">');

  fs.writeFileSync(file, content);
}
