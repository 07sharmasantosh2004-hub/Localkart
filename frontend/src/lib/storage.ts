import { supabase } from "./supabase";

export type ImageBucket = "avatars" | "business-photos" | "product-images" | "food-images" | "banners" | "page-assets";

export async function uploadPublicImage(bucket: ImageBucket, path: string, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed.");
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
