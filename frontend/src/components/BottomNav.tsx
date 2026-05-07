import { Home, Scissors, ShoppingBasket, Utensils, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Salons", path: "/salons", icon: Scissors },
    { name: "Kirana", path: "/kirana", icon: ShoppingBasket },
    { name: "Food", path: "/food", icon: Utensils },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex justify-center px-3 sm:px-6 lg:hidden">
      <nav className="flex h-16 w-full max-w-md items-center justify-around gap-1 rounded-[2rem] border border-white/20 bg-slate-950/80 px-2 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group relative flex h-12 w-12 flex-col items-center justify-center rounded-2xl transition-all duration-300",
                isActive ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-white" />
              )}
              <span className="sr-only">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
