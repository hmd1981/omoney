import { content } from '../lib/content';
import { MediaBackground } from './media-background';
import type { MediaPlacementMap } from '../lib/media';

const stepsContent = {
  fa: [
    'ثبت درخواست و اطلاعات گیرنده',
    'بررسی مدارک و تأیید نرخ',
    'بارگذاری رسید پرداخت',
    'پردازش و اعلام وضعیت نهایی'
  ],
  en: [
    'Submit beneficiary details',
    'Review documents and confirm rate',
    'Upload payment receipt',
    'Processing and final confirmation'
  ]
} as const;

export function ProcessSection({
  locale,
  media
}: {
  locale: keyof typeof content;
  media: MediaPlacementMap;
}) {
  const t = content[locale];
  const steps = stepsContent[locale];
  const fa = locale === 'fa';

  return (
    <section className="section-band relative isolate overflow-hidden bg-[#fcfbf8]">
      <MediaBackground media={media.HOME_CORRIDORS} />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">{fa ? 'فرآیند روشن' : 'Clear process'}</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{t.howTitle}</h2>
          <p className="mt-4 text-base leading-8 text-[#5f6b78]">
            {fa
              ? 'انتقال پول بین‌المللی با اومانی — از ثبت تا تکمیل، هر مرحله قابل پیگیری است.'
              : 'International transfer with OMoney — every stage is traceable from submission to completion.'}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step} className="surface rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-md">
              <span className="text-sm font-semibold tracking-widest text-[#c7a15b]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
