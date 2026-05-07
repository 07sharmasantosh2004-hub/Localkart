import { supabase } from "../lib/supabase";

export async function createWhatsAppBookingLead(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("create-whatsapp-booking-lead", { body: payload });
  if (error) throw error;
  return data as { lead_id: string; whatsapp_url: string };
}

export async function createWhatsAppOrderLead(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("create-whatsapp-order-lead", { body: payload });
  if (error) throw error;
  return data as { lead_id: string; whatsapp_url: string };
}

export async function createWhatsAppFoodLead(payload: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("create-whatsapp-food-lead", { body: payload });
  if (error) throw error;
  return data as { lead_id: string; whatsapp_url: string };
}
