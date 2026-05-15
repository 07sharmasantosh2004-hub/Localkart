import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle, Phone, ShoppingBasket, Utensils, Check, Clock3, MapPin, X, Plus, Soup } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { foodMenuItems, kiranaProducts, mealPlans } from "../../lib/mockData";
import { supabase } from "../../lib/supabase";
import type { Business, FoodMenuItem, KiranaProduct, MealPlan } from "../../lib/types";
import { generateWhatsAppLink } from "../../lib/whatsapp";
import { createWhatsAppBookingLead, createWhatsAppFoodLead, createWhatsAppOrderLead } from "../../services/leads";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Enter a valid phone number"),
  address: z.string().min(8, "Delivery address is required"),
  mealPreference: z.enum(["Breakfast", "Lunch", "Dinner", "Full day"]),
  planType: z.enum(["Trial", "Daily", "Weekly", "Monthly"]),
  foodPreference: z.enum(["Veg", "Non-veg"]),
  startDate: z.string().min(1, "Start date is required"),
  note: z.string().optional(),
});

const orderSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Enter a valid phone number"),
  address: z.string().min(8, "Delivery address is required"),
  groceryList: z.string().optional(),
  note: z.string().optional(),
});

const foodOrderSchema = z
  .object({
    customerName: z.string().min(2, "Name is required"),
    customerPhone: z.string().min(10, "Enter a valid phone number"),
    orderType: z.enum(["delivery", "pickup"]),
    address: z.string().optional(),
    customOrderText: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.orderType === "delivery" && (!values.address || values.address.trim().length < 8)) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Address is required for delivery",
      });
    }
  });

type BookingFormValues = z.infer<typeof bookingSchema>;
type OrderFormValues = z.infer<typeof orderSchema>;
type FoodOrderFormValues = z.infer<typeof foodOrderSchema>;
const emptySelectedItems: Record<string, number> = {};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-bold text-red-600">{message}</p>;
}

