import { Link, useParams } from "react-router-dom";
import { foodShops, kiranaStores, tiffinProviders } from "../lib/mockData";
import { CityLandingContent, FoodCard, KiranaCard, SEOHead, SectionHeader, TiffinCard } from "../components/marketplace";
import type { BusinessType } from "../lib/types";
import { titleCase } from "../lib/utils";

export default function CityLanding({ type }: { type: BusinessType }) {
  const { city, area } = useParams();
  const cityName = titleCase(city) || "Your City";
  const areaName = titleCase(area);
  const place = areaName ? `${areaName}, ${cityName}` : cityName;
  const isTiffin = type === "tiffin";
  const isFood = type === "food";
  const routeBase = isTiffin ? "tiffin-service" : isFood ? "food-delivery" : "kirana-delivery";
  const seoTitle = isTiffin
    ? `Find Nearby Tiffin Services in ${place} Directly on WhatsApp`
    : isFood
      ? areaName
        ? `Nearby Food Shops in ${place} | Direct WhatsApp Order`
        : `Order from Nearby Café & Food Shops in ${place} on WhatsApp`
      : `Order from Nearby Kirana Shops in ${place} on WhatsApp`;

  return (
    <>
      <SEOHead
        config={{
          title: seoTitle,
          description: isTiffin
            ? `Explore nearby tiffin services in ${place}, compare meal plans, and send enquiries directly on WhatsApp.`
            : isFood
              ? `Finding local food in ${place} should be simple. Discover cafés, Chinese corners, momo shops, bakeries, juice shops and snack points, then send your order directly on WhatsApp.`
              : `Discover nearby kirana stores in ${place} and send grocery lists directly on WhatsApp without unnecessary app charges.`,
          canonical: `/${routeBase}/${city}${area ? `/${area}` : ""}`,
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": isTiffin ? "FoodEstablishment" : isFood ? "FoodEstablishment" : "GroceryStore",
              name: isTiffin ? `Nearby tiffin services in ${place}` : isFood ? `Nearby food shops in ${place}` : `Nearby kirana shops in ${place}`,
              areaServed: place,
              url: `/${routeBase}/${city}`,
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: isFood
                ? [
                    ["Can I order from cafés on WhatsApp?", "Yes. The order goes directly to the shopkeeper WhatsApp."],
                    ["Who confirms the food order?", "The shopkeeper confirms availability, total amount and timing directly."],
                    ["Can I choose pickup instead of delivery?", "Yes. Delivery or pickup depends on shop availability."],
                  ].map(([question, answer]) => ({
                    "@type": "Question",
                    name: question,
                    acceptedAnswer: { "@type": "Answer", text: answer },
                  }))
                : [],
            },
          ],
        }}
      />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <CityLandingContent type={type} city={city} area={area} />
        <section>
          <SectionHeader
            eyebrow={isTiffin ? "Tiffin services near you" : isFood ? "Food shops near you" : "Kirana shops near you"}
            title={isTiffin ? `Popular tiffin options in ${place}` : isFood ? `Local food options in ${place}` : `Local kirana options in ${place}`}
            text="These sample listings show how city and locality SEO pages will feel once connected to live Supabase data."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(isTiffin ? tiffinProviders : isFood ? foodShops : kiranaStores).map((business) => {
              if (isTiffin) return <TiffinCard key={business.id} provider={business} />;
              if (isFood) return <FoodCard key={business.id} shop={business} />;
              return <KiranaCard key={business.id} shop={business} />;
            })}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Explore more"
            title={isTiffin ? "Popular tiffin services near you" : isFood ? "Food shops near you" : "Kirana shops near you"}
            text={isTiffin ? "Try nearby city and area pages for more tiffin discovery." : isFood ? "Try nearby city and area pages for local food shops." : "Try nearby city and area pages for local grocery shops."}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["/tiffin-service/your-city", "Tiffin services in your city"],
              ["/tiffin-services/city/your-city/your-area", "Home food in your area"],
              ["/kirana-delivery/your-city", "Kirana shops in your city"],
              ["/food-delivery/your-city", "Food shops in your city"],
              ["/register-shop", "Register your shop"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-black text-slate-800 hover:bg-emerald-50">
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
