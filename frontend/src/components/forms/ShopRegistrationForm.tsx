import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Crosshair, ImagePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { compressImage } from "../../lib/image";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const registrationSchema = z.object({
  ownerName: z.string().min(2, "Owner name is required"),
  mobileNumber: z.string().min(10, "Mobile number is required"),
  whatsappNumber: z.string().min(10, "WhatsApp number is required"),
  businessType: z.enum(["tiffin", "kirana", "food"]),
  foodCategoryId: z.string().optional(),
  shopName: z.string().min(2, "Shop name is required"),
  description: z.string().min(20, "Add a short description"),
  address: z.string().min(8, "Address is required"),
  area: z.string().min(2, "Area is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Pincode is required"),
  lat: z.coerce.number({ error: "Latitude is required" }),
  lng: z.coerce.number({ error: "Longitude is required" }),
  openingTime: z.string().min(1, "Opening time is required"),
  closingTime: z.string().min(1, "Closing time is required"),
  homeDeliveryAvailable: z.enum(["yes", "no"]),
  pickupAvailable: z.enum(["yes", "no"]),
  deliveryRadius: z.coerce.number().optional(),
  deliveryFeeNote: z.string().optional(),
});

type RegistrationValues = z.infer<typeof registrationSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
}

async function uploadBusinessImage(bucket: "business-photos" | "avatars", userId: string, file?: File | null) {
  if (!file) return null;
  const compressed = await compressImage(file);
  const path = `${userId}/${crypto.randomUUID()}-${compressed.name}`;
  const { error } = await supabase.storage.from(bucket).upload(path, compressed, { upsert: false });
  if (error) return null;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function ShopRegistrationForm() {
  const { user, refreshProfile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const form = useForm<z.input<typeof registrationSchema>, unknown, RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      businessType: "tiffin",
      state: "",
      city: "",
      homeDeliveryAvailable: "no",
      pickupAvailable: "yes",
      deliveryRadius: 0,
    },
  });
  const businessType = useWatch({ control: form.control, name: "businessType" });
  const foodCategories = useQuery({
    queryKey: ["registration-food-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("food_categories").select("id, name").eq("is_active", true).order("sort_order");
      return data || [];
    },
    enabled: businessType === "food",
  });

  const useGps = () => {
    navigator.geolocation?.getCurrentPosition((position) => {
      form.setValue("lat", Number(position.coords.latitude.toFixed(6)), { shouldValidate: true });
      form.setValue("lng", Number(position.coords.longitude.toFixed(6)), { shouldValidate: true });
    });
  };

  const onSubmit = async (values: RegistrationValues) => {
    setFormError("");
    if (!user) {
      setFormError("Please login first. Shop ownership needs your account for approval and future edits.");
      return;
    }

    await supabase.from("profiles").upsert({
      id: user.id,
      role: "owner",
      full_name: values.ownerName,
      phone: values.mobileNumber,
      whatsapp_number: values.whatsappNumber,
      area: values.area,
      city: values.city,
      state: values.state,
      onboarding_completed: true,
    });
    await refreshProfile();

    const [logoUrl, coverUrl] = await Promise.all([
      uploadBusinessImage("avatars", user.id, logo),
      uploadBusinessImage("business-photos", user.id, cover),
    ]);

    const { error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      type: values.businessType,
      name: values.shopName,
      slug: `${slugify(values.shopName)}-${user.id.slice(0, 8)}`,
      description: values.description,
      phone: values.mobileNumber,
      whatsapp_number: values.whatsappNumber,
      address: values.address,
      area: values.area,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      lat: values.lat,
      lng: values.lng,
      opening_time: values.openingTime,
      closing_time: values.closingTime,
      home_delivery_available: values.homeDeliveryAvailable === "yes",
      pickup_available: values.pickupAvailable === "yes",
      delivery_radius_km: values.deliveryRadius || null,
      delivery_fee_note: values.deliveryFeeNote || null,
      food_category_id: values.businessType === "food" ? values.foodCategoryId || null : null,
      logo_url: logoUrl,
      cover_image_url: coverUrl,
      status: "pending",
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
        <h2 className="mt-4 text-2xl font-black text-slate-950">Your shop has been submitted for review.</h2>
        <p className="mt-2 text-slate-700">
          After approval, customers near your area can find your shop and contact you directly on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 md:p-6">
      {formError ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700 md:col-span-2">{formError}</p> : null}
      <div>
        <Label>Owner name</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("ownerName")} />
        <FieldError message={form.formState.errors.ownerName?.message} />
      </div>
      <div>
        <Label>Mobile number</Label>
        <Input type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.mobileNumber)} className="mt-2 h-12 rounded-2xl" {...form.register("mobileNumber")} />
        <FieldError message={form.formState.errors.mobileNumber?.message} />
      </div>
      <div>
        <Label>WhatsApp number</Label>
        <Input type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.whatsappNumber)} className="mt-2 h-12 rounded-2xl" {...form.register("whatsappNumber")} />
        <FieldError message={form.formState.errors.whatsappNumber?.message} />
      </div>
      <div>
        <Label>Business type</Label>
        <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold" {...form.register("businessType")}>
          <option value="tiffin">Tiffin Service / Home Food</option>
          <option value="kirana">Kirana</option>
          <option value="food">Local Café & Food Shop</option>
        </select>
      </div>
      {businessType === "food" ? (
        <div className="md:col-span-2 rounded-3xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm font-black text-orange-800">
            Apna café, Chinese corner, momo shop, bakery, juice shop ya local food business free mein list karein aur customer orders direct WhatsApp par paayen.
          </p>
          <div className="mt-4">
            <Label>Food shop category</Label>
            <select className="mt-2 h-12 w-full rounded-2xl border border-orange-100 bg-white px-4 text-sm font-semibold" {...form.register("foodCategoryId")}>
              <option value="">Select category</option>
              {(foodCategories.data || []).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      <div className="md:col-span-2">
        <Label>Shop name</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("shopName")} />
        <FieldError message={form.formState.errors.shopName?.message} />
      </div>
      <div className="md:col-span-2">
        <Label>Description</Label>
        <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100" {...form.register("description")} />
        <FieldError message={form.formState.errors.description?.message} />
      </div>
      <div className="md:col-span-2">
        <Label>Address</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("address")} />
        <FieldError message={form.formState.errors.address?.message} />
      </div>
      <div>
        <Label>Area/locality</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("area")} />
        <FieldError message={form.formState.errors.area?.message} />
      </div>
      <div>
        <Label>City</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("city")} />
        <FieldError message={form.formState.errors.city?.message} />
      </div>
      <div>
        <Label>State</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("state")} />
        <FieldError message={form.formState.errors.state?.message} />
      </div>
      <div>
        <Label>Pincode</Label>
        <Input inputMode="numeric" autoComplete="postal-code" aria-invalid={Boolean(form.formState.errors.pincode)} className="mt-2 h-12 rounded-2xl" {...form.register("pincode")} />
        <FieldError message={form.formState.errors.pincode?.message} />
      </div>
      <div>
        <Label>Latitude</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("lat")} />
        <FieldError message={form.formState.errors.lat?.message} />
      </div>
      <div>
        <Label>Longitude</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("lng")} />
        <FieldError message={form.formState.errors.lng?.message} />
      </div>
      <Button type="button" variant="outline" className="h-12 rounded-2xl font-black md:col-span-2" onClick={useGps}>
        <Crosshair className="h-4 w-4" />
        Use browser GPS
      </Button>
      <div>
        <Label>Opening time</Label>
        <Input type="time" className="mt-2 h-12 rounded-2xl" {...form.register("openingTime")} />
      </div>
      <div>
        <Label>Closing time</Label>
        <Input type="time" className="mt-2 h-12 rounded-2xl" {...form.register("closingTime")} />
      </div>
      <div>
        <Label>Home delivery available</Label>
        <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold" {...form.register("homeDeliveryAvailable")}>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <div>
        <Label>Pickup available</Label>
        <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold" {...form.register("pickupAvailable")}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <Label>Delivery radius km</Label>
        <Input className="mt-2 h-12 rounded-2xl" {...form.register("deliveryRadius")} />
      </div>
      <div className="md:col-span-2">
        <Label>Delivery fee note</Label>
        <Input className="mt-2 h-12 rounded-2xl" placeholder="Example: Free nearby, charges depend on distance" {...form.register("deliveryFeeNote")} />
      </div>
      <div>
        <Label>Shop logo upload</Label>
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-600">
          <ImagePlus className="h-5 w-5" />
          {logo ? logo.name : "Upload logo"}
          <input type="file" accept="image/*" className="hidden" onChange={(event) => setLogo(event.target.files?.[0] || null)} />
        </label>
      </div>
      <div>
        <Label>Cover photo upload</Label>
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-600">
          <ImagePlus className="h-5 w-5" />
          {cover ? cover.name : "Upload cover"}
          <input type="file" accept="image/*" className="hidden" onChange={(event) => setCover(event.target.files?.[0] || null)} />
        </label>
      </div>
      <Button disabled={form.formState.isSubmitting} className="h-12 rounded-2xl bg-emerald-700 text-base font-black md:col-span-2">
        {form.formState.isSubmitting ? "Submitting..." : "Submit for approval"}
      </Button>
      <p className="text-center text-xs font-semibold text-slate-500 md:col-span-2">
        Approval ke baad listing public dikhegi. Customers WhatsApp par direct contact karenge.
      </p>
    </form>
  );
}
