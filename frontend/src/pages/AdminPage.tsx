import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  BarChart3,
  Check,
  Download,
  Edit3,
  Eye,
  ImagePlus,
  Megaphone,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Store,
  Utensils,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { compressImage } from "../lib/image";
import { supabase } from "../lib/supabase";
import { generateWhatsAppLink } from "../lib/whatsapp";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { EmptyStateBlock, ErrorStateBlock, SkeletonCard } from "../components/feedback";

type BusinessType = "tiffin" | "kirana" | "food";
type BusinessStatus = "draft" | "pending" | "approved" | "rejected" | "blocked";
type ProfileRole = "customer" | "owner" | "admin";

interface AdminBusiness {
  id: string;
  owner_id: string;
  type: BusinessType;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  whatsapp_number: string;
  address: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  opening_time: string | null;
  closing_time: string | null;
  status: BusinessStatus;
  rejection_reason: string | null;
  blocked_reason: string | null;
  whatsapp_verified: boolean;
  is_featured: boolean;
  rating_avg: number;
  rating_count: number;
  home_delivery_available: boolean;
  delivery_radius_km: number | null;
  delivery_fee_note: string | null;
  cover_image_url: string | null;
  created_at: string;
}

interface AdminProfile {
  id: string;
  role: ProfileRole;
  full_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  city: string | null;
  is_blocked: boolean;
  created_at: string;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  business_type?: BusinessType;
  is_active: boolean;
  sort_order: number;
}

interface ProductCategoryRow {
  id: string;
  business_id: string | null;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

interface BookingLead {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  preferred_date: string;
  preferred_time: string;
  whatsapp_message: string;
  created_at: string;
}

interface OrderLead {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  grocery_list: string;
  whatsapp_message: string;
  created_at: string;
}

interface FoodLead {
  id: string;
  business_id: string;
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

type AdminLead = BookingLead | OrderLead | FoodLead;

interface ReviewRow {
  id: string;
  business_id: string;
  customer_name: string | null;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
}

interface BannerRow {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  placement: string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

interface AdSlotRow {
  id: string;
  key: string;
  name: string;
  page: string | null;
  placement: string;
  platform: string;
  provider: string;
  test_mode: boolean;
  frequency: number;
  notes: string | null;
  is_active: boolean;
}

interface AdUnitRow {
  id: string;
  slot_id: string;
  title: string | null;
  google_ad_unit_id: string | null;
  provider: string;
  platform: string;
  test_mode: boolean;
  frequency: number;
  notes: string | null;
  is_active: boolean;
}

interface SeoRow {
  id: string;
  page_key: string;
  title: string;
  meta_description: string;
  keywords: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  robots_index: boolean;
  structured_data: Record<string, unknown>;
}

interface PageRow {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
  is_published: boolean;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  business_type: BusinessType | null;
  sort_order: number;
}

interface AppConfigRow {
  key: string;
  value: unknown;
  description: string | null;
  is_public: boolean;
}

interface ReportRow {
  id: string;
  target_type: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
}

interface TicketRow {
  id: string;
  name: string | null;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface AuditRow {
  id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

const businessSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsapp_number: z.string().min(10),
  address: z.string().min(6),
  area: z.string().min(2),
  city: z.string().min(2),
  pincode: z.string().min(6),
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sort_order: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  placement: z.string().min(2),
  link_url: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  is_active: z.boolean().default(true),
});

const adSlotSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  page: z.string().optional(),
  placement: z.string().min(2),
  platform: z.enum(["web", "android", "ios"]),
  provider: z.enum(["adsense", "admob", "internal"]),
  test_mode: z.boolean().default(true),
  frequency: z.coerce.number().min(1).default(1),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

const seoSchema = z.object({
  page_key: z.string().min(2),
  title: z.string().min(5),
  meta_description: z.string().min(10),
  keywords: z.string().optional(),
  canonical_url: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  robots_index: z.boolean().default(true),
  structured_data: z.string().default("{}"),
});

const pageSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(3),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  content: z.string().min(10),
  is_published: z.boolean().default(false),
});

const configSchema = z.object({
  key: z.string().min(2),
  value: z.string().min(1),
  description: z.string().optional(),
  is_public: z.boolean().default(true),
});

const statusColors: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  rejected: "bg-red-50 text-red-700 border-red-100",
  blocked: "bg-slate-200 text-slate-700 border-slate-300",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function AdminPage() {
  const { section } = useParams();
  const [toast, setToast] = useState<ToastState | null>(null);
  const current = section || "dashboard";

  const notify = (nextToast: ToastState) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <>
      {toast ? <Toast toast={toast} /> : null}
      {current === "dashboard" ? <Dashboard notify={notify} /> : null}
      {current === "approvals" ? <Approvals notify={notify} /> : null}
      {current === "tiffin-services" ? <BusinessManager type="tiffin" notify={notify} /> : null}
      {current === "kirana" || current === "kirana-shops" ? <BusinessManager type="kirana" notify={notify} /> : null}
      {current === "food-shops" ? <BusinessManager type="food" notify={notify} /> : null}
      {current === "users" ? <UsersManager notify={notify} /> : null}
      {current === "categories" ? <CategoriesManager notify={notify} /> : null}
      {current === "leads" ? <LeadsManager notify={notify} /> : null}
      {current === "reviews" ? <ReviewsManager notify={notify} /> : null}
      {current === "banners" ? <BannersManager notify={notify} /> : null}
      {current === "ads" ? <AdsManager notify={notify} /> : null}
      {current === "seo" ? <SeoManager notify={notify} /> : null}
      {current === "pages" ? <PagesManager notify={notify} /> : null}
      {current === "faqs" ? <FaqsManager /> : null}
      {current === "config" ? <ConfigManager notify={notify} /> : null}
      {current === "support" || current === "reports" ? <SupportManager notify={notify} /> : null}
      {current === "audit" || current === "audit-logs" ? <AuditLogs /> : null}
    </>
  );
}

