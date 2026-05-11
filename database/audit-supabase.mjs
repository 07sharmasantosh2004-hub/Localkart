import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const envPath = path.join(projectRoot, "supabase", ".env");

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

const env = { ...readEnv(envPath), ...process.env };
const supabaseUrl = env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

const tables = [
  "profiles",
  "addresses",
  "businesses",
  "business_photos",
  "business_hours",
  "categories",
  "salon_services",
  "product_categories",
  "products",
  "reviews",
  "favorites",
  "banners",
  "ad_slots",
  "ad_units",
  "pages",
  "seo_pages",
  "faqs",
  "support_tickets",
  "reports",
  "app_config",
  "admin_audit_logs",
  "whatsapp_booking_leads",
  "whatsapp_order_leads",
  "food_categories",
  "food_items",
  "whatsapp_food_order_leads",
];

const buckets = ["avatars", "business-photos", "product-images", "food-images", "banners", "page-assets"];

async function check(url) {
  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  return response.status;
}

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY in supabase/.env.");
  process.exit(1);
}

let failed = false;

console.log(`Auditing Supabase project: ${supabaseUrl}`);
console.log("\nTables");
for (const table of tables) {
  const status = await check(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`);
  const ok = status >= 200 && status < 300;
  failed ||= !ok;
  console.log(`${ok ? "OK " : "ERR"} ${table} ${status}`);
}

console.log("\nStorage Buckets");
for (const bucket of buckets) {
  const status = await check(`${supabaseUrl}/storage/v1/bucket/${bucket}`);
  const ok = status >= 200 && status < 300;
  failed ||= !ok;
  console.log(`${ok ? "OK " : "ERR"} ${bucket} ${status}`);
}

process.exit(failed ? 1 : 0);
