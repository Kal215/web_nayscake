const fs = require('fs');
const files = [
  'src/app/keranjang/page.tsx',
  'src/components/FloatingCart.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Ubah https://web.whatsapp.com/send menjadi https://api.whatsapp.com/send
    // api.whatsapp.com akan memicu App Desktop jika terinstal, dan fallback ke Web
    content = content.replace(
      /https:\/\/web\.whatsapp\.com\/send\?phone=\$\{nomorBot\}&text=\$\{teks\}/g,
      'https://api.whatsapp.com/send?phone=${nomorBot}&text=${teks}'
    );
    
    // Ganti window.location.assign dengan window.open untuk mencegah "diam" 
    // jika assign diblokir oleh popup/webview.
    content = content.replace(
      /window\.location\.assign\(waUrl\);/g,
      'window.open(waUrl, "_blank");'
    );
    
    fs.writeFileSync(file, content);
  }
});
