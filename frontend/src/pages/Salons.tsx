import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Search, Scissors, MapPin, ArrowRight } from "lucide-react";
import { salons } from "../lib/mockData";
import { DynamicAdSlot, SalonCard, SEOHead, SectionHeader } from "../components/marketplace";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyBusinesses } from "../lib/businesses";
import { EmptyStateBlock, ErrorStateBlock, SkeletonCard } from "../components/feedback";

const serviceFilters = ["All", "haircut", "shave", "facial", "hair color", "massage", "grooming"];

export default function Salons() {
  const [search, setSearch] = useState("");
  const [openNow, setOpenNow] = useState(false);
  const [distance, setDistance] = useState("15");
  const [service, setService] = useState("All");
  const { location, error: locationError } = useGeolocation();
  const {
    data: nearbySalons = salons,
    isLoading,
    isError,
  } = useNearbyBusinesses({
    type: "salon",
    lat: location?.lat,
    lng: location?.lng,
    radiusKm: Number(distance),
  });

  const filteredSalons = useMemo(
    () =>
      nearbySalons.filter((salon) => {
        const matchesSearch =
          !search ||
          salon.name.toLowerCase().includes(search.toLowerCase()) ||
          salon.area.toLowerCase().includes(search.toLowerCase()) ||
          salon.description?.toLowerCase().includes(search.toLowerCase());
        const matchesService = service === "All" || salon.description?.toLowerCase().includes(service);
        const matchesOpen = !openNow || salon.is_open;
        const matchesDistance = salon.distance_meters / 1000 <= Number(distance);
        return matchesSearch && matchesService && matchesOpen && matchesDistance;
      }),
    [distance, nearbySalons, openNow, search, service],
  );

  return (
    <>
      <SEOHead
        config={{
          title: "Nearby Salon Booking on WhatsApp | Save Time, Skip the Queue",
          description:
            "Discover salons near you, choose services like haircut, shave, facial or grooming, and send booking details directly to the salon on WhatsApp.",
          keywords:
            "salon near me, salon booking near me, haircut near me, beauty salon near me, book salon on WhatsApp, men salon near me, women salon near me, grooming service near me",
          jsonLd: salons.map((salon) => ({
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            name: salon.name,
            address: salon.address,
            telephone: salon.phone,
            image: salon.cover_image,
          })),
        }}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12">
        <section className="relative overflow-hidden rounded-[3.5rem] bg-[#064E3B] p-8 md:p-16 text-white">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
              Queue chhodo, time bachao
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Nearby Salons for Direct Booking
            </h1>
            <p className="text-xl leading-8 text-emerald-50/80">
              Find trusted salons near you, select your service, and connect directly on WhatsApp to save time.
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 p-8 opacity-20">
             <Scissors className="h-64 w-64" />
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-slate-100 bg-white/90 p-4 shadow-xl shadow-emerald-950/5 backdrop-blur-xl sm:sticky sm:top-24 sm:z-40">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_auto_auto] lg:items-center">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-700" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search salons"
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 pl-12 text-base font-bold transition-all focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="Search by salon name, area or service"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
               <div className="relative flex-1 sm:min-w-48 lg:w-48">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={distance}
                    onChange={(event) => setDistance(event.target.value)}
                    aria-label="Filter salons by distance"
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50/50 pl-10 pr-10 text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="3">Within 3 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="15">Within 15 km</option>
                  </select>
               </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenNow((value) => !value)}
                aria-pressed={openNow}
                className={cn(
                  "h-14 w-full rounded-2xl border-slate-100 px-6 font-black transition-all sm:w-auto", 
                  openNow ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-slate-50/50 text-slate-600 hover:bg-white"
                )}
              >
                <Filter className="h-4 w-4" />
                Open now
              </Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {serviceFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setService(filter)}
                className={cn(
                  "shrink-0 rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all",
                  service === filter ? "bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-900/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
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
              eyebrow="Available salons"
              title="Choose your neighborhood salon"
              text="Book on WhatsApp or view services before sending your preferred date and time."
            />
          </div>
          
          {locationError && (
            <div className="mb-8">
              <ErrorStateBlock title="Location not enabled" text="Showing sample salons near you. You can still search by area and book on WhatsApp." />
            </div>
          )}
          
          {isError && (
            <div className="mb-8">
              <ErrorStateBlock title="Could not refresh nearby salons" text="Showing available local listings for now." />
            </div>
          )}

          <div className="grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : filteredSalons.map((salon, index) => (
              <div key={salon.id} className="flex h-full animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                <SalonCard salon={salon} />
              </div>
            ))}
          </div>

          {!isLoading && filteredSalons.length > 0 && (
            <div className="mx-auto mt-10 max-w-3xl">
              <DynamicAdSlot slot="salon_list_after_5_cards" />
            </div>
          )}
          
          {!isLoading && !filteredSalons.length && (
            <EmptyStateBlock title="No salons found" text="Try a wider distance or search another service. New local salons are added after approval." />
          )}
        </section>

        <section className="rounded-[3rem] bg-emerald-50 p-12 md:p-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-950">Salon booking should not take extra effort</h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Instead of waiting in long queues, customers can now connect directly with nearby salons on WhatsApp. Support local businesses while saving your precious time.
              </p>
            </div>
            <Button asChild size="lg" className="h-16 rounded-2xl bg-emerald-700 px-8 text-lg font-black text-white hover:bg-emerald-800 shadow-xl shadow-emerald-950/10">
               <Link to="/register-shop" className="flex items-center gap-2">
                 List Your Salon <ArrowRight className="h-5 w-5" />
               </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
