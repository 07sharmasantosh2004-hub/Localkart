import type { AdUnit, Business, FAQItem, FoodCategory, FoodMenuItem, KiranaProduct, MealPlan } from "./types";

export const tiffinProviders: Business[] = [
  {
    id: "tiffin-1",
    name: "Ghar Ka Dabba",
    slug: "ghar-ka-dabba",
    type: "tiffin",
    area: "Lajpat Nagar",
    city: "New Delhi",
    address: "Near Central Market, Lajpat Nagar, New Delhi",
    whatsapp: "+91 98765 43210",
    phone: "+91 98765 43210",
    distance_meters: 850,
    rating: 4.8,
    cover_image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    pickup_available: true,
    min_order: 99,
    category: "North Indian Tiffin",
    popular_items: ["Monthly lunch plan", "Trial thali", "Full day meals"],
    meal_types: ["Lunch", "Dinner", "Full day"],
    cuisines: ["North Indian", "Homemade"],
    veg_available: true,
    non_veg_available: false,
    monthly_plan_available: true,
    trial_meal_available: true,
    description:
      "Home-style veg tiffin with roti, sabzi, dal, rice and monthly subscription plans for students and working professionals.",
  },
  {
    id: "tiffin-2",
    name: "Maa Annapurna Meals",
    slug: "maa-annapurna-meals",
    type: "tiffin",
    area: "Andheri East",
    city: "Mumbai",
    address: "Marol Pipeline Road, Andheri East, Mumbai",
    whatsapp: "+91 99887 76655",
    phone: "+91 99887 76655",
    distance_meters: 1400,
    rating: 4.6,
    cover_image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    pickup_available: false,
    min_order: 120,
    category: "Home Food Provider",
    popular_items: ["Weekly dinner plan", "Breakfast boxes", "Non-veg Sunday meal"],
    meal_types: ["Breakfast", "Lunch", "Dinner"],
    cuisines: ["Maharashtrian", "North Indian"],
    veg_available: true,
    non_veg_available: true,
    monthly_plan_available: true,
    trial_meal_available: true,
    description:
      "Fresh homemade meals with daily, weekly and monthly plans. Delivery timing and menu are confirmed directly on WhatsApp.",
  },
  {
    id: "tiffin-3",
    name: "Healthy Bowl Tiffins",
    slug: "healthy-bowl-tiffins",
    type: "tiffin",
    area: "Kothrud",
    city: "Pune",
    address: "Karve Road, Kothrud, Pune",
    whatsapp: "+91 91234 56780",
    phone: "+91 91234 56780",
    distance_meters: 2600,
    rating: 4.7,
    cover_image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    pickup_available: true,
    min_order: 149,
    category: "Healthy Tiffin",
    popular_items: ["Diet lunch", "Protein dinner", "Trial meal"],
    meal_types: ["Lunch", "Dinner"],
    cuisines: ["Healthy", "Indian"],
    veg_available: true,
    non_veg_available: true,
    monthly_plan_available: true,
    trial_meal_available: true,
    description:
      "Balanced home food and cloud kitchen meals with veg and non-veg options for office lunch and dinner subscriptions.",
  },
];

export const salons = tiffinProviders;

export const kiranaStores: Business[] = [
  {
    id: "kirana-1",
    name: "Sharma Daily Needs",
    slug: "sharma-daily-needs",
    type: "kirana",
    area: "Indiranagar",
    city: "Bengaluru",
    address: "CMH Road, Indiranagar, Bengaluru",
    whatsapp: "+91 90909 12345",
    phone: "+91 90909 12345",
    distance_meters: 500,
    rating: 4.9,
    cover_image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    min_order: 199,
    description:
      "Trusted daily grocery shop for atta, dal, rice, oil, milk, snacks and household items.",
  },
  {
    id: "kirana-2",
    name: "Sai Kirana Mart",
    slug: "sai-kirana-mart",
    type: "kirana",
    area: "Koramangala",
    city: "Bengaluru",
    address: "Near BDA Complex, Koramangala, Bengaluru",
    whatsapp: "+91 94444 55555",
    phone: "+91 94444 55555",
    distance_meters: 1200,
    rating: 4.5,
    cover_image:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    min_order: 249,
    description:
      "Local dukandaar for monthly ration, packaged food, personal care and home essentials.",
  },
  {
    id: "kirana-3",
    name: "Fresh Basket Provision Store",
    slug: "fresh-basket-provision-store",
    type: "kirana",
    area: "HSR Layout",
    city: "Bengaluru",
    address: "27th Main, HSR Layout, Bengaluru",
    whatsapp: "+91 93333 22222",
    phone: "+91 93333 22222",
    distance_meters: 3100,
    rating: 4.4,
    cover_image:
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=80",
    is_open: false,
    delivery_available: false,
    description:
      "Neighbourhood grocery and provision store with phone and WhatsApp order support.",
  },
];

