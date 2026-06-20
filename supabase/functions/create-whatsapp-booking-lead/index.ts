import { corsHeaders, jsonResponse, whatsappLink } from "../_shared/cors.ts";
import { adminClient, getAuthUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const supabase = adminClient();
    const user = await getAuthUser(req);

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, type, status, whatsapp_number")
      .eq("id", body.business_id)
      .maybeSingle();

    if (businessError || !business || !["tiffin", "salon"].includes(business.type) || business.status !== "approved") {
      return jsonResponse({ error: "Tiffin service is not available for enquiry." }, 400);
    }

    if (body.service_id) {
      const { data: service } = await supabase
        .from("salon_services")
        .select("id")
        .eq("id", body.service_id)
        .eq("business_id", business.id)
        .eq("is_active", true)
        .maybeSingle();
      if (!service) return jsonResponse({ error: "Selected meal plan is not available." }, 400);
    }

    const message = body.whatsapp_message ??
      `Hello ${business.name}, I want to enquire about tiffin service.\n\nName: ${body.customer_name}\nPhone: ${body.customer_phone}\nPreferred Date: ${body.preferred_date ?? "Flexible"}\nMeal Time: ${body.preferred_time ?? "Flexible"}\nNote: ${body.note ?? "No note"}\n\nPlease confirm price, availability and delivery time.`;

    const { data: lead, error: leadError } = await supabase
      .from("whatsapp_booking_leads")
      .insert({
        customer_id: user?.id ?? null,
        business_id: business.id,
        service_id: body.service_id ?? null,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        preferred_date: body.preferred_date ?? null,
        preferred_time: body.preferred_time ?? null,
        note: body.note ?? null,
        whatsapp_message: message,
        selected_items: body.selected_items ?? null,
        metadata: body.metadata ?? null,
        status: "sent",
      })
      .select("id")
      .single();

    if (leadError) return jsonResponse({ error: "Could not save booking lead." }, 500);

    return jsonResponse({ lead_id: lead.id, whatsapp_url: whatsappLink(business.whatsapp_number, message) });
  } catch (_error) {
    return jsonResponse({ error: "Invalid booking request." }, 400);
  }
});