function Dashboard({ notify }: { notify: (toast: ToastState) => void }) {
  const stats = useAdminStats();
  const pending = useBusinesses({ status: "pending" });
  const recentAudit = useAuditLogs();

  if (stats.isLoading) return <DashboardSkeleton />;
  if (stats.isError) return <ErrorStateBlock title="Dashboard failed to load" text="Please refresh after checking your admin access." />;

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="LocalKart admin"
        title="Control center"
        text="Approvals, listings, leads, ads, SEO and support in one practical dashboard."
      />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {stats.data?.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Pending shop approvals" action={<Badge className="bg-amber-50 text-amber-700">{pending.data?.length || 0} pending</Badge>}>
          <div className="grid gap-3">
            {(pending.data || []).slice(0, 4).map((business) => (
              <ApprovalMiniCard key={business.id} business={business} notify={notify} />
            ))}
            {!pending.data?.length ? <EmptyLine text="No pending shops right now." /> : null}
          </div>
        </Panel>
        <Panel title="Recent admin audit">
          <div className="grid gap-3">
            {(recentAudit.data || []).slice(0, 6).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="font-black text-slate-950">{log.action}</p>
                <p className="text-xs font-semibold text-slate-500">{formatDate(log.created_at)}</p>
              </div>
            ))}
            {!recentAudit.data?.length ? <EmptyLine text="No audit logs yet." /> : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Approvals({ notify }: { notify: (toast: ToastState) => void }) {
  const businesses = useBusinesses({ status: "pending" });

  return (
    <Panel title="Pending approvals" description="Review shop details, verify WhatsApp manually, approve, reject or block.">
      <DataTable
        data={businesses.data || []}
        isLoading={businesses.isLoading}
        isError={businesses.isError}
        searchPlaceholder="Search pending shop, city, area..."
        columns={[
          { label: "Shop", render: (row) => <BusinessCell business={row} /> },
          { label: "Type", render: (row) => <StatusBadge value={row.type} /> },
          { label: "Location", render: (row) => `${row.area}, ${row.city}` },
          { label: "WhatsApp", render: (row) => row.whatsapp_number },
          { label: "Verify", render: (row) => <VerifyButton business={row} notify={notify} /> },
          { label: "Actions", render: (row) => <ApprovalActions business={row} notify={notify} /> },
        ]}
      />
    </Panel>
  );
}

function BusinessManager({ type, notify }: { type: BusinessType; notify: (toast: ToastState) => void }) {
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const businesses = useBusinesses({ type, status: status === "all" ? undefined : status, city, area });

  return (
    <Panel
      title={type === "tiffin" ? "Manage tiffin services" : type === "food" ? "Manage food shops" : "Manage kirana shops"}
      description="Search, filter, edit, view items and mark listings featured."
      action={
        <div className="flex flex-wrap gap-2">
          <Select value={status} onChange={setStatus} options={["all", "approved", "pending", "blocked", "rejected"]} />
          <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="h-10 w-32 rounded-xl" />
          <Input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Area" className="h-10 w-32 rounded-xl" />
        </div>
      }
    >
      <DataTable
        data={businesses.data || []}
        isLoading={businesses.isLoading}
        isError={businesses.isError}
        searchPlaceholder={`Search ${type} by name, city or area`}
        columns={[
          { label: "Business", render: (row) => <BusinessCell business={row} /> },
          { label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { label: "Featured", render: (row) => <FeaturedButton business={row} notify={notify} /> },
          { label: "Items", render: (row) => <ItemsDialog business={row} /> },
          { label: "Actions", render: (row) => <BusinessActions business={row} notify={notify} /> },
        ]}
      />
    </Panel>
  );
}

function UsersManager({ notify }: { notify: (toast: ToastState) => void }) {
  const [role, setRole] = useState("all");
  const profiles = useProfiles(role === "all" ? undefined : role);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ profile, updates, action }: { profile: AdminProfile; updates: Partial<AdminProfile>; action: string }) => {
      const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id);
      if (error) throw error;
      await logAudit(user?.id, action, "profiles", profile.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      notify({ type: "success", message: "User updated" });
    },
    onError: () => notify({ type: "error", message: "Could not update user" }),
  });

  return (
    <Panel
      title="User management"
      description="Search users, block/unblock and change role carefully."
      action={<Select value={role} onChange={setRole} options={["all", "customer", "owner", "admin"]} />}
    >
      <DataTable
        data={profiles.data || []}
        isLoading={profiles.isLoading}
        isError={profiles.isError}
        searchPlaceholder="Search name, phone, city..."
        columns={[
          { label: "User", render: (row) => <div><p className="font-black">{row.full_name || "Unnamed user"}</p><p className="text-xs text-slate-500">{row.phone || row.id}</p></div> },
          { label: "Role", render: (row) => <RoleChanger profile={row} onChange={(nextRole) => mutation.mutate({ profile: row, updates: { role: nextRole }, action: "change_user_role" })} /> },
          { label: "City", render: (row) => row.city || "Not set" },
          { label: "Status", render: (row) => <StatusBadge value={row.is_blocked ? "blocked" : "active"} /> },
          {
            label: "Actions",
            render: (row) => (
              <ConfirmButton
                label={row.is_blocked ? "Unblock" : "Block"}
                tone={row.is_blocked ? "default" : "danger"}
                title={`${row.is_blocked ? "Unblock" : "Block"} user?`}
                description="This updates profile blocking status. RLS and business rules should still be enforced server-side."
                onConfirm={() => mutation.mutate({ profile: row, updates: { is_blocked: !row.is_blocked }, action: row.is_blocked ? "unblock_user" : "block_user" })}
              />
            ),
          },
        ]}
      />
    </Panel>
  );
}

function CategoriesManager({ notify }: { notify: (toast: ToastState) => void }) {
  const tiffinCategories = useCategories();
  const productCategories = useProductCategories();
  const foodCategories = useFoodCategories();

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <CategoryPanel
        title="Tiffin meal plan categories"
        rows={tiffinCategories.data || []}
        table="categories"
        queryKey="admin-categories"
        notify={notify}
      />
      <CategoryPanel
        title="Kirana product categories"
        rows={productCategories.data || []}
        table="product_categories"
        queryKey="admin-product-categories"
        notify={notify}
      />
      <CategoryPanel
        title="Food categories"
        rows={foodCategories.data || []}
        table="food_categories"
        queryKey="admin-food-categories"
        notify={notify}
      />
    </div>
  );
}

function LeadsManager({ notify }: { notify: (toast: ToastState) => void }) {
  const [type, setType] = useState<"tiffin" | "orders" | "food">("tiffin");
  const [date, setDate] = useState("");
  const bookingLeads = useBookingLeads();
  const orderLeads = useOrderLeads();
  const foodLeads = useFoodLeads();
  const businesses = useBusinesses({});
  const businessMap = useMemo(() => new Map((businesses.data || []).map((item) => [item.id, item])), [businesses.data]);
  const rows: AdminLead[] =
    type === "tiffin"
      ? (bookingLeads.data || []).filter((lead) => !date || lead.created_at.startsWith(date))
      : type === "orders"
        ? (orderLeads.data || []).filter((lead) => !date || lead.created_at.startsWith(date))
        : (foodLeads.data || []).filter((lead) => !date || lead.created_at.startsWith(date));

  const exportCsv = () => {
    const csvRows = rows.map((row) => {
      const business = businessMap.get(row.business_id);
      const isBooking = "preferred_date" in row;
      const isFood = "order_type" in row;
      return {
        type,
        shop: business?.name || row.business_id,
        city: business?.city || "",
        customer_name: row.customer_name,
        customer_phone: row.customer_phone,
        details: isBooking ? `${row.preferred_date} ${row.preferred_time}` : isFood ? ((row as FoodLead).custom_order_text || (row as FoodLead).order_type) : (row as OrderLead).grocery_list,
        created_at: row.created_at,
      };
    });
    downloadCsv(`localkart-${type}-leads.csv`, csvRows);
    notify({ type: "success", message: "CSV exported" });
  };

  return (
    <Panel
      title="WhatsApp leads"
      description="Enquiry and order leads saved before WhatsApp redirect."
      action={
        <div className="flex flex-wrap gap-2">
          <Select value={type} onChange={(value) => setType(value as "tiffin" | "orders" | "food")} options={["tiffin", "orders", "food"]} />
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-40 rounded-xl" />
          <Button onClick={exportCsv} className="h-10 rounded-xl bg-emerald-700 font-black"><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      }
    >
      <DataTable
        data={rows}
        isLoading={bookingLeads.isLoading || orderLeads.isLoading || foodLeads.isLoading}
        isError={bookingLeads.isError || orderLeads.isError || foodLeads.isError}
        searchPlaceholder="Search customer, shop, city..."
        extraSearch={(row, search) => {
          const business = businessMap.get(row.business_id);
          return `${business?.name || ""} ${business?.city || ""} ${business?.area || ""}`.toLowerCase().includes(search);
        }}
        columns={[
          { label: "Customer", render: (row) => <div><p className="font-black">{row.customer_name}</p><p className="text-xs text-slate-500">{row.customer_phone}</p></div> },
          { label: "Shop", render: (row) => businessMap.get(row.business_id)?.name || row.business_id },
          {
            label: "Details",
            render: (row) =>
              "preferred_date" in row
                ? `${row.preferred_date} at ${row.preferred_time}`
                : "order_type" in row
                  ? <p className="max-w-md truncate">{row.custom_order_text || row.selected_items?.map((item) => `${item.name || "Item"} x ${item.quantity || 1}`).join(", ") || row.order_type}</p>
                  : <p className="max-w-md truncate">{row.grocery_list}</p>,
          },
          { label: "Created", render: (row) => formatDate(row.created_at) },
          { label: "WhatsApp", render: (row) => <Button asChild variant="outline" className="rounded-xl font-bold"><a href={generateWhatsAppLink(row.customer_phone, "Namaste, LocalKart admin se message kar rahe hain.")} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /> Chat</a></Button> },
        ]}
      />
    </Panel>
  );
}