export const foodShops: Business[] = [
  {
    id: "food-1",
    name: "Cafe Chai Adda",
    slug: "cafe-chai-adda",
    type: "food",
    area: "Indiranagar",
    city: "Bengaluru",
    address: "12th Main Road, Indiranagar, Bengaluru",
    whatsapp: "+91 90000 11111",
    phone: "+91 90000 11111",
    distance_meters: 650,
    rating: 4.8,
    cover_image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    pickup_available: true,
    category: "Cafe",
    popular_items: ["Cold coffee", "Masala chai", "Cheese sandwich"],
    description:
      "Neighbourhood cafe for chai, coffee, sandwiches and evening snacks with direct WhatsApp ordering.",
  },
  {
    id: "food-2",
    name: "Dragon Wok Chinese Corner",
    slug: "dragon-wok-chinese-corner",
    type: "food",
    area: "Koramangala",
    city: "Bengaluru",
    address: "5th Block, Koramangala, Bengaluru",
    whatsapp: "+91 90000 22222",
    phone: "+91 90000 22222",
    distance_meters: 1200,
    rating: 4.6,
    cover_image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1200&q=80",
    is_open: true,
    delivery_available: true,
    pickup_available: true,
    category: "Chinese Food",
    popular_items: ["Veg chowmein", "Fried rice", "Manchurian"],
    description:
      "Local Chinese corner for noodles, fried rice and quick fast food orders on WhatsApp.",
  },
  {
    id: "food-3",
    name: "Momo Street Point",
    slug: "momo-street-point",
    type: "food",
    area: "HSR Layout",
    city: "Bengaluru",
    address: "27th Main, HSR Layout, Bengaluru",
    whatsapp: "+91 90000 33333",
    phone: "+91 90000 33333",
    distance_meters: 2400,
    rating: 4.5,
    cover_image:
      "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=1200&q=80",
    is_open: false,
    delivery_available: false,
    pickup_available: true,
    category: "Momos",
    popular_items: ["Veg momos", "Paneer momos", "Spicy chutney"],
    description:
      "Small momo counter for steamed momos, fried momos and snack boxes. Pickup depends on availability.",
  },
];

export const foodCategories: FoodCategory[] = [
  { id: "cafe", name: "Cafe", slug: "cafe", icon: "coffee" },
  { id: "chinese-food", name: "Chinese Food", slug: "chinese-food", icon: "utensils" },
  { id: "fast-food", name: "Fast Food", slug: "fast-food", icon: "burger" },
  { id: "tea-snacks", name: "Tea & Snacks", slug: "tea-snacks", icon: "cup-soda" },
  { id: "bakery", name: "Bakery", slug: "bakery", icon: "cake-slice" },
  { id: "juice-shake", name: "Juice & Shake", slug: "juice-shake", icon: "glass-water" },
  { id: "momos", name: "Momos", slug: "momos", icon: "circle-dot" },
  { id: "street-food", name: "Street Food", slug: "street-food", icon: "store" },
  { id: "sweets", name: "Sweets", slug: "sweets", icon: "candy" },
  { id: "south-indian", name: "South Indian", slug: "south-indian", icon: "utensils" },
  { id: "north-indian", name: "North Indian", slug: "north-indian", icon: "utensils" },
  { id: "rolls-sandwiches", name: "Rolls & Sandwiches", slug: "rolls-sandwiches", icon: "sandwich" },
  { id: "pizza-burger", name: "Pizza & Burger", slug: "pizza-burger", icon: "pizza" },
  { id: "local-food", name: "Local Food", slug: "local-food", icon: "map-pin" },
];

