import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/', '/static/'],
    },
    sitemap: 'https://abrarshop.vercel.app/sitemap.xml',
  };
}
