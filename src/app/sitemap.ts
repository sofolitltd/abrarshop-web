import { MetadataRoute } from 'next';
import { getAllProductSlugs, getAllCategorySlugs, getAllBrandSlugs } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://abrarshop.vercel.app';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/products',
    '/categories',
    '/brands',
    '/about',
    '/contact',
    '/cart',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Fetch Dynamic Slugs
  const [products, categories, brands] = await Promise.all([
    getAllProductSlugs(),
    getAllCategorySlugs(),
    getAllBrandSlugs(),
  ]);

  // 3. Product Routes
  const productRoutes = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. Category Routes
  const categoryRoutes = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // 5. Brand Routes
  const brandRoutes = brands.map((b) => ({
    url: `${baseUrl}/brand/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...brandRoutes,
  ];
}
