import { Link } from "react-router-dom";
import { Mail, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { customerFaqs } from "../lib/mockData";
import { FAQAccordion, SEOHead, SectionHeader } from "../components/marketplace";
import { Button } from "../components/ui/button";

const pageCopy = {
  about: {
    title: "About LocalKart",
    description: "LocalKart helps customers discover nearby salons and kirana shops, then connect directly on WhatsApp.",
    body: [
      "LocalKart is built for the way Indian neighbourhoods already work. A customer wants a haircut or monthly ration, the local shopkeeper knows the area, and WhatsApp is where confirmation naturally happens.",
      "We do not add a payment layer or commission checkout in the MVP. Customers send clear details, and the shopkeeper confirms timing, availability, delivery and payment directly on WhatsApp.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description: "How LocalKart handles customer, shop and WhatsApp lead information.",
    body: [
      "LocalKart stores only the information needed to help customers contact nearby shops and help shopkeepers manage their listing and leads.",
      "WhatsApp lead details are saved before redirect so shopkeepers and admins can see lead history. Online payments are not collected in this MVP.",
    ],
  },
  terms: {
    title: "Terms and Conditions",
    description: "Terms for customers, salon owners and kirana shopkeepers using LocalKart.",
    body: [
      "LocalKart is a discovery and WhatsApp lead platform. The final booking, order confirmation, delivery, service quality and payment are handled between the customer and shopkeeper.",
      "Delivery depends on shop availability, area, timing and manual confirmation. We do not promise instant delivery or guaranteed lowest prices.",
    ],
  },
};

export function AboutPage() {
  return <TextPage {...pageCopy.about} />;
}

export function PrivacyPolicyPage() {
  return <TextPage {...pageCopy.privacy} />;
}

export function TermsPage() {
  return <TextPage {...pageCopy.terms} />;
}

export function ContactPage() {
  return (
    <>
      <SEOHead config={{ title: "Contact LocalKart | Help for Customers and Shopkeepers", description: "Contact LocalKart for shop listing, customer support and local marketplace questions." }} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <SectionHeader eyebrow="Contact" title="Need help with LocalKart?" text="Customer ho ya shopkeeper, simple message bhejiye. We keep support practical and WhatsApp-friendly." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <MessageCircle className="h-8 w-8 text-emerald-700" />
            <h2 className="mt-4 text-xl font-black text-slate-950">WhatsApp support</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">For urgent shop listing or lead issues, WhatsApp support is fastest.</p>
            <Button asChild className="mt-5 rounded-2xl bg-emerald-700 font-black">
              <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer">Message LocalKart</a>
            </Button>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <Mail className="h-8 w-8 text-amber-700" />
            <h2 className="mt-4 text-xl font-black text-slate-950">Email</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">For partnership, admin approval, or feedback: hello@localkart.example</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function FAQPage() {
  return (
    <>
      <SEOHead
        config={{
          title: "LocalKart FAQ | WhatsApp Salon Booking and Kirana Ordering",
          description: "Common questions about LocalKart, WhatsApp booking, kirana ordering, delivery confirmation and free shop listings.",
          jsonLd: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: customerFaqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <SectionHeader eyebrow="FAQ" title="Questions customers and shopkeepers ask" text="LocalKart keeps the flow simple: discover nearby shop, fill details, send on WhatsApp, and wait for shopkeeper confirmation." />
        <FAQAccordion items={customerFaqs} />
      </div>
    </>
  );
}

function TextPage({ title, description, body }: { title: string; description: string; body: string[] }) {
  return (
    <>
      <SEOHead config={{ title: `${title} | LocalKart`, description }} />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              {title.includes("Privacy") ? <ShieldCheck className="h-6 w-6" /> : <Store className="h-6 w-6" />}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">LocalKart</p>
              <h1 className="text-3xl font-black text-slate-950">{title}</h1>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-base leading-8 text-slate-700">
            {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <Button asChild variant="outline" className="mt-6 rounded-2xl font-black">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
