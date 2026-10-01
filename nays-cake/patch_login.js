const fs = require('fs');
let content = fs.readFileSync('src/components/DesktopNav.tsx', 'utf8');

// Tambahkan impor useClerk
content = content.replace(
  'import { useAuth, UserButton } from "@clerk/nextjs";',
  'import { useAuth, UserButton, useClerk } from "@clerk/nextjs";'
);

// Tambahkan inisialisasi useClerk()
content = content.replace(
  'const { isSignedIn } = useAuth();',
  'const { isSignedIn } = useAuth();\n  const { openSignIn } = useClerk();'
);

// Ubah Link Login menjadi Button yang memicu openSignIn
content = content.replace(
  '<Link\n                  href="/sign-in"\n                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"\n                >\n                  <User className="w-4 h-4" />\n                  Login\n                </Link>',
  '<button\n                  onClick={() => openSignIn({ forceRedirectUrl: \'/auth-sync\' })}\n                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors cursor-pointer"\n                >\n                  <User className="w-4 h-4" />\n                  Login\n                </button>'
);

fs.writeFileSync('src/components/DesktopNav.tsx', content);