export function TiffinWhatsAppOrderForm({ provider, plans = mealPlans }: { provider: Business; plans?: MealPlan[] }) {
  const availablePlans = plans.length ? plans : mealPlans;
  const [selectedPlan, setSelectedPlan] = useState<MealPlan>(availablePlans[0]);
  const [warning, setWarning] = useState("");
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      address: "",
      mealPreference: "Lunch",
      planType: "Trial",
      foodPreference: "Veg",
      startDate: "",
      note: "",
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    const message = `Hello ${provider.name},
I want to enquire/order tiffin service.

Name: ${values.customerName}
Phone: ${values.customerPhone}
Address: ${values.address}
Meal: ${values.mealPreference}
Plan: ${values.planType}${selectedPlan?.name ? ` - ${selectedPlan.name}` : ""}
Veg/Non-veg: ${values.foodPreference}
Start date: ${values.startDate}
Notes: ${values.note || "No special note"}

Please confirm price, availability, and delivery time.`;

    try {
      const result = await createWhatsAppBookingLead({
        business_id: provider.id,
        service_id: selectedPlan.id,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        preferred_date: values.startDate,
        preferred_time: values.mealPreference,
        note: values.note || null,
        whatsapp_message: message,
        selected_items: [{ plan: selectedPlan.name, meal: values.mealPreference, type: values.planType, food_preference: values.foodPreference, address: values.address }],
      });
      setWarning("");
      window.open(result.whatsapp_url, "_blank", "noopener,noreferrer");
    } catch {
      const { error } = await supabase.from("whatsapp_booking_leads").insert({
        business_id: provider.id,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        preferred_date: values.startDate,
        preferred_time: values.mealPreference,
        note: values.note || null,
        whatsapp_message: message,
        selected_items: [{ plan: selectedPlan.name, meal: values.mealPreference, type: values.planType, food_preference: values.foodPreference, address: values.address }],
        metadata: {
          plan_name: selectedPlan.name,
          plan_id: selectedPlan.id,
          delivery_address: values.address,
          plan_type: values.planType,
          food_preference: values.foodPreference,
          source: "customer_tiffin_detail",
        },
      });

      setWarning(error ? "Lead save nahi ho paya, lekin aap WhatsApp par enquiry bhej sakte hain." : "");
      window.open(generateWhatsAppLink(provider.whatsapp, message), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-2xl shadow-emerald-950/5 md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 shadow-inner">
          <Soup className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-slate-950">Order / enquire on WhatsApp</h2>
          <p className="text-sm font-semibold text-slate-500">Provider confirms price, delivery and availability.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Meal Plan</Label>
        <div className="grid gap-3">
          {availablePlans.map((plan) => {
            const selected = selectedPlan.id === plan.id;
            return (
              <button
                type="button"
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                }}
                className={cn(
                  "group flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300",
                  selected ? "border-orange-300 bg-orange-50/50 shadow-md ring-2 ring-orange-100" : "border-slate-100 bg-slate-50/50 hover:border-orange-200"
                )}
              >
                <div className="flex items-center gap-3">
                   <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors", selected ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300 bg-white")}>
                      {selected && <Check className="h-3 w-3 stroke-[4]" />}
                   </div>
                   <div>
                    <span className="block font-black text-slate-950">{plan.name}</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Clock3 className="h-3 w-3" />
                      {plan.duration}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-950">Rs {plan.price}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Your name</Label>
          <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="Ravi Kumar" {...form.register("customerName")} />
          <FieldError message={form.formState.errors.customerName?.message} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone number</Label>
          <Input type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.customerPhone)} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="98765 43210" {...form.register("customerPhone")} />
          <FieldError message={form.formState.errors.customerPhone?.message} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Meal</Label>
          <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold focus:bg-white" {...form.register("mealPreference")}>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Full day</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Plan type</Label>
          <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold focus:bg-white" {...form.register("planType")}>
            <option>Trial</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Veg / Non-veg</Label>
          <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold focus:bg-white" {...form.register("foodPreference")}>
            <option>Veg</option>
            <option>Non-veg</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Start date</Label>
          <Input type="date" className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" {...form.register("startDate")} />
          <FieldError message={form.formState.errors.startDate?.message} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery address</Label>
        <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="House no, street, landmark" {...form.register("address")} />
        <FieldError message={form.formState.errors.address?.message} />
      </div>

      <div className="mt-6 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Notes</Label>
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-semibold outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 placeholder:text-slate-400"
          placeholder="Preferred delivery time, spice level, allergies, number of people..."
          {...form.register("note")}
        />
      </div>
      
      {warning && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800 border border-amber-100">{warning}</div>}

      <div className="mt-8">
        <Button disabled={form.formState.isSubmitting} className="h-14 w-full rounded-2xl bg-[#16A34A] text-lg font-black text-white shadow-xl shadow-emerald-900/20 hover:bg-[#15803D] hover:scale-[1.02] active:scale-95 transition-all">
          <MessageCircle className="h-6 w-6" />
          {form.formState.isSubmitting ? "Connecting..." : "Send Tiffin Enquiry"}
        </Button>
        <p className="mt-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
           Direct Connection • No Charges
        </p>
      </div>
    </form>
  );
}

export const BookingWhatsAppForm = TiffinWhatsAppOrderForm;

