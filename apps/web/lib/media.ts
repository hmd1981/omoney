export type MediaPlacementKey =
  | 'HOME_HERO'
  | 'HOME_SECURITY'
  | 'HOME_KYC'
  | 'HOME_CORRIDORS'
  | 'HOME_FAQ'
  | 'ABOUT_HERO'
  | 'CONTACT_HERO'
  | 'LOGIN_HERO'
  | 'REGISTER_HERO'
  | 'DASHBOARD_EMPTY'
  | 'TRANSFER_EMPTY'
  | 'KYC_EMPTY'
  | 'SECURITY_SECTION'
  | 'FOOTER_BACKGROUND';

export type CmsMedia = {
  id: string;
  title: string;
  slug: string;
  mediaType: 'IMAGE' | 'VIDEO';
  fileUrl: string;
  thumbnailUrl: string | null;
  mobileFileUrl: string | null;
  altText: string | null;
  overlayOpacity: number;
  focalPoint: { x?: number; y?: number } | null;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  published: boolean;
};

export type MediaMap = Partial<Record<MediaPlacementKey, CmsMedia>>;
export type MediaPlacementMap = MediaMap;

export async function getMediaPlacements(): Promise<MediaMap> {
  const base = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? process.env.PUBLIC_API_URL ?? 'http://localhost:4000';
  try {
    const response = await fetch(`${base}/media/placements`, { next: { revalidate: 60 } });
    return response.ok ? response.json() : {};
  } catch {
    return {};
  }
}
