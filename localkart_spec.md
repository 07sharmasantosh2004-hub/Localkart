# LocalKart - Product Specification

## 1. Feature List by Role

### Customer
- **Discovery**: Location-based discovery of nearby Salons and Kirana shops.
- **Salons**: View salon profiles, services, prices, timings, and book appointments.
- **Kirana**: Browse shop inventory, add products to cart, and place home delivery orders.
- **Account**: Manage profile, view active and past bookings/orders, manage saved addresses.

### Salon Owner
- **Shop Management**: Create and update salon profile.
- **Service Management**: Add/edit/delete services with duration and pricing.
- **Booking Management**: Accept/decline appointments, view calendar.

### Kirana Shop Owner
- **Shop Management**: Create and update shop profile, delivery radius.
- **Inventory**: Add/update products, categories, prices, and stock availability.
- **Order Management**: Accept/decline incoming orders, assign delivery.

### Admin
- **User Management**: Approve/reject shop onboarding requests.
- **Catalog/Category**: Manage global categories for salons and Kirana.
- **Platform Management**: Manage CMS pages, banners and promotions.

---

## 2. Screens and UI Layout Details

### Mobile-First PWA Routes
- `/` - **Customer Home**
- `/salons` - **Salon Listing**
- `/salons/:slug` - **Salon Details**
- `/book/:salonId/:serviceId` - **Booking Flow**
- `/kirana` - **Kirana Listing**
- `/kirana/:slug` - **Kirana Details**
- `/cart` - **Cart & Checkout**
- `/orders` & `/bookings` - **History**
- `/profile` - **User Profile**
- `/partner` - **Partner Landing**
- `/partner/salon` & `/partner/kirana` - **Partner Dashboards**
- `/admin` - **Admin Panel**

---

## 3. Design System (Tailwind + shadcn/ui)
- **Primary**: `hsl(262, 83%, 58%)` (Vibrant Purple)
- **Secondary**: `hsl(316, 73%, 52%)` (Magenta)
- **Background**: `hsl(0, 0%, 98%)` (Light Gray)
- **Font**: 'Inter', sans-serif

---

## 4. MVP vs. Later Scope
**MVP Scope**: Browsing, ordering/booking, partner dashboards, basic admin, COD.
**Later Scope**: Online payments, live tracking, in-app chat.
