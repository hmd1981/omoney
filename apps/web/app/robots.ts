import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/fa/dashboard',
          '/en/dashboard',
          '/ar/dashboard',
          '/fa/login',
          '/en/login',
          '/ar/login',
          '/fa/register',
          '/en/register',
          '/ar/register',
          '/fa/complete-profile',
          '/en/complete-profile',
          '/ar/complete-profile',
          '/*/auth/'
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
