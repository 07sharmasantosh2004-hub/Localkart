import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { SEOHead } from "../components/marketplace";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <>
      <SEOHead
        config={{
          title: "Page Not Found | LocalKart",
          description: "This LocalKart page was not found. Explore nearby tiffin services, kirana shops, or register your shop for free.",
          canonical: "/404",
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "404", item: "/404" },
            ],
          },
        }}
      />
      <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-12">
        <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
          <Search className="mx-auto h-12 w-12 text-emerald-700" />
          <h1 className="mt-4 text-4xl font-black text-slate-950">Page nahi mila</h1>
          <p className="mt-3 leading-7 text-slate-600">
            This page may have moved. You can still find nearby tiffin services, kirana shops, or list your shop free on LocalKart.
          </p>
          <Button asChild className="mt-6 rounded-2xl bg-emerald-700 font-black">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
