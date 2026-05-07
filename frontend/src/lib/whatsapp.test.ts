import { describe, expect, it } from "vitest";
import { generateWhatsAppLink } from "./whatsapp";

describe("generateWhatsAppLink", () => {
  it("removes plus signs, spaces and hyphens from phone numbers", () => {
    const link = generateWhatsAppLink("+91 98765-43210", "Hello");

    expect(link).toBe("https://wa.me/919876543210?text=Hello");
  });

  it("removes brackets and other formatting from phone numbers", () => {
    const link = generateWhatsAppLink("+91 (98765) 432-10", "Hello");

    expect(link).toBe("https://wa.me/919876543210?text=Hello");
  });

  it("encodes multiline WhatsApp messages", () => {
    const link = generateWhatsAppLink("91 99999 88888", "Name: Ravi\nService: Haircut & shave");

    expect(link).toBe(
      "https://wa.me/919999988888?text=Name%3A%20Ravi%0AService%3A%20Haircut%20%26%20shave",
    );
  });
});