function ReviewsManager({ notify }: { notify: (toast: ToastState) => void }) {
  const reviews = useReviews();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: async ({ review, action }: { review: ReviewRow; action: "hide" | "show" | "delete" }) => {
      if (action === "delete") {
        const { error } = await supabase.from("reviews").delete().eq("id", review.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").update({ is_approved: action === "show" }).eq("id", review.id);
        if (error) throw error;
      }
      await logAudit(user?.id, `${action}_review`, "reviews", review.id, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      notify({ type: "success", message: "Review updated" });
    },
  });

  return (
    <Panel title="Reviews moderation" description="Hide inappropriate reviews or delete fake/spam entries.">
      <DataTable
        data={reviews.data || []}
        isLoading={reviews.isLoading}
        isError={reviews.isError}
        searchPlaceholder="Search review text or customer..."
        columns={[
          { label: "Customer", render: (row) => row.customer_name || "Customer" },
          { label: "Rating", render: (row) => <span className="font-black">{row.rating}/5</span> },
          { label: "Comment", render: (row) => <p className="max-w-md truncate">{row.comment || "No comment"}</p> },
          { label: "Status", render: (row) => <StatusBadge value={row.is_approved ? "active" : "inactive"} /> },
          {
            label: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl font-bold" onClick={() => mutation.mutate({ review: row, action: row.is_approved ? "hide" : "show" })}>
                  {row.is_approved ? "Hide" : "Show"}
                </Button>
                <ConfirmButton label="Delete" tone="danger" title="Delete review?" description="This removes the review permanently." onConfirm={() => mutation.mutate({ review: row, action: "delete" })} />
              </div>
            ),
          },
        ]}
      />
    </Panel>
  );
}

