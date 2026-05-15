import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LocateFixed, MapPin, Search, Soup, Truck } from "lucide-react";
import { tiffinProviders } from "../lib/mockData";
import { DynamicAdSlot, SEOHead, SectionHeader, TiffinCard } from "../components/marketplace";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useLocationContext } from "../context/LocationContext";
import { useNearbyBusinesses } from "../lib/businesses";
import { EmptyStateBlock, ErrorStateBlock, SkeletonCard } from "../components/feedback";

const mealFilters = ["All", "Breakfast", "Lunch", "Dinner", "Full day", "Monthly Plan", "Trial Meal", "Veg", "Non-veg"];
const cuisineFilters = ["All", "North Indian", "South Indian", "Healthy", "Homemade", "Maharashtrian"];

export default function TiffinServices() {
  const [search, setSearch] = useState("");
  const [delivery, setDelivery] = useState(false);
  const [distance, setDistance] = useState("15");
  const [meal, setMeal] = useState("All");
  const [cuisine, setCuisine] = useState("All");
  const { location, error: locationError, loading: locationLoading, requestCurrentLocation, openManualLocation, searchTerm, displayLabel } = useLocationContext();
  const {
    data: providers = tiffinProviders,
    isLoading,
    isError,
  } = useNearbyBusinesses({
    type: "tiffin",
    lat: location?.lat,
    lng: location?.lng,
    radiusKm: Number(distance),
    searchLocation: searchTerm,
  });

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const haystack = [
          provider.name,
          provider.area,
          provider.city,
          provider.description,
          provider.category,
          ...(provider.meal_types || []),
          ...(provider.cuisines || []),
          ...(provider.popular_items || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = !search || haystack.includes(search.toLowerCase());
        const matchesMeal =
          meal === "All" ||
          haystack.includes(meal.toLowerCase()) ||
          (meal === "Monthly Plan" && provider.monthly_plan_available) ||
          (meal === "Trial Meal" && provider.trial_meal_available) ||
          (meal === "Veg" && provider.veg_available) ||
          (meal === "Non-veg" && provider.non_veg_available);
        const matchesCuisine = cuisine === "All" || haystack.includes(cuisine.toLowerCase());
        const matchesDelivery = !delivery || provider.delivery_available;
        const matchesDistance = provider.distance_meters / 1000 <= Number(distance) || provider.distance_meters === 0;
        return matchesSearch && matchesMeal && matchesCuisine && matchesDelivery && matchesDistance;
      }),
    [cuisine, delivery, distance, meal, providers, search],
  );

  return (
    <>
      <SEOHead
        config={{
          title: "Nearby Tiffin Services & Cloud Kitchens | Direct WhatsApp Ordering",
          description:
            "Find home food, tiffin services and cloud kitchens near you. Compare meal plans, veg and non-veg options, trial meals and monthly tiffin plans, then enquire on WhatsApp.",
          keywords:
            "tiffin service near me, home food near me, cloud kitchen near me, monthly tiffin plan, lunch tiffin, dinner tiffin, homemade food delivery",
          jsonLd: tiffinProviders.map((provider) => ({
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            name: provider.name,
            address: provider.address,
            telephone: provider.phone,
            image: provider.cover_image,
            servesCuisine: provider.cuisines?.join(", ") || "Home Food",
          })),
        }}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-3 py-6 sm:px-4 sm:py-10 md:space-y-12 md:py-12">
        <section className="mobile-safe-card relative overflow-hidden bg-[#064E3B] text-white">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
              <Soup className="h-3.5 w-3.5" />
              Home food near you
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Find Nearby Tiffin Services
            </h1>
            <p className="text-lg leading-8 text-emerald-50/80 sm:text-xl">
              Search home food providers, monthly tiffin plans and cloud kitchens near your current location. Order or enquire directly on WhatsApp.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" className="h-12 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50" onClick={() => void requestCurrentLocation()} disabled={locationLoading}>
                <LocateFixed className="h-4 w-4" />
                {locationLoading ? "Detecting..." : "Use current location"}
              </Button>
              <Button type="button" variant="outline" className="h-12 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={openManualLocation}>
                <MapPin className="h-4 w-4" />
                {displayLabel}
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-8 opacity-20">
            <Soup className="h-64 w-64" />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-100 bg-white/90 p-3 shadow-xl shadow-emerald-950/5 backdrop-blur-xl sm:sticky sm:top-24 sm:z-40 sm:rounded-[2.5rem] sm:p-4">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_auto_auto] lg:items-center">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tiffin services"
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 text-base font-bold transition-all focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Search by provider, area, cuisine or plan"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 sm:min-w-48 lg:w-48">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={distance}
                  onChange={(event) => setDistance(event.target.value)}
                  aria-label="Filter tiffin providers by distance"
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-10 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="3">Within 3 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="15">Within 15 km</option>
                  <option value="30">Within 30 km</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDelivery((value) => !value)}
                aria-pressed={delivery}
                className={cn(
                  "h-14 w-full rounded-2xl border-slate-100 px-6 font-black transition-all sm:w-auto",
                  delivery ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-slate-50/50 text-slate-600 hover:bg-white",
                )}
              >
                <Truck className="h-4 w-4" />
                Delivery
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {mealFilters.map((filter) => (
              <button key={filter} type="button" onClick={() => setMeal(filter)} className={cn("shrink-0 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all", meal === filter ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                {filter}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {cuisineFilters.map((filter) => (
              <button key={filter} type="button" onClick={() => setCuisine(filter)} className={cn("shrink-0 rounded-xl px-4 py-2 text-xs font-black transition-all", cuisine === filter ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100")}>
                {filter}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Available providers"
              title="Choose your neighborhood tiffin provider"
              text="Compare meal plans, trial meals and delivery options before sending your WhatsApp enquiry."
            />
          </div>

          {locationError && (
            <div className="mb-8">
              <ErrorStateBlock title="Location needs attention" text={locationError} />
            </div>
          )}
          {isError && (
            <div className="mb-8">
              <ErrorStateBlock title="Could not refresh nearby tiffin providers" text="Showing available local listings for now." />
            </div>
          )}

          <div className="grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : filteredProviders.map((provider, index) => (
                  <div key={provider.id} className="flex h-full animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                    <TiffinCard provider={provider} />
                  </div>
                ))}
          </div>

          {!isLoading && filteredProviders.length > 0 && (
            <div className="mx-auto mt-10 max-w-3xl">
              <DynamicAdSlot slot="tiffin_list_after_5_cards" />
            </div>
          )}
          {!isLoading && !filteredProviders.length && (
            <EmptyStateBlock title="No tiffin providers found" text="Try another area, wider distance, or fewer filters. New home food providers are added after approval." />
          )}
        </section>

        <section className="mobile-safe-card bg-emerald-50">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-950">Run a tiffin service or cloud kitchen?</h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                List your home food business for free and receive direct WhatsApp enquiries for trial meals, daily meals and monthly subscriptions.
              </p>
            </div>
            <Button asChild size="lg" className="h-16 rounded-2xl bg-emerald-700 px-8 text-lg font-black text-white hover:bg-emerald-800 shadow-xl shadow-emerald-950/10">
              <Link to="/register-shop" className="flex items-center gap-2">
                List Your Tiffin Service <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
