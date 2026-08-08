'use client';

import { useEffect } from 'react';
import { Locale, localeHtmlLang } from '../lib/i18n';
import { content } from '../lib/content';

export function LocaleDocumentAttributes({ locale }: { locale: Locale }) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = localeHtmlLang[locale];
    html.dir = content[locale].dir;
  }, [locale]);

  return null;
}
