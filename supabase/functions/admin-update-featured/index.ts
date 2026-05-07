import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient, requireAdmin } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const supabase = adminClient();

    const { data: oldBusiness } = await supabase.from("businesses").select("*").eq("id", body.business_id).maybeSingle();
    if (!oldBusiness) return jsonResponse({ error: "Business not found." }, 404);

    const { data: newBusiness, error } = await supabase
      .from("businesses")
      .update({ is_featured: Boolean(body.is_featured) })
      .eq("id", body.business_id)
      .select("*")
      .single();

    if (error) return jsonResponse({ error: "Could not update featured status." }, 500);

    await supabase.from("admin_audit_logs").insert({
      admin_id: admin.id,
      action: Boolean(body.is_featured) ? "business_featured" : "business_unfeatured",
      entity_type: "businesses",
      entity_id: body.business_id,
      old_data: oldBusiness,
      new_data: newBusiness,
      user_agent: req.headers.get("user-agent"),
    });

    return jsonResponse({ business: newBusiness });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return jsonResponse({ error: message }, message === "Unauthorized" ? 401 : 403);
  }
});
