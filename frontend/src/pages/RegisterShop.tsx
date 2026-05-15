import { CheckCircle2, MessageCircle, ShieldCheck, Store, Zap, Target, Users } from "lucide-react";
import { DynamicAdSlot, SEOHead, SectionHeader } from "../components/marketplace";
import { ShopRegistrationForm } from "../components/forms/ShopRegistrationForm";
import { Button } from "../components/ui/button";

export default function RegisterShop() {
  return (
    <>
      <SEOHead
        config={{
          title: "Register Your Tiffin Service or Local Shop Free | Get Customers on WhatsApp",
          description:
            "List your tiffin service, cloud kitchen, kirana shop or food business for free and receive local customer orders directly on WhatsApp without commission.",
          keywords:
            "free shop listing, register tiffin service online, register kirana shop online, local business listing, get customers on WhatsApp, small business promotion, free local marketplace",
        }}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-3 py-6 sm:px-4 sm:py-10 md:space-y-16 md:py-20">
        <section className="mobile-safe-card relative overflow-hidden bg-[#064E3B] text-white shadow-2xl shadow-emerald-950/20">
          <div className="relative z-10 max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-100 backdrop-blur-sm">
              Grow your local business
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
              Register Your Shop for Free
            </h1>
            <p className="text-lg leading-8 text-emerald-50/80 sm:text-xl">
              Get local customers directly on WhatsApp. No commission, no complicated app, no technical setup. Just pure business growth.
            </p>
            <div className="grid gap-4 pt-4 sm:flex sm:flex-wrap sm:gap-6">
               {[
                 { label: "Free Forever", icon: Zap },
                 { label: "Direct Leads", icon: Target },
                 { label: "Local Visibility", icon: Users },
               ].map((item) => (
                 <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-100 backdrop-blur-md">
                       <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-emerald-50">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 p-8 opacity-10">
             <Store className="h-64 w-64" />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Direct WhatsApp Leads", desc: "Customers talk to you directly. No middlemen." },
            { title: "Zero Commission", desc: "You keep 100% of what you earn from customers." },
            { title: "Human Relationship", desc: "Build trust with neighborhood families directly." },
          ].map((benefit) => (
            <div key={benefit.title} className="group flex flex-col gap-4 rounded-[1.75rem] border border-slate-100 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 sm:rounded-[2.5rem] sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-950">{benefit.title}</h3>
                <p className="mt-2 text-base leading-7 text-slate-500">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-10">
            <div>
               <SectionHeader
                eyebrow="Simple Process"
                title="List your shop in 2 minutes"
                text="Customers nearby can find your listing after approval and send enquiries or orders directly to your WhatsApp number."
              />
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[2rem] border border-emerald-100 bg-emerald-50/50 p-5 min-[420px]:flex-row min-[420px]:gap-6 sm:p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                   <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">WhatsApp-first leads</h3>
                  <p className="mt-2 text-base leading-7 text-slate-600">
                    You receive full customer details on WhatsApp and confirm manually. Keep your business personal.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-[2rem] border border-amber-100 bg-amber-50/50 p-5 min-[420px]:flex-row min-[420px]:gap-6 sm:p-8">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                   <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">No forced payment setup</h3>
                  <p className="mt-2 text-base leading-7 text-slate-600">
                    Payments, delivery and timing stay between you and your customer. We don't interfere in your business logic.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-5 text-white sm:p-8">
               <h4 className="text-xl font-black mb-4">Need help registering?</h4>
               <p className="text-slate-400 mb-6">Talk to our merchant support team if you face any issues while listing your shop.</p>
               <Button asChild variant="outline" className="h-12 w-full rounded-xl border-white/20 bg-white/5 font-black text-white hover:bg-white/10">
                  <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer">
                     Support on WhatsApp
                  </a>
               </Button>
            </div>
          </div>
          
          <div className="lg:sticky lg:top-28">
            <ShopRegistrationForm />
          </div>
        </section>

        <DynamicAdSlot slot="registration_page_bottom" />
      </div>
    </>
  );
}
