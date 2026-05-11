import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function sha256Hex(value: string) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function AdminLogin() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signInLocalAdmin } = useAuth();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (values: z.infer<typeof adminLoginSchema>) => {
    setError("");
    const envAdminEmail = (import.meta.env.VITE_LOCALKART_ADMIN_EMAIL || "").trim().toLowerCase();
    const envAdminPasswordHash = (import.meta.env.VITE_LOCALKART_ADMIN_PASSWORD_SHA256 || "").trim().toLowerCase();
    const typedEmail = values.email.trim().toLowerCase();

    if (import.meta.env.DEV && envAdminEmail && envAdminPasswordHash && typedEmail === envAdminEmail) {
      const typedPasswordHash = await sha256Hex(values.password);

      if (typedPasswordHash === envAdminPasswordHash) {
        signInLocalAdmin();
        navigate("/admin", { replace: true });
        return;
      }
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (signInError || !authData.user) {
      setError("Invalid admin credentials.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status, is_blocked")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin" || profile.status === "blocked" || profile.is_blocked) {
      await supabase.auth.signOut();
      setError("Only an active Supabase admin profile can access this panel.");
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md rounded-3xl border-slate-800 bg-white shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black text-slate-950">Super Admin</CardTitle>
            <CardDescription className="mt-2 text-sm font-bold uppercase tracking-widest text-slate-500">
              LocalKart Control Panel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin email</Label>
              <Input id="admin-email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin password</Label>
              <Input id="admin-password" type="password" {...register("password")} />
            </div>
            {error ? <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
            <Button disabled={isSubmitting} className="h-12 w-full rounded-2xl bg-emerald-700 text-base font-black hover:bg-emerald-800">
              {isSubmitting ? "Checking admin..." : "Enter Admin Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
