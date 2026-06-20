import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  ExternalLink,
  Filter,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Soup,
  Star,
  Store,
  Utensils,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn, formatDistance, generateWhatsAppLink, titleCase } from "../lib/utils";
import { adUnits, kiranaProducts, mealPlans } from "../lib/mockData";
import { supabase } from "../lib/supabase";
import { SkeletonCard } from "./feedback";
import { useAuth } from "../hooks/useAuth";
import type { Business, BusinessType, FAQItem, KiranaProduct, MealPlan, SEOConfig } from "../lib/types";

type CardTone = BusinessType | "neutral";
const defaultMealPlans = mealPlans;

interface DynamicAdSlotRow {
  key: string;
  name: string;
  ad_units?: Array<{
    id: string;
    title: string | null;
    body: string | null;
    image_url: string | null;
    link_url: string | null;
    is_active: boolean;
  }>;
}

const toneClasses: Record<CardTone, string> = {
  tiffin: "from-[#ECFDF5] to-[#FFF7ED] border-emerald-100 text-[#065F46]",
  kirana: "from-[#F0FDF4] to-[#F59E0B]/10 border-emerald-100 text-[#065F46]", // Fresh Green/Saffron
  food: "from-[#FFF7ED] to-[#FFEDD5] border-orange-100 text-[#9A3412]", // Warm Orange
  neutral: "from-white to-[#F8FAFC] border-slate-200 text-slate-700",
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FFF7ED] pb-24 pt-8 min-[420px]:pb-28 min-[420px]:pt-10 lg:pb-16 lg:pt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 min-[420px]:space-y-8">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700 shadow-sm ring-1 ring-emerald-100 min-[420px]:px-4 min-[420px]:text-xs">
              Direct local commerce on WhatsApp
            </div>
            <h1 className="max-w-full break-words text-[2rem] font-black leading-[1.08] tracking-tight text-slate-950 min-[380px]:text-4xl sm:text-6xl md:text-7xl xl:text-8xl">
              <span className="block">Find Nearby Shops.</span>
              <span className="block text-emerald-700 underline decoration-amber-400 decoration-[6px] underline-offset-4 min-[420px]:decoration-8 min-[420px]:underline-offset-8">Order Direct.</span>
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600 min-[420px]:text-lg min-[420px]:leading-8 sm:text-xl">
              Connect with trusted tiffin services, kirana stores, and food shops directly on WhatsApp. No platform markup, no hidden fees.
            </p>
            <div className="flex flex-col gap-3 pt-2 min-[420px]:pt-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild size="lg" className="h-[3.25rem] w-full rounded-2xl bg-[#064E3B] px-5 text-base font-black text-white shadow-2xl shadow-emerald-950/20 transition-all hover:scale-105 min-[420px]:h-14 sm:w-auto sm:px-6">
                <Link to="/tiffin-services" className="flex items-center gap-2">
                  <Soup className="h-4 w-4" />
                  Find Tiffin
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-[3.25rem] w-full rounded-2xl border-slate-200 bg-white px-5 text-base font-black text-slate-900 shadow-sm transition-all hover:scale-105 hover:bg-slate-50 min-[420px]:h-14 sm:w-auto sm:px-6">
                <Link to="/kirana" className="flex items-center gap-2">
                  <ShoppingBasket className="h-4 w-4 text-emerald-700" />
                  Order Groceries
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-[3.25rem] w-full rounded-2xl border-orange-200 bg-orange-50 px-5 text-base font-black text-orange-950 shadow-sm transition-all hover:scale-105 hover:bg-orange-100 min-[420px]:h-14 sm:w-auto sm:px-6">
                <Link to="/food" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-orange-700" />
                  Café & Food
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[22rem] animate-in fade-in zoom-in duration-1000 sm:max-w-md lg:max-w-none">
             {/* Abstract Premium Visuals */}
             <div className="relative mx-auto aspect-[4/3] w-full sm:aspect-square lg:max-w-xl">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-amber-500/10 blur-2xl min-[420px]:rotate-3 sm:rounded-[4rem]" />
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-1 shadow-2xl shadow-emerald-950/10 min-[420px]:-rotate-3 sm:rounded-[4rem] sm:p-2">
                    <img
                      src="/poster.png" 
                      alt="LocalKart Featured" 
                      width="720"
                      height="720"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      className="h-full w-full rounded-[1.75rem] object-cover sm:rounded-[3.5rem]" 
                    />
                 </div>
             </div>
          </div>
        </div>
      </div>
      {/* Background patterns */}
      <div className="absolute left-0 top-0 -z-10 h-full w-full opacity-30">
        <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-emerald-200 blur-[100px]" />
        <div className="absolute right-[10%] bottom-[20%] h-64 w-64 rounded-full bg-amber-200 blur-[100px]" />
      </div>
    </section>
  );
}

