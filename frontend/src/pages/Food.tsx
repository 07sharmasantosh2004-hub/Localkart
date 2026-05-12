import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Utensils, MapPin, ArrowRight, Truck, Soup } from "lucide-react";
import { foodShops } from "../lib/mockData";
import { DynamicAdSlot, FoodCard, SEOHead, SectionHeader } from "../components/marketplace";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyBusinesses } from "../lib/businesses";
import { EmptyStateBlock, ErrorStateBlock, SkeletonCard } from "../components/feedback";

const cuisineFilters = ["All", "Cafe", "Chinese", "Momo", "Bakery", "Indian", "Pizza", "Snacks"];

export default function Food() {
  const [search, setSearch] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [distance, setDistance] = useState("15");
  const [cuisine, setCuisine] = useState("All");
  const { location, error: locationError } = useGeolocation();
  const {
    data: nearbyShops = foodShops,
    isLoading,
    isError,
  } = useNearbyBusinesses({
    type: "food",
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
          shop.area.toLowerCase().includes(search.toLowerCase()) ||
          shop.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCuisine = cuisine === "All" || shop.description?.toLowerCase().includes(cuisine.toLowerCase());
        const matchesDelivery = !delivery || shop.delivery_available;
        const matchesDistance = shop.distance_meters / 1000 <= Number(distance);
        return matchesSearch && matchesCuisine && matchesDelivery && matchesDistance;
      }),
    [cuisine, delivery, distance, nearbyShops, search],
  );

  return (
    <>
      <SEOHead
        config={{
          title: "Nearby Cafés & Food Shops | Direct WhatsApp Ordering",
          description:
            "Find nearby cafes, Chinese corners, momo shops, and local eateries. Send your order directly on WhatsApp and enjoy local taste without extra platform charges.",
          keywords:
            "food near me, cafe near me, chinese food near me, order food on WhatsApp, nearby snacks shop, local food delivery, no commission food app",
          jsonLd: foodShops.map((shop) => ({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: shop.name,
            address: shop.address,
            telephone: shop.phone,
            image: shop.cover_image,
          })),
        }}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-3 py-6 sm:px-4 sm:py-10 md:space-y-12 md:py-12">
        <section className="mobile-safe-card relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-700 text-white shadow-2xl shadow-orange-900/20">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-100 backdrop-blur-sm">
              <Utensils className="h-3.5 w-3.5" />
              Local taste, ab WhatsApp par
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Local Cafés & Eateries
            </h1>
            <p className="text-lg leading-8 text-orange-50/80 sm:text-xl">
              Discover the best local Chinese corners, momo points, and cafes near you. Order directly on WhatsApp for pickup or home delivery.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 p-8 opacity-20">
             <Soup className="h-64 w-64" />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-100 bg-white/90 p-3 shadow-xl shadow-orange-950/5 backdrop-blur-xl sm:sticky sm:top-24 sm:z-40 sm:rounded-[2.5rem] sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_auto_auto] lg:items-center">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-700" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search food shops"
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 text-base font-bold transition-all focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Search for Chinese, Cafe, Momos..."
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
               <div className="relative flex-1 sm:min-w-48 lg:w-48">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={distance}
                    onChange={(event) => setDistance(event.target.value)}
                    aria-label="Filter food shops by distance"
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-10 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-orange-100"
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
                  delivery ? "border-orange-400 bg-orange-50 text-orange-800" : "bg-slate-50/50 text-slate-600 hover:bg-white"
                )}
              >
                <Truck className="h-4 w-4" />
                Delivery Available
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {cuisineFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCuisine(filter)}
                className={cn(
                  "shrink-0 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                  cuisine === filter ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-8">
            <SectionHeader
              eyebrow="Nearby eateries"
              title="Delicious food, just a message away"
              text="Explore menus and send your food order directly to the shopkeeper's WhatsApp."
            />
          </div>
          
          {locationError && (
            <div className="mb-8">
              <ErrorStateBlock title="Location not enabled" text="Showing available food shops in your city. Enable location for more precise nearby results." />
            </div>
          )}
          
          {isError && (
            <div className="mb-8">
              <ErrorStateBlock title="Could not refresh nearby food shops" text="Showing available local listings for now." />
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : filteredShops.map((shop, index) => (
              <div key={shop.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                <FoodCard shop={shop} />
                {index === 2 && <div className="mt-8 col-span-full"><DynamicAdSlot slot="food_list_after_3_cards" /></div>}
              </div>
            ))}
          </div>
          
          {!isLoading && !filteredShops.length && (
            <EmptyStateBlock title="No food shops found" text="Try a wider distance or search another cuisine. New local eateries are added daily." />
          )}
        </section>

        <section className="mobile-safe-card bg-orange-50">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-950">Own a food business?</h2>
              <p className="max-w-2xl text-lg leading-8 text-orange-900/70">
                Register your café, Chinese corner, or snack shop for free and start receiving direct WhatsApp orders without paying heavy platform commissions.
              </p>
            </div>
            <Button asChild size="lg" className="h-16 rounded-2xl bg-orange-600 px-8 text-lg font-black text-white hover:bg-orange-700 shadow-xl shadow-orange-950/10">
               <Link to="/register-shop" className="flex items-center gap-2">
                 Register Your Shop <ArrowRight className="h-5 w-5" />
               </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
