import { Heart, LogOut, MessageCircle, Store, UserCircle, Utensils } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { SEOHead } from "../components/marketplace";
import { Button } from "../components/ui/button";

export default function Profile() {
  const { profile, user, signOut } = useAuth();

  return (
    <>
      <SEOHead config={{ title: "Your LocalKart Profile", description: "Manage your LocalKart account, favorites and partner access." }} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
          <UserCircle className="mx-auto h-20 w-20 text-emerald-700" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">{profile?.full_name || "LocalKart user"}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{profile?.phone || user?.email}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Save your favorite local shops, revisit trusted salons and connect faster with your nearby dukandaar.
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          <ProfileLink to="/favorites" icon={<Heart className="h-5 w-5" />} label="Favorites" text="Saved salons and kirana shops" />
          <ProfileLink to="/food" icon={<Utensils className="h-5 w-5" />} label="Food shops" text="Cafe, Chinese, momo and snack shops nearby" />
          <ProfileLink to="/register-shop" icon={<Store className="h-5 w-5" />} label="List shop free" text="Add salon, kirana or food shop for approval" />
          <ProfileLink to="/partner" icon={<Store className="h-5 w-5" />} label="Partner dashboard" text="Manage your shop, menu, services/products and leads" />
          <ProfileLink to="/contact" icon={<MessageCircle className="h-5 w-5" />} label="Help & support" text="Need help? Message LocalKart" />
          <Button variant="outline" className="h-12 rounded-2xl border-red-100 font-black text-red-700 hover:bg-red-50" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}

function ProfileLink({ to, icon, label, text }: { to: string; icon: ReactNode; label: string; text: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</span>
      <span>
        <span className="block font-black text-slate-950">{label}</span>
        <span className="text-sm text-slate-600">{text}</span>
      </span>
    </Link>
  );
}