export function SEOHead({ config }: { config: SEOConfig }) {
  const siteUrl = import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "https://localkart.in");
  const appName = import.meta.env.VITE_APP_NAME || "LocalKart";
  const canonicalPath = config.canonical || (typeof window !== "undefined" ? window.location.pathname : "/");
  const canonical = canonicalPath.startsWith("http") ? canonicalPath : `${siteUrl}${canonicalPath}`;
  const imagePath = config.image || "/logo.png";
  const image = imagePath.startsWith("http") ? imagePath : `${siteUrl}${imagePath}`;
  const jsonLd = Array.isArray(config.jsonLd) ? config.jsonLd : config.jsonLd ? [config.jsonLd] : [];
  const pathParts = typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean) : [];
  const breadcrumbJsonLd =
    pathParts.length
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: pathParts
            .map((part, index, parts) => ({
              "@type": "ListItem",
              position: index + 1,
              name: titleCase(part),
              item: `${siteUrl}/${parts.slice(0, index + 1).join("/")}`,
            })),
        }
      : null;

  return (
    <Helmet>
      <title>{config.title}</title>
      <meta name="description" content={config.description} />
      <meta name="robots" content="index,follow" />
      {config.keywords ? <meta name="keywords" content={config.keywords} /> : null}
      <meta property="og:title" content={config.title} />
      <meta property="og:description" content={config.description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={appName} />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={config.title} />
      <meta name="twitter:description" content={config.description} />
      <meta name="twitter:image" content={image} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {[...jsonLd, breadcrumbJsonLd].filter(Boolean).length ? (
        <script type="application/ld+json">{JSON.stringify([...jsonLd, breadcrumbJsonLd].filter(Boolean))}</script>
      ) : null}
    </Helmet>
  );
}

export function SmartImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const resolvedSrc = src || "/logo.png";
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imageSrc = failedSrc === resolvedSrc ? "/logo.png" : resolvedSrc;
  const loaded = loadedSrc === imageSrc;

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {!loaded ? <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" /> : null}
      <img
        src={imageSrc}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        onLoad={() => setLoadedSrc(imageSrc)}
        onError={() => {
          if (imageSrc !== "/logo.png") setFailedSrc(resolvedSrc);
        }}
        className={cn("h-full w-full object-cover transition duration-500", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}

export function LocationSelector() {
  const [area, setArea] = useState("Choose your city, area or pincode");
  const [editing, setEditing] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS not available. Enter area manually.");
      return;
    }
    setGpsStatus("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setArea(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        setGpsStatus("Location detected. Nearby results will use browser GPS.");
        setEditing(false);
      },
      () => setGpsStatus("Location permission denied. Enter city or area manually."),
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={() => setEditing((value) => !value)}
        aria-expanded={editing}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <MapPin className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current area
            </span>
            <span className="block text-sm font-bold text-slate-950">{area}</span>
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", editing && "rotate-180")} />
      </button>
      {editing ? (
        <div className="mt-3 grid gap-2">
          <div className="flex gap-2">
          <Input
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className="h-11 rounded-xl border-slate-200 bg-slate-50"
            placeholder="Enter area manually"
          />
          <Button type="button" className="h-11 rounded-xl bg-emerald-700" onClick={() => setEditing(false)}>
            Save
          </Button>
          </div>
          <Button type="button" variant="outline" className="h-10 rounded-xl font-bold" onClick={useCurrentLocation}>
            Use current location
          </Button>
        </div>
      ) : null}
      {gpsStatus ? <p className="mt-2 text-xs font-semibold text-slate-500">{gpsStatus}</p> : null}
    </div>
  );
}

