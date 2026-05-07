import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { generateWhatsAppLink } from "./whatsapp"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) return `${distanceMeters} m`
  return `${(distanceMeters / 1000).toFixed(1)} km`
}

export function titleCase(value: string | undefined) {
  if (!value) return ""
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
