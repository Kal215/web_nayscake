const fs = require('fs');

const file = 'src/app/dashboard/kasir/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Tambahkan state searchQuery dan icon Search dari lucide-react
content = content.replace("import { Sidebar } from \"@/components/dashboard/sidebar\";", "import { Sidebar } from \"@/components/dashboard/sidebar\";\nimport { Search } from \"lucide-react\";");
content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const [searchQuery, setSearchQuery] = useState('');");

// 2. Filter products sebelum groupedProducts
content = content.replace(
  "const groupedProducts = products.reduce((acc: any, curr: any) => {",
  "const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase())));\n\n  const groupedProducts = filteredProducts.reduce((acc: any, curr: any) => {"
);

// 3. Masukkan bilah Search ke dalam antarmuka UI (di bawah Header)
const searchUI = `
      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama kue atau supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
          />
        </div>
      </div>`;

content = content.replace(
  '<p className="text-xs text-gray-500 mt-1">Pagi: Masukkan Stok Bawaan &bull; Sore: Masukkan Sisa</p>\n      </div>',
  '<p className="text-xs text-gray-500 mt-1">Pagi: Masukkan Stok Bawaan &bull; Sore: Masukkan Sisa</p>\n      </div>\n' + searchUI
);

fs.writeFileSync(file, content);
