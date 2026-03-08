/**
 * Utilitário central para links do WhatsApp.
 * Alterar número e mensagem aqui reflete em todo o site.
 */

const WHATSAPP_NUMBER = "5511967878378";
const DEFAULT_MESSAGE =
  "Oi Sabrina! Vim pelo site e queria mais informações sobre seus serviços.";

/**
 * Gera o link do WhatsApp com mensagem opcional.
 * A mensagem é codificada para URL.
 */
export function getWhatsAppLink(message?: string): string {
  const text = message?.trim() || DEFAULT_MESSAGE;
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

/**
 * Abre o WhatsApp na mesma aba (ou nova, em mobile costuma abrir o app).
 */
export function openWhatsApp(message?: string): void {
  if (typeof window === "undefined") return;
  window.open(getWhatsAppLink(message), "_blank", "noopener,noreferrer");
}

export const whatsAppNumber = WHATSAPP_NUMBER;
export const whatsAppDisplay = "(11) 96787-8378";
