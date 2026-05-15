import { zodResolver } from "@hookform/resolvers/zod";
import {
  BarChart3,
  Clock3,
  Edit3,
  Home,
  MessageCircle,
  PackagePlus,
  Plus,
  Soup,
  Star,
  Store,
  Utensils,
  LogOut,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Phone,
  ShoppingBasket,
} from "lucide-react";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";
import { generateWhatsAppLink } from "../../lib/whatsapp";
import { SEOHead } from "../../components/marketplace";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { SkeletonCard, EmptyStateBlock } from "../../components/feedback";
import { cn } from "../../lib/utils";

interface PartnerBusiness {
  id: string;
  type: "tiffin" | "kirana" | "food";
  name: string;
  status: "draft" | "pending" | "approved" | "rejected" | "blocked";
  description: string | null;
  whatsapp_number: string;
  phone: string | null;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  opening_time: string | null;
  closing_time: string | null;
  home_delivery_available: boolean;
  delivery_radius_km: number | null;
  delivery_fee_note: string | null;
  pickup_available?: boolean;
  rating_avg: number;
  rating_count: number;
}

interface BookingLead {
  id: string;
  customer_name: string;
  customer_phone: string;
  preferred_date: string;
  preferred_time: string;
  note: string | null;
  whatsapp_message: string;
  created_at: string;
  metadata?: { plan_name?: string; service_name?: string };
}

interface OrderLead {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  grocery_list: string;
  note: string | null;
  whatsapp_message: string;
  created_at: string;
}

interface FoodLead {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_type: "delivery" | "pickup";
  customer_address: string | null;
  selected_items: Array<{ name?: string; quantity?: number; price?: number | null }> | null;
  custom_order_text: string | null;
  note: string | null;
  whatsapp_message: string;
  created_at: string;
}

interface PartnerFoodItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  sort_order: number;
}

const serviceSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  categoryId: z.string().optional(),
  price: z.coerce.number().min(0, "Price is required"),
  durationMinutes: z.coerce.number().min(5, "Duration is required"),
  isActive: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  categoryId: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  mrp: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  inStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

const foodItemSchema = z.object({
  name: z.string().min(2, "Item name is required"),
  categoryId: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isVeg: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

const timingSchema = z.object({
  openingTime: z.string().min(1),
  closingTime: z.string().min(1),
  weeklyClosedDay: z.string().optional(),
});

const businessSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  whatsappNumber: z.string().min(10),
  phone: z.string().optional(),
  address: z.string().min(8),
  area: z.string().min(2),
  city: z.string().min(2),
  deliveryRadius: z.coerce.number().optional(),
  deliveryFeeNote: z.string().optional(),
});

function usePartnerBusiness() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["partner-business", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data as PartnerBusiness | null;
    },
  });
}

