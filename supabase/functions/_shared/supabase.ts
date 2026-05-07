import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function adminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase Edge Function environment is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getAuthUser(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !anonKey || !authorization) return null;

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function requireAdmin(req: Request) {
  const user = await getAuthUser(req);
  if (!user) throw new Error("Unauthorized");

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role, status, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data || data.role !== "admin" || data.status === "blocked" || data.is_blocked) {
    throw new Error("Forbidden");
  }

  return user;
}
