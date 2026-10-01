const fs = require('fs');

function patchWA(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the WA URL definition
  content = content.replace(
    /const waUrl = isMobile[\s\S]*?\? `whatsapp:\/\/send\?phone=\$\{nomorBot\}&text=\$\{teks\}`[\s\S]*?: `https:\/\/api\.whatsapp\.com\/send\?phone=\$\{nomorBot\}&text=\$\{teks\}`;/g,
    `// Menggunakan Universal Link mutakhir (wa.me) agar lolos blokir Webview HP & Safari
    const waUrl = isMobile 
      ? \`https://wa.me/\${nomorBot}?text=\${teks}\`
      : \`https://api.whatsapp.com/send?phone=\${nomorBot}&text=\${teks}\`;`
  );
  
  // Wait, I should also ensure we are passing the encoded text safely although it's pre-encoded.
  // Actually, wait, `wa.me` needs the ?text= to be standard.
  fs.writeFileSync(file, content);
}

patchWA('src/app/keranjang/page.tsx');
patchWA('src/components/FloatingCart.tsx');
