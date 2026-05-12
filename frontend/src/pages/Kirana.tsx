import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBasket, Store, MapPin, ArrowRight, Truck } from "lucide-react";
import { kiranaStores } from "../lib/mockData";
import { DynamicAdSlot, KiranaCard, SEOHead, SectionHeader } from "../components/marketplace";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyBusinesses } from "../lib/businesses";
import { EmptyStateBlock, ErrorStateBlock, SkeletonCard } from "../components/feedback";

export default function Kirana() {
  const [search, setSearch] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [distance, setDistance] = useState("15");
  const { location, error: locationError } = useGeolocation();
  const {
    data: nearbyShops = kiranaStores,
    isLoading,
    isError,
  } = useNearbyBusinesses({
    type: "kirana",
    lat: location?.lat,
    lng: location?.lng,
    radiusKm: Number(distance),
  });

  const filteredShops = useMemo(
    () =>
      nearbyShops.filter((shop) => {
        const matchesSearch =
          !search ||
          shop.name.toLowerCase().includes(search.toLowerCase()) ||
          shop.area.toLowerCase().includes(search.toLowerCase());
        const matchesDelivery = !delivery || shop.delivery_available;
        const matchesDistance = shop.distance_meters / 1000 <= Number(distance);
        return matchesSearch && matchesDelivery && matchesDistance;
      }),
    [delivery, distance, nearbyShops, search],
  );

  return (
    <>
      <SEOHead
        config={{
          title: "Nearby Kirana Shop WhatsApp Ordering | Zero Markup Home Delivery",
          description:
            "Order groceries from your favorite local kirana shops directly on WhatsApp. Save on platform fees and support your neighborhood dukandaar.",
          keywords:
            "kirana near me, grocery store near me, online grocery delivery, WhatsApp grocery order, nearby kirana delivery, local dukandaar app, no extra charge grocery",
          jsonLd: kiranaStores.map((shop) => ({
            "@context": "https://schema.org",
            "@type": "GroceryStore",
            name: shop.name,
            address: shop.address,
            telephone: shop.phone,
            image: shop.cover_image,
          })),
        }}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-3 py-6 sm:px-4 sm:py-10 md:space-y-12 md:py-12">
        <section className="mobile-safe-card relative overflow-hidden bg-[#F59E0B] text-slate-950">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-950 backdrop-blur-sm">
              <ShoppingBasket className="h-3.5 w-3.5" />
              Ghar ki dukan, ab WhatsApp par
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Neighborhood Kirana Stores
            </h1>
            <p className="text-lg leading-8 text-amber-950/80 sm:text-xl">
              Order directly from trusted local shops on WhatsApp. Pay only the actual shop prices with zero platform markups.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 p-8 opacity-20">
             <Store className="h-64 w-64" />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-100 bg-white/90 p-3 shadow-xl shadow-amber-950/5 backdrop-blur-xl sm:sticky sm:top-24 sm:z-40 sm:rounded-[2.5rem] sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_auto_auto] lg:items-center">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-700" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search kirana shops"
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 text-base font-bold transition-all focus:bg-white focus:ring-4 focus:ring-amber-100"
                placeholder="Search by shop name or area"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
               <div className="relative flex-1 sm:min-w-48 lg:w-48">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={distance}
                    onChange={(event) => setDistance(event.target.value)}
                    aria-label="Filter kirana shops by distance"
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-10 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-amber-100"
                  >
                    <option value="3">Within 3 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="15">Within 15 km</option>
                  </select>
               </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDelivery((value) => !value)}
                aria-pressed={delivery}
                className={cn(
                  "h-14 w-full rounded-2xl border-slate-100 px-6 font-black transition-all sm:w-auto", 
                  delivery ? "border-amber-400 bg-amber-50 text-amber-800" : "bg-slate-50/50 text-slate-600 hover:bg-white"
                )}
              >
                <Truck className="h-4 w-4" />
                Home Delivery
              </Button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-8">
            <SectionHeader
              eyebrow="Available shops"
              title="Pick your trusted dukandaar"
              text="Send your grocery list directly to the shopkeeper and confirm delivery time."
            />
          </div>
          
          {locationError && (
            <div className="mb-8">
              <ErrorStateBlock title="Location not enabled" text="Showing available shops in your city. Enable location for more precise nearby stores." />
            </div>
          )}
          
          {isError && (
            <div className="mb-8">
              <ErrorStateBlock title="Could not refresh nearby shops" text="Showing available local listings for now." />
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : filteredShops.map((shop, index) => (
              <div key={shop.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                <KiranaCard shop={shop} />
                {index === 2 && <div className="mt-8 col-span-full"><DynamicAdSlot slot="kirana_list_after_3_cards" /></div>}
              </div>
            ))}
          </div>
          
          {!isLoading && !filteredShops.length && (
            <EmptyStateBlock title="No kirana shops found" text="Try a wider distance or search another area. We are onboarding new shops daily." />
          )}
        </section>

        <section className="mobile-safe-card bg-amber-50">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-950">Support your local economy</h2>
              <p className="max-w-2xl text-lg leading-8 text-amber-900/70">
                Massive aggregators take huge commissions from small shops. By ordering directly on WhatsApp, you help your local dukandaar thrive while saving on your own bills.
              </p>
            </div>
            <Button asChild size="lg" className="h-16 rounded-2xl bg-[#064E3B] px-8 text-lg font-black text-white hover:bg-emerald-900 shadow-xl shadow-emerald-950/10">
               <Link to="/register-shop" className="flex items-center gap-2">
                 List Your Shop <ArrowRight className="h-5 w-5" />
               </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
