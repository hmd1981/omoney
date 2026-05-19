/** Official OMoney WhatsApp Business message link (used site-wide). */

import type { Locale } from './i18n';

const DEFAULT_WHATSAPP_MESSAGE_URL = 'https://wa.me/message/3IRFY6VEC7GCG1';

export type WhatsAppLocale = Locale;

export function getWhatsAppHref(_locale: WhatsAppLocale = 'fa', _customMessage?: string): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE_URL ??
    process.env.PUBLIC_WHATSAPP_MESSAGE_URL ??
    DEFAULT_WHATSAPP_MESSAGE_URL
  );
}
