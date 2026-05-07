import { corsHeaders, jsonResponse, whatsappLink } from "../_shared/cors.ts";
import { adminClient, getAuthUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const supabase = adminClient();
    const user = await getAuthUser(req);

    const { data: business } = await supabase
      .from("businesses")
      .select("id, name, type, status, whatsapp_number")
      .eq("id", body.business_id)
      .maybeSingle();

    if (!business || business.type !== "kirana" || business.status !== "approved") {
      return jsonResponse({ error: "Kirana shop is not available for ordering." }, 400);
    }

    const selectedItems = Array.isArray(body.selected_items) ? body.selected_items : [];
    if (selectedItems.length) {
      const ids = selectedItems.map((item: { id?: string }) => item.id).filter(Boolean);
      const { data: products } = await supabase
        .from("products")
        .select("id")
        .eq("business_id", business.id)
        .eq("is_active", true)
        .in("id", ids);
      if ((products?.length ?? 0) !== ids.length) {
        return jsonResponse({ error: "One or more selected products are not available." }, 400);
      }
    }

    const message = body.whatsapp_message ??
      `Hello ${business.name}, I want to order groceries.\n\nName: ${body.customer_name}\nPhone: ${body.customer_phone}\nAddress: ${body.customer_address}\n\nOrder Details:\n${body.custom_order_text ?? "Selected products attached"}\n\nPlease confirm availability and delivery time.`;

    const { data: lead, error: leadError } = await supabase
      .from("whatsapp_order_leads")
      .insert({
        customer_id: user?.id ?? null,
        business_id: business.id,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address,
        delivery_address: body.customer_address,
        selected_items: selectedItems.length ? selectedItems : null,
        selected_products: selectedItems,
        custom_order_text: body.custom_order_text ?? null,
        grocery_list: body.custom_order_text ?? "",
        note: body.note ?? null,
        whatsapp_message: message,
        status: "sent",
      })
      .select("id")
      .single();

    if (leadError) return jsonResponse({ error: "Could not save order lead." }, 500);

    return jsonResponse({ lead_id: lead.id, whatsapp_url: whatsappLink(business.whatsapp_number, message) });
  } catch (_error) {
    return jsonResponse({ error: "Invalid order request." }, 400);
  }
});
