import { MetadataRoute } from 'next';
import { getProducts, getCategories, getBrands } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://abrarshop.online';

    // Base routes
    const routes = [
        '',
        '/products',
        '/categories',
        '/brands',
        '/contact',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    try {
        // Fetch all dynamic data
        const [{ products }, categories, brands] = await Promise.all([
            getProducts({ limit: 1000 }), // Get up to 1000 products for sitemap
            getCategories(),
            getBrands(),
        ]);

        // Product routes
        const productRoutes = products.map((product) => ({
            url: `${baseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // Category routes
        const categoryRoutes = categories.map((category) => ({
            url: `${baseUrl}/category/${category.slug}`,
            lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        // Brand routes
        const brandRoutes = brands.map((brand) => ({
            url: `${baseUrl}/brands/${brand.slug}`,
            lastModified: brand.updatedAt ? new Date(brand.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

        return [...routes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return routes;
    }
}
