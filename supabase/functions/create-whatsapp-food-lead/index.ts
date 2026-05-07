import { corsHeaders, jsonResponse, whatsappLink } from "../_shared/cors.ts";
import { adminClient, getAuthUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const supabase = adminClient();
    const user = await getAuthUser(req);
    const orderType = body.order_type === "delivery" ? "delivery" : "pickup";

    if (orderType === "delivery" && !body.customer_address) {
      return jsonResponse({ error: "Address is required for delivery orders." }, 400);
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id, name, type, status, whatsapp_number, home_delivery_available, pickup_available")
      .eq("id", body.business_id)
      .maybeSingle();

    if (!business || business.type !== "food" || business.status !== "approved") {
      return jsonResponse({ error: "Food shop is not available for ordering." }, 400);
    }
    if (orderType === "delivery" && !business.home_delivery_available) {
      return jsonResponse({ error: "Delivery is not available for this food shop." }, 400);
    }
    if (orderType === "pickup" && business.pickup_available === false) {
      return jsonResponse({ error: "Pickup is not available for this food shop." }, 400);
    }

    const selectedItems = Array.isArray(body.selected_items) ? body.selected_items : [];
    if (selectedItems.length) {
      const ids = selectedItems.map((item: { id?: string }) => item.id).filter(Boolean);
      const { data: items } = await supabase
        .from("food_items")
        .select("id")
        .eq("business_id", business.id)
        .eq("is_available", true)
        .in("id", ids);
      if ((items?.length ?? 0) !== ids.length) {
        return jsonResponse({ error: "One or more selected menu items are not available." }, 400);
      }
    }

    const message = body.whatsapp_message ??
      `Hello ${business.name}, I want to place a food order.\n\nName: ${body.customer_name}\nPhone: ${body.customer_phone}\nOrder Type: ${orderType}\n${orderType === "delivery" ? `Address: ${body.customer_address}\n` : ""}\nOrder Details:\n${body.custom_order_text ?? "Selected menu items attached"}\n\nPlease confirm availability, total amount and timing.`;

    const { data: lead, error: leadError } = await supabase
      .from("whatsapp_food_order_leads")
      .insert({
        customer_id: user?.id ?? null,
        business_id: business.id,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        order_type: orderType,
        customer_address: orderType === "delivery" ? body.customer_address : null,
        selected_items: selectedItems.length ? selectedItems : null,
        custom_order_text: body.custom_order_text ?? null,
        note: body.note ?? null,
        whatsapp_message: message,
        status: "sent",
      })
      .select("id")
      .single();

    if (leadError) return jsonResponse({ error: "Could not save food order lead." }, 500);

    return jsonResponse({ lead_id: lead.id, whatsapp_url: whatsappLink(business.whatsapp_number, message) });
  } catch (_error) {
    return jsonResponse({ error: "Invalid food order request." }, 400);
  }
});
