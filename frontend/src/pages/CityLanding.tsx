import { Link, useParams } from "react-router-dom";
import { foodShops, kiranaStores, salons } from "../lib/mockData";
import { CityLandingContent, FoodCard, KiranaCard, SalonCard, SEOHead, SectionHeader } from "../components/marketplace";
import type { BusinessType } from "../lib/types";
import { titleCase } from "../lib/utils";

export default function CityLanding({ type }: { type: BusinessType }) {
  const { city, area } = useParams();
  const cityName = titleCase(city) || "Your City";
  const areaName = titleCase(area);
  const place = areaName ? `${areaName}, ${cityName}` : cityName;
  const isSalon = type === "salon";
  const isFood = type === "food";
  const routeBase = isSalon ? "salon-booking" : isFood ? "food-delivery" : "kirana-delivery";
  const seoTitle = isSalon
    ? `Book Nearby Salons in ${place} Directly on WhatsApp`
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
          description: isSalon
            ? `Explore nearby salons in ${place}, choose services, and send booking requests directly on WhatsApp.`
            : isFood
              ? `Finding local food in ${place} should be simple. Discover cafés, Chinese corners, momo shops, bakeries, juice shops and snack points, then send your order directly on WhatsApp.`
              : `Discover nearby kirana stores in ${place} and send grocery lists directly on WhatsApp without unnecessary app charges.`,
          canonical: `/${routeBase}/${city}${area ? `/${area}` : ""}`,
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": isSalon ? "BeautySalon" : isFood ? "FoodEstablishment" : "GroceryStore",
              name: isSalon ? `Nearby salons in ${place}` : isFood ? `Nearby food shops in ${place}` : `Nearby kirana shops in ${place}`,
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
            eyebrow={isSalon ? "Salons near you" : isFood ? "Food shops near you" : "Kirana shops near you"}
            title={isSalon ? `Popular salon options in ${place}` : isFood ? `Local food options in ${place}` : `Local kirana options in ${place}`}
            text="These sample listings show how city and locality SEO pages will feel once connected to live Supabase data."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(isSalon ? salons : isFood ? foodShops : kiranaStores).map((business) => {
              if (isSalon) return <SalonCard key={business.id} salon={business} />;
              if (isFood) return <FoodCard key={business.id} shop={business} />;
              return <KiranaCard key={business.id} shop={business} />;
            })}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Explore more"
            title={isSalon ? "Popular salons near you" : isFood ? "Food shops near you" : "Kirana shops near you"}
            text={isSalon ? "Try nearby city and area pages for more salon discovery." : isFood ? "Try nearby city and area pages for local food shops." : "Try nearby city and area pages for local grocery shops."}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["/salon-booking/bengaluru", "Bengaluru salons"],
              ["/salon-booking/bengaluru/indiranagar", "Indiranagar salons"],
              ["/kirana-delivery/bengaluru", "Bengaluru kirana shops"],
              ["/food-delivery/bengaluru", "Bengaluru food shops"],
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