function BannersManager({ notify }: { notify: (toast: ToastState) => void }) {
  const banners = useBanners();

  return (
    <Panel title="Banners" description="Create, edit and schedule homepage or listing banners." action={<BannerDialog notify={notify} />}>
      <DataTable
        data={banners.data || []}
        isLoading={banners.isLoading}
        isError={banners.isError}
        searchPlaceholder="Search banner title or placement..."
        columns={[
          { label: "Banner", render: (row) => <div className="flex items-center gap-3"><img src={row.image_url} alt={row.title} className="h-12 w-20 rounded-xl object-cover" /><div><p className="font-black">{row.title}</p><p className="text-xs text-slate-500">{row.subtitle}</p></div></div> },
          { label: "Placement", render: (row) => row.placement },
          { label: "Dates", render: (row) => `${row.starts_at ? formatDate(row.starts_at) : "Now"} - ${row.ends_at ? formatDate(row.ends_at) : "No end"}` },
          { label: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
          { label: "Actions", render: (row) => <BannerDialog banner={row} notify={notify} /> },
        ]}
      />
    </Panel>
  );
}

function AdsManager({ notify }: { notify: (toast: ToastState) => void }) {
  const slots = useAdSlots();
  const units = useAdUnits();

  return (
    <div className="space-y-5">
      <Panel title="Ad slots" description="Define pages and placement keys. No production ad IDs are hardcoded in frontend." action={<AdSlotDialog notify={notify} />}>
        <DataTable
          data={slots.data || []}
          isLoading={slots.isLoading}
          isError={slots.isError}
          searchPlaceholder="Search page, key, provider..."
          columns={[
            { label: "Slot", render: (row) => <div><p className="font-black">{row.name}</p><p className="text-xs text-slate-500">{row.key}</p></div> },
            { label: "Page", render: (row) => row.page || "Global" },
            { label: "Provider", render: (row) => `${row.provider} / ${row.platform}` },
            { label: "Mode", render: (row) => row.test_mode ? "Test" : "Live" },
            { label: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
            { label: "Actions", render: (row) => <AdSlotDialog slot={row} notify={notify} /> },
          ]}
        />
      </Panel>
      <Panel title="Ad units" description="Connect internal/promoted/ad-provider units to slots. Keep IDs stored in Supabase, not source code.">
        <DataTable
          data={units.data || []}
          isLoading={units.isLoading}
          isError={units.isError}
          searchPlaceholder="Search ad unit title or provider..."
          columns={[
            { label: "Unit", render: (row) => <div><p className="font-black">{row.title || "Untitled ad unit"}</p><p className="text-xs text-slate-500">{row.google_ad_unit_id || "No ad unit ID"}</p></div> },
            { label: "Provider", render: (row) => `${row.provider} / ${row.platform}` },
            { label: "Frequency", render: (row) => row.frequency },
            { label: "Mode", render: (row) => row.test_mode ? "Test" : "Live" },
            { label: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
          ]}
        />
      </Panel>
    </div>
  );
}

function SeoManager({ notify }: { notify: (toast: ToastState) => void }) {
  const seo = useSeoPages();

  return (
    <Panel title="SEO CMS" description="Manage titles, meta, canonical, Open Graph, robots and structured data." action={<SeoDialog notify={notify} />}>
      <DataTable
        data={seo.data || []}
        isLoading={seo.isLoading}
        isError={seo.isError}
        searchPlaceholder="Search page key, title, keywords..."
        columns={[
          { label: "Page", render: (row) => <div><p className="font-black">{row.page_key}</p><p className="max-w-sm truncate text-xs text-slate-500">{row.title}</p></div> },
          { label: "Meta description", render: (row) => <p className="max-w-md truncate">{row.meta_description}</p> },
          { label: "Canonical", render: (row) => row.canonical_url || "Not set" },
          { label: "Robots", render: (row) => row.robots_index ? "index" : "noindex" },
          { label: "Actions", render: (row) => <SeoDialog seo={row} notify={notify} /> },
        ]}
      />
    </Panel>
  );
}

function PagesManager({ notify }: { notify: (toast: ToastState) => void }) {
  const pages = usePages();

  return (
    <Panel title="Pages CMS" description="Privacy policy, terms, about, contact, FAQ, cancellation policy and how it works." action={<PageDialog notify={notify} />}>
      <DataTable
        data={pages.data || []}
        isLoading={pages.isLoading}
        isError={pages.isError}
        searchPlaceholder="Search slug, title, content..."
        columns={[
          { label: "Page", render: (row) => <div><p className="font-black">{row.title}</p><p className="text-xs text-slate-500">/{row.slug}</p></div> },
          { label: "Meta", render: (row) => <p className="max-w-md truncate">{row.meta_description || row.meta_title || "Not set"}</p> },
          { label: "Status", render: (row) => <StatusBadge value={row.is_published ? "active" : "inactive"} /> },
          { label: "Actions", render: (row) => <PageDialog page={row} notify={notify} /> },
        ]}
      />
    </Panel>
  );
}

function FaqsManager() {
  const faqs = useFaqs();

  return (
    <Panel title="FAQs" description="Review customer and shopkeeper FAQ entries used across LocalKart.">
      <DataTable
        data={faqs.data || []}
        isLoading={faqs.isLoading}
        isError={faqs.isError}
        searchPlaceholder="Search FAQ question, answer or category..."
        columns={[
          { label: "Question", render: (row) => <div><p className="font-black">{row.question}</p><p className="max-w-md truncate text-xs text-slate-500">{row.answer}</p></div> },
          { label: "Category", render: (row) => row.category || "General" },
          { label: "Business type", render: (row) => row.business_type || "All" },
          { label: "Sort", render: (row) => row.sort_order },
        ]}
      />
    </Panel>
  );
}

function ConfigManager({ notify }: { notify: (toast: ToastState) => void }) {
  const config = useAppConfig();
  return (
    <Panel title="App config" description="Support contacts, maintenance, app version, ads, registration and default location settings." action={<ConfigDialog notify={notify} />}>
      <DataTable
        data={config.data || []}
        isLoading={config.isLoading}
        isError={config.isError}
        searchPlaceholder="Search config key..."
        columns={[
          { label: "Key", render: (row) => <p className="font-black">{row.key}</p> },
          { label: "Value", render: (row) => <code className="block max-w-md truncate rounded-xl bg-slate-100 px-2 py-1 text-xs">{JSON.stringify(row.value)}</code> },
          { label: "Description", render: (row) => row.description || "No description" },
          { label: "Public", render: (row) => row.is_public ? "Yes" : "Admin only" },
          { label: "Actions", render: (row) => <ConfigDialog config={row} notify={notify} /> },
        ]}
      />
    </Panel>
  );
}

function SupportManager({ notify }: { notify: (toast: ToastState) => void }) {
  const reports = useReports();
  const tickets = useTickets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: async ({ table, id }: { table: "reports" | "support_tickets"; id: string }) => {
      const { error } = await supabase.from(table).update({ status: "resolved" }).eq("id", id);
      if (error) throw error;
      await logAudit(user?.id, "resolve_support_item", table, id, { status: "resolved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      notify({ type: "success", message: "Marked resolved" });
    },
  });

  return (
    <div className="space-y-5">
      <Panel title="Reported shops/content">
        <DataTable
          data={reports.data || []}
          isLoading={reports.isLoading}
          isError={reports.isError}
          searchPlaceholder="Search reports..."
          columns={[
            { label: "Target", render: (row) => row.target_type },
            { label: "Reason", render: (row) => row.reason },
            { label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { label: "Actions", render: (row) => <Button variant="outline" className="rounded-xl font-bold" onClick={() => mutation.mutate({ table: "reports", id: row.id })}>Resolve</Button> },
          ]}
        />
      </Panel>
      <Panel title="Support tickets">
        <DataTable
          data={tickets.data || []}
          isLoading={tickets.isLoading}
          isError={tickets.isError}
          searchPlaceholder="Search tickets..."
          columns={[
            { label: "Customer", render: (row) => <div><p className="font-black">{row.name || "User"}</p><p className="text-xs text-slate-500">{row.phone}</p></div> },
            { label: "Subject", render: (row) => row.subject },
            { label: "Message", render: (row) => <p className="max-w-md truncate">{row.message}</p> },
            { label: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { label: "Actions", render: (row) => <Button variant="outline" className="rounded-xl font-bold" onClick={() => mutation.mutate({ table: "support_tickets", id: row.id })}>Resolve</Button> },
          ]}
        />
      </Panel>
    </div>
  );
}

function AuditLogs() {
  const audit = useAuditLogs();
  return (
    <Panel title="Audit logs" description="Admin approvals, rejections, edits, deletes, feature toggles, ads and SEO changes.">
      <DataTable
        data={audit.data || []}
        isLoading={audit.isLoading}
        isError={audit.isError}
        searchPlaceholder="Search audit action, table or ID..."
        columns={[
          { label: "Action", render: (row) => <p className="font-black">{row.action}</p> },
          { label: "Target", render: (row) => `${row.target_table || "-"} / ${row.target_id || "-"}` },
          { label: "Changes", render: (row) => <code className="block max-w-lg truncate rounded-xl bg-slate-100 px-2 py-1 text-xs">{JSON.stringify(row.new_values || {})}</code> },
          { label: "Created", render: (row) => formatDate(row.created_at) },
        ]}
      />
    </Panel>
  );
}

function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        users,
        businesses,
        pending,
        tiffin,
        kirana,
        food,
        pendingFood,
        bookingLeads,
        orderLeads,
        foodLeads,
        featured,
        activeAds,
      ] = await Promise.all([
        countTable("profiles"),
        countTable("businesses"),
        countTable("businesses", "status", "pending"),
        countBusinesses({ type: "tiffin", status: "approved" }),
        countBusinesses({ type: "kirana", status: "approved" }),
        countBusinesses({ type: "food", status: "approved" }),
        countBusinesses({ type: "food", status: "pending" }),
        countTable("whatsapp_booking_leads"),
        countTable("whatsapp_order_leads"),
        countTable("whatsapp_food_order_leads"),
        countTable("businesses", "is_featured", true),
        countTable("ad_units", "is_active", true),
      ]);

      return [
        { label: "Total users", value: users, icon: Users },
        { label: "Total businesses", value: businesses, icon: Store },
        { label: "Pending approvals", value: pending, icon: ShieldCheck },
        { label: "Approved tiffin services", value: tiffin, icon: BadgeCheck },
        { label: "Approved kirana", value: kirana, icon: Store },
        { label: "Approved food shops", value: food, icon: Utensils },
        { label: "Pending food shops", value: pendingFood, icon: ShieldCheck },
        { label: "Tiffin enquiries", value: bookingLeads, icon: MessageCircle },
        { label: "Order leads", value: orderLeads, icon: MessageCircle },
        { label: "Food WhatsApp leads", value: foodLeads, icon: MessageCircle },
        { label: "Featured shops", value: featured, icon: Star },
        { label: "Active ads", value: activeAds, icon: Megaphone },
      ];
    },
  });
}

