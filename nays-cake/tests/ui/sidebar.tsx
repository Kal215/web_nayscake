import type { ReactNode } from "react";
// Component fixture only: no session, database, or application authentication.
export function Sidebar({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-gray-50 p-4 lg:p-8 text-gray-900">{children}</div>;
}
