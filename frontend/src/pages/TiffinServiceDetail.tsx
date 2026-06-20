import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Phone, ShieldCheck, Soup, Truck, Utensils } from "lucide-react";
import { mealPlans, tiffinProviders } from "../lib/mockData";
import { DistanceBadge, DynamicAdSlot, RatingBadge, SEOHead, ShopStatusBadge } from "../components/marketplace";
import { TiffinWhatsAppOrderForm } from "../components/forms/LeadForms";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useBusinessBySlug, useTiffinMealPlans } from "../lib/businesses";
import { EmptyStateBlock, SkeletonCard } from "../components/feedback";
import { generateWhatsAppLink } from "../lib/whatsapp";
import { cn } from "../lib/utils";

export default function TiffinServiceDetail() {
  const { slug } = useParams();
  const { data: provider = tiffinProviders.find((item) => item.slug === slug) || tiffinProviders[0], isLoading } = useBusinessBySlug("tiffin", slug);
  const { data: plans = mealPlans } = useTiffinMealPlans(provider?.id);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-6"><SkeletonCard /></div>;
  }

  if (!provider) {
    return <div className="mx-auto max-w-4xl px-4 py-12"><EmptyStateBlock title="Tiffin provider not found" text="This provider is not approved or no longer available." /></div>;
  }

  return (
    <>
      <SEOHead
        config={{
          title: `${provider.name} Tiffin Service & Meal Plans | ${provider.area}`,
          description:
            "View meal plans, trial meals, veg and non-veg options, delivery availability and send a direct WhatsApp tiffin enquiry.",
          image: provider.cover_image,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            name: provider.name,
            address: provider.address,
            telephone: provider.phone,
            image: provider.cover_image,
            servesCuisine: provider.cuisines?.join(", ") || "Home Food",
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-3 py-6 pb-24 sm:px-4 md:py-12 md:pb-12">
        <Button asChild variant="ghost" className="mb-6 w-full rounded-2xl bg-white/50 px-4 font-black text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white sm:mb-8 sm:w-auto sm:px-6">
          <Link to="/tiffin-services" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Explore all tiffin services
          </Link>
        </Button>

        <section className="group relative overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-2xl shadow-emerald-950/10 sm:rounded-[3.5rem]">
          <div className="relative h-[360px] sm:h-[300px] md:h-[500px]">
            <img src={provider.cover_image} alt={provider.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="eager" decoding="async" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
              <div className="mb-6 flex flex-wrap gap-3">
                <ShopStatusBadge isOpen={provider.is_open} />
                <DistanceBadge meters={provider.distance_meters} />
                <RatingBadge rating={provider.rating} />
                {provider.delivery_available ? <Badge className="rounded-full bg-emerald-50 text-emerald-700">Delivery available</Badge> : null}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">{provider.name}</h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-white/80 sm:mt-4 sm:text-lg">{provider.address}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Direct WhatsApp enquiry", icon: MessageCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Trial and monthly plans", icon: Soup, color: "text-orange-700", bg: "bg-orange-50" },
            { label: provider.delivery_available ? "Home delivery available" : "Pickup depends on availability", icon: Truck, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Provider confirms directly", icon: ShieldCheck, color: "text-purple-700", bg: "bg-purple-50" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-[1.5rem] border border-white bg-white/60 p-4 shadow-sm backdrop-blur-sm sm:p-5 md:rounded-[2rem]">
              <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner", item.bg, item.color)}>
                <item.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-black leading-snug text-slate-800 text-balance">{item.label}</span>
            </div>
          ))}
        </section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section className="space-y-8">
            <div className="mobile-safe-card border border-slate-100 bg-white shadow-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#064E3B] text-white shadow-lg">
                  <Utensils className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Meal Plans</h2>
              </div>
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="group rounded-3xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5 sm:p-6">
                    <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-950">{plan.name}</h3>
                          <Badge className={plan.is_veg === false ? "rounded-full bg-red-50 text-red-700" : "rounded-full bg-emerald-50 text-emerald-700"}>
                            {plan.is_veg === false ? "Non-veg" : "Veg"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-500">{plan.duration}</p>
                        {plan.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p> : null}
                      </div>
                      <div className="text-left min-[420px]:text-right">
                        <p className="text-xl font-black text-[#064E3B]">Rs {plan.price}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{plan.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-4 min-[420px]:flex-row">
                <Button asChild variant="outline" className="h-14 flex-1 rounded-[1.5rem] border-slate-200 bg-white text-lg font-black text-slate-700 hover:bg-slate-50 shadow-sm">
                  <a href={`tel:${provider.phone}`}>
                    <Phone className="h-5 w-5" />
                    Call Provider
                  </a>
                </Button>
                <Button asChild className="h-14 flex-1 rounded-[1.5rem] bg-[#16A34A] text-lg font-black text-white hover:bg-[#15803D] shadow-xl shadow-emerald-900/20">
                  <a href={generateWhatsAppLink(provider.whatsapp, `Hello ${provider.name}, I want to enquire/order tiffin service.`)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="mobile-safe-card border border-emerald-100 bg-emerald-50/50">
              <h3 className="text-xl font-black text-slate-950">How confirmation works</h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                LocalKart sends a clear enquiry to the provider. The provider confirms exact menu, price, delivery timing and availability directly on WhatsApp.
              </p>
            </div>
          </section>

          <aside className="lg:sticky lg:top-28">
            <TiffinWhatsAppOrderForm provider={provider} plans={plans} />
          </aside>
        </div>

        <div className="mt-12">
          <DynamicAdSlot slot="tiffin_detail_bottom" />
        </div>
      </div>
    </>
  );
}
