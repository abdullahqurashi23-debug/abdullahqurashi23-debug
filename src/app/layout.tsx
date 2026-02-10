import type { Metadata, Viewport } from 'next';
import { Outfit, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { generatePersonSchema, generateWebsiteSchema, SchemaScript } from '@/lib/schema';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://emalkamawal.com';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Emal Kamawal | AI Researcher in Healthcare',
    template: '%s | Emal Kamawal',
  },
  description: 'Portfolio of Emal Kamawal - AI Researcher specializing in Healthcare AI, Computer Vision, Brain-Computer Interfaces, and Privacy-Preserving Machine Learning.',
  keywords: ['AI Researcher', 'Healthcare AI', 'Computer Vision', 'BCI', 'Machine Learning', 'Deep Learning', 'Medical Imaging', 'Emal Kamawal'],
  authors: [{ name: 'Emal Kamawal', url: baseUrl }],
  creator: 'Emal Kamawal',
  publisher: 'Emal Kamawal',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Emal Kamawal',
    title: 'Emal Kamawal | AI Researcher in Healthcare',
    description: 'AI Researcher specializing in Healthcare AI, Computer Vision, and Brain-Computer Interfaces.',
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Emal Kamawal - AI Researcher in Healthcare',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emal Kamawal | AI Researcher in Healthcare',
    description: 'AI Researcher specializing in Healthcare AI, Computer Vision, and BCI.',
    images: [`${baseUrl}/api/og`],
    creator: '@emalkamawal',
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* JSON-LD Schema Markup */}
        <SchemaScript schema={[generatePersonSchema(), generateWebsiteSchema()]} />

        {/* Plausible Analytics - Privacy-friendly analytics */}
        <Script
          defer
          data-domain="emalkamawal.com"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Header />
            <main id="main-content" className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