function useBusinesses(filters: { type?: BusinessType; status?: string; city?: string; area?: string }) {
  return useQuery({
    queryKey: ["admin-businesses", filters],
    queryFn: async () => {
      let query = supabase.from("businesses").select("*").order("created_at", { ascending: false });
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters.area) query = query.ilike("area", `%${filters.area}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AdminBusiness[];
    },
  });
}

function useProfiles(role?: string) {
  return useQuery({
    queryKey: ["admin-profiles", role],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (role) query = query.eq("role", role);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AdminProfile[];
    },
  });
}

function useCategories() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as CategoryRow[];
    },
  });
}

function useProductCategories() {
  return useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_categories").select("*").is("business_id", null).order("sort_order");
      if (error) throw error;
      return (data || []) as ProductCategoryRow[];
    },
  });
}

function useFoodCategories() {
  return useQuery({
    queryKey: ["admin-food-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("food_categories").select("*").order("sort_order");
      if (error) throw error;
      return (data || []) as ProductCategoryRow[];
    },
  });
}

function useBookingLeads() {
  return useQuery({
    queryKey: ["admin-booking-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_booking_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BookingLead[];
    },
  });
}

function useOrderLeads() {
  return useQuery({
    queryKey: ["admin-order-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_order_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as OrderLead[];
    },
  });
}

function useFoodLeads() {
  return useQuery({
    queryKey: ["admin-food-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_food_order_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FoodLead[];
    },
  });
}

function useReviews() {
  return useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ReviewRow[];
    },
  });
}

function useBanners() {
  return useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BannerRow[];
    },
  });
}

function useAdSlots() {
  return useQuery({
    queryKey: ["admin-ad-slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ad_slots").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AdSlotRow[];
    },
  });
}

function useAdUnits() {
  return useQuery({
    queryKey: ["admin-ad-units"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ad_units").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as AdUnitRow[];
    },
  });
}

function useSeoPages() {
  return useQuery({
    queryKey: ["admin-seo-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("seo_pages").select("*").order("page_key");
      if (error) throw error;
      return (data || []) as SeoRow[];
    },
  });
}

function usePages() {
  return useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").order("slug");
      if (error) throw error;
      return (data || []) as PageRow[];
    },
  });
}

function useFaqs() {
  return useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("id, question, answer, category, business_type, sort_order").order("sort_order");
      if (error) throw error;
      return (data || []) as FaqRow[];
    },
  });
}

function useAppConfig() {
  return useQuery({
    queryKey: ["admin-app-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_config").select("*").order("key");
      if (error) throw error;
      return (data || []) as AppConfigRow[];
    },
  });
}

function useReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ReportRow[];
    },
  });
}

function useTickets() {
  return useQuery({
    queryKey: ["admin-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as TicketRow[];
    },
  });
}

function useAuditLogs() {
  return useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data || []) as AuditRow[];
    },
  });
}

async function countTable(table: string, field?: string, value?: string | boolean) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (field) query = query.eq(field, value);
  const { count } = await query;
  return count || 0;
}

async function countBusinesses(filters: { type: BusinessType; status: BusinessStatus }) {
  const { count } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("type", filters.type)
    .eq("status", filters.status);
  return count || 0;
}

async function logAudit(
  adminId: string | undefined,
  action: string,
  targetTable: string,
  targetId: string,
  newValues: Record<string, unknown> | Partial<AdminBusiness> | Partial<AdminProfile>,
) {
  await supabase.from("admin_audit_logs").insert({
    admin_id: adminId,
    action,
    target_table: targetTable,
    target_id: targetId,
    new_values: newValues,
  });
}

function ApprovalActions({ business, notify }: { business: AdminBusiness; notify: (toast: ToastState) => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: async ({ status, reason }: { status: BusinessStatus; reason?: string }) => {
      const updates: Partial<AdminBusiness> = {
        status,
        rejection_reason: status === "rejected" ? reason || "Rejected by admin" : null,
        blocked_reason: status === "blocked" ? reason || "Blocked by admin" : null,
      };
      const { error } = await supabase.from("businesses").update(updates).eq("id", business.id);
      if (error) throw error;
      await logAudit(user?.id, `${status}_business`, "businesses", business.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      notify({ type: "success", message: "Business status updated" });
    },
    onError: () => notify({ type: "error", message: "Could not update business" }),
  });

  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmButton label="Approve" title="Approve shop?" description="Approved shops become visible publicly." onConfirm={() => mutation.mutate({ status: "approved" })} />
      <ReasonDialog label="Reject" title="Reject shop" tone="danger" onConfirm={(reason) => mutation.mutate({ status: "rejected", reason })} />
      <ReasonDialog label="Block" title="Block shop" tone="danger" onConfirm={(reason) => mutation.mutate({ status: "blocked", reason })} />
      <EditBusinessDialog business={business} notify={notify} />
    </div>
  );
}

function BusinessActions({ business, notify }: { business: AdminBusiness; notify: (toast: ToastState) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <EditBusinessDialog business={business} notify={notify} />
      <ApprovalActions business={business} notify={notify} />
    </div>
  );
}

function VerifyButton({ business, notify }: { business: AdminBusiness; notify: (toast: ToastState) => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("businesses").update({ whatsapp_verified: !business.whatsapp_verified }).eq("id", business.id);
      if (error) throw error;
      await logAudit(user?.id, "verify_whatsapp", "businesses", business.id, { whatsapp_verified: !business.whatsapp_verified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      notify({ type: "success", message: "WhatsApp verification updated" });
    },
  });

  return (
    <Button variant="outline" className="rounded-xl font-bold" onClick={() => mutation.mutate()}>
      {business.whatsapp_verified ? <Check className="h-4 w-4 text-emerald-700" /> : <X className="h-4 w-4 text-amber-700" />}
      {business.whatsapp_verified ? "Verified" : "Mark verified"}
    </Button>
  );
}

function FeaturedButton({ business, notify }: { business: AdminBusiness; notify: (toast: ToastState) => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: async () => {
      const next = !business.is_featured;
      const { error } = await supabase.from("businesses").update({ is_featured: next }).eq("id", business.id);
      if (error) throw error;
      await logAudit(user?.id, next ? "feature_business" : "unfeature_business", "businesses", business.id, { is_featured: next });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      notify({ type: "success", message: "Featured status updated" });
    },
  });

  return (
    <Button variant="outline" className={cn("rounded-xl font-bold", business.is_featured && "border-amber-200 bg-amber-50 text-amber-700")} onClick={() => mutation.mutate()}>
      <Star className={cn("h-4 w-4", business.is_featured && "fill-amber-400")} />
      {business.is_featured ? "Featured" : "Feature"}
    </Button>
  );
}

function ApprovalMiniCard({ business, notify }: { business: AdminBusiness; notify: (toast: ToastState) => void }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <BusinessCell business={business} />
        <ApprovalActions business={business} notify={notify} />
      </div>
    </div>
  );
}

function EditBusinessDialog({ business, notify }: { business: AdminBusiness; notify: (toast: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof businessSchema>, unknown, z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business.name,
      description: business.description || "",
      phone: business.phone || "",
      whatsapp_number: business.whatsapp_number,
      address: business.address,
      area: business.area,
      city: business.city,
      pincode: business.pincode,
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof businessSchema>) => {
      const { error } = await supabase.from("businesses").update(values).eq("id", business.id);
      if (error) throw error;
      await logAudit(user?.id, "edit_business", "businesses", business.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      setOpen(false);
      notify({ type: "success", message: "Business updated" });
    },
    onError: () => notify({ type: "error", message: "Could not save business" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="rounded-xl font-bold" onClick={() => setOpen(true)}><Edit3 className="h-4 w-4" /> Edit</Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Edit shop info</DialogTitle>
          <DialogDescription>Fix incorrect shop details before approval or public listing.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <TextInput label="Name" register={form.register("name")} />
          <TextInput label="WhatsApp" register={form.register("whatsapp_number")} />
          <TextInput label="Phone" register={form.register("phone")} />
          <TextInput label="Area" register={form.register("area")} />
          <TextInput label="City" register={form.register("city")} />
          <TextInput label="Pincode" register={form.register("pincode")} />
          <div className="md:col-span-2">
            <TextInput label="Address" register={form.register("address")} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" {...form.register("description")} />
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="rounded-xl bg-emerald-700 font-black">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ItemsDialog({ business }: { business: AdminBusiness }) {
  const [open, setOpen] = useState(false);
  const services = useQuery({
    queryKey: ["admin-business-services", business.id],
    enabled: open && business.type === "tiffin",
    queryFn: async () => {
      const { data } = await supabase.from("salon_services").select("*").eq("business_id", business.id);
      return (data || []) as Array<{ id: string; name: string; price: number; duration_minutes: number; is_active: boolean }>;
    },
  });
  const products = useQuery({
    queryKey: ["admin-business-products", business.id],
    enabled: open && business.type === "kirana",
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("business_id", business.id);
      return (data || []) as Array<{ id: string; name: string; unit: string | null; price: number | null; in_stock: boolean }>;
    },
  });
  const foodItems = useQuery({
    queryKey: ["admin-business-food-items", business.id],
    enabled: open && business.type === "food",
    queryFn: async () => {
      const { data } = await supabase.from("food_items").select("*, food_categories(name)").eq("business_id", business.id);
      return (data || []) as Array<{ id: string; name: string; price: number | null; is_veg: boolean; is_available: boolean; food_categories?: { name: string | null } | null }>;
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="rounded-xl font-bold" onClick={() => setOpen(true)}><Eye className="h-4 w-4" /> View</Button>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader>
          <DialogTitle>{business.type === "tiffin" ? "Tiffin meal plans" : business.type === "food" ? "Food menu items" : "Kirana products"}</DialogTitle>
          <DialogDescription>{business.name}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto">
          {business.type === "tiffin"
            ? (services.data || []).map((item) => <InfoRow key={item.id} title={item.name} meta={`Rs ${item.price} - ${item.duration_minutes} min`} />)
            : business.type === "food"
              ? (foodItems.data || []).map((item) => <InfoRow key={item.id} title={item.name} meta={`${item.food_categories?.name || "Local Food"} - Rs ${item.price || "Ask shop"} - ${item.is_veg ? "Veg" : "Non-veg"} - ${item.is_available ? "Available" : "Unavailable"}`} />)
              : (products.data || []).map((item) => <InfoRow key={item.id} title={item.name} meta={`${item.unit || "Unit"} - Rs ${item.price || "Ask shop"} - ${item.in_stock ? "In stock" : "Out of stock"}`} />)}
          {business.type === "tiffin" && !services.data?.length ? <EmptyLine text="No meal plans added." /> : null}
          {business.type === "kirana" && !products.data?.length ? <EmptyLine text="No products added." /> : null}
          {business.type === "food" && !foodItems.data?.length ? <EmptyLine text="No menu items added." /> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryPanel({
  title,
  rows,
  table,
  queryKey,
  notify,
}: {
  title: string;
  rows: Array<CategoryRow | ProductCategoryRow>;
  table: "categories" | "product_categories" | "food_categories";
  queryKey: string;
  notify: (toast: ToastState) => void;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof categorySchema>, unknown, z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", sort_order: 0, is_active: true },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof categorySchema>) => {
      const { error } =
        table === "categories"
          ? await supabase.from("categories").insert({ ...values, business_type: "tiffin" })
          : table === "product_categories"
            ? await supabase.from("product_categories").insert({ ...values, business_id: null })
            : await supabase.from("food_categories").insert(values);
      if (error) throw error;
      await logAudit(user?.id, "create_category", table, values.slug, values);
    },
    onSuccess: () => {
      form.reset({ name: "", slug: "", sort_order: 0, is_active: true });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      notify({ type: "success", message: "Category saved" });
    },
    onError: () => notify({ type: "error", message: "Category save failed" }),
  });

  return (
    <Panel title={title}>
      <form className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_90px_auto]" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <TextInput label="Name" register={form.register("name")} />
        <TextInput label="Slug" register={form.register("slug")} />
        <TextInput label="Order" register={form.register("sort_order")} />
        <Button className="mt-6 rounded-xl bg-emerald-700 font-black"><Plus className="h-4 w-4" /> Add</Button>
      </form>
      <div className="grid gap-2">
        {rows.map((row) => <InfoRow key={row.id} title={row.name} meta={`${row.slug} - ${row.is_active ? "Active" : "Inactive"}`} />)}
      </div>
    </Panel>
  );
}

function BannerDialog({ banner, notify }: { banner?: BannerRow; notify: (toast: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof bannerSchema>, unknown, z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      placement: banner?.placement || "home_top",
      link_url: banner?.link_url || "",
      starts_at: banner?.starts_at?.slice(0, 10) || "",
      ends_at: banner?.ends_at?.slice(0, 10) || "",
      is_active: banner?.is_active ?? true,
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof bannerSchema>) => {
      let imageUrl = banner?.image_url || "";
      if (file && user) {
        const compressed = await compressImage(file);
        const path = `${user.id}/${crypto.randomUUID()}-${compressed.name}`;
        const { error } = await supabase.storage.from("banners").upload(path, compressed);
        if (error) throw error;
        imageUrl = supabase.storage.from("banners").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        title: values.title,
        subtitle: values.subtitle || null,
        placement: values.placement,
        link_url: values.link_url || null,
        starts_at: values.starts_at || null,
        ends_at: values.ends_at || null,
        is_active: values.is_active,
        image_url: imageUrl || "/logo.png",
      };
      const request = banner ? supabase.from("banners").update(payload).eq("id", banner.id) : supabase.from("banners").insert(payload);
      const { error } = await request;
      if (error) throw error;
      await logAudit(user?.id, banner ? "edit_banner" : "create_banner", "banners", banner?.id || values.title, payload);
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      notify({ type: "success", message: "Banner saved" });
    },
    onError: () => notify({ type: "error", message: "Could not save banner" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={banner ? "outline" : "default"} className={cn("rounded-xl font-bold", !banner && "bg-emerald-700")} onClick={() => setOpen(true)}>
        {banner ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {banner ? "Edit" : "Create banner"}
      </Button>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader><DialogTitle>{banner ? "Edit banner" : "Create banner"}</DialogTitle></DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <TextInput label="Title" register={form.register("title")} />
          <TextInput label="Subtitle" register={form.register("subtitle")} />
          <TextInput label="Placement" register={form.register("placement")} />
          <TextInput label="Link URL" register={form.register("link_url")} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Start date" type="date" register={form.register("starts_at")} />
            <TextInput label="End date" type="date" register={form.register("ends_at")} />
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold">
            <ImagePlus className="h-5 w-5" />
            {file ? file.name : "Upload banner image"}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </label>
          <Checkbox label="Active" register={form.register("is_active")} />
          <DialogFooter><Button className="rounded-xl bg-emerald-700 font-black">Save banner</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdSlotDialog({ slot, notify }: { slot?: AdSlotRow; notify: (toast: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof adSlotSchema>, unknown, z.infer<typeof adSlotSchema>>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: {
      key: slot?.key || "",
      name: slot?.name || "",
      page: slot?.page || "",
      placement: slot?.placement || "",
      platform: (slot?.platform as "web" | "android" | "ios") || "web",
      provider: (slot?.provider as "adsense" | "admob" | "internal") || "internal",
      test_mode: slot?.test_mode ?? true,
      frequency: slot?.frequency || 1,
      notes: slot?.notes || "",
      is_active: slot?.is_active ?? true,
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof adSlotSchema>) => {
      const payload = { ...values, page: values.page || null, notes: values.notes || null };
      const request = slot ? supabase.from("ad_slots").update(payload).eq("id", slot.id) : supabase.from("ad_slots").insert(payload);
      const { error } = await request;
      if (error) throw error;
      await logAudit(user?.id, slot ? "edit_ad_slot" : "create_ad_slot", "ad_slots", slot?.id || values.key, payload);
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-ad-slots"] });
      notify({ type: "success", message: "Ad slot saved" });
    },
    onError: () => notify({ type: "error", message: "Could not save ad slot" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={slot ? "outline" : "default"} className={cn("rounded-xl font-bold", !slot && "bg-emerald-700")} onClick={() => setOpen(true)}>
        {slot ? "Edit" : "Create ad slot"}
      </Button>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader>
          <DialogTitle>{slot ? "Edit ad slot" : "Create ad slot"}</DialogTitle>
          <DialogDescription>Do not hardcode production IDs in frontend. Store ad config here.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <TextInput label="Placement key" register={form.register("key")} />
          <TextInput label="Name" register={form.register("name")} />
          <TextInput label="Page" register={form.register("page")} />
          <TextInput label="Placement" register={form.register("placement")} />
          <SelectField label="Platform" register={form.register("platform")} options={["web", "android", "ios"]} />
          <SelectField label="Provider" register={form.register("provider")} options={["internal", "adsense", "admob"]} />
          <TextInput label="Frequency" register={form.register("frequency")} />
          <TextInput label="Notes" register={form.register("notes")} />
          <Checkbox label="Test mode" register={form.register("test_mode")} />
          <Checkbox label="Active" register={form.register("is_active")} />
          <DialogFooter className="md:col-span-2"><Button className="rounded-xl bg-emerald-700 font-black">Save ad slot</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SeoDialog({ seo, notify }: { seo?: SeoRow; notify: (toast: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof seoSchema>, unknown, z.infer<typeof seoSchema>>({
    resolver: zodResolver(seoSchema),
    defaultValues: {
      page_key: seo?.page_key || "homepage",
      title: seo?.title || "",
      meta_description: seo?.meta_description || "",
      keywords: seo?.keywords || "",
      canonical_url: seo?.canonical_url || "",
      og_title: seo?.og_title || "",
      og_description: seo?.og_description || "",
      robots_index: seo?.robots_index ?? true,
      structured_data: JSON.stringify(seo?.structured_data || {}, null, 2),
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof seoSchema>) => {
      let structuredData: Record<string, unknown>;
      try {
        structuredData = JSON.parse(values.structured_data) as Record<string, unknown>;
      } catch {
        throw new Error("Structured data must be valid JSON");
      }
      const payload = { ...values, structured_data: structuredData };
      const request = seo ? supabase.from("seo_pages").update(payload).eq("id", seo.id) : supabase.from("seo_pages").insert(payload);
      const { error } = await request;
      if (error) throw error;
      await logAudit(user?.id, seo ? "edit_seo" : "create_seo", "seo_pages", seo?.id || values.page_key, payload);
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] });
      notify({ type: "success", message: "SEO saved" });
    },
    onError: (error) => notify({ type: "error", message: error.message || "Could not save SEO" }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={seo ? "outline" : "default"} className={cn("rounded-xl font-bold", !seo && "bg-emerald-700")} onClick={() => setOpen(true)}>{seo ? "Edit" : "Create SEO"}</Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl bg-white">
        <DialogHeader><DialogTitle>SEO CMS</DialogTitle></DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <TextInput label="Page key" register={form.register("page_key")} />
          <TextInput label="Page title" register={form.register("title")} />
          <TextInput label="Meta description" register={form.register("meta_description")} />
          <TextInput label="Keywords" register={form.register("keywords")} />
          <TextInput label="Canonical URL" register={form.register("canonical_url")} />
          <TextInput label="Open Graph title" register={form.register("og_title")} />
          <TextInput label="Open Graph description" register={form.register("og_description")} />
          <Checkbox label="Index page" register={form.register("robots_index")} />
          <div>
            <Label>Structured data JSON</Label>
            <textarea className="mt-2 min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs" {...form.register("structured_data")} />
          </div>
          <DialogFooter><Button className="rounded-xl bg-emerald-700 font-black">Save SEO</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PageDialog({ page, notify }: { page?: PageRow; notify: (toast: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof pageSchema>, unknown, z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      slug: page?.slug || "",
      title: page?.title || "",
      meta_title: page?.meta_title || "",
      meta_description: page?.meta_description || "",
      content: page?.content || "",
      is_published: page?.is_published ?? false,
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof pageSchema>) => {
      const request = page ? supabase.from("pages").update(values).eq("id", page.id) : supabase.from("pages").insert(values);
      const { error } = await request;
      if (error) throw error;
      await logAudit(user?.id, page ? "edit_page" : "create_page", "pages", page?.id || values.slug, values);
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      notify({ type: "success", message: "Page saved" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={page ? "outline" : "default"} className={cn("rounded-xl font-bold", !page && "bg-emerald-700")} onClick={() => setOpen(true)}>{page ? "Edit" : "Create page"}</Button>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl bg-white">
        <DialogHeader><DialogTitle>Pages CMS</DialogTitle></DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <TextInput label="Slug" register={form.register("slug")} />
          <TextInput label="Title" register={form.register("title")} />
          <TextInput label="Meta title" register={form.register("meta_title")} />
          <TextInput label="Meta description" register={form.register("meta_description")} />
          <div>
            <Label>Content</Label>
            <textarea className="mt-2 min-h-48 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" {...form.register("content")} />
          </div>
          <Checkbox label="Published" register={form.register("is_published")} />
          <DialogFooter><Button className="rounded-xl bg-emerald-700 font-black">Save page</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ConfigDialog({ config, notify }: { config?: AppConfigRow; notify: (toast: ToastState) => void }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const form = useForm<z.input<typeof configSchema>, unknown, z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      key: config?.key || "",
      value: JSON.stringify(config?.value ?? "", null, 2),
      description: config?.description || "",
      is_public: config?.is_public ?? true,
    },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof configSchema>) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(values.value);
      } catch {
        parsed = values.value;
      }
      const payload = { key: values.key, value: parsed, description: values.description || null, is_public: values.is_public };
      const { error } = await supabase.from("app_config").upsert(payload);
      if (error) throw error;
      await logAudit(user?.id, "save_app_config", "app_config", values.key, payload);
    },
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-app-config"] });
      notify({ type: "success", message: "Config saved" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={config ? "outline" : "default"} className={cn("rounded-xl font-bold", !config && "bg-emerald-700")} onClick={() => setOpen(true)}>{config ? "Edit" : "Add config"}</Button>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader><DialogTitle>App config</DialogTitle></DialogHeader>
        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <TextInput label="Key" register={form.register("key")} />
          <div>
            <Label>Value JSON/string</Label>
            <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs" {...form.register("value")} />
          </div>
          <TextInput label="Description" register={form.register("description")} />
          <Checkbox label="Public config" register={form.register("is_public")} />
          <DialogFooter><Button className="rounded-xl bg-emerald-700 font-black">Save config</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleChanger({ profile, onChange }: { profile: AdminProfile; onChange: (role: ProfileRole) => void }) {
  const [value, setValue] = useState<ProfileRole>(profile.role);
  return (
    <select
      value={value}
      onChange={(event) => {
        const next = event.target.value as ProfileRole;
        if (window.confirm(`Change role to ${next}?`)) {
          setValue(next);
          onChange(next);
        }
      }}
      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
    >
      <option value="customer">customer</option>
      <option value="owner">owner</option>
      <option value="admin">admin</option>
    </select>
  );
}

function DataTable<T>({
  data,
  columns,
  isLoading,
  isError,
  searchPlaceholder,
  extraSearch,
}: {
  data: T[];
  columns: Array<{ label: string; render: (row: T) => ReactNode }>;
  isLoading?: boolean;
  isError?: boolean;
  searchPlaceholder: string;
  extraSearch?: (row: T, search: string) => boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filtered = useMemo(() => {
    const lowered = search.toLowerCase().trim();
    if (!lowered) return data;
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(lowered) || extraSearch?.(row, lowered));
  }, [data, extraSearch, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) return <div className="grid gap-3 md:grid-cols-2"><SkeletonCard /><SkeletonCard /></div>;
  if (isError) return <ErrorStateBlock title="Could not load data" text="Check Supabase RLS/admin access and try again." />;

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={searchPlaceholder} className="h-11 rounded-2xl bg-slate-50 pl-10" />
      </div>
      {!pageRows.length ? <EmptyStateBlock title="No records found" text="Try clearing filters or search terms." /> : null}
      {pageRows.length ? (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
          <div className="grid gap-3 p-3 md:hidden">
            {pageRows.map((row, index) => (
              <article key={JSON.stringify(row).slice(0, 80) + index} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <dl className="grid gap-3">
                  {columns.map((column) => (
                    <div key={column.label} className="min-w-0">
                      <dt className="text-[10px] font-black uppercase tracking-widest text-slate-400">{column.label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-700 [&_*]:max-w-full">{column.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>{columns.map((column) => <th key={column.label} className="px-4 py-3 font-black">{column.label}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((row, index) => (
                  <tr key={JSON.stringify(row).slice(0, 80) + index} className="align-top hover:bg-slate-50">
                    {columns.map((column) => <td key={column.label} className="px-4 py-4 font-semibold text-slate-700">{column.render(row)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm font-bold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>{filtered.length} records</span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="h-9 rounded-xl" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Prev</Button>
              <span>Page {page} of {totalPages}</span>
              <Button variant="outline" className="h-9 rounded-xl" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConfirmButton({
  label,
  title,
  description,
  onConfirm,
  tone = "default",
}: {
  label: string;
  title: string;
  description: string;
  onConfirm: () => void;
  tone?: "default" | "danger";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className={cn("rounded-xl font-bold", tone === "danger" && "border-red-100 text-red-700 hover:bg-red-50")} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className={cn("rounded-xl font-black", tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-800")} onClick={() => { onConfirm(); setOpen(false); }}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReasonDialog({
  label,
  title,
  onConfirm,
  tone = "default",
}: {
  label: string;
  title: string;
  onConfirm: (reason: string) => void;
  tone?: "default" | "danger";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className={cn("rounded-xl font-bold", tone === "danger" && "border-red-100 text-red-700 hover:bg-red-50")} onClick={() => setOpen(true)}>{label}</Button>
      <DialogContent className="rounded-3xl bg-white">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason shown in admin notes/audit" className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm" />
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="rounded-xl bg-red-600 font-black hover:bg-red-700" onClick={() => { onConfirm(reason); setOpen(false); setReason(""); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action ? <div className="min-w-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-black text-slate-950">{title}</h1>
      <p className="mt-2 max-w-3xl leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span>
        <span className="text-2xl font-black text-slate-950">{value}</span>
      </div>
      <p className="mt-4 text-sm font-black text-slate-600">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="grid gap-4 md:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
}

function BusinessCell({ business }: { business: AdminBusiness }) {
  return (
    <div>
      <p className="font-black text-slate-950">{business.name}</p>
      <p className="text-xs font-semibold text-slate-500">{business.area}, {business.city}</p>
      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{business.address}</p>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  return <Badge className={cn("rounded-full border px-3 py-1", statusColors[value] || "bg-slate-50 text-slate-600")}>{value}</Badge>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  );
}

function TextInput({ label, register, defaultValue, type = "text" }: { label: string; register: UseFormRegisterReturn; defaultValue?: string | number; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} defaultValue={defaultValue} className="mt-2 h-11 rounded-2xl bg-slate-50" {...register} />
    </div>
  );
}

function SelectField({ label, register, options }: { label: string; register: UseFormRegisterReturn; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <select className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold" {...register}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function Checkbox({ label, register }: { label: string; register: UseFormRegisterReturn }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-slate-700">
      <input type="checkbox" className="h-4 w-4" {...register} />
      {label}
    </label>
  );
}

function InfoRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <p className="font-black text-slate-950">{title}</p>
      <p className="text-sm text-slate-600">{meta}</p>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{text}</p>;
}

function Toast({ toast }: { toast: ToastState }) {
  return (
    <div className={cn("fixed left-4 right-4 top-4 z-[80] rounded-2xl px-4 py-3 text-sm font-black shadow-xl sm:left-auto sm:max-w-sm", toast.type === "success" ? "bg-emerald-700 text-white" : "bg-red-600 text-white")}>
      {toast.message}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number | boolean>>) {
  const headers = Object.keys(rows[0] || { empty: "" });
  const escape = (value: string | number | boolean) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