export const foodMenuItems: FoodMenuItem[] = [
  {
    id: "cold-coffee",
    category: "Cafe",
    name: "Cold Coffee",
    description: "Cafe-style chilled coffee.",
    price: 89,
    is_veg: true,
    is_available: true,
  },
  {
    id: "masala-chai",
    category: "Tea & Snacks",
    name: "Masala Chai",
    description: "Fresh local chai.",
    price: 20,
    is_veg: true,
    is_available: true,
  },
  {
    id: "veg-chowmein",
    category: "Chinese Food",
    name: "Veg Chowmein",
    description: "Street-style noodles with vegetables.",
    price: 120,
    is_veg: true,
    is_available: true,
  },
  {
    id: "fried-rice",
    category: "Chinese Food",
    name: "Veg Fried Rice",
    description: "Quick Chinese rice plate.",
    price: 130,
    is_veg: true,
    is_available: true,
  },
  {
    id: "veg-momos",
    category: "Momos",
    name: "Veg Momos",
    description: "Steamed momos with spicy chutney.",
    price: 80,
    is_veg: true,
    is_available: true,
  },
  {
    id: "paneer-momos",
    category: "Momos",
    name: "Paneer Momos",
    description: "Soft paneer momos.",
    price: 100,
    is_veg: true,
    is_available: true,
  },
  {
    id: "cheese-sandwich",
    category: "Rolls & Sandwiches",
    name: "Cheese Sandwich",
    description: "Grilled sandwich for a quick bite.",
    price: 99,
    is_veg: true,
    is_available: true,
  },
  {
    id: "burger",
    category: "Pizza & Burger",
    name: "Veg Burger",
    description: "Simple fast food burger.",
    price: 90,
    is_veg: true,
    is_available: true,
  },
];

export const mealPlans: MealPlan[] = [
  {
    id: "trial-veg-thali",
    name: "Trial Veg Thali",
    price: 99,
    duration: "One meal",
    category: "Trial Meal",
    description: "Roti, dal, sabzi, rice and salad. Good for first-time tasting.",
    is_veg: true,
    includes: ["Lunch", "Veg", "Trial"],
  },
  {
    id: "daily-lunch",
    name: "Daily Lunch Plan",
    price: 120,
    duration: "Per meal",
    category: "Daily Meal",
    description: "Fresh lunch delivered on working days. Menu changes daily.",
    is_veg: true,
    includes: ["Lunch", "Delivery", "Daily"],
  },
  {
    id: "dinner-plan",
    name: "Dinner Tiffin",
    price: 130,
    duration: "Per meal",
    category: "Daily Meal",
    description: "Evening tiffin with roti, sabzi, dal and rice.",
    is_veg: true,
    includes: ["Dinner", "Veg"],
  },
  {
    id: "full-day",
    name: "Full Day Meals",
    price: 249,
    duration: "Breakfast + lunch + dinner",
    category: "Full Day",
    description: "Complete meal support for students and professionals.",
    is_veg: true,
    includes: ["Breakfast", "Lunch", "Dinner"],
  },
  {
    id: "monthly-subscription",
    name: "Monthly Subscription",
    price: 3200,
    duration: "Monthly",
    category: "Monthly Plan",
    description: "Regular lunch or dinner subscription. Final menu and holidays confirmed by provider.",
    is_veg: true,
    includes: ["Monthly", "Delivery"],
  },
  {
    id: "non-veg-special",
    name: "Non-veg Special Meal",
    price: 180,
    duration: "Per meal",
    category: "Non-veg",
    description: "Chicken or egg meal based on provider availability.",
    is_veg: false,
    includes: ["Lunch", "Dinner", "Non-veg"],
  },
];

export const salonServices = mealPlans;

