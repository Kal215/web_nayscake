"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, PackageSearch, User, ShoppingCart } from "lucide-react";
import { useAuth, useClerk, SignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useCartStore } from "@/store/cartStore";

export default function MobileNav() {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const clerk = useClerk();
  const { user } = useUser();
  const isAdmin = ["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(user?.primaryEmailAddress?.emailAddress || "");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hook Scroll-Hide dari Think-Tank
  const scrollDirection = useScrollDirection();
  const isHidden = scrollDirection === "down";

  // Zustand Store untuk Badge Keranjang
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname.includes("/dashboard/kasir")) return null;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    if (userId) {
      window.location.href = "/profil";
    } else {
      setShowGoogleModal(true);
    }
  };

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Katalog", href: "/catalog", icon: PackageSearch },
    { 
      name: "Keranjang", 
      href: "/keranjang", 
      icon: ShoppingCart,
      badge: mounted && totalItems > 0 ? totalItems : undefined 
    },
    { 
      name: userId ? "Profil" : "Masuk", 
      href: "/profil", 
      icon: User,
      onClick: handleProfileClick
    },
  ];

  return (
    <>
      <AnimatePresence>
        {showGoogleModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoogleModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[210] flex justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full relative">
                <button 
                  onClick={() => setShowGoogleModal(false)}
                  className="absolute top-4 right-4 z-[220] p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                >
                  ✕
                </button>
                <div className="flex justify-center w-full max-h-[85vh] overflow-y-auto overflow-x-hidden">
                  <div className="transform scale-95 origin-top w-full flex justify-center mt-6 mb-2">
                    <SignIn routing="hash" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isHidden ? 100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        // Z-Index diturunkan ke 40 agar tidak menutupi FloatingCart atau tombol Checkout
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 pb-safe z-40 lg:hidden shadow-[0_-8px_30px_rgba(0,0,0,0.04)]"
      >
        <nav className="flex justify-around items-center h-16 sm:h-20 px-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <div key={item.name} className="relative">
                {item.onClick ? (
                  <button onClick={item.onClick} className="flex flex-col items-center justify-center w-16 h-full gap-1 sm:gap-1.5 group outline-none">
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-amber-100 text-amber-600" : "text-gray-500 group-hover:bg-gray-50 group-hover:text-amber-500"}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100 group-hover:scale-110"}`} />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium transition-colors ${isActive ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
                      {item.name}
                    </span>
                  </button>
                ) : (
                  <Link href={item.href} className="flex flex-col items-center justify-center w-16 h-full gap-1 sm:gap-1.5 group outline-none">
                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? "bg-amber-100 text-amber-600" : "text-gray-500 group-hover:bg-gray-50 group-hover:text-amber-500"}`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isActive ? "scale-110" : "scale-100 group-hover:scale-110"}`} />
                      
                      {item.badge !== undefined && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium transition-colors ${isActive ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
                      {item.name}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
}
