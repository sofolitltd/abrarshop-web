import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/cart-context';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: {
    default: 'Abrar Shop | Trustest Online Shop in Bangladesh',
    template: '%s | Abrar Shop',
  },
  description: 'The most trusted online shop in Bangladesh for authentic gadgets and accessories. Your one-stop shop for everything cool.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'font-body'
        )}
      >
        <NextTopLoader showSpinner={false} color="#000000" />
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