export function TrustBadges() {
  const badges = [
    { label: "No Extra Platform Charges", icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Direct WhatsApp Ordering", icon: MessageCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Support Trusted Local Shops", icon: Store, color: "text-amber-700", bg: "bg-amber-50" },
    { label: "Direct Shopkeeper Confirmation", icon: BadgeCheck, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((item) => (
        <div key={item.label} className="group flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-4 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md backdrop-blur-sm">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-110", item.bg, item.color)}>
            <item.icon className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold leading-tight text-slate-800">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CategoryCard({
  title,
  text,
  cta,
  to,
  tone,
  icon,
}: {
  title: string;
  text: string;
  cta: string;
  to: string;
  tone: CardTone;
  icon: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border p-5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-950/10 sm:rounded-[2.5rem] sm:p-8",
        toneClasses[tone],
      )}
    >
      <div className="relative z-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">{icon}</span>
          <span className="rounded-full bg-white/60 px-4 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-sm">Direct</span>
        </div>
        <h3 className="text-2xl font-black tracking-tight text-slate-950">{title}</h3>
        <p className="mt-3 text-base leading-7 opacity-80">{text}</p>
        <span className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition-all duration-300 group-hover:gap-4">
          {cta}
          <ExternalLink className="h-4 w-4" />
        </span>
      </div>
      <div className="absolute -bottom-10 -right-10 h-40 w-40 opacity-5 transition-transform duration-700 group-hover:scale-150">
        {icon}
      </div>
    </Link>
  );
}

export function ShopStatusBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <Badge className={cn("rounded-full border px-2.5 py-1 text-xs", isOpen ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600")}>
      {isOpen ? "Open now" : "Closed"}
    </Badge>
  );
}

export function DistanceBadge({ meters }: { meters: number }) {
  return (
    <Badge className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
      <MapPin className="h-3 w-3" />
      {formatDistance(meters)}
    </Badge>
  );
}

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <Badge className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      {rating}
    </Badge>
  );
}

export function WhatsAppCTAButton({
  phoneNumber,
  message,
  children,
  className,
  disabled,
}: {
  phoneNumber: string;
  message: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      disabled={disabled}
      onClick={() => window.open(generateWhatsAppLink(phoneNumber, message), "_blank", "noopener,noreferrer")}
      className={cn("group h-12 gap-2 rounded-2xl bg-[#16A34A] px-6 font-black text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:bg-[#15803D] hover:shadow-xl active:scale-95", className)}
    >
      <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      {children}
    </Button>
  );
}

export const BusinessCard = memo(function BusinessCard({ business, to, actionLabel }: { business: Business; to: string; actionLabel: string }) {
  const message =
    business.type === "tiffin"
      ? `Hello ${business.name}, I want to enquire/order tiffin service.`
      : business.type === "kirana"
        ? `Hello ${business.name}, I want to order groceries.`
        : `Hello ${business.name}, I want to place a food order.`;

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-950/10">
      <Link to={to} className="relative block h-52 overflow-hidden">
        <SmartImage src={business.cover_image} alt={business.name} className="h-full w-full transition duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          <ShopStatusBadge isOpen={business.is_open} />
          <DistanceBadge meters={business.distance_meters} />
          {business.rating && <RatingBadge rating={business.rating} />}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <Link to={to}>
          <h3 className="text-xl font-black tracking-tight text-slate-950 group-hover:text-emerald-800">{business.name}</h3>
        </Link>
        <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {business.area}, {business.city}
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{business.description}</p>
        <div className="mt-6 flex items-center gap-3 max-[340px]:flex-col max-[340px]:items-stretch">
          <WhatsAppCTAButton phoneNumber={business.whatsapp} message={message} className="flex-1 rounded-xl max-[340px]:w-full">
            {actionLabel}
          </WhatsAppCTAButton>
          <Button asChild variant="outline" className="h-12 rounded-xl border-slate-200 px-5 font-bold hover:bg-slate-50 max-[340px]:w-full">
            <Link to={to}>Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
});

export function TiffinCard({ provider }: { provider: Business }) {
  return (
    <BusinessCard business={provider} to={`/tiffin-services/${provider.slug}`} actionLabel="Enquire" />
  );
}


