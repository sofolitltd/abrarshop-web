import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Abrar Shop',
        short_name: 'Abrar Shop',
        description: 'Your one-stop destination for the latest trends and high-quality products in Bangladesh.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/abrarshop-logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
