import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/checkout/success/', '/cart/'],
        },
        sitemap: 'https://abrarshop.vercel.app/sitemap.xml',
        // sitemap: 'http://localhost:3000/sitemap.xml',
    }
}
