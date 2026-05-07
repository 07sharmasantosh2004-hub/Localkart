import { Link } from "react-router-dom";
import { ChevronDown, MapPin, Menu, Search, Store, UserCircle, Utensils, Scissors, ShoppingBasket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";

export default function Header() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const userPath = user ? "/profile" : "/login";

  return (
    <header className="sticky top-0 z-[60] border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4 md:flex-nowrap md:px-6 md:py-0">
        <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden sm:h-12 sm:w-12">
             <img
               src="/logo.png"
               alt="LocalKart"
               width="48"
               height="48"
               decoding="async"
               className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
             />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xl font-black leading-none tracking-tight text-slate-950 sm:text-2xl">
              Local<span className="text-[#064E3B]">Kart</span>
            </span>
            <div className="mt-1 hidden items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F59E0B] sm:flex">
              <Scissors className="h-3 w-3" />
              <span>Salon</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <ShoppingBasket className="h-3 w-3" />
              <span>Kirana</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <Utensils className="h-3 w-3" />
              <span>Food</span>
            </div>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-4 ml-4">
          <div className="h-10 w-px bg-slate-200" />
          <button type="button" className="flex items-center gap-2 rounded-2xl bg-slate-100/50 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100" aria-label="Change current location">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <span>Indiranagar, Bengaluru</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="group relative order-3 mx-auto w-full flex-none md:order-none md:max-w-2xl md:flex-1">
          <label htmlFor="site-search" className="sr-only">Search salons, kirana or food</label>
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
          <input
            id="site-search"
            type="text"
            placeholder="Search salons, kirana or food..."
            autoComplete="off"
            className="h-12 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:border-emerald-200 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <nav className="hidden xl:flex items-center gap-2 mr-2">
             {[
               { to: "/salons", label: "Salons", icon: Scissors },
               { to: "/kirana", label: "Kirana", icon: ShoppingBasket },
               { to: "/food", label: "Food", icon: Utensils },
             ].map((link) => (
               <Link 
                 key={link.to} 
                 to={link.to}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-950 transition-all"
               >
                 <link.icon className="h-4 w-4" />
                 {link.label}
               </Link>
             ))}
          </nav>
          
          <Button asChild variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-all duration-300">
            <Link to={userPath} aria-label="Profile">
              <UserCircle className="h-6 w-6 text-slate-600" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-2xl border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm hover:bg-emerald-100 transition-all duration-300"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div id="site-menu" className="absolute left-2 right-2 top-[calc(100%+0.5rem)] z-[70] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-emerald-950/10 transition-all animate-in fade-in zoom-in-95 duration-300 sm:left-auto sm:right-4 sm:w-72">
          <div className="p-3 border-b border-slate-100 mb-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Main Menu</p>
          </div>
          <MenuLink to={userPath} icon={UserCircle} label="My Profile" desc="Account, orders & favorites" onClick={() => setMenuOpen(false)} />
          <MenuLink to="/register-shop" icon={Store} label="List Your Shop" desc="Grow your local business" onClick={() => setMenuOpen(false)} tone="emerald" />
          <MenuLink to="/partner" icon={Store} label="Partner Dashboard" desc="Manage leads & listings" onClick={() => setMenuOpen(false)} />
          <div className="mt-2 pt-2 border-t border-slate-100">
             <MenuLink to="/about" label="About Us" onClick={() => setMenuOpen(false)} />
             <MenuLink to="/contact" label="Contact Support" onClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, desc, onClick, tone }: { to: string, icon?: LucideIcon, label: string, desc?: string, onClick: () => void, tone?: "emerald" }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-[1.5rem] p-4 transition-all duration-300",
        tone === "emerald" ? "bg-emerald-50 hover:bg-emerald-100" : "hover:bg-slate-50"
      )}
    >
      {Icon && (
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "emerald" ? "bg-white text-emerald-700 shadow-sm" : "bg-slate-100 text-slate-600"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <span className="block text-sm font-black text-slate-950">{label}</span>
        {desc && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{desc}</span>}
      </div>
    </Link>
  );
}
