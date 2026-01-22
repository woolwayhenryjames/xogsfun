import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
// import PWAInstaller from '@/components/PWAInstaller';
// import PWAInstallButton from '@/components/PWAInstallButton';
// import PWAStatus from '@/components/PWAStatus';

const inter = { className: 'font-sans' };

export const metadata: Metadata = {
  title: '🚀 $XOGS - Get Paid for Your CryptoTwitter Influence!',
  description: '🤖 AI analyzes your crypto Twitter influence → 💰 Earn $XOGS tokens on Solana → 🏆 Join 10K+ influencers. Free evaluation!',
  keywords: 'crypto, twitter, AI, scoring, solana, blockchain, influence, analysis, $XOGS, cryptocurrency, social media, analytics',
  authors: [{ name: 'XOGS Team', url: 'https://x.mdvu.com' }],
  creator: 'XOGS Team',
  publisher: 'XOGS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://xogs.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '🚀 $XOGS - Get Paid for Your CryptoTwitter Influence!',
    description: '🤖 AI analyzes your crypto Twitter influence → 💰 Earn $XOGS tokens on Solana → 🏆 Join 10K+ influencers. Free evaluation!',
    url: 'https://xogs.vercel.app',
    siteName: 'XOGS',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/twitter-card-image.png',
        width: 1200,
        height: 630,
        alt: 'XOGS - CryptoTwitter AI Scoring Platform - Earn $XOGS Tokens',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🚀 $XOGS - Get Paid for Your CryptoTwitter Influence!',
    description: '🤖 AI analyzes your crypto Twitter influence → 💰 Earn $XOGS tokens on Solana → 🏆 Join 10K+ influencers. Free evaluation!',
    site: '@xogsfun',
    creator: '@xogsfun',
    images: ['/twitter-card-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // 您需要从Google Search Console获取
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  // manifest: '/manifest.json', // PWA 功能已隐藏
  other: {
    'application-name': 'XOGS',
    // 'msapplication-TileColor': '#2B5CE6', // PWA 功能已隐藏
    // 'theme-color': '#2B5CE6', // PWA 功能已隐藏
    // 'mobile-web-app-capable': 'yes', // PWA 功能已隐藏
    // 'apple-mobile-web-app-capable': 'yes', // PWA 功能已隐藏
    // 'apple-mobile-web-app-status-bar-style': 'default', // PWA 功能已隐藏
    // 'apple-mobile-web-app-title': 'XOGS', // PWA 功能已隐藏
    'format-detection': 'telephone=no',
    'referrer': 'origin-when-cross-origin',
    'color-scheme': 'light',
    'supported-color-schemes': 'light',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N4JK99WJ');`,
          }}
        />
        {/* End Google Tag Manager */}
        
        {/* Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-Z8Y95Q0RGY"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Z8Y95Q0RGY');
            `,
          }}
        />
        {/* End Google Analytics */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N4JK99WJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          {/* <PWAInstaller /> */}
          {children}
          <Toaster position="top-right" />
          {/* <PWAInstallButton /> */}
          {/* <PWAStatus /> */}
        </Providers>
      </body>
    </html>
  );
}
