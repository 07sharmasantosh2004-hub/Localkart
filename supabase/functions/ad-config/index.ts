import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page");
    const platform = url.searchParams.get("platform") ?? "web";
    const supabase = adminClient();

    const { data: adsFlag } = await supabase.from("app_config").select("value").eq("key", "ads_enabled").maybeSingle();
    if (adsFlag?.value === false) return jsonResponse({ enabled: false, slots: [] });

    let query = supabase
      .from("ad_slots")
      .select("*, ad_units(*)")
      .eq("is_active", true)
      .eq("platform", platform)
      .order("placement");

    if (page) query = query.eq("page", page);

    const { data, error } = await query;
    if (error) return jsonResponse({ error: "Could not load ad config." }, 500);

    const now = Date.now();
    const slots = (data ?? []).map((slot) => ({
      ...slot,
      ad_units: (slot.ad_units ?? []).filter((unit: { is_active: boolean; starts_at?: string | null; ends_at?: string | null }) =>
        unit.is_active &&
        (!unit.starts_at || Date.parse(unit.starts_at) <= now) &&
        (!unit.ends_at || Date.parse(unit.ends_at) >= now)
      ),
    }));

    return jsonResponse({ enabled: true, slots });
  } catch (_error) {
    return jsonResponse({ error: "Invalid ad config request." }, 400);
  }
});