export function KiranaCard({ shop }: { shop: Business }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">
      <Link to={`/kirana/${shop.slug}`} className="block">
        <div className="relative h-44 overflow-hidden">
          <SmartImage src={shop.cover_image} alt={shop.name} className="h-full w-full transition duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            <ShopStatusBadge isOpen={shop.is_open} />
            {shop.delivery_available ? (
              <Badge className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                Delivery available
              </Badge>
            ) : null}
            <DistanceBadge meters={shop.distance_meters} />
          </div>
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <Link to={`/kirana/${shop.slug}`}>
          <h3 className="text-lg font-black text-slate-950">{shop.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-slate-600">{shop.area}, {shop.city}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span>Minimum order</span>
          <strong>{shop.min_order ? `Rs ${shop.min_order}` : "Ask shop"}</strong>
        </div>
        <div className="mt-4 flex gap-2 max-[340px]:flex-col">
          <WhatsAppCTAButton
            phoneNumber={shop.whatsapp}
            message={`Hello ${shop.name}, I want to order groceries.`}
            className="flex-1 max-[340px]:w-full"
          >
            Order
          </WhatsAppCTAButton>
          <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 font-bold max-[340px]:w-full">
            <Link to={`/kirana/${shop.slug}`}>Products</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function FoodCard({ shop }: { shop: Business }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl">
      <Link to={`/food/${shop.slug}`} className="block">
        <div className="relative h-44 overflow-hidden">
          <SmartImage src={shop.cover_image} alt={shop.name} className="h-full w-full transition duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          <div className="absolute left-3 top-3">
            <Badge className="rounded-full border border-white/40 bg-white/90 px-3 py-1 text-xs font-black text-orange-700">
              {shop.category || "Local Food"}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            <ShopStatusBadge isOpen={shop.is_open} />
            <DistanceBadge meters={shop.distance_meters} />
            <RatingBadge rating={shop.rating} />
          </div>
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <Link to={`/food/${shop.slug}`}>
          <h3 className="text-lg font-black text-slate-950">{shop.name}</h3>
        </Link>
        <p className="mt-1 text-sm text-slate-600">{shop.area}, {shop.city}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {shop.delivery_available ? <Badge className="rounded-full bg-emerald-50 text-emerald-700">Delivery</Badge> : null}
          {shop.pickup_available ? <Badge className="rounded-full bg-blue-50 text-blue-700">Pickup</Badge> : null}
          {(shop.popular_items || []).slice(0, 2).map((item) => (
            <Badge key={item} className="rounded-full bg-orange-50 text-orange-700">{item}</Badge>
          ))}
        </div>
        <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">{shop.description}</p>
        <div className="mt-4 flex gap-2 max-[340px]:flex-col">
          <WhatsAppCTAButton
            phoneNumber={shop.whatsapp}
            message={`Hello ${shop.name}, I want to place a food order.`}
            className="flex-1 max-[340px]:w-full"
          >
            Order on WhatsApp
          </WhatsAppCTAButton>
          <Button asChild variant="outline" className="h-11 rounded-xl border-slate-200 font-bold max-[340px]:w-full">
            <Link to={`/food/${shop.slug}`}>View Menu</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function PremiumBusinessGrid({
  businesses,
  type,
  isLoading,
  adSlot,
}: {
  businesses: Business[];
  type: BusinessType;
  isLoading?: boolean;
  adSlot?: string;
}) {
  const renderCard = (business: Business) => {
    if (type === "tiffin") return <TiffinCard provider={business} />;
    if (type === "kirana") return <KiranaCard shop={business} />;
    return <FoodCard shop={business} />;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
        : businesses.map((business, index) => (
            <div key={business.id}>
              {renderCard(business)}
              {adSlot && index === 4 ? <div className="mt-4"><DynamicAdSlot slot={adSlot} /></div> : null}
            </div>
          ))}
    </div>
  );
}

export function ServiceSelector({
  services = defaultMealPlans,
  value,
  onChange,
}: {
  services?: MealPlan[];
  value: string;
  onChange: (service: MealPlan) => void;
}) {
  return (
    <div className="grid gap-3">
      {services.map((service) => {
        const selected = value === service.name;
        return (
          <button
            type="button"
            key={service.id}
            onClick={() => onChange(service)}
            className={cn(
              "flex items-center justify-between rounded-2xl border p-4 text-left transition",
              selected ? "border-fuchsia-300 bg-fuchsia-50 shadow-sm" : "border-slate-200 bg-white hover:border-fuchsia-200",
            )}
          >
            <span>
              <span className="block font-black text-slate-950">{service.name}</span>
              <span className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Clock3 className="h-3.5 w-3.5" />
                {service.duration}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-black text-slate-950">Rs {service.price}</span>
              <span className="text-xs font-bold uppercase tracking-wide text-fuchsia-700">
                {selected ? "Selected" : "Select"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ProductSelector({
  products = kiranaProducts,
  onChange,
}: {
  products?: KiranaProduct[];
  onChange: (lines: string[]) => void;
}) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    const lines = products
      .filter((product) => selected[product.id])
      .map((product) => `${product.name} - ${selected[product.id]} x ${product.unit}`);
    onChange(lines);
  }, [onChange, products, selected]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {products.map((product) => {
        const quantity = selected[product.id] || 0;
        return (
          <div key={product.id} className={cn("rounded-2xl border p-3", quantity ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{product.name}</p>
                <p className="text-sm text-slate-600">{product.unit} - {product.priceHint}</p>
              </div>
              <Badge className="rounded-full bg-white text-emerald-700">{product.category}</Badge>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Remove ${product.name}`}
                className="h-10 w-10 rounded-xl"
                onClick={() =>
                  setSelected((current) => ({ ...current, [product.id]: Math.max(0, quantity - 1) }))
                }
              >
                <X className="h-4 w-4" />
              </Button>
              <span className="min-w-8 text-center font-black">{quantity}</span>
              <Button
                type="button"
                size="icon"
                aria-label={`Add ${product.name}`}
                className="h-10 w-10 rounded-xl bg-emerald-700"
                onClick={() => setSelected((current) => ({ ...current, [product.id]: quantity + 1 }))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GroceryListInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      placeholder="Example: 5kg atta, 1L oil, 2kg rice, 1 packet tea..."
    />
  );
}

export function BookingWhatsAppForm({ salon: provider }: { salon: Business }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedService, setSelectedService] = useState<MealPlan>(defaultMealPlans[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const message = `Hello ${provider.name},
I want to enquire/order tiffin service.

Name: ${name}
Phone: ${phone}
Meal plan: ${selectedService.name}
Preferred Date: ${date}
Preferred Time: ${time}
Note: ${note || "No special note"}

Please confirm price, availability, and delivery time.`;

  const canSend = provider.whatsapp && name && phone && selectedService.name && date && time;

  const handleSend = async () => {
    if (!provider.whatsapp) setError("WhatsApp number is required.");
    else if (!name) setError("Customer name is required.");
    else if (!phone) setError("Customer phone is required.");
    else if (!selectedService.name) setError("Service is required.");
    else if (!date || !time) setError("Preferred date and time are required.");
    else {
      setError("");
      await supabase.from("whatsapp_booking_leads").insert({
        business_id: provider.id,
        customer_name: name,
        customer_phone: phone,
        preferred_date: date,
        preferred_time: time,
        note,
        whatsapp_message: message,
        metadata: {
          service_name: selectedService.name,
          service_price: selectedService.price,
          source: "frontend_whatsapp_form",
        },
      });
      window.open(generateWhatsAppLink(provider.whatsapp, message), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700">
          <CalendarClock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-950">Book on WhatsApp</h2>
          <p className="text-sm text-slate-600">Provider will confirm price, delivery and availability.</p>
        </div>
      </div>

      <ServiceSelector value={selectedService.name} onChange={setSelectedService} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" value={name} onChange={setName} placeholder="Ravi Kumar" />
        <Field label="Phone number" value={phone} onChange={setPhone} placeholder="98765 43210" />
        <Field label="Preferred date" value={date} onChange={setDate} type="date" />
        <Field label="Preferred time" value={time} onChange={setTime} type="time" />
      </div>
      <div className="mt-4">
        <Label className="text-sm font-bold text-slate-700">Special note</Label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100"
          placeholder="Any timing request or service note..."
        />
      </div>
      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      <div className="sticky bottom-20 -mx-4 mt-5 border-t border-slate-100 bg-white/95 p-4 backdrop-blur md:static md:mx-0 md:border-0 md:p-0">
        <Button
          type="button"
          onClick={() => void handleSend()}
          className="h-12 w-full rounded-2xl bg-emerald-700 text-base font-black text-white shadow-xl shadow-emerald-900/10 hover:bg-emerald-800"
        >
          <MessageCircle className="h-5 w-5" />
          Send Booking on WhatsApp
        </Button>
        {!canSend ? <p className="mt-2 text-center text-xs text-slate-500">Name, phone, service, date and time are required.</p> : null}
      </div>
    </div>
  );
}

export function KiranaWhatsAppOrderForm({ shop }: { shop: Business }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [groceryList, setGroceryList] = useState("");
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [error, setError] = useState("");

  const orderDetails = selectedLines.length ? selectedLines.join("\n") : groceryList.trim();
  const message = `Hello ${shop.name},
I want to order groceries.

Name: ${name}
Phone: ${phone}
Address: ${address}

Order Details:
${orderDetails}

Delivery Note: ${note || "No special note"}

Please confirm availability and delivery time.`;

  const handleSend = async () => {
    if (!shop.whatsapp) setError("WhatsApp number is required.");
    else if (!name) setError("Customer name is required.");
    else if (!phone) setError("Customer phone is required.");
    else if (!address) setError("Delivery address is required.");
    else if (!orderDetails) setError("Order details are required.");
    else {
      setError("");
      await supabase.from("whatsapp_order_leads").insert({
        business_id: shop.id,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        grocery_list: orderDetails,
        selected_products: selectedLines,
        note,
        whatsapp_message: message,
        metadata: {
          source: "frontend_whatsapp_form",
        },
      });
      window.open(generateWhatsAppLink(shop.whatsapp, message), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <ShoppingBasket className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-950">Order on WhatsApp</h2>
          <p className="text-sm text-slate-600">Shopkeeper will confirm availability and delivery.</p>
        </div>
      </div>

      <ProductSelector onChange={setSelectedLines} />
      <div className="mt-5">
        <Label className="text-sm font-bold text-slate-700">Or write your grocery list manually</Label>
        <div className="mt-2">
          <GroceryListInput value={groceryList} onChange={setGroceryList} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" value={name} onChange={setName} placeholder="Pooja Sharma" />
        <Field label="Phone number" value={phone} onChange={setPhone} placeholder="98765 43210" />
      </div>
      <div className="mt-4">
        <Field label="Delivery address" value={address} onChange={setAddress} placeholder="House no, street, landmark" />
      </div>
      <div className="mt-4">
        <Label className="text-sm font-bold text-slate-700">Delivery note</Label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
          placeholder="Delivery timing, landmark, alternate item preference..."
        />
      </div>
      {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
      <div className="sticky bottom-20 -mx-4 mt-5 border-t border-slate-100 bg-white/95 p-4 backdrop-blur md:static md:mx-0 md:border-0 md:p-0">
        <Button
          type="button"
          onClick={() => void handleSend()}
          className="h-12 w-full rounded-2xl bg-emerald-700 text-base font-black text-white shadow-xl shadow-emerald-900/10 hover:bg-emerald-800"
        >
          <MessageCircle className="h-5 w-5" />
          Send Order on WhatsApp
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-bold text-slate-700">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 focus-visible:ring-emerald-100"
      />
    </div>
  );
}

export function ShopRegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [photoName, setPhotoName] = useState("");

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoName(`${file.name} selected. Image will be compressed before upload in production.`);
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
        <BadgeCheck className="mx-auto h-12 w-12 text-emerald-700" />
        <h2 className="mt-4 text-2xl font-black text-slate-950">Your shop has been submitted for review.</h2>
        <p className="mt-2 text-slate-700">
          After approval, customers near your area can find your shop and contact you directly on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 md:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      {[
        "Owner name",
        "Mobile number",
        "WhatsApp number",
        "Shop name",
        "Shop address",
        "City",
        "Area/locality",
        "Pincode",
        "Manual latitude",
        "Manual longitude",
        "Opening time",
        "Closing time",
        "Delivery radius",
      ].map((label) => (
        <div key={label} className={label === "Shop address" ? "md:col-span-2" : ""}>
          <Label className="text-sm font-bold text-slate-700">{label}</Label>
          <Input className="mt-2 h-12 rounded-2xl border-slate-200 bg-slate-50" placeholder={label} required={!label.includes("latitude") && !label.includes("longitude")} />
        </div>
      ))}
      <div>
        <Label className="text-sm font-bold text-slate-700">Business type</Label>
        <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
          <option>Tiffin Service</option>
          <option>Kirana</option>
        </select>
      </div>
      <div>
        <Label className="text-sm font-bold text-slate-700">Home delivery available</Label>
        <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <Label className="text-sm font-bold text-slate-700">Shop photo upload</Label>
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm font-bold text-slate-600">
          <ImagePlus className="h-5 w-5" />
          Upload shop photo
          <input type="file" accept="image/*" className="hidden" onChange={(event) => void handlePhoto(event.target.files?.[0])} />
        </label>
        {photoName ? <p className="mt-2 text-xs font-semibold text-emerald-700">{photoName}</p> : null}
      </div>
      <div className="md:col-span-2">
        <Label className="text-sm font-bold text-slate-700">Description</Label>
        <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100" placeholder="Tell customers what your shop is known for." />
      </div>
      <div className="md:col-span-2">
        <Button className="h-12 w-full rounded-2xl bg-emerald-700 text-base font-black hover:bg-emerald-800">
          Submit for approval
        </Button>
      </div>
    </form>
  );
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      {items.map((item, index) => (
        <div key={item.question}>
          <button
            type="button"
            onClick={() => setOpen(open === index ? -1 : index)}
            className="flex w-full items-center justify-between gap-4 p-4 text-left"
          >
            <span className="font-black text-slate-950">{item.question}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-500 transition", open === index && "rotate-180")} />
          </button>
          {open === index ? <p className="px-4 pb-4 text-sm leading-6 text-slate-600">{item.answer}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { title: "Choose nearby provider", desc: "Find trusted tiffin services, food shops or kirana stores in your area.", icon: Search },
    { title: "Fill details", desc: "Select services or write your grocery list easily.", icon: Edit3 },
    { title: "Send on WhatsApp", desc: "Your request goes directly to the shopkeeper's phone.", icon: MessageCircle },
    { title: "Shopkeeper confirms", desc: "Get direct manual confirmation and delivery details.", icon: BadgeCheck },
  ];

  return (
    <div className="relative grid gap-6 md:grid-cols-4">
      <div className="absolute left-8 top-12 hidden h-0.5 w-[calc(100%-64px)] bg-slate-200 md:block" />
      {steps.map((step, index) => (
        <div key={step.title} className="group relative rounded-3xl border border-white bg-white/60 p-6 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-xl md:p-8">
          <div className="relative z-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <step.icon className="h-6 w-6" />
            </span>
            <div className="mt-6">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700">Step 0{index + 1}</span>
              <h3 className="mt-2 text-xl font-black text-slate-950">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DynamicAdSlot({ slot }: { slot: string }) {
  const { data: adsEnabled = true } = useQuery({
    queryKey: ["app-config", "ads_enabled"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_config").select("value").eq("key", "ads_enabled").maybeSingle();
      if (error || data?.value === undefined) return true;
      return Boolean(data.value);
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data } = useQuery({
    queryKey: ["ad-slot", slot],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("ad_slots")
        .select("key, name, provider, test_mode, ad_units(id, title, body, image_url, link_url, is_active)")
        .eq("key", slot)
        .eq("is_active", true)
        .maybeSingle();

      if (error) return null;
      return row as DynamicAdSlotRow | null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: adsEnabled,
  });

  if (!adsEnabled) return null;

  const dynamicAd = data?.ad_units?.find((unit) => unit.is_active);
  const fallbackAd = adUnits.find((unit) => unit.slot === slot && unit.is_active);
  const title = dynamicAd?.title || fallbackAd?.title || (import.meta.env.DEV ? "Development ad placeholder" : "");
  const description = dynamicAd?.body || fallbackAd?.description || (import.meta.env.DEV ? "Production AdSense/AdMob code will be injected from admin-managed ad units here." : "");
  const imageUrl = dynamicAd?.image_url;

  if (!title && !description && !imageUrl) return null;

  return (
    <a
      href={dynamicAd?.link_url || undefined}
      className="block min-h-28 overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-emerald-300 hover:bg-emerald-50"
      target={dynamicAd?.link_url ? "_blank" : undefined}
      rel={dynamicAd?.link_url ? "noreferrer" : undefined}
    >
      {/* Production ad provider snippets should be loaded through admin-managed ad slot/unit configuration, never hardcoded here. */}
      {imageUrl ? <img src={imageUrl} alt={title || data?.name || slot} loading="lazy" decoding="async" className="mb-3 h-28 w-full rounded-2xl object-cover" /> : null}
      <Badge className="rounded-full bg-white text-slate-600">Ad slot: {data?.name || slot}</Badge>
      {title ? <h3 className="mt-3 font-black text-slate-950">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
    </a>
  );
}

export function CityLandingContent({ type, city, area }: { type: BusinessType; city?: string; area?: string }) {
  const cityName = titleCase(city) || "your city";
  const areaName = titleCase(area);
  const place = areaName ? `${areaName}, ${cityName}` : cityName;

  if (type === "tiffin") {
    return (
      <section className="rounded-3xl border border-fuchsia-100 bg-fuchsia-50 p-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Find Nearby Tiffin Services in {place} Directly on WhatsApp</h1>
        <p className="mt-4 leading-7 text-slate-700">
          With LocalKart, you can explore nearby tiffin services in {place}, compare meal plans, and send your enquiry directly on WhatsApp. The provider will confirm price, delivery and availability.
        </p>
      </section>
    );
  }

  if (type === "food") {
    return (
      <section className="rounded-3xl border border-orange-100 bg-orange-50 p-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Order from Nearby Café & Food Shops in {place} on WhatsApp</h1>
        <p className="mt-4 leading-7 text-slate-700">
          Finding local food in {place} should be simple. With LocalKart, you can discover nearby cafés, Chinese corners, momo shops, bakeries, juice shops and snack points, then send your order directly on WhatsApp. The shopkeeper confirms availability, price and timing directly with you.
        </p>
        <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-black text-orange-800">
          Delivery or pickup depends on shop availability. Shopkeeper will confirm on WhatsApp.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">Order from Nearby Kirana Shops in {place} on WhatsApp</h1>
      <p className="mt-4 leading-7 text-slate-700">
        Extra charge kyun dena? LocalKart helps you discover kirana stores near you and send your grocery list directly on WhatsApp. The shopkeeper will confirm availability, delivery timing, and any delivery charge. Delivery depends on shop availability.
      </p>
    </section>
  );
}

export function AdminLayout() {
  const { signOut } = useAuth();
  const nav = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Approvals", to: "/admin/approvals", icon: UserCheck },
    { label: "Tiffin services", to: "/admin/tiffin-services", icon: Soup },
    { label: "Kirana", to: "/admin/kirana-shops", icon: Store },
    { label: "Food shops", to: "/admin/food-shops", icon: Utensils },
    { label: "Users", to: "/admin/users", icon: Users },
    { label: "Categories", to: "/admin/categories", icon: Filter },
    { label: "WhatsApp leads", to: "/admin/leads", icon: MessageCircle },
    { label: "Reviews", to: "/admin/reviews", icon: Star },
    { label: "Banners", to: "/admin/banners", icon: ImagePlus },
    { label: "Ads", to: "/admin/ads", icon: Megaphone },
    { label: "SEO", to: "/admin/seo", icon: Search },
    { label: "Pages CMS", to: "/admin/pages", icon: Edit3 },
    { label: "FAQs", to: "/admin/faqs", icon: MessageCircle },
    { label: "App config", to: "/admin/config", icon: ShieldCheck },
    { label: "Reports/support", to: "/admin/reports", icon: ShieldCheck },
    { label: "Audit logs", to: "/admin/audit-logs", icon: ShieldCheck },
  ];
  const handleLogout = async () => {
    await signOut();
    window.location.assign("/admin-login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <Link to="/" className="flex items-center gap-3">
          <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-emerald-200/50">
            <img
              src="/logo.png" 
              alt="LocalKart logo" 
              width="48"
              height="48"
              decoding="async"
              className="absolute inset-0 h-full w-full scale-[2.25] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[2.4]" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black leading-none tracking-tight text-slate-950">
              Local<span className="text-emerald-700">Kart</span>
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Admin Control <span className="mx-1 opacity-50">•</span> Portal
            </span>
          </div>
        </Link>
        <nav className="mt-8 grid max-h-[calc(100vh-130px)] gap-1 overflow-y-auto pr-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  isActive ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 border-t border-slate-100 pt-4">
          <Button variant="outline" className="h-11 w-full rounded-2xl border-red-100 font-black text-red-700 hover:bg-red-50" onClick={() => void handleLogout()}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      <main className="lg:pl-72">
        <div className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Control center</p>
              <h1 className="text-2xl font-black text-slate-950 sm:text-2xl">Shop approvals, ads, SEO and content</h1>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button asChild variant="outline" className="hidden rounded-xl font-bold sm:inline-flex">
                <Link to="/">View app</Link>
              </Button>
              <Button variant="outline" className="rounded-xl border-red-100 font-bold text-red-700 hover:bg-red-50" onClick={() => void handleLogout()}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
        <nav className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden" aria-label="Admin sections">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto no-scrollbar">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition",
                    isActive ? "bg-emerald-700 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="mx-auto max-w-6xl p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function AdminTable({ title, rows }: { title: string; rows: Record<string, string>[] }) {
  const columns = useMemo(() => Object.keys(rows[0] || { name: "", status: "", action: "" }), [rows]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <Button variant="outline" className="w-full rounded-xl sm:w-auto">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {rows.map((row) => (
          <article key={JSON.stringify(row)} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            <dl className="grid gap-3">
              {columns.map((column) => (
                <div key={column} className="min-w-0">
                  <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">{column}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-700">{row[column]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-black">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={JSON.stringify(row)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column} className="px-4 py-4 font-semibold text-slate-700">{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApprovalCard({ business }: { business: Business }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 min-[380px]:flex-row">
        <img src={business.cover_image} alt={business.name} className="h-20 w-20 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-slate-950">{business.name}</h3>
            <Badge className="rounded-full bg-slate-100 text-slate-700">{business.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">{business.address}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{business.whatsapp}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 min-[380px]:grid-cols-2">
        <Button className="w-full rounded-xl bg-emerald-700 font-black hover:bg-emerald-800">
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button variant="outline" className="w-full rounded-xl border-red-200 font-black text-red-700 hover:bg-red-50">
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, text, center }: { eyebrow?: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={cn("mb-8 max-w-3xl", center && "mx-auto text-center")}>
      {eyebrow ? (
        <div className={cn("mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800", center && "mx-auto")}>
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">{title}</h2>
      {text ? <p className="mt-4 text-lg leading-8 text-slate-600 text-balance">{text}</p> : null}
    </div>
  );
}


export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
      <Store className="mx-auto h-10 w-10 text-slate-400" />
      <h3 className="mt-3 font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
    </div>
  );
}
