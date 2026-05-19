import { CmsMedia } from '../lib/media';

type StaticFallback = {
  jpg: string;
  webp?: string;
  overlayOpacity?: number;
};

export function MediaBackground({
  media,
  eager = false,
  fallback
}: {
  media?: CmsMedia;
  eager?: boolean;
  fallback?: StaticFallback;
}) {
  if (!media?.fileUrl) {
    if (!fallback) return null;

    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <picture>
          {fallback.webp ? <source type="image/webp" srcSet={fallback.webp} /> : null}
          <img
            src={fallback.jpg}
            alt=""
            className="h-full w-full object-cover"
            loading={eager ? 'eager' : 'lazy'}
          />
        </picture>
        <div
          className="absolute inset-0 bg-[#08111d]"
          style={{ opacity: fallback.overlayOpacity ?? 0.55 }}
        />
      </div>
    );
  }

  const objectPosition = media.focalPoint?.x !== undefined && media.focalPoint?.y !== undefined
    ? `${media.focalPoint.x}% ${media.focalPoint.y}%`
    : 'center';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {media.mediaType === 'VIDEO' ? (
        <video
          className="h-full w-full object-cover"
          style={{ objectPosition }}
          autoPlay={media.autoplay}
          muted={media.muted}
          loop={media.loop}
          playsInline
          preload={eager ? 'auto' : 'metadata'}
          poster={media.thumbnailUrl ?? undefined}
        >
          {media.mobileFileUrl && <source media="(max-width: 767px)" src={media.mobileFileUrl} />}
          <source src={media.fileUrl} />
        </video>
      ) : (
        <picture>
          {media.mobileFileUrl && <source media="(max-width: 767px)" srcSet={media.mobileFileUrl} />}
          <img
            src={media.fileUrl}
            alt={media.altText ?? ''}
            className="h-full w-full object-cover"
            style={{ objectPosition }}
            loading={eager ? 'eager' : 'lazy'}
          />
        </picture>
      )}
      <div className="absolute inset-0 bg-[#08111d]" style={{ opacity: media.overlayOpacity }} />
    </div>
  );
}
