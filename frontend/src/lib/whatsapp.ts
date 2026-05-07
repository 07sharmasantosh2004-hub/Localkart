export function generateWhatsAppLink(phoneNumber: string, message: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