export const kiranaProducts: KiranaProduct[] = [
  { id: "atta", name: "Atta", unit: "5 kg", priceHint: "Ask shop", category: "Atta" },
  { id: "rice", name: "Rice", unit: "5 kg", priceHint: "Ask shop", category: "Rice" },
  { id: "dal", name: "Dal", unit: "1 kg", priceHint: "Ask shop", category: "Dal" },
  { id: "oil", name: "Cooking Oil", unit: "1 L", priceHint: "Ask shop", category: "Oil" },
  { id: "milk", name: "Milk", unit: "1 L", priceHint: "Ask shop", category: "Milk" },
  { id: "tea", name: "Tea", unit: "250 g", priceHint: "Ask shop", category: "Snacks" },
  { id: "soap", name: "Bath Soap", unit: "4 pcs", priceHint: "Ask shop", category: "Personal care" },
  { id: "cleaner", name: "Floor Cleaner", unit: "1 L", priceHint: "Ask shop", category: "Household items" },
];

export const customerFaqs: FAQItem[] = [
  {
    question: "Is this app free?",
    answer:
      "Yes. Customers can discover nearby tiffin services, home food providers, cloud kitchens and kirana shops without paying any platform fee.",
  },
  {
    question: "Do I need to pay extra delivery charges?",
    answer:
      "The platform does not add extra app charges. Delivery charges, if any, are decided by the shopkeeper and confirmed on WhatsApp.",
  },
  {
    question: "How do I order or enquire for tiffin service?",
    answer:
      "Choose a nearby tiffin provider, select meal preference and plan type, then send your enquiry directly on WhatsApp.",
  },
  {
    question: "How do I order from kirana shops?",
    answer:
      "Open a nearby kirana shop, select products or write your grocery list, add your address, and send it on WhatsApp.",
  },
  {
    question: "Who confirms the order?",
    answer:
      "The shopkeeper confirms availability, timing, delivery and any charges directly with you on WhatsApp.",
  },
  {
    question: "Can shopkeepers register for free?",
    answer:
      "Yes. Tiffin providers, cloud kitchens, home food businesses, kirana stores and local food shops can submit their listing for free.",
  },
  {
    question: "Does the app collect payment?",
    answer:
      "No online payment is collected in the MVP. Payment is handled directly between customer and shopkeeper.",
  },
  {
    question: "Can I order from cafes on WhatsApp?",
    answer:
      "Yes. Add menu items or write your food order and send it directly to the shopkeeper's WhatsApp. The shopkeeper confirms availability, total amount and timing.",
  },
  {
    question: "Can I choose pickup instead of delivery?",
    answer:
      "Yes. Delivery or pickup depends on shop availability. The shopkeeper will confirm the final option on WhatsApp.",
  },
  {
    question: "Is home delivery available everywhere?",
    answer:
      "Delivery depends on shop availability, distance and timing. The shopkeeper will confirm on WhatsApp.",
  },
];

export const adUnits: AdUnit[] = [
  {
    id: "ad-1",
    slot: "home_after_categories",
    title: "Featured local shops will appear here",
    description: "Development ad placeholder controlled from admin.",
    is_active: true,
  },
  {
    id: "ad-2",
    slot: "tiffin_detail_bottom",
    title: "Tiffin service featured placement",
    description: "Future promoted listing slot for tiffin providers, no real ad ID hardcoded.",
    is_active: true,
  },
  {
    id: "ad-3",
    slot: "kirana_detail_bottom",
    title: "Kirana featured placement",
    description: "Future promoted listing slot, no real ad ID hardcoded.",
    is_active: true,
  },
  {
    id: "ad-4",
    slot: "food_home_section",
    title: "Featured food shops will appear here",
    description: "Local cafe, momo, bakery and snack shop promotions can run from admin.",
    is_active: true,
  },
  {
    id: "ad-5",
    slot: "food_list_after_5_cards",
    title: "Food list featured placement",
    description: "Future promoted listing slot for food shops.",
    is_active: true,
  },
  {
    id: "ad-6",
    slot: "food_detail_bottom",
    title: "Food shop detail placement",
    description: "Future promoted listing slot, no real ad ID hardcoded.",
    is_active: true,
  },
  {
    id: "ad-7",
    slot: "food_order_form_bottom",
    title: "Food order form placement",
    description: "Admin-controlled ad slot below direct WhatsApp ordering.",
    is_active: true,
  },
];
