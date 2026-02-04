import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  metadataBase: new URL('https://kommentify.com'),
  title: {
    default: 'AI LinkedIn Automation Extension for Growth & Leads | Kommentify',
    template: '%s | Kommentify'
  },
  description: 'Kommentify is an AI-powered LinkedIn automation extension for smart commenting, intelligent networking, and lead tracking—all in a safe, browser-based solution.',
  keywords: [
    'LinkedIn automation',
    'LinkedIn auto comment',
    'LinkedIn growth tool',
    'AI LinkedIn comments',
    'LinkedIn networking',
    'LinkedIn post scheduler',
    'LinkedIn engagement tool',
    'LinkedIn marketing automation',
    'grow LinkedIn followers',
    'LinkedIn lead generation'
  ],
  authors: [{ name: 'Kommentify' }],
  creator: 'Kommentify',
  publisher: 'Kommentify',
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
    url: 'https://kommentify.com',
    siteName: 'Kommentify',
    title: 'AI LinkedIn Automation Extension for Growth & Leads | Kommentify',
    description: 'Kommentify is an AI-powered LinkedIn automation extension for smart commenting, intelligent networking, and lead tracking—all in a safe, browser-based solution.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kommentify - LinkedIn Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI LinkedIn Automation Extension for Growth & Leads | Kommentify',
    description: 'Kommentify is an AI-powered LinkedIn automation extension for smart commenting, intelligent networking, and lead tracking.',
    images: ['/og-image.png'],
    creator: '@kommentify',
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual code
  },
  alternates: {
    canonical: 'https://kommentify.com',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.png" type="image/png" />
          <link rel="apple-touch-icon" href="/favicon.png" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* Meta Pixel Code */}
          <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1325317928900506');fbq('track','PageView');` }} />
          <noscript dangerouslySetInnerHTML={{ __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1325317928900506&ev=PageView&noscript=1" />` }} />
          <meta name="theme-color" content="#693fe9" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          
          {/* Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: 'Kommentify',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Chrome',
                description: 'AI-powered LinkedIn automation tool for auto-commenting, networking, and growth.',
                url: 'https://kommentify.com',
                author: {
                  '@type': 'Organization',
                  name: 'Kommentify',
                },
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                  description: '30-Day Money-Back Guarantee',
                },
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.8',
                  ratingCount: '150',
                },
              }),
            }}
          />
          
          <style>{`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
          `}</style>
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          {children}
          <SpeedInsights />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
