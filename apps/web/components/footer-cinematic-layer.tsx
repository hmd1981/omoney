import { CinematicBackground } from './cinematic-background';
import { MediaBackground } from './media-background';
import type { CmsMedia } from '../lib/media';

export function FooterCinematicLayer({ media }: { media?: CmsMedia }) {
  if (media?.fileUrl) {
    return <MediaBackground media={media} />;
  }
  return <CinematicBackground variant="footer" />;
}
