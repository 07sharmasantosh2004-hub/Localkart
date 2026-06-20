import { Home, ShoppingBasket, Soup, Utensils, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useCartContext } from "../context/CartContext";

export default function BottomNav() {
  const location = useLocation();
  const { getTotalItems } = useCartContext();
  const cartCount = getTotalItems();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Tiffin", path: "/tiffin-services", icon: Soup },
    { name: "Kirana", path: "/kirana", icon: ShoppingBasket },
    { name: "Food", path: "/food", icon: Utensils },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-50 flex justify-center px-2 sm:px-6 lg:hidden">
      <nav className="flex h-14 w-full max-w-md items-center justify-around gap-1 rounded-[1.5rem] border border-white/20 bg-slate-950/85 px-2 shadow-2xl shadow-slate-950/40 backdrop-blur-xl min-[380px]:h-16 min-[380px]:rounded-[2rem]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
          const showBadge = item.name === "Kirana" && cartCount > 0;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group relative flex h-10 w-10 flex-col items-center justify-center rounded-xl transition-all duration-300 min-[380px]:h-12 min-[380px]:w-12 min-[380px]:rounded-2xl",
                isActive ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
              title={item.name}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} strokeWidth={isActive ? 2.5 : 2} />
              {showBadge && (
                <span className="absolute -right-1 -top-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full min-[380px]:w-6 min-[380px]:h-6 min-[380px]:text-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              {isActive && !showBadge && (
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
