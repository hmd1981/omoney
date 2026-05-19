import { CinematicBackground } from './cinematic-background';
import { MediaBackground } from './media-background';
import type { CmsMedia } from '../lib/media';

/**
 * CMS media when available; otherwise static اومانی cinematic hero assets.
 */
export function HeroCinematicLayer({ media, eager = false }: { media?: CmsMedia; eager?: boolean }) {
  if (media?.fileUrl) {
    return <MediaBackground media={media} eager={eager} />;
  }
  return <CinematicBackground variant="hero" scene="muscat" priority={eager} />;
}
