import { Heart } from "lucide-react";
import { kiranaStores, salons } from "../lib/mockData";
import { KiranaCard, SalonCard, SEOHead, SectionHeader } from "../components/marketplace";

export default function Favorites() {
  const favorites = [salons[0], kiranaStores[0]];

  return (
    <>
      <SEOHead config={{ title: "Your Favorite Local Shops | LocalKart", description: "Saved salons and kirana shops for quick WhatsApp booking and ordering." }} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <SectionHeader eyebrow="Favorites" title="Saved shops for quick WhatsApp action" text="Keep your regular salon and trusted dukandaar one tap away." />
        <div className="mb-5 rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-800">
          <Heart className="mr-2 inline h-4 w-4" />
          Live favorites will sync after customer login. Showing starter examples for now.
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SalonCard salon={favorites[0]} />
          <KiranaCard shop={favorites[1]} />
        </div>
      </div>
    </>
  );
}
