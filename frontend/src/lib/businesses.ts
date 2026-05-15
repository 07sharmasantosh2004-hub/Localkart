import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "./supabase";
import { foodMenuItems, foodShops, kiranaProducts, kiranaStores, mealPlans, tiffinProviders } from "./mockData";
import type { Business, BusinessType, DatabaseBusinessType, FoodMenuItem, KiranaProduct, MealPlan } from "./types";

interface NearbyBusinessRow {
  id: string;
  type: DatabaseBusinessType;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  whatsapp_number: string;
  address: string;
  area: string;
  city: string;
  rating_avg: number;
  cover_image_url: string | null;
  home_delivery_available: boolean;
  pickup_available?: boolean | null;
  min_order_amount: number | null;
  distance_meters: number;
  distance_km?: number | null;
  food_categories?: { name: string | null } | Array<{ name: string | null }> | null;
}

const fallbackByType: Record<BusinessType, Business[]> = {
  tiffin: tiffinProviders,
  kirana: kiranaStores,
  food: foodShops,
};

const legacyTypeByType: Record<BusinessType, DatabaseBusinessType[]> = {
  tiffin: ["tiffin", "salon"],
  kirana: ["kirana"],
  food: ["food"],
};

function normalizeBusinessType(type: DatabaseBusinessType): BusinessType {
  return type === "salon" ? "tiffin" : type;
}

function mapNearbyBusiness(row: NearbyBusinessRow): Business {
  const foodCategory = Array.isArray(row.food_categories) ? row.food_categories[0] : row.food_categories;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: normalizeBusinessType(row.type),
    area: row.area,
    city: row.city,
    address: row.address,
    whatsapp: row.whatsapp_number,
    phone: row.phone || row.whatsapp_number,
    distance_meters: Math.round(row.distance_meters || 0),
    rating: Number(row.rating_avg || 0),
    cover_image: row.cover_image_url || fallbackByType[normalizeBusinessType(row.type)][0]?.cover_image || "/logo.png",
    is_open: true,
    delivery_available: row.home_delivery_available,
    pickup_available: row.pickup_available ?? true,
    min_order: row.min_order_amount ? Number(row.min_order_amount) : undefined,
    description: row.description || undefined,
    category: foodCategory?.name || (normalizeBusinessType(row.type) === "food" ? "Local Food" : normalizeBusinessType(row.type) === "tiffin" ? "Tiffin Service" : undefined),
  };
}

