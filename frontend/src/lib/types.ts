export interface Business {
  id: string;
  name: string;
  slug: string;
  type: BusinessType;
  area: string;
  city: string;
  address: string;
  whatsapp: string;
  phone: string;
  distance_meters: number;
  rating: number;
  cover_image: string;
  is_open: boolean;
  delivery_available?: boolean;
  pickup_available?: boolean;
  min_order?: number;
  description?: string;
  category?: string;
  popular_items?: string[];
}

export type BusinessType = 'salon' | 'kirana' | 'food';

export interface AdUnit {
  id: string;
  slot: string;
  title: string;
  description: string;
  is_active: boolean;
}

export interface SalonService {
  id: string;
  name: string;
  price: number;
  duration: string;
  category: string;
}

export interface KiranaProduct {
  id: string;
  name: string;
  unit: string;
  priceHint: string;
  category: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface FoodMenuItem {
  id: string;
  business_id?: string;
  category_id?: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  is_veg: boolean;
  is_available: boolean;
  sort_order?: number;
  category: string;
}

export interface SelectedFoodItem extends FoodMenuItem {
  quantity: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
