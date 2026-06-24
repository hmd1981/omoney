import Link from 'next/link';
import { Clock, FileCheck2, Headset } from 'lucide-react';
import {
  type GuideSlug,
  corridorGuides,
  guideSlugs
} from '../lib/corridor-guides';
import type { Locale } from '../lib/i18n';
import { getWhatsAppHref } from '../lib/whatsapp';

export function CorridorGuideContent({ locale, slug }: { locale: Locale; slug: GuideSlug }) {
  const guide = corridorGuides[slug][locale];
  const rtl = locale !== 'en';
  const whatsappHref = getWhatsAppHref(locale);

  const otherGuides = guideSlugs.filter((s) => s !== slug);

  return (
    <>
      <section className="section-band bg-[#fcfbf8]">
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
          <article className="surface rounded-2xl p-6 leading-8 text-[#5f6b78] md:p-8">
            <div className="space-y-5">
              {guide.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {guide.sections.map((section, index) => (
              <article key={section.title} className="trust-card">
                <p className="eyebrow">{String(index + 1).padStart(2, '0')}</p>
                <h2 className="mt-3 text-xl font-semibold text-[#101e30]">{section.title}</h2>
                <div className="mt-4 space-y-3 text-[#5f6b78]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark section-band">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <FileCheck2 className="text-[#dec58d]" size={24} />
              <h2 className="text-2xl font-semibold text-white">{guide.documentsTitle}</h2>
            </div>
            <ul className="mt-6 space-y-3 text-white/72">
              {guide.documents.map((doc) => (
                <li key={doc} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dec58d]" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Clock className="text-[#dec58d]" size={24} />
              <h2 className="text-2xl font-semibold text-white">{guide.timingTitle}</h2>
            </div>
            <ul className="mt-6 space-y-3 text-white/72">
              {guide.timingItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#dec58d]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-white/55">{guide.timingNote}</p>
          </article>
        </div>
      </section>

      <section className="section-band bg-[#fcfbf8]">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#0b1624] to-[#060d18] px-6 py-10 text-white shadow-[var(--shadow-lg)] md:px-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="eyebrow text-[#dec58d]">{rtl ? 'مشاوره رایگان' : 'Free consultation'}</p>
                <h2 className="mt-3 text-3xl font-semibold">{guide.ctaTitle}</h2>
                <p className="mt-4 max-w-2xl leading-8 text-white/72">{guide.ctaCopy}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a href={whatsappHref} className="btn-primary">
                  <Headset size={18} />
                  WhatsApp
                </a>
                <Link href={`/${locale}/contact`} className="btn-ghost text-center">
                  {rtl ? 'صفحه تماس' : 'Contact page'}
                </Link>
              </div>
            </div>
          </div>

          {otherGuides.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow">{rtl ? 'راهنمای مسیرهای دیگر' : 'Other corridor guides'}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {otherGuides.map((other) => (
                  <Link
                    key={other}
                    href={`/${locale}/${other}`}
                    className="rounded-lg border border-[#c7a15b]/30 bg-white px-4 py-2 text-sm font-medium text-[#101e30] transition hover:border-[#c7a15b]/60 hover:shadow-sm"
                  >
                    {corridorGuides[other][locale].kicker}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
