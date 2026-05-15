import { Link } from "react-router-dom";
import { BadgeIndianRupee, Soup, ShoppingBasket, Store, Utensils, ExternalLink, Check, Users } from "lucide-react";
import { customerFaqs, foodShops, tiffinProviders } from "../lib/mockData";
import {
  HeroSection,
  CategoryCard,
  DynamicAdSlot,
  FAQAccordion,
  FoodCard,
  HowItWorks,
  TiffinCard,
  SEOHead,
  SectionHeader,
  TrustBadges,
} from "../components/marketplace";
import { Button } from "../components/ui/button";
import { useNearbyBusinesses } from "../lib/businesses";
import { useFaqs } from "../services/cms";

export default function Home() {
  const { data: homeTiffins = tiffinProviders } = useNearbyBusinesses({ type: "tiffin", radiusKm: 10 });
  const { data: homeFoodShops = foodShops } = useNearbyBusinesses({ type: "food", radiusKm: 10 });
  const { data: faqs = [] } = useFaqs("customer");
  const visibleFaqs = faqs.length ? faqs : customerFaqs;

  return (
    <>
      <SEOHead
        config={{
          title: "Nearby Tiffin Services & Cloud Kitchens | Direct WhatsApp Ordering",
          description:
            "Find nearby tiffin services, home food providers, kirana shops, cafes and local food shops. Send orders directly on WhatsApp without extra platform charges.",
          keywords:
            "tiffin service near me, home food near me, cloud kitchen near me, monthly tiffin plan, kirana home delivery, local shops near me, order grocery on WhatsApp",
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "LocalKart",
              description:
                "Hyperlocal platform connecting customers with nearby tiffin services, kirana shops and food providers directly on WhatsApp.",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Tiffin, Kirana and Local Food WhatsApp leads",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: visibleFaqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ],
        }}
      />

      <HeroSection />

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 md:py-12">
        <TrustBadges />

        <section>
          <SectionHeader
            center
            eyebrow="Explore Categories"
            title="What are you looking for today?"
            text="Choose your category and connect with the best local shops in your neighborhood."
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <CategoryCard
              title="Tiffin Services"
              text="Find nearby home food providers, trial meals and monthly tiffin plans directly on WhatsApp."
              cta="Find Tiffin Services"
              to="/tiffin-services"
              tone="tiffin"
              icon={<Soup className="h-8 w-8 text-emerald-700" />}
            />
            <CategoryCard
              title="Kirana Store"
              text="Order from your nearest kirana shop without paying unnecessary extra charges."
              cta="Find Kirana Shops"
              to="/kirana"
              tone="kirana"
              icon={<ShoppingBasket className="h-8 w-8 text-emerald-700" />}
            />
            <CategoryCard
              title="Café & Food"
              text="Nearby café, Chinese corner aur local food shops se direct WhatsApp par order karein."
              cta="Explore Food Shops"
              to="/food"
              tone="food"
              icon={<Utensils className="h-8 w-8 text-orange-700" />}
            />
          </div>
        </section>

        <DynamicAdSlot slot="home_after_categories" />

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Nearby tiffin services"
              title="Home food and meal plans near you"
              text="Breakfast, lunch, dinner, trial meal or monthly plan - pick a nearby provider and send details directly on WhatsApp."
            />
            <Button asChild variant="link" className="h-auto p-0 text-lg font-black text-emerald-800">
              <Link to="/tiffin-services" className="flex items-center gap-2">
                View all tiffin services <ExternalLink className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {homeTiffins.slice(0, 6).map((provider) => (
              <TiffinCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[3rem] bg-[#064E3B] px-6 py-12 text-white md:px-16 md:py-24">
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
                For local shopkeepers
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Own a tiffin service, kirana or food shop?
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-emerald-50/80 sm:text-xl">
                Apna tiffin service, cloud kitchen, kirana, cafe, Chinese corner, momo shop, bakery ya local food business free mein list karein aur direct WhatsApp leads paayen.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                {["Free Listing", "Zero Commission", "Direct WhatsApp Contacts", "Local Visibility"].map((tag) => (
                  <div key={tag} className="flex items-center gap-2 text-sm font-bold text-emerald-200">
                    <Check className="h-5 w-5 text-emerald-400" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
            <Button asChild size="lg" className="h-16 w-full rounded-[2rem] bg-[#F59E0B] px-6 text-lg font-black text-slate-950 shadow-2xl shadow-amber-950/20 transition-all hover:scale-105 hover:bg-[#D97706] sm:w-auto sm:px-10 sm:text-xl">
              <Link to="/register-shop">Register Your Shop Free</Link>
            </Button>
          </div>
          {/* Background decoration */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-900/50 blur-3xl" />
        </section>

        <section>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Nearby cafés & food shops"
              title="Local taste, direct WhatsApp order"
              text="Nearby café, Chinese corner aur local food shops se direct WhatsApp par order karein."
            />
            <Button asChild variant="link" className="h-auto p-0 text-lg font-black text-orange-800">
              <Link to="/food" className="flex items-center gap-2">
                View all food shops <ExternalLink className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {homeFoodShops.slice(0, 6).map((shop) => (
              <FoodCard key={shop.id} shop={shop} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            center
            eyebrow="How it works"
            title="Simple enough for everyone"
            text="LocalKart is built for speed and trust. No complex checkouts, just direct human contact."
          />
          <div className="mt-12">
            <HowItWorks />
          </div>
        </section>

        <section className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeader
              eyebrow="Why LocalKart"
              title="Built for trust, not platform fees"
              text="This is not a paid delivery app. It is a simple bridge between customers and the local shops they already know."
            />
            <div className="mt-8 space-y-4">
              {[
                { title: "Direct Human Relationship", desc: "Talk directly to the shopkeeper you trust. No middleman support bots.", icon: Users },
                { title: "Zero Platform Markup", desc: "Pay the shop's actual price. We don't add hidden 'platform convenience' fees.", icon: BadgeIndianRupee },
                { title: "Local Economy Support", desc: "Help neighborhood shops thrive by cutting out massive aggregator commissions.", icon: Store },
              ].map((item) => (
                <div key={item.title} className="group flex gap-6 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <item.icon className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-base leading-7 text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-8">
            <SectionHeader eyebrow="FAQ" title="Common questions" />
            <FAQAccordion items={visibleFaqs} />
          </div>
        </section>

        <section className="rounded-[3.5rem] bg-amber-50 p-12 md:p-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-amber-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Store className="h-5 w-5" />
                </div>
                <p className="text-xl font-black">Your local market, now on WhatsApp.</p>
              </div>
              <p className="max-w-2xl text-lg leading-7 text-amber-900/70">
                No middleman. No extra app charge. Just your trusted local shop and a clear WhatsApp message.
              </p>
            </div>
            <Button asChild size="lg" className="h-14 rounded-2xl bg-amber-600 px-8 font-black text-white hover:bg-amber-700">
              <Link to="/tiffin-service/your-city">Explore city pages</Link>
            </Button>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Popular city links" title="Explore LocalKart by city" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["/tiffin-service/your-city", "Tiffin services in your city"],
              ["/kirana-delivery/your-city", "Kirana delivery in your city"],
              ["/food-delivery/your-city", "Food shops in your city"],
              ["/tiffin-services/city/your-city/your-area", "Home food in your area"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 text-sm font-black text-slate-800 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50">
                {label}
                <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