export function KiranaWhatsAppOrderForm({ shop, products = kiranaProducts }: { shop: Business; products?: KiranaProduct[] }) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [warning, setWarning] = useState("");
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerName: "", customerPhone: "", address: "", groceryList: "", note: "" },
  });

  const selectedLines = useMemo(
    () =>
      products
        .filter((product) => selected[product.id])
        .map((product) => `${product.name} - ${selected[product.id]} x ${product.unit}`),
    [products, selected],
  );

  const onSubmit = async (values: OrderFormValues) => {
    const orderDetails = selectedLines.length ? selectedLines.join("\n") : values.groceryList?.trim();
    if (!orderDetails) {
      form.setError("groceryList", { message: "Select products or write your grocery list" });
      return;
    }

    const message = `Hello ${shop.name},
I want to order groceries.

Name: ${values.customerName}
Phone: ${values.customerPhone}
Address: ${values.address}

Order Details:
${orderDetails}

Delivery Note: ${values.note || "No special note"}

Please confirm availability and delivery time.`;

    const selectedItems = products.filter((product) => selected[product.id]).map((product) => ({ ...product, quantity: selected[product.id] }));

    try {
      const result = await createWhatsAppOrderLead({
        business_id: shop.id,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        customer_address: values.address,
        selected_items: selectedItems,
        custom_order_text: orderDetails,
        note: values.note || null,
        whatsapp_message: message,
      });
      setWarning("");
      window.open(result.whatsapp_url, "_blank", "noopener,noreferrer");
    } catch {
      const { error } = await supabase.from("whatsapp_order_leads").insert({
        business_id: shop.id,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        delivery_address: values.address,
        customer_address: values.address,
        grocery_list: orderDetails,
        custom_order_text: orderDetails,
        selected_items: selectedItems,
        selected_products: selectedLines,
        note: values.note || null,
        whatsapp_message: message,
        metadata: {
          source: "customer_kirana_detail",
        },
      });

      setWarning(error ? "Lead save nahi ho paya, lekin aap WhatsApp par order bhej sakte hain." : "");
      window.open(generateWhatsAppLink(shop.whatsapp, message), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-2xl shadow-emerald-950/5 md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-inner">
          <ShoppingBasket className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-slate-950">Order on WhatsApp</h2>
          <p className="text-sm font-semibold text-slate-500">Delivery confirmed directly by shopkeeper.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Popular Products</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((product) => {
            const quantity = selected[product.id] || 0;
            return (
              <div key={product.id} className={cn("rounded-2xl border p-4 transition-all", quantity ? "border-emerald-300 bg-emerald-50/50 shadow-sm" : "border-slate-100 bg-slate-50/50")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{product.name}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{product.unit}</p>
                  </div>
                  <Badge className="rounded-full bg-white text-emerald-700 text-[10px] font-black">{product.category}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Button type="button" variant="outline" size="icon" aria-label={`Remove ${product.name}`} className="h-10 w-10 rounded-lg bg-white" onClick={() => setSelected((current) => ({ ...current, [product.id]: Math.max(0, quantity - 1) }))}>
                    <X className="h-3 w-3" />
                  </Button>
                  <span className="min-w-8 text-center font-black text-slate-950">{quantity}</span>
                  <Button type="button" size="icon" aria-label={`Add ${product.name}`} className="h-10 w-10 rounded-lg bg-emerald-700 text-white" onClick={() => setSelected((current) => ({ ...current, [product.id]: quantity + 1 }))}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Or write your grocery list</Label>
        <textarea
          className="min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-semibold outline-none transition-all focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100 placeholder:text-slate-400"
          placeholder="Example: 5kg atta, 1L oil, 2kg rice, 1 packet tea..."
          {...form.register("groceryList")}
        />
        <FieldError message={form.formState.errors.groceryList?.message} />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Your name</Label>
          <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="Pooja Sharma" {...form.register("customerName")} />
          <FieldError message={form.formState.errors.customerName?.message} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone number</Label>
          <Input type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.customerPhone)} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="98765 43210" {...form.register("customerPhone")} />
          <FieldError message={form.formState.errors.customerPhone?.message} />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery address</Label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50 pl-11 focus:bg-white transition-colors" placeholder="House no, street, landmark" {...form.register("address")} />
        </div>
        <FieldError message={form.formState.errors.address?.message} />
      </div>
      <div className="mt-5 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery note</Label>
        <textarea className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-semibold outline-none focus:border-emerald-300 focus:bg-white transition-all" placeholder="Landmark, alternate items, etc." {...form.register("note")} />
      </div>
      
      {warning && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800 border border-amber-100">{warning}</div>}
      
      <div className="mt-8 space-y-4">
        <Button disabled={form.formState.isSubmitting} className="h-14 w-full rounded-2xl bg-[#16A34A] text-lg font-black text-white shadow-xl shadow-emerald-900/20 hover:bg-[#15803D] hover:scale-[1.02] transition-all">
          <MessageCircle className="h-6 w-6" />
          {form.formState.isSubmitting ? "Connecting..." : "Send Order on WhatsApp"}
        </Button>
        <Button asChild variant="outline" className="h-12 w-full rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
          <a href={`tel:${shop.phone}`}>
            <Phone className="h-4 w-4" />
            Call Shop Instead
          </a>
        </Button>
      </div>
    </form>
  );
}

export function FoodOrderWhatsAppForm({
  shop,
  menuItems = foodMenuItems,
  selected,
  setSelected,
}: {
  shop: Business;
  menuItems?: FoodMenuItem[];
  selected?: Record<string, number>;
  setSelected?: Dispatch<SetStateAction<Record<string, number>>>;
}) {
  const [warning, setWarning] = useState("");
  const selectedItems = selected ?? emptySelectedItems;
  const form = useForm<FoodOrderFormValues>({
    resolver: zodResolver(foodOrderSchema),
    defaultValues: { customerName: "", customerPhone: "", orderType: shop.delivery_available ? "delivery" : "pickup", address: "", customOrderText: "", note: "" },
  });
  const orderType = useWatch({ control: form.control, name: "orderType" });

  const selectedLines = useMemo(
    () =>
      menuItems
        .filter((item) => selectedItems[item.id])
        .map((item) => `${item.name} - ${selectedItems[item.id]} x${item.price ? ` - Rs ${Number(item.price) * selectedItems[item.id]}` : ""}`),
    [menuItems, selectedItems],
  );

  const selectedPayload = useMemo(
    () =>
      menuItems
        .filter((item) => selectedItems[item.id])
        .map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price ?? null,
          quantity: selectedItems[item.id],
          category: item.category,
          is_veg: item.is_veg,
        })),
    [menuItems, selectedItems],
  );

  const onSubmit = async (values: FoodOrderFormValues) => {
    const customText = values.customOrderText?.trim();
    const orderDetails = selectedLines.length ? selectedLines.join("\n") : customText;
    if (!orderDetails) {
      form.setError("customOrderText", { message: "Select menu items or write your food order" });
      return;
    }

    const message = `Hello ${shop.name},
I want to place a food order.

Name: ${values.customerName}
Phone: ${values.customerPhone}
Order Type: ${values.orderType === "delivery" ? "Delivery" : "Pickup"}
${values.orderType === "delivery" ? `Address: ${values.address}` : ""}

Order Details:
${orderDetails}

Note: ${values.note || "No special note"}

Please confirm availability, total amount and timing.`;

    try {
      const result = await createWhatsAppFoodLead({
        business_id: shop.id,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        order_type: values.orderType,
        customer_address: values.orderType === "delivery" ? values.address || null : null,
        selected_items: selectedPayload.length ? selectedPayload : null,
        custom_order_text: customText || null,
        note: values.note || null,
        whatsapp_message: message,
      });
      setWarning("");
      window.open(result.whatsapp_url, "_blank", "noopener,noreferrer");
    } catch {
      const { error } = await supabase.from("whatsapp_food_order_leads").insert({
        business_id: shop.id,
        customer_name: values.customerName,
        customer_phone: values.customerPhone,
        order_type: values.orderType,
        customer_address: values.orderType === "delivery" ? values.address || null : null,
        selected_items: selectedPayload.length ? selectedPayload : null,
        custom_order_text: customText || null,
        note: values.note || null,
        whatsapp_message: message,
        status: "sent",
      });

      setWarning(error ? "Lead save nahi ho paya, lekin aap WhatsApp par order bhej sakte hain." : "");
      window.open(generateWhatsAppLink(shop.whatsapp, message), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[2.5rem] border border-slate-100 bg-white p-6 shadow-2xl shadow-emerald-950/5 md:p-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 shadow-inner">
          <Utensils className="h-7 w-7" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-slate-950">Order on WhatsApp</h2>
          <p className="text-sm font-semibold text-slate-500">Shopkeeper confirms total amount directly.</p>
        </div>
      </div>

      {selectedPayload.length ? (
        <div className="mb-6 rounded-3xl border border-orange-100 bg-orange-50 p-4">
          <Label className="text-xs font-black uppercase tracking-widest text-orange-700">Selected from menu</Label>
          <div className="mt-3 space-y-2">
            {selectedPayload.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <span className="min-w-0 truncate text-sm font-black text-slate-950">{item.name}</span>
                <span className="shrink-0 text-sm font-black text-orange-700">x{item.quantity}</span>
              </div>
            ))}
          </div>
          {setSelected ? (
            <Button type="button" variant="outline" className="mt-3 h-10 rounded-xl bg-white text-xs font-black" onClick={() => setSelected({})}>
              Clear selected items
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Or write your order manually</Label>
        <textarea
          className="min-h-32 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-semibold outline-none transition-all focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 placeholder:text-slate-400"
          placeholder="Example: 2 plate chowmein, 1 veg momo, 1 cold coffee..."
          {...form.register("customOrderText")}
        />
        <FieldError message={form.formState.errors.customOrderText?.message} />
      </div>

      <div className="mt-8 space-y-2">
         <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Order Type</Label>
         <div className="grid gap-3 sm:grid-cols-2">
          <label className={cn("flex cursor-pointer items-center justify-between rounded-2xl border p-4 text-sm font-black transition-all", orderType === "delivery" ? "border-orange-300 bg-orange-50 text-orange-800" : "border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed")}>
            <div className="flex items-center gap-3">
              <input type="radio" value="delivery" className="h-4 w-4 accent-orange-600" {...form.register("orderType")} disabled={!shop.delivery_available} />
              Delivery
            </div>
            {!shop.delivery_available && <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">N/A</span>}
          </label>
          <label className={cn("flex cursor-pointer items-center justify-between rounded-2xl border p-4 text-sm font-black transition-all", orderType === "pickup" ? "border-orange-300 bg-orange-50 text-orange-800" : "border-slate-100 bg-slate-50/50")}>
            <div className="flex items-center gap-3">
              <input type="radio" value="pickup" className="h-4 w-4 accent-orange-600" {...form.register("orderType")} disabled={!shop.pickup_available} />
              Pickup
            </div>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Your name</Label>
          <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="Ravi Kumar" {...form.register("customerName")} />
          <FieldError message={form.formState.errors.customerName?.message} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone number</Label>
          <Input type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(form.formState.errors.customerPhone)} className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="98765 43210" {...form.register("customerPhone")} />
          <FieldError message={form.formState.errors.customerPhone?.message} />
        </div>
      </div>
      {orderType === "delivery" ? (
        <div className="mt-5 space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery address</Label>
          <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors" placeholder="House no, street, landmark" {...form.register("address")} />
          <FieldError message={form.formState.errors.address?.message} />
        </div>
      ) : null}
      <div className="mt-5 space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Special Note</Label>
        <textarea className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-semibold outline-none focus:border-orange-300 focus:bg-white transition-all" placeholder="Spice level, pickup time, etc." {...form.register("note")} />
      </div>
      
      {warning && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800 border border-amber-100">{warning}</div>}
      
      <div className="mt-8">
        <Button disabled={form.formState.isSubmitting} className="h-14 w-full rounded-2xl bg-[#16A34A] text-lg font-black text-white shadow-xl shadow-emerald-950/20 hover:bg-[#15803D] hover:scale-[1.02] transition-all">
          <MessageCircle className="h-6 w-6" />
          {form.formState.isSubmitting ? "Connecting..." : "Send Order on WhatsApp"}
        </Button>
      </div>
    </form>
  );
}
