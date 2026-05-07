import { supabase } from "../lib/supabase";

export async function approveBusiness(payload: { business_id: string; status: "approved" | "rejected" | "blocked" | "pending"; rejection_reason?: string }) {
  const { data, error } = await supabase.functions.invoke("admin-approve-business", { body: payload });
  if (error) throw error;
  return data;
}

export async function updateBusinessFeatured(payload: { business_id: string; is_featured: boolean }) {
  const { data, error } = await supabase.functions.invoke("admin-update-featured", { body: payload });
  if (error) throw error;
  return data;
}

export async function fetchAdminMetrics() {
  const tables = [
    "profiles",
    "businesses",
    "whatsapp_booking_leads",
    "whatsapp_order_leads",
    "whatsapp_food_order_leads",
    "support_tickets",
    "reports",
  ] as const;

  const pairs = await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) throw error;
      return [table, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(pairs);
}
