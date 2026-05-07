import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteUrl = process.env.VITE_SITE_URL || "https://localkart.in";
const cities = ["bengaluru", "mumbai", "delhi", "pune", "hyderabad"];
const areas = ["indiranagar", "koramangala", "hsr-layout", "whitefield"];

const staticRoutes = [
  "/",
  "/salons",
  "/kirana",
  "/food",
  "/register-shop",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/faq",
];

const dynamicRoutes = cities.flatMap((city) => [
  `/salon-booking/${city}`,
  `/kirana-delivery/${city}`,
  `/food-delivery/${city}`,
  ...areas.flatMap((area) => [`/salon-booking/${city}/${area}`, `/kirana-delivery/${city}/${area}`, `/food-delivery/${city}/${area}`]),
]);

const urls = [...staticRoutes, ...dynamicRoutes];
const lastmod = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route === "/" ? "daily" : "weekly"}</changefreq>
    <priority>${route === "/" ? "1.0" : "0.7"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync(resolve("public", "sitemap.xml"), sitemap);
console.log(`Generated sitemap.xml with ${urls.length} URLs`);
