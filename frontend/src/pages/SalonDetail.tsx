import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, Clock3, Star, ShieldCheck } from "lucide-react";
import { salons } from "../lib/mockData";
import {
  DistanceBadge,
  DynamicAdSlot,
  RatingBadge,
  SEOHead,
  ShopStatusBadge,
} from "../components/marketplace";
import { BookingWhatsAppForm } from "../components/forms/LeadForms";
import { Button } from "../components/ui/button";
import { useBusinessBySlug, useSalonServices } from "../lib/businesses";
import { EmptyStateBlock, SkeletonCard } from "../components/feedback";
import { cn } from "../lib/utils";

export default function SalonDetail() {
  const { slug } = useParams();
  const { data: salon = salons.find((item) => item.slug === slug) || salons[0], isLoading } = useBusinessBySlug("salon", slug);
  const { data: services = [] } = useSalonServices(salon?.id);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-6"><SkeletonCard /></div>;
  }

  if (!salon) {
    return <div className="mx-auto max-w-4xl px-4 py-12"><EmptyStateBlock title="Salon not found" text="This salon is not approved or no longer available." /></div>;
  }

  return (
    <>
      <SEOHead
        config={{
          title: `${salon.name} WhatsApp Booking | Nearby Salon in ${salon.area}`,
          description:
            "Booking a salon appointment should not take extra effort. Choose your service, share your preferred time, and let the salon confirm your slot.",
          image: salon.cover_image,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            name: salon.name,
            address: salon.address,
            telephone: salon.phone,
            image: salon.cover_image,
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:py-12">
        <Button asChild variant="ghost" className="mb-6 w-full rounded-2xl bg-white/50 px-4 font-black text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white sm:mb-8 sm:w-auto sm:px-6">
          <Link to="/salons" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Explore all salons
          </Link>
        </Button>

        <section className="group relative overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-2xl shadow-emerald-950/10 sm:rounded-[3.5rem]">
          <div className="relative h-[360px] sm:h-[300px] md:h-[500px]">
            <img src={salon.cover_image} alt={salon.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="eager" decoding="async" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
              <div className="mb-6 flex flex-wrap gap-3">
                <ShopStatusBadge isOpen={salon.is_open} />
                <DistanceBadge meters={salon.distance_meters} />
                <RatingBadge rating={salon.rating} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-7xl">{salon.name}</h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-white/80 sm:mt-4 sm:text-lg">{salon.address}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Direct WhatsApp Booking", icon: MessageCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Zero Waiting Time", icon: Clock3, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Trusted Local Shop", icon: Star, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Verified Business", icon: ShieldCheck, color: "text-purple-700", bg: "bg-purple-50" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-[2rem] border border-white bg-white/60 p-5 shadow-sm backdrop-blur-sm">
              <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner", item.bg, item.color)}>
                <item.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-black text-slate-800 leading-snug text-balance">{item.label}</span>
            </div>
          ))}
        </section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section className="space-y-8">
            <div className="mobile-safe-card border border-slate-100 bg-white shadow-sm">
               <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#064E3B] text-white shadow-lg">
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">Premium Services</h2>
               </div>
              <div className="grid gap-4">
                {services.map((service) => (
                  <div key={service.id} className="group flex flex-col gap-4 rounded-3xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                       <div className="h-2 w-2 rounded-full bg-emerald-500" />
                       <div>
                        <h3 className="text-lg font-black text-slate-950">{service.name}</h3>
                        <p className="text-sm font-bold text-slate-500">{service.duration}</p>
                      </div>
                    </div>
                    <div className="text-left min-[420px]:text-right">
                      <p className="text-xl font-black text-[#064E3B]">Rs {service.price}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fixed Price</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="outline" className="h-14 flex-1 rounded-[1.5rem] border-slate-200 bg-white text-lg font-black text-slate-700 hover:bg-slate-50 shadow-sm">
                  <a href={`tel:${salon.phone}`}>
                    <Phone className="h-5 w-5" />
                    Call Salon
                  </a>
                </Button>
                <Button asChild className="h-14 flex-1 rounded-[1.5rem] bg-[#16A34A] text-lg font-black text-white hover:bg-[#15803D] shadow-xl shadow-emerald-900/20">
                  <a href={`https://wa.me/${salon.whatsapp.replace(/[+\s-]/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="mobile-safe-card border border-emerald-100 bg-emerald-50/50">
               <h3 className="text-xl font-black text-slate-950">Why book with LocalKart?</h3>
               <p className="mt-4 text-base leading-8 text-slate-600">
                  Booking a salon appointment should not take extra effort. Instead of waiting in long queues, connect directly with nearby salons. No middlemen, no hidden fees—just pure local convenience.
               </p>
            </div>
          </section>

          <aside className="lg:sticky lg:top-28">
            <BookingWhatsAppForm salon={salon} services={services} />
          </aside>
        </div>

        <div className="mt-12">
          <DynamicAdSlot slot="salon_detail_bottom" />
        </div>
      </div>
    </>
  );
}
