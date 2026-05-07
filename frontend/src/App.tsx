import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from "./components/ProtectedRoute";
import { SkeletonCard } from "./components/feedback";

const RootLayout = lazy(() => import("./layouts/RootLayout"));
const Home = lazy(() => import("./pages/Home"));
const Salons = lazy(() => import("./pages/Salons"));
const SalonDetail = lazy(() => import("./pages/SalonDetail"));
const Kirana = lazy(() => import("./pages/Kirana"));
const KiranaDetail = lazy(() => import("./pages/KiranaDetail"));
const Food = lazy(() => import("./pages/Food"));
const FoodDetail = lazy(() => import("./pages/FoodDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const RegisterShop = lazy(() => import("./pages/RegisterShop"));
const CityLanding = lazy(() => import("./pages/CityLanding"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLayout = lazy(() => import("./components/marketplace").then((module) => ({ default: module.AdminLayout })));
const AboutPage = lazy(() => import("./pages/StaticPages").then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("./pages/StaticPages").then((module) => ({ default: module.ContactPage })));
const FAQPage = lazy(() => import("./pages/StaticPages").then((module) => ({ default: module.FAQPage })));
const PrivacyPolicyPage = lazy(() => import("./pages/StaticPages").then((module) => ({ default: module.PrivacyPolicyPage })));
const TermsPage = lazy(() => import("./pages/StaticPages").then((module) => ({ default: module.TermsPage })));
const PartnerPages = () => import("./pages/partner/PartnerPages");
const PartnerLayout = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerLayout })));
const PartnerDashboard = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerDashboard })));
const PartnerOnboarding = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerOnboarding })));
const PartnerProfile = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerProfile })));
const PartnerBusinessPage = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerBusinessPage })));
const PartnerServicesPage = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerServicesPage })));
const PartnerProductsPage = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerProductsPage })));
const FoodOwnerDashboard = lazy(() => PartnerPages().then((module) => ({ default: module.FoodOwnerDashboard })));
const FoodMenuManager = lazy(() => PartnerPages().then((module) => ({ default: module.FoodMenuManager })));
const PartnerTimingsPage = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerTimingsPage })));
const PartnerLeadsPage = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerLeadsPage })));
const PartnerReviewsPage = lazy(() => PartnerPages().then((module) => ({ default: module.PartnerReviewsPage })));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="mx-auto max-w-7xl p-4"><SkeletonCard /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin-login" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path=":section" element={<AdminPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/partner" element={<PartnerLayout />}>
              <Route index element={<PartnerDashboard />} />
              <Route path="onboarding" element={<PartnerOnboarding />} />
              <Route path="profile" element={<PartnerProfile />} />
              <Route path="business" element={<PartnerBusinessPage />} />
              <Route path="salon/services" element={<PartnerServicesPage />} />
              <Route path="kirana/products" element={<PartnerProductsPage />} />
              <Route path="food" element={<FoodOwnerDashboard />} />
              <Route path="food/menu" element={<FoodMenuManager />} />
              <Route path="food/leads" element={<PartnerLeadsPage />} />
              <Route path="food/settings" element={<PartnerBusinessPage />} />
              <Route path="timings" element={<PartnerTimingsPage />} />
              <Route path="leads" element={<PartnerLeadsPage />} />
              <Route path="reviews" element={<PartnerReviewsPage />} />
            </Route>
          </Route>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="salons" element={<Salons />} />
            <Route path="salons/:slug" element={<SalonDetail />} />
            <Route path="kirana" element={<Kirana />} />
            <Route path="kirana/:slug" element={<KiranaDetail />} />
            <Route path="food" element={<Food />} />
            <Route path="food/:slug" element={<FoodDetail />} />
            <Route path="register-shop" element={<RegisterShop />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="salon-booking/:city" element={<CityLanding type="salon" />} />
            <Route path="salon-booking/:city/:area" element={<CityLanding type="salon" />} />
            <Route path="kirana-delivery/:city" element={<CityLanding type="kirana" />} />
            <Route path="kirana-delivery/:city/:area" element={<CityLanding type="kirana" />} />
            <Route path="food-delivery/:city" element={<CityLanding type="food" />} />
            <Route path="food-delivery/:city/:area" element={<CityLanding type="food" />} />
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="favorites" element={<Favorites />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
