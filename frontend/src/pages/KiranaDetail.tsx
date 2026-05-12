import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Home, MessageCircle, Phone, Truck, BadgeCheck, Star, ShieldPlus } from "lucide-react";
import { kiranaStores } from "../lib/mockData";
import {
  DistanceBadge,
  DynamicAdSlot,
  RatingBadge,
  SEOHead,
  ShopStatusBadge,
} from "../components/marketplace";
import { KiranaWhatsAppOrderForm } from "../components/forms/LeadForms";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useBusinessBySlug, useKiranaProducts } from "../lib/businesses";
import { EmptyStateBlock, SkeletonCard } from "../components/feedback";
import { cn } from "../lib/utils";

export default function KiranaDetail() {
  const { slug } = useParams();
  const { data: shop = kiranaStores.find((item) => item.slug === slug) || kiranaStores[0], isLoading } = useBusinessBySlug("kirana", slug);
  const { data: products = [] } = useKiranaProducts(shop?.id);
  const categories = Array.from(new Set(products.map((product) => product.category)));

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-6"><SkeletonCard /></div>;
  }

  if (!shop) {
    return <div className="mx-auto max-w-4xl px-4 py-12"><EmptyStateBlock title="Kirana shop not found" text="This shop is not approved or no longer available." /></div>;
  }

  return (
    <>
      <SEOHead
        config={{
          title: `${shop.name} WhatsApp Grocery Order | Kirana in ${shop.area}`,
          description:
            "Order groceries directly from your nearest kirana shop on WhatsApp. Avoid unnecessary platform charges and support your local dukandaar.",
          image: shop.cover_image,
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "GroceryStore",
            name: shop.name,
            address: shop.address,
            telephone: shop.phone,
            image: shop.cover_image,
          },
        }}
      />

      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:py-12">
        <Button asChild variant="ghost" className="mb-6 w-full rounded-2xl bg-white/50 px-4 font-black text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white sm:mb-8 sm:w-auto sm:px-6">
          <Link to="/kirana" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Explore all kirana shops
          </Link>
        </Button>

        <section className="group relative overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-2xl shadow-emerald-950/10 sm:rounded-[3.5rem]">
          <div className="relative h-[360px] sm:h-[300px] md:h-[500px]">
            <img src={shop.cover_image} alt={shop.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="eager" decoding="async" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
              <div className="mb-6 flex flex-wrap gap-3">
                <ShopStatusBadge isOpen={shop.is_open} />
                <DistanceBadge meters={shop.distance_meters} />
                <RatingBadge rating={shop.rating} />
                {shop.delivery_available && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                    <Truck className="h-3.5 w-3.5" />
                    Delivery available
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl md:text-7xl">{shop.name}</h1>
              <p className="mt-3 max-w-2xl text-base font-medium text-white/80 sm:mt-4 sm:text-lg">{shop.address}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Direct Shop Ordering", icon: MessageCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Zero App Markup", icon: BadgeCheck, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Local Trust", icon: Star, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Quality Products", icon: ShieldPlus, color: "text-purple-700", bg: "bg-purple-50" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-[2rem] border border-white bg-white/60 p-5 shadow-sm backdrop-blur-sm">
              <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner", item.bg, item.color)}>
                <item.icon className="h-6 w-6" />
              </span>
              <span className="text-sm font-black text-slate-800 leading-snug">{item.label}</span>
            </div>
          ))}
        </section>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <section className="space-y-8">
            <div className="mobile-safe-card border border-slate-100 bg-white shadow-sm">
              <h2 className="text-2xl font-black text-slate-950 mb-6">Popular categories</h2>
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((category) => (
                  <Badge key={category} className="rounded-xl border-emerald-100 bg-emerald-50 px-4 py-2 text-emerald-700 font-black text-xs uppercase tracking-widest">
                    {category}
                  </Badge>
                ))}
              </div>
              
              <h3 className="text-xl font-black text-slate-950 mb-6">Regular items</h3>
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="group flex flex-col gap-3 rounded-3xl border border-slate-50 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between sm:p-6">
                    <div>
                      <p className="text-lg font-black text-slate-950">{product.name}</p>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">{product.unit}</p>
                    </div>
                    <p className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">{product.priceHint}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="outline" className="h-14 flex-1 rounded-[1.5rem] border-slate-200 bg-white text-lg font-black text-slate-700 hover:bg-slate-50 shadow-sm">
                  <a href={`tel:${shop.phone}`}>
                    <Phone className="h-5 w-5" />
                    Call Shop
                  </a>
                </Button>
                <Button asChild className="h-14 flex-1 rounded-[1.5rem] bg-[#16A34A] text-lg font-black text-white hover:bg-[#15803D] shadow-xl shadow-emerald-900/20">
                  <a href={`https://wa.me/${shop.whatsapp.replace(/[+\s-]/g, "")}`} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="mobile-safe-card border border-amber-100 bg-amber-50/50">
               <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-start">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                     <Home className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-950">Why direct kirana ordering?</h3>
                    <p className="mt-3 text-base leading-8 text-slate-600">
                      Extra charge kyun dena? Seedha apne najdeeki dukandaar se order karein. Order groceries directly on WhatsApp and get local home delivery without unnecessary extra app charges.
                    </p>
                  </div>
               </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-28">
            <KiranaWhatsAppOrderForm shop={shop} products={products} />
          </aside>
        </div>

        <div className="mt-12">
          <DynamicAdSlot slot="kirana_detail_bottom" />
        </div>
      </div>
    </>
  );
}
