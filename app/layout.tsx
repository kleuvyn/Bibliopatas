import type { Metadata } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CookieConsent } from '@/components/cookie-consent'
import { AnalyticsConsent } from '@/components/analytics-consent'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL('https://bibliopatas.com.br')

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'Bibliopatas | Livros que salvam vidas',
    template: '%s | Bibliopatas',
  },
  description:
    'Bibliopatas é um catálogo de livros usados e valores, com venda via WhatsApp e entrega para todo Brasil.',
  keywords: [
    'bibliopatas',
    'livros usados',
    'livros baratos',
    'sebo online',
    'brasilia',
    'proteção animal',
    'abrigo de animais',
  ],
  authors: [
    { name: 'Bibliopatas', url: 'https://bibliopatas.com.br' },
    { name: 'Biblioteca social de emergência' },
  ],
  openGraph: {
    title: 'Bibliopatas | Livros que salvam vidas',
    description:
      'Bibliopatas reúne livros usados para apoiar protetores independentes e abrigos de animais em Brasília.',
    type: 'website',
    siteName: 'Bibliopatas',
    locale: 'pt_BR',
    url: siteUrl.href,
    images: [
      {
        url: `${siteUrl.origin}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: 'Bibliopatas - Livros que salvam vidas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bibliopatas | Livros que salvam vidas',
    description:
      'Bibliopatas reúne livros usados para apoiar protetores independentes e abrigos de animais em Brasília.',
    creator: '@bibliopatas',
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      image: true,
    },
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body
        className={`${playfair.variable} ${lora.variable} font-sans antialiased text-foreground selection:bg-primary/20 selection:text-primary`}
      >
        {children}
        <ScrollToTop />
        <CookieConsent />
        <AnalyticsConsent />
      </body>
    </html>
  )
}
