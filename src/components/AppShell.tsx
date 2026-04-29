"use client";

import { usePathname } from "next/navigation";
import AuthStatus from "@/components/AuthStatus";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage =
    pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (isPublicPage) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="md:hidden font-bold text-blue-600">FlowMind AI</div>
          <div className="hidden md:block text-sm text-gray-400">
            워크스페이스 / 분석 도구
          </div>

          <AuthStatus />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-8 px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  );
}
