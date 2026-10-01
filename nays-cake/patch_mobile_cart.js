const fs = require('fs');

function patchFile(file, isFloatingCart) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Perbaiki logika WhatsApp
  const oldWaLogic = `window.open(waUrl, "_blank");`;
  const newWaLogic = `if (isMobile) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, "_blank");
    }`;
  content = content.replace(oldWaLogic, newWaLogic);

  // Jika ini FloatingCart, ubah UI Mobile
  if (isFloatingCart) {
    const oldMobileUI = `<div className="lg:hidden">\n        <Link href="/keranjang">\n          <motion.button className="fixed bottom-24 right-6 bg-amber-600 text-white p-4 rounded-full shadow-2xl z-[90] flex items-center justify-center hover:bg-amber-700 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>\n            <div className="relative">\n              <ShoppingCart className="w-6 h-6" />\n              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalItems}</span>\n            </div>\n          </motion.button>\n        </Link>\n      </div>`;
    
    const newMobileUI = `<div className="lg:hidden fixed bottom-[90px] left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[50] border border-gray-100 p-3 transition-all hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-600 p-2.5 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{totalItems} Produk</span>
              <span className="text-[11px] text-gray-500">Estimasi Rp{total.toLocaleString("id-ID")}</span>
            </div>
          </div>
          <Link href="/keranjang" className="bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-amber-200">
            Checkout
          </Link>
        </div>
      </div>`;
      
    content = content.replace(oldMobileUI, newMobileUI);
  }

  fs.writeFileSync(file, content);
}

patchFile('src/components/FloatingCart.tsx', true);
patchFile('src/app/keranjang/page.tsx', false);