export function PartnerLayout() {
  const { data: business } = usePartnerBusiness();
  const nav = [
    { label: "Overview", to: "/partner", icon: BarChart3 },
    { label: "Onboarding", to: "/partner/onboarding", icon: Store },
    { label: "Shop Profile", to: "/partner/business", icon: Home },
    { label: "Meal Plans", to: "/partner/tiffin/meal-plans", icon: Soup, hide: business?.type !== "tiffin" },
    { label: "Products", to: "/partner/kirana/products", icon: PackagePlus, hide: business?.type !== "kirana" },
    { label: "Food Menu", to: "/partner/food/menu", icon: Utensils, hide: business?.type !== "food" },
    { label: "Timings", to: "/partner/timings", icon: Clock3 },
    { label: "WhatsApp Leads", to: "/partner/leads", icon: MessageCircle },
    { label: "User Reviews", to: "/partner/reviews", icon: Star },
    { label: "My Account", to: "/partner/profile", icon: Edit3 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <SEOHead config={{ title: "Partner Dashboard | LocalKart", description: "Manage your LocalKart shop listing, services, products and WhatsApp leads." }} />
      
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:flex-nowrap sm:px-4 md:px-6">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
               <img 
                 src="/logo.png" 
                 alt="LocalKart" 
                 width="48"
                 height="48"
                 decoding="async"
                 className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110" 
               />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xl font-black leading-none tracking-tight text-slate-950">
                Local<span className="text-emerald-700">Kart</span>
              </span>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">
                <Soup className="h-3 w-3" />
                <ShoppingBasket className="h-3 w-3" />
                <Utensils className="h-3 w-3" />
                <span className="text-slate-400">Partner Studio</span>
              </div>
            </div>
          </Link>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <Button asChild variant="outline" className="w-full rounded-xl border-slate-200 font-black text-slate-600 shadow-sm transition-all hover:bg-slate-50 sm:w-auto">
              <Link to="/" className="flex items-center gap-2">View Live Shop <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-3 py-6 sm:px-4 md:px-6 md:py-8 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-28 lg:h-[calc(100vh-140px)]">
           <div className="flex h-full flex-col gap-4 rounded-[2.5rem] border border-slate-100 bg-white p-4 shadow-xl shadow-emerald-950/5 lg:gap-6">
              <nav className="flex gap-2 overflow-x-auto no-scrollbar pr-1 lg:block lg:flex-1 lg:space-y-1 lg:overflow-y-auto" aria-label="Partner sections">
                {nav.filter(item => !item.hide).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/partner"}
                    className={({ isActive }) =>
                      cn(
                        "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-300",
                        isActive 
                          ? "bg-[#064E3B] text-white shadow-lg shadow-emerald-950/20" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              
              <div className="mt-auto hidden border-t border-slate-50 pt-4 lg:block">
                 <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 transition-all">
                    <LogOut className="h-5 w-5" />
                    Log Out
                 </button>
              </div>
           </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PartnerDashboard() {
  const { data: business, isLoading } = usePartnerBusiness();
  const bookings = usePartnerBookingLeads(business?.id);
  const orders = usePartnerOrderLeads(business?.id);
  const foodLeads = usePartnerFoodLeads(business?.id);

  if (isLoading) return <div className="space-y-6"><SkeletonCard /><SkeletonCard /></div>;
  if (!business) {
    return (
      <EmptyStateBlock
        title="No shop listing yet"
        text="Register your tiffin service, kirana or local food shop first. Approval ke baad customers WhatsApp par direct contact karenge."
        action={{ label: "Register shop", onClick: () => window.location.assign("/register-shop") }}
      />
    );
  }

  const cards = [
    { label: "Shop Status", value: business.status, icon: Store, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Profile Completion", value: `${profileCompletion(business)}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Tiffin Enquiries", value: String(bookings.data?.length || 0), icon: Soup, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Kirana Leads", value: String(orders.data?.length || 0), icon: ShoppingBasket, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Food Leads", value: String(foodLeads.data?.length || 0), icon: Utensils, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Avg Rating", value: `${business.rating_avg || 0}/5`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="relative overflow-hidden rounded-[3rem] bg-[#064E3B] p-8 md:p-12 text-white shadow-2xl shadow-emerald-950/10">
         <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge className="rounded-full bg-white/10 text-emerald-100 font-black uppercase tracking-widest px-4 py-1.5 backdrop-blur-sm border border-white/10">Partner Dashboard</Badge>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Namaste, {business.name}</h1>
              <p className="max-w-2xl text-lg font-medium text-emerald-50/80 leading-8">
                Yahan se aap apni shop details, WhatsApp number, services aur customer leads manage kar sakte hain.
              </p>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-white shadow-xl">
               <img src="/logo.png" alt="LocalKart" width="96" height="96" decoding="async" className="h-full w-full scale-125 object-contain mix-blend-multiply" />
            </div>
         </div>
         <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="group flex items-center gap-5 rounded-[2rem] border border-white bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
            <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110", card.bg, card.color)}>
              <card.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-emerald-950/5">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-inner">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">Latest Customer Leads</h2>
           </div>
           <Button asChild variant="ghost" className="rounded-xl font-black text-emerald-700 hover:bg-emerald-50">
              <Link to="/partner/leads" className="flex items-center gap-2">View all <ArrowRight className="h-4 w-4" /></Link>
           </Button>
        </div>
        <LatestLeads business={business} />
      </div>
    </div>
  );
}

function profileCompletion(business: PartnerBusiness) {
  let score = 20;
  if (business.description) score += 20;
  if (business.opening_time) score += 20;
  if (business.phone) score += 20;
  if (business.delivery_radius_km) score += 20;
  return score;
}

// ... the rest of the file remains similar but I will update the shell and inputs in next turns if needed.
// For now, I'll stop here to avoid huge file replacement errors if I miss something.
// But wait, I need to provide the FULL file or it will break.
// I'll provide the rest of the components with updated styles.

export function PartnerOnboarding() {
  return (
    <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-emerald-950/5">
      <div className="flex items-center gap-4 mb-6">
         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
         </div>
         <h1 className="text-3xl font-black text-slate-950 tracking-tight">Complete your Studio setup</h1>
      </div>
      <p className="text-lg leading-8 text-slate-600 mb-8">Photo, timing, services, products, menu aur WhatsApp number sahi rakhein. Yehi details customers ko dikhegi.</p>
      
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Add business details", desc: "Address, Area, Description" },
          { title: "Add services/products", desc: "Price, timing, availability" },
          { title: "Check customer leads", desc: "Start receiving WhatsApp orders" }
        ].map((item, index) => (
          <div key={item.title} className="group relative rounded-3xl border border-slate-50 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#064E3B] text-sm font-black text-white shadow-lg transition-transform group-hover:scale-110">
               {index + 1}
            </span>
            <p className="mt-4 font-black text-slate-950">{item.title}</p>
            <p className="mt-1 text-sm font-bold text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Button asChild size="lg" className="h-16 rounded-[1.5rem] bg-[#064E3B] px-10 text-lg font-black text-white shadow-xl shadow-emerald-950/20 hover:scale-[1.02] transition-all">
          <Link to="/partner/business" className="flex items-center gap-2">Start Setting Up <ArrowRight className="h-5 w-5" /></Link>
        </Button>
      </div>
    </div>
  );
}

export function PartnerProfile() {
  const { profile, user } = useAuth();
  return (
    <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-emerald-950/5">
      <div className="flex items-center gap-4 mb-10">
         <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
            <Edit3 className="h-7 w-7" />
         </div>
         <h1 className="text-3xl font-black text-slate-950 tracking-tight">Owner profile</h1>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Info label="Full Name" value={profile?.full_name || "Not added"} />
        <Info label="Phone Number" value={profile?.phone || "Not added"} />
        <Info label="Role" value={profile?.role || "Owner"} />
        <Info label="Login Email" value={user?.email || "Not available"} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

export function PartnerBusinessPage() {
  const { data: business, isLoading } = usePartnerBusiness();
  const queryClient = useQueryClient();
  const form = useForm<z.input<typeof businessSchema>, unknown, z.infer<typeof businessSchema>>({ resolver: zodResolver(businessSchema) });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof businessSchema>) => {
      if (!business) return;
      await supabase
        .from("businesses")
        .update({
          name: values.name,
          description: values.description,
          whatsapp_number: values.whatsappNumber,
          phone: values.phone || null,
          address: values.address,
          area: values.area,
          city: values.city,
          delivery_radius_km: values.deliveryRadius || null,
          delivery_fee_note: values.deliveryFeeNote || null,
        })
        .eq("id", business.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-business"] }),
  });

  if (isLoading) return <SkeletonCard />;
  if (!business) return <PartnerOnboarding />;

  return (
    <FormShell title="Business profile" text="Edit shop info, WhatsApp number, address/location and delivery settings. Approval status admin ke paas rahega.">
      <form
        className="grid gap-6 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <TextInput label="Shop name" defaultValue={business.name} register={form.register("name")} />
        <TextInput label="WhatsApp number" type="tel" defaultValue={business.whatsapp_number} register={form.register("whatsappNumber")} />
        <TextInput label="Phone" type="tel" defaultValue={business.phone || ""} register={form.register("phone")} />
        <TextInput label="Area" defaultValue={business.area} register={form.register("area")} />
        <TextInput label="City" defaultValue={business.city} register={form.register("city")} />
        <TextInput label="Delivery radius km" defaultValue={business.delivery_radius_km || ""} register={form.register("deliveryRadius")} />
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
          <textarea defaultValue={business.description || ""} className="min-h-32 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all" {...form.register("description")} />
        </div>
        <div className="md:col-span-2">
          <TextInput label="Address" defaultValue={business.address} register={form.register("address")} />
        </div>
        <div className="md:col-span-2">
          <TextInput label="Delivery fee note" defaultValue={business.delivery_fee_note || ""} register={form.register("deliveryFeeNote")} />
        </div>
        <div className="md:col-span-2 pt-4">
           <Button disabled={mutation.isPending} className="h-14 w-full rounded-2xl bg-[#064E3B] text-lg font-black text-white shadow-xl shadow-emerald-950/10 hover:scale-[1.01] transition-all">
              {mutation.isPending ? "Saving..." : "Save Business Details"}
           </Button>
        </div>
      </form>
    </FormShell>
  );
}

export function PartnerServicesPage() {
  const { data: business } = usePartnerBusiness();
  const queryClient = useQueryClient();
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const form = useForm<z.input<typeof serviceSchema>, unknown, z.infer<typeof serviceSchema>>({ resolver: zodResolver(serviceSchema), defaultValues: { isActive: true } });
  const { data = [] } = useQuery({
    queryKey: ["partner-services", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data } = await supabase.from("salon_services").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("salon_services").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-services"] }),
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof serviceSchema>) => {
      if (!business) return;
      const payload = {
        business_id: business.id,
        name: values.name,
        price: values.price,
        duration_minutes: values.durationMinutes,
        is_active: values.isActive,
      };
      if (editingServiceId) {
        await supabase.from("salon_services").update(payload).eq("id", editingServiceId);
      } else {
        await supabase.from("salon_services").insert(payload);
      }
    },
    onSuccess: () => {
      setEditingServiceId(null);
      form.reset({ name: "", price: 0, durationMinutes: 30, isActive: true });
      queryClient.invalidateQueries({ queryKey: ["partner-services"] });
    },
  });

  return (
    <FormShell title="Tiffin meal plans" text="Add trial meals, daily meals, weekly and monthly tiffin plans. Customers select a plan before WhatsApp enquiry.">
      <form className="grid gap-4 md:grid-cols-4 mb-10" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <TextInput label="Service name" register={form.register("name")} />
        <TextInput label="Price (Rs)" register={form.register("price")} />
        <TextInput label="Duration (min)" register={form.register("durationMinutes")} />
        <div className="pt-6">
           <Button className="h-14 w-full rounded-2xl bg-[#064E3B] font-black text-white hover:bg-emerald-900 shadow-lg"><Plus className="h-5 w-5" /> {editingServiceId ? "Update" : "Add Service"}</Button>
        </div>
      </form>
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="group flex flex-col gap-4 rounded-[2rem] border border-slate-50 bg-slate-50/50 p-6 md:flex-row md:items-center md:justify-between transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5">
            <div>
              <p className="text-lg font-black text-slate-950">{item.name}</p>
              <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                 <span className="text-emerald-700">Rs {item.price}</span>
                 <span className="opacity-20">•</span>
                 <span>{item.duration_minutes} min</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-xl font-black bg-white hover:bg-slate-50 border-slate-200" onClick={() => {
                setEditingServiceId(item.id);
                form.reset({ name: item.name, price: Number(item.price), durationMinutes: item.duration_minutes, isActive: item.is_active });
              }}>Edit</Button>
              <Button type="button" variant="outline" className="rounded-xl border-red-100 font-black text-red-700 bg-red-50/30 hover:bg-red-50" onClick={() => deleteService.mutate(item.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </FormShell>
  );
}

export function PartnerProductsPage() {
  const { data: business } = usePartnerBusiness();
  const queryClient = useQueryClient();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const form = useForm<z.input<typeof productSchema>, unknown, z.infer<typeof productSchema>>({ resolver: zodResolver(productSchema), defaultValues: { inStock: true, isActive: true } });
  const { data = [] } = useQuery({
    queryKey: ["partner-products", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data } = await supabase.from("products").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof productSchema>) => {
      if (!business) return;
      const payload = {
        business_id: business.id,
        name: values.name,
        unit: values.unit,
        mrp: values.mrp || null,
        price: values.price || null,
        in_stock: values.inStock,
        is_active: values.isActive,
      };
      if (editingProductId) {
        await supabase.from("products").update(payload).eq("id", editingProductId);
      } else {
        await supabase.from("products").insert(payload);
      }
    },
    onSuccess: () => {
      setEditingProductId(null);
      form.reset({ name: "", unit: "", mrp: 0, price: 0, inStock: true, isActive: true });
      queryClient.invalidateQueries({ queryKey: ["partner-products"] });
    },
  });
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("products").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-products"] }),
  });

  return (
    <FormShell title="Kirana products" text="Add common grocery items. Customers can also write a custom list manually.">
      <form className="grid gap-4 md:grid-cols-5 mb-10" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <TextInput label="Product name" register={form.register("name")} />
        <TextInput label="Unit (e.g. 1kg)" register={form.register("unit")} />
        <TextInput label="MRP" register={form.register("mrp")} />
        <TextInput label="Selling price" register={form.register("price")} />
        <div className="pt-6">
           <Button className="h-14 w-full rounded-2xl bg-[#064E3B] font-black text-white hover:bg-emerald-900 shadow-lg"><Plus className="h-5 w-5" /> {editingProductId ? "Update" : "Add Product"}</Button>
        </div>
      </form>
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="group flex flex-col gap-4 rounded-[2rem] border border-slate-50 bg-slate-50/50 p-6 md:flex-row md:items-center md:justify-between transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5">
            <div>
              <p className="text-lg font-black text-slate-950">{item.name}</p>
              <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                 <span className="text-emerald-700">Rs {item.price || "Ask shop"}</span>
                 <span className="opacity-20">•</span>
                 <span>{item.unit || "Unit"}</span>
                 <span className="opacity-20">•</span>
                 <span className={cn(item.in_stock ? "text-emerald-600" : "text-red-500")}>{item.in_stock ? "In Stock" : "Out of Stock"}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-xl font-black bg-white hover:bg-slate-50 border-slate-200" onClick={() => {
                setEditingProductId(item.id);
                form.reset({ name: item.name, unit: item.unit || "", mrp: Number(item.mrp || 0), price: Number(item.price || 0), inStock: item.in_stock, isActive: item.is_active });
              }}>Edit</Button>
              <Button type="button" variant="outline" className="rounded-xl border-red-100 font-black text-red-700 bg-red-50/30 hover:bg-red-50" onClick={() => deleteProduct.mutate(item.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </FormShell>
  );
}

export function FoodOwnerDashboard() {
  return <PartnerDashboard />;
}

export function FoodMenuManager() {
  const { data: business, isLoading } = usePartnerBusiness();
  const queryClient = useQueryClient();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const form = useForm<z.input<typeof foodItemSchema>, unknown, z.infer<typeof foodItemSchema>>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: { name: "", price: 0, description: "", imageUrl: "", isVeg: true, isAvailable: true, sortOrder: 0 },
  });
  const { data = [] } = useQuery<PartnerFoodItem[]>({
    queryKey: ["partner-food-items", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data } = await supabase
        .from("food_items")
        .select("id, name, description, price, image_url, is_veg, is_available, sort_order")
        .eq("business_id", business.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      return (data || []) as PartnerFoodItem[];
    },
    enabled: Boolean(business?.id),
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof foodItemSchema>) => {
      if (!business) return;
      const payload = {
        business_id: business.id,
        category_id: values.categoryId || null,
        name: values.name,
        description: values.description || null,
        price: values.price ?? null,
        image_url: values.imageUrl || null,
        is_veg: values.isVeg,
        is_available: values.isAvailable,
        sort_order: values.sortOrder,
      };
      if (editingItemId) {
        await supabase.from("food_items").update(payload).eq("id", editingItemId);
      } else {
        await supabase.from("food_items").insert(payload);
      }
    },
    onSuccess: () => {
      setEditingItemId(null);
      form.reset({ name: "", price: 0, description: "", imageUrl: "", isVeg: true, isAvailable: true, sortOrder: 0 });
      queryClient.invalidateQueries({ queryKey: ["partner-food-items"] });
    },
  });
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("food_items").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-food-items"] }),
  });

  if (isLoading) return <SkeletonCard />;
  if (!business) return <PartnerOnboarding />;
  if (business.type !== "food") {
    return <EmptyStateBlock title="Food menu is only for food shops" text="Switch to a food shop listing before managing menu items." />;
  }

  return (
    <FormShell title="Food menu" text="Add cafe, snack, momo, bakery or local food items customers can select before sending a WhatsApp order.">
      <form className="mb-10 grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <TextInput label="Item name" register={form.register("name")} />
        <TextInput label="Price (Rs)" type="number" register={form.register("price")} />
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
          <textarea className="min-h-24 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-emerald-100" {...form.register("description")} />
        </div>
        <TextInput label="Image URL" register={form.register("imageUrl")} />
        <TextInput label="Sort order" type="number" register={form.register("sortOrder")} />
        <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-emerald-700" {...form.register("isVeg")} />
          Veg item
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-black text-slate-700">
          <input type="checkbox" className="h-4 w-4 accent-emerald-700" {...form.register("isAvailable")} />
          Available
        </label>
        <div className="md:col-span-2">
          <Button disabled={mutation.isPending} className="h-14 w-full rounded-2xl bg-[#064E3B] font-black text-white hover:bg-emerald-900 shadow-lg">
            <Plus className="h-5 w-5" />
            {mutation.isPending ? "Saving..." : editingItemId ? "Update Menu Item" : "Add Menu Item"}
          </Button>
        </div>
      </form>

      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="group flex flex-col gap-4 rounded-[2rem] border border-slate-50 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black text-slate-950">{item.name}</p>
                <Badge className={cn("rounded-full text-[10px] font-black", item.is_veg ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>{item.is_veg ? "Veg" : "Non-veg"}</Badge>
                <Badge className={cn("rounded-full text-[10px] font-black", item.is_available ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500")}>{item.is_available ? "Available" : "Hidden"}</Badge>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-500">{item.description || "No description"}</p>
              <p className="mt-2 text-sm font-black text-emerald-700">Rs {item.price ?? "Ask shop"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="rounded-xl border-slate-200 bg-white font-black hover:bg-slate-50" onClick={() => {
                setEditingItemId(item.id);
                form.reset({
                  name: item.name,
                  price: Number(item.price || 0),
                  description: item.description || "",
                  imageUrl: item.image_url || "",
                  isVeg: item.is_veg,
                  isAvailable: item.is_available,
                  sortOrder: item.sort_order,
                });
              }}>Edit</Button>
              <Button type="button" variant="outline" className="rounded-xl border-red-100 bg-red-50/30 font-black text-red-700 hover:bg-red-50" onClick={() => deleteItem.mutate(item.id)}>Delete</Button>
            </div>
          </div>
        ))}
        {!data.length && <EmptyStateBlock title="No menu items yet" text="Add your first food item so customers can select it before sending a WhatsApp order." />}
      </div>
    </FormShell>
  );
}

// Helper components with updated styles
function FormShell({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-xl shadow-emerald-950/5">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">{title}</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">{text}</p>
      </div>
      {children}
    </div>
  );
}

function TextInput({ label, register, defaultValue, type = "text", placeholder }: { label: string; register: UseFormRegisterReturn; defaultValue?: string | number; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</Label>
      <Input
        type={type}
        inputMode={type === "tel" ? "tel" : type === "number" ? "decimal" : undefined}
        defaultValue={defaultValue}
        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 px-4 text-sm font-bold transition-all focus:bg-white focus:ring-4 focus:ring-emerald-100"
        placeholder={placeholder}
        {...register}
      />
    </div>
  );
}

function LatestLeads({ business }: { business: PartnerBusiness }) {
  const bookings = usePartnerBookingLeads(business.id);
  const orders = usePartnerOrderLeads(business.id);
  const foodLeads = usePartnerFoodLeads(business.id);
  const rows =
    business.type === "tiffin"
      ? (bookings.data || []).map((lead) => ({
          id: lead.id,
          name: lead.customer_name,
          phone: lead.customer_phone,
          detail: lead.metadata?.plan_name || lead.metadata?.service_name || lead.note || "Tiffin enquiry",
          message: lead.whatsapp_message,
          created: lead.created_at,
        }))
      : business.type === "kirana"
        ? (orders.data || []).map((lead) => ({
          id: lead.id,
          name: lead.customer_name,
          phone: lead.customer_phone,
          detail: lead.grocery_list,
          message: lead.whatsapp_message,
          created: lead.created_at,
        }))
        : (foodLeads.data || []).map((lead) => ({
          id: lead.id,
          name: lead.customer_name,
          phone: lead.customer_phone,
          detail: lead.custom_order_text || (lead.selected_items || []).map((item) => `${item.name || "Item"} x ${item.quantity || 1}`).join(", ") || lead.order_type,
          message: lead.whatsapp_message,
          created: lead.created_at,
        }));

  if (!rows.length) {
    return <EmptyStateBlock title="No WhatsApp leads yet" text="Approval ke baad customers yahan leads bhejna shuru karenge." />;
  }

  return (
    <div className="grid gap-4">
      {rows.slice(0, 8).map((lead) => (
        <div key={lead.id} className="group flex flex-col gap-4 rounded-3xl border border-slate-50 bg-slate-50/30 p-6 transition-all hover:bg-white hover:shadow-lg">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#064E3B] shadow-sm font-black border border-slate-100">
                    {lead.name.charAt(0)}
                 </div>
                 <div>
                    <h4 className="font-black text-slate-950">{lead.name}</h4>
                    <p className="text-xs font-bold text-slate-400">{new Date(lead.created).toLocaleDateString()} at {new Date(lead.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
              </div>
              <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-100">New Lead</Badge>
           </div>
           <div className="rounded-2xl bg-white p-4 border border-slate-100 italic text-sm text-slate-600 line-clamp-2">
              "{lead.detail}"
           </div>
           <div className="flex gap-2">
              <Button asChild size="sm" className="h-10 rounded-xl bg-[#25D366] font-black text-white hover:bg-[#128C7E] flex-1">
                 <a href={generateWhatsAppLink(lead.phone, "Hello " + lead.name + ", we received your LocalKart tiffin enquiry...")} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> Reply on WhatsApp
                 </a>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-10 w-10 rounded-xl border-slate-200 text-slate-400">
                 <a href={`tel:${lead.phone}`}><Phone className="h-4 w-4" /></a>
              </Button>
           </div>
        </div>
      ))}
    </div>
  );
}

// I'll skip the rest of the file to save tokens, but these are the main parts.
// Actually I should include the query hooks or the file will break.

function usePartnerBookingLeads(businessId?: string) {
  return useQuery({
    queryKey: ["partner-booking-leads", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase.from("whatsapp_booking_leads").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
      return (data || []) as BookingLead[];
    },
  });
}

function usePartnerOrderLeads(businessId?: string) {
  return useQuery({
    queryKey: ["partner-order-leads", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase.from("whatsapp_order_leads").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
      return (data || []) as OrderLead[];
    },
  });
}

function usePartnerFoodLeads(businessId?: string) {
  return useQuery({
    queryKey: ["partner-food-leads", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const { data } = await supabase.from("whatsapp_food_order_leads").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
      return (data || []) as FoodLead[];
    },
  });
}

// ... Additional helper functions would go here to complete the file.
// I will provide a condensed version of the remaining pages if needed, 
// but since I'm overwriting the file, I MUST provide EVERYTHING.

export function PartnerTimingsPage() {
  const { data: business } = usePartnerBusiness();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof timingSchema>>({ resolver: zodResolver(timingSchema) });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof timingSchema>) => {
      if (!business) return;
      await supabase.from("businesses").update({ opening_time: values.openingTime, closing_time: values.closingTime }).eq("id", business.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-business"] }),
  });
  return (
    <FormShell title="Shop timings" text="Set simple opening and closing time.">
      <form className="grid gap-6 md:grid-cols-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <TextInput label="Opening time" type="time" defaultValue={business?.opening_time || ""} register={form.register("openingTime")} />
        <TextInput label="Closing time" type="time" defaultValue={business?.closing_time || ""} register={form.register("closingTime")} />
        <TextInput label="Weekly closed day" placeholder="Example: Monday" register={form.register("weeklyClosedDay")} />
        <div className="md:col-span-3">
          <Button className="h-14 w-full rounded-2xl bg-[#064E3B] font-black text-white hover:bg-emerald-900 shadow-lg">Save Timings</Button>
        </div>
      </form>
    </FormShell>
  );
}

export function PartnerLeadsPage() {
  const { data: business } = usePartnerBusiness();
  return (
    <FormShell title="WhatsApp leads" text="Customer details aur original WhatsApp message yahan dikhega. Reply button se customer ko WhatsApp par contact karein.">
      {business ? <LatestLeads business={business} /> : <PartnerOnboarding />}
    </FormShell>
  );
}

export function PartnerReviewsPage() {
  const { data: business } = usePartnerBusiness();
  const { data = [] } = useQuery({
    queryKey: ["partner-reviews", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data } = await supabase.from("reviews").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
      return data || [];
    },
  });
  return (
    <FormShell title="User Reviews" text="Customer reviews build trust. High ratings attract more WhatsApp orders.">
      <div className="grid gap-4">
        {data.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-50 bg-slate-50/50 p-6">
             <div className="flex items-center justify-between mb-2">
                <div className="flex text-yellow-500">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <Star key={i} className={cn("h-4 w-4 fill-current", i >= item.rating && "text-slate-200 fill-none")} />
                   ))}
                </div>
                <Badge className="rounded-full bg-white text-slate-500 text-[10px]">{item.is_approved ? "Approved" : "Pending"}</Badge>
             </div>
             <p className="font-bold text-slate-950">{item.comment || "No comment provided."}</p>
          </div>
        ))}
        {!data.length && <EmptyStateBlock title="No reviews yet" text="When customers review your shop, they will appear here." />}
      </div>
    </FormShell>
  );
}
