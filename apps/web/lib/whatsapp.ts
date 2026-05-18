/** Official OMoney WhatsApp Business message link (used site-wide). */

const DEFAULT_WHATSAPP_MESSAGE_URL = 'https://wa.me/message/3IRFY6VEC7GCG1';

export type WhatsAppLocale = 'fa' | 'en';

export function getWhatsAppHref(_locale: WhatsAppLocale = 'fa', _customMessage?: string): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE_URL ??
    process.env.PUBLIC_WHATSAPP_MESSAGE_URL ??
    DEFAULT_WHATSAPP_MESSAGE_URL
  );
}
