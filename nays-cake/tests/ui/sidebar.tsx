import type { ReactNode } from "react";
// Component fixture only: no session, database, or application authentication.
export function Sidebar({ children }: { children: ReactNode }) {
  return <div className="neo-page min-h-screen p-4 lg:p-8 text-gray-900">{children}</div>;
}
