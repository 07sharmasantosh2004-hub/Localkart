export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function businessSlug(name: string, area?: string) {
  return slugify([name, area].filter(Boolean).join(" ")) || `shop-${Date.now()}`;
}
