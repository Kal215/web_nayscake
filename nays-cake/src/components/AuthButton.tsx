"use client";

import { UserButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn, LayoutDashboard, Store, Loader2, Calculator } from "lucide-react";

export default function AuthButton() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const isAdmin = ["riskalfadhilla215@gmail.com", "nayscake16@gmail.com"].includes(user?.primaryEmailAddress?.emailAddress || "");

  return (
    <div className="flex items-center justify-center z-[50]">
      <style dangerouslySetInnerHTML={{__html: `
        .neo-btn-raised {
          background: var(--neo-base);
          color: var(--neo-ink);
          box-shadow: 4px 4px 9px var(--neo-shadow), -4px -4px 9px var(--neo-light);
          border: 1px solid #d1dbd7;
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .neo-btn-raised:hover { background: #f5f8f7; }
        .neo-btn-raised:active {
          box-shadow: var(--neo-inset);
          background: #e5eeea;
          transform: scale(0.96);
        }
      `}} />

      {!isLoaded ? (
         <div className="neo-btn-raised flex items-center justify-center px-6 py-2.5 rounded-full">
           <Loader2 className="w-5 h-5 animate-spin opacity-50" />
         </div>
      ) : !isSignedIn ? (
        <button
          onClick={() => openSignIn({ forceRedirectUrl: '/auth-sync' })}
          className="neo-btn-raised group flex items-center justify-center gap-2.5 px-4 py-2 md:px-5 md:py-2 rounded-full font-bold cursor-pointer"
        >
          <LogIn className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm md:text-base tracking-wide">Login</span>
        </button>
      ) : (
        <div className="neo-btn-raised relative rounded-full p-1 flex items-center justify-center cursor-pointer">
           <UserButton 
             appearance={{ 
               elements: { 
                 avatarBox: "w-9 h-9 md:w-11 md:h-11 border-2 border-[#d1dbd7] rounded-full",
                 userButtonPopoverCard: "shadow-[4px_4px_9px_var(--neo-shadow),-4px_-4px_9px_var(--neo-light)] rounded-3xl border border-[#d1dbd7] font-sans",
                 userButtonTrigger: "focus:shadow-none focus:outline-none"
               } 
             }} 
           >
             <UserButton.MenuItems>
               {isAdmin && (
                 <>
                   <UserButton.Link
                     label="Kasir POS"
                     labelIcon={<Calculator className="w-4 h-4" />}
                     href="/dashboard/kasir"
                   />
                   <UserButton.Link
                     label="Dashboard Admin"
                     labelIcon={<LayoutDashboard className="w-4 h-4" />}
                     href="/dashboard"
                   />
                 </>
               )}
               <UserButton.Link
                 label="Katalog"
                 labelIcon={<Store className="w-4 h-4" />}
                 href="/catalog"
               />
             </UserButton.MenuItems>
           </UserButton>
        </div>
      )}
    </div>
  );
}
