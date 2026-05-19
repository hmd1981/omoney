import { CmsMedia } from '../lib/media';

export function MediaBackground({ media, eager = false }: { media?: CmsMedia; eager?: boolean }) {
  if (!media) return null;
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
            fetchPriority={eager ? 'high' : 'low'}
            decoding="async"
          />
        </picture>
      )}
      <div className="absolute inset-0 bg-[#08111d]" style={{ opacity: media.overlayOpacity }} />
    </div>
  );
}
