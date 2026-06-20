import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, MessageCircle, Phone, Plus, ShoppingBag, Store, Utensils, X } from "lucide-react";
import { foodMenuItems, foodShops } from "../lib/mockData";
import {
  DistanceBadge,
  DynamicAdSlot,
  FoodCard,
  RatingBadge,
  SEOHead,
  SectionHeader,
  ShopStatusBadge,
} from "../components/marketplace";
import { FoodOrderWhatsAppForm } from "../components/forms/LeadForms";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useBusinessBySlug, useFoodMenuItems } from "../lib/businesses";
import { EmptyStateBlock, SkeletonCard } from "../components/feedback";
import { generateWhatsAppLink } from "../lib/whatsapp";

export default function FoodDetail() {
  const { slug } = useParams();
  const { data: shop = foodShops.find((item) => item.slug === slug) || foodShops[0], isLoading } = useBusinessBySlug("food", slug);
  const { data: menuItems = foodMenuItems } = useFoodMenuItems(shop?.id);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const categories = useMemo(() => Array.from(new Set(menuItems.map((item) => item.category))), [menuItems]);
  const visibleMenuItems = useMemo(
    () => (selectedCategory === "All" ? menuItems : menuItems.filter((item) => item.category === selectedCategory)),
    [menuItems, selectedCategory],
  );
  const selectedCount = Object.values(selectedItems).reduce((total, quantity) => total + quantity, 0);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-6"><SkeletonCard /></div>;
  }

  if (!shop) {
    return <div className="mx-auto max-w-4xl px-4 py-12"><EmptyStateBlock title="Food shop not found" text="This food shop is not approved or no longer available." /></div>;
  }

  const related = foodShops.filter((item) => item.slug !== shop.slug).slice(0, 3);

  return (
    <>
      <SEOHead
        config={{
          title: `${shop.name} Menu & WhatsApp Food Order | ${shop.area}`,
          description:
            "Order from a nearby café or local food shop directly on WhatsApp. Shopkeeper confirms availability, total amount, pickup or delivery timing.",
          image: shop.cover_image,
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": shop.category?.toLowerCase().includes("cafe") ? "CafeOrCoffeeShop" : "FoodEstablishment",
              name: shop.name,
              address: shop.address,
              telephone: shop.phone,
              image: shop.cover_image,
              servesCuisine: shop.category || "Local Food",
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                ["Who confirms this food order?", "The shopkeeper confirms availability, total amount and timing on WhatsApp."],
                ["Is delivery guaranteed?", "Delivery or pickup depends on shop availability."],
              ].map(([question, answer]) => ({
                "@type": "Question",
                name: question,
                acceptedAnswer: { "@type": "Answer", text: answer },
              })),
            },
          ],
        }}
      />

      <div className="mx-auto max-w-7xl px-3 py-6 pb-24 sm:px-4 md:pb-12">
        <Button asChild variant="ghost" className="mb-4 w-full rounded-xl font-bold text-slate-700 sm:w-auto">
          <Link to="/food">
            <ArrowLeft className="h-4 w-4" />
            Back to food shops
          </Link>
        </Button>

        <section className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-sm sm:rounded-[2rem]">
          <div className="relative h-[340px] md:h-[430px]">
            <img src={shop.cover_image} alt={shop.name} className="h-full w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-8">
              <div className="mb-3 flex flex-wrap gap-2">
                <ShopStatusBadge isOpen={shop.is_open} />
                <Badge className="rounded-full border border-orange-100 bg-orange-50 text-orange-700">{shop.category || "Local Food"}</Badge>
                <DistanceBadge meters={shop.distance_meters} />
                <RatingBadge rating={shop.rating} />
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">{shop.name}</h1>
              <p className="mt-2 max-w-2xl text-white/90">{shop.address}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Direct WhatsApp order", Icon: MessageCircle },
            { label: "Local food shop", Icon: Store },
            { label: "Pickup or delivery depends on availability", Icon: ShoppingBag },
            { label: "Shopkeeper confirms directly", Icon: BadgeCheck },
          ].map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-[1.5rem] border border-orange-100 bg-orange-50 p-4 sm:rounded-3xl">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-black text-slate-950">{label}</span>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">Menu</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Choose a section, then add items for WhatsApp order.</p>
              </div>
              {selectedCount ? (
                <Badge className="w-fit rounded-full bg-orange-600 px-3 py-1.5 text-white">
                  {selectedCount} selected
                </Badge>
              ) : null}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["All", ...categories].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                    selectedCategory === category
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-900/10"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3">
              {visibleMenuItems.map((item) => {
                const quantity = selectedItems[item.id] || 0;
                return (
                <div key={item.id} className={`rounded-2xl border p-4 transition ${quantity ? "border-orange-200 bg-orange-50/60" : "border-slate-100 bg-slate-50"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-950">{item.name}</h3>
                        <span className={`h-2.5 w-2.5 rounded-full ${item.is_veg ? "bg-emerald-500" : "bg-red-500"}`} title={item.is_veg ? "Veg" : "Non-veg"} />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description || item.category}</p>
                      <p className="mt-2 text-base font-black text-orange-700">{item.price ? `Rs ${item.price}` : "Ask shop"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 self-start">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Remove ${item.name}`}
                        className="h-10 w-10 rounded-xl bg-white shadow-sm"
                        onClick={() => setSelectedItems((current) => ({ ...current, [item.id]: Math.max(0, quantity - 1) }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <span className="min-w-8 text-center font-black text-slate-950">{quantity}</span>
                      <Button
                        type="button"
                        size="icon"
                        aria-label={`Add ${item.name}`}
                        className="h-10 w-10 rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-900/15 hover:bg-orange-700"
                        onClick={() => setSelectedItems((current) => ({ ...current, [item.id]: quantity + 1 }))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className={item.is_veg ? "mt-2 rounded-full bg-emerald-50 text-emerald-700" : "mt-2 rounded-full bg-red-50 text-red-700"}>
                      {item.is_veg ? "Veg" : "Non-veg"}
                    </Badge>
                  </div>
                </div>
              );
              })}
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="h-12 flex-1 rounded-2xl border-slate-200 font-black">
                <a href={`tel:${shop.phone}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
              <Button asChild className="h-12 flex-1 rounded-2xl bg-emerald-700 font-black hover:bg-emerald-800">
                <a href={generateWhatsAppLink(shop.whatsapp, `Hello ${shop.name}, I want to place a food order.`)} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </section>

          <div>
            <FoodOrderWhatsAppForm shop={shop} menuItems={menuItems} selected={selectedItems} setSelected={setSelectedItems} />
            <div className="mt-4">
              <DynamicAdSlot slot="food_order_form_bottom" />
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start">
            <Utensils className="mt-1 h-5 w-5 shrink-0 text-orange-700" />
            <div>
              <h2 className="text-2xl font-black text-slate-950">Order local food without complicated checkout</h2>
              <p className="mt-3 leading-7 text-slate-700">
                Craving kuch tasty? Apne nearby café ya food shop ko seedha WhatsApp par order bhejein. LocalKart only helps you send clear order details. The shopkeeper confirms availability, total amount, timing, delivery or pickup directly on WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <SectionHeader eyebrow="Nearby food shops" title="Related food shops nearby" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <FoodCard key={item.id} shop={item} />)}
          </div>
        </section>

        <div className="mt-6">
          <DynamicAdSlot slot="food_detail_bottom" />
        </div>
      </div>
    </>
  );
}
