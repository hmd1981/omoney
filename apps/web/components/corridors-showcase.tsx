import Image from 'next/image';
import { corridorShowcase, content } from '../lib/content';
import { corridorImageWebp } from '../lib/visual-assets';
import { MediaBackground } from './media-background';
import type { MediaPlacementMap } from '../lib/media';

export function CorridorsShowcase({
  locale,
  media
}: {
  locale: keyof typeof content;
  media: MediaPlacementMap;
}) {
  const t = content[locale];
  const corridors = corridorShowcase[locale];

  return (
    <section className="section-band relative isolate overflow-hidden bg-[#060d18]">
      <MediaBackground media={media.HOME_CORRIDORS} />
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div>
          <p className="eyebrow">
            {locale === 'fa' ? 'مسیرهای جهانی' : locale === 'ar' ? 'مسارات عالمية' : 'Global corridors'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">{t.corridorsTitle}</h2>
          <p className="mt-4 text-base leading-8 text-white/72">{t.corridorsCopy}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {corridors.map((corridor) => {
            const webp = corridorImageWebp(corridor.city);
            return (
              <article key={corridor.city} className="corridor-card">
                <div className="corridor-card__media relative min-h-[220px]">
                  <Image
                    src={webp}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={70}
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
                <div className="corridor-card__overlay" />
                <div className="corridor-card__body">
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-[#dec58d]">
                    {corridor.tag}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">{corridor.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">{corridor.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
