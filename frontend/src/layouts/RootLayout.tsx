import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import { useEffect } from "react";
import InstallPrompt from "../components/InstallPrompt";

export default function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf7] text-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:text-emerald-800 focus:shadow-xl"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="relative z-10 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-0">
        <Outlet />
      </main>
      <InstallPrompt />
      <BottomNav />
    </div>
  );
}
