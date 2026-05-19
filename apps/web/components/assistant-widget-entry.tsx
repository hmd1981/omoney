'use client';

import dynamic from 'next/dynamic';
import { Locale } from '../lib/i18n';

const AssistantWidget = dynamic(
  () => import('./assistant-widget').then((module) => module.AssistantWidget),
  {
    ssr: false,
    loading: () => null
  }
);

export function AssistantWidgetEntry({ locale }: { locale: Locale }) {
  return <AssistantWidget locale={locale} />;
}