export function useNearbyBusinesses({
  type,
  lat,
  lng,
  radiusKm,
  searchLocation,
}: {
  type: BusinessType;
  lat?: number;
  lng?: number;
  radiusKm: number;
  searchLocation?: string;
}) {
  return useQuery({
    queryKey: ["nearby-businesses", type, lat, lng, radiusKm, searchLocation],
    queryFn: async () => {
      const locationTerm = searchLocation?.trim().toLowerCase();
      if (!isSupabaseConfigured) {
        return filterByManualLocation(fallbackByType[type], locationTerm);
      }

      if (typeof lat === "number" && typeof lng === "number") {
        const { data, error } = await supabase.rpc("nearby_businesses", {
          user_lat: lat,
          user_lng: lng,
          radius_km: radiusKm,
          business_type: type === "tiffin" ? null : type,
        });

        if (error) throw error;
        return ((data ?? []) as NearbyBusinessRow[])
          .filter((row) => legacyTypeByType[type].includes(row.type))
          .map(mapNearbyBusiness);
      }

      let query = supabase
        .from("businesses")
        .select(
          "id, type, name, slug, description, phone, whatsapp_number, address, area, city, rating_avg, cover_image_url, home_delivery_available, pickup_available, min_order_amount, food_categories(name)",
        )
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("rating_avg", { ascending: false })
        .limit(24);

      if (type !== "tiffin") {
        query = query.eq("type", type);
      }

      if (locationTerm) {
        const escaped = locationTerm.replace(/[%_]/g, "");
        query = query.or(`city.ilike.%${escaped}%,area.ilike.%${escaped}%,pincode.ilike.%${escaped}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return ((data ?? []) as unknown as Omit<NearbyBusinessRow, "distance_meters">[])
        .filter((row) => legacyTypeByType[type].includes(row.type))
        .map((row) => mapNearbyBusiness({ ...row, distance_meters: 0 }));
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useBusinessBySlug(type: BusinessType, slug: string | undefined) {
  return useQuery({
    queryKey: ["business", type, slug],
    queryFn: async () => {
      if (!slug) return null;
      if (!isSupabaseConfigured) return fallbackByType[type].find((item) => item.slug === slug) || fallbackByType[type][0];

      let query = supabase
        .from("businesses")
        .select(
          "id, type, name, slug, description, phone, whatsapp_number, address, area, city, rating_avg, cover_image_url, home_delivery_available, pickup_available, min_order_amount, food_categories(name)",
        )
        .eq("slug", slug)
        .eq("status", "approved");

      if (type !== "tiffin") {
        query = query.eq("type", type);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) return null;
      if (!legacyTypeByType[type].includes((data as { type: DatabaseBusinessType }).type)) return null;

      return mapNearbyBusiness({ ...((data as unknown) as Omit<NearbyBusinessRow, "distance_meters">), distance_meters: 0 });
    },
    staleTime: 1000 * 60 * 5,
  });
}

interface FoodItemRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  sort_order: number;
  food_categories?: { id: string; name: string | null } | Array<{ id: string; name: string | null }> | null;
}

export function useFoodMenuItems(businessId?: string) {
  return useQuery({
    queryKey: ["food-menu-items", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      if (!isSupabaseConfigured || businessId.startsWith("food-")) return foodMenuItems;

      const { data, error } = await supabase
        .from("food_items")
        .select("id, business_id, name, description, price, image_url, is_veg, is_available, sort_order, food_categories(id, name)")
        .eq("business_id", businessId)
        .eq("is_available", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data as unknown) as FoodItemRow[]).map(
        (item): FoodMenuItem => {
          const category = Array.isArray(item.food_categories) ? item.food_categories[0] : item.food_categories;
          return ({
          id: item.id,
          business_id: item.business_id,
          category_id: category?.id,
          name: item.name,
          description: item.description || undefined,
          price: item.price ? Number(item.price) : undefined,
          image_url: item.image_url || undefined,
          is_veg: item.is_veg,
          is_available: item.is_available,
          sort_order: item.sort_order,
          category: category?.name || "Local Food",
        });
        },
      );
    },
    staleTime: 1000 * 60 * 5,
  });
}

interface SalonServiceRow {
  id: string;
  name: string;
  price: number | null;
  duration_minutes: number | null;
  categories?: { name: string | null } | Array<{ name: string | null }> | null;
}

export function useTiffinMealPlans(businessId?: string) {
  return useQuery({
    queryKey: ["tiffin-meal-plans", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      if (!isSupabaseConfigured || businessId.startsWith("tiffin-") || businessId.startsWith("salon-")) return mealPlans;

      const { data, error } = await supabase
        .from("salon_services")
        .select("id, name, price, duration_minutes, categories(name)")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data ?? []) as unknown as SalonServiceRow[]).map((service): MealPlan => {
        const category = Array.isArray(service.categories) ? service.categories[0] : service.categories;
        return {
          id: service.id,
          name: service.name,
          price: Number(service.price ?? 0),
          duration: service.duration_minutes ? `${service.duration_minutes} days` : "Ask provider",
          category: category?.name || "Meal Plan",
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export const useSalonServices = useTiffinMealPlans;

function filterByManualLocation(businesses: Business[], locationTerm?: string) {
  if (!locationTerm) return businesses;
  return businesses.filter((business) =>
    [business.area, business.city, business.address]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(locationTerm)),
  );
}

interface ProductRow {
  id: string;
  name: string;
  unit: string | null;
  selling_price: number | null;
  price: number | null;
  product_categories?: { name: string | null } | Array<{ name: string | null }> | null;
}

export function useKiranaProducts(businessId?: string) {
  return useQuery({
    queryKey: ["kirana-products", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      if (!isSupabaseConfigured || businessId.startsWith("kirana-")) return kiranaProducts;

      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit, selling_price, price, product_categories(name)")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      return ((data ?? []) as unknown as ProductRow[]).map((product): KiranaProduct => {
        const category = Array.isArray(product.product_categories) ? product.product_categories[0] : product.product_categories;
        const price = product.selling_price ?? product.price;
        return {
          id: product.id,
          name: product.name,
          unit: product.unit || "Unit",
          priceHint: price ? `Rs ${Number(price)}` : "Ask shop",
          category: category?.name || "Daily Essentials",
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}
