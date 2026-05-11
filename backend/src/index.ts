import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../supabase/.env") });

const app = express();
const port = process.env.PORT || 8000;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;
const allowedOrigins = new Set(
  [
    process.env.SITE_URL,
    process.env.VITE_SITE_URL,
    ...(process.env.CORS_ORIGINS || "").split(","),
    ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]),
  ]
    .map((origin) => origin?.trim().replace(/\/$/, ""))
    .filter(Boolean),
);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS."));
  },
};

type BusinessType = "salon" | "kirana" | "food";

async function supabaseRest<T>(pathName: string): Promise<T> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment is not configured.");
  }

  const baseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/rest/v1/${pathName}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${body}`);
  }

  return (await response.json()) as T;
}

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "LocalKart API is running",
    health: "/health",
  });
});

app.get("/health", async (req, res) => {
  try {
    const businesses = await supabaseRest<Array<{ id: string }>>("businesses?select=id&limit=1");

    res.json({
      status: "ok",
      supabase: {
        configured: Boolean(supabaseUrl && supabaseKey),
        connected: true,
        probeRows: businesses.length,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      supabase: {
        configured: Boolean(supabaseUrl && supabaseKey),
        connected: false,
      },
      error: error instanceof Error ? error.message : "Unknown health check error",
    });
  }
});

app.get("/api/salons", (req, res) => {
  res.redirect(307, "/api/businesses?type=salon");
});

app.get("/api/businesses", async (req, res) => {
  const type = String(req.query.type || "");
  const allowedTypes: BusinessType[] = ["salon", "kirana", "food"];

  if (type && !allowedTypes.includes(type as BusinessType)) {
    res.status(400).json({ error: "Invalid business type." });
    return;
  }

  const query = new URLSearchParams({
    select: "id,type,name,slug,description,phone,whatsapp_number,address,area,city,rating_avg,cover_image_url,home_delivery_available,pickup_available,min_order_amount",
    status: "eq.approved",
    order: "is_featured.desc,rating_avg.desc",
    limit: "24",
  });

  if (type) {
    query.set("type", `eq.${type}`);
  }

  try {
    const businesses = await supabaseRest(`businesses?${query.toString()}`);
    res.json({ businesses });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to fetch businesses.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
