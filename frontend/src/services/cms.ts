import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { FAQItem } from "../lib/types";

export function useFaqs(page?: string) {
  return useQuery({
    queryKey: ["faqs", page],
    queryFn: async (): Promise<FAQItem[]> => {
      if (!isSupabaseConfigured) return [];

      let query = supabase
        .from("faqs")
        .select("question, answer")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (page) query = query.or(`page.eq.${page},category.eq.${page}`);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: ["page", slug],
    queryFn: async () => {
      if (!isSupabaseConfigured) return null;
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
