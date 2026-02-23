import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'

export const metadata: Metadata = {
  title: 'CCRU Numogram',
  description: 'Interactive visualization of the Decimal Labyrinth — explore zones, syzygies, currents, gates and demons across four layouts with planetary orbital mechanics.',
  metadataBase: new URL('https://num.qliphoth.systems'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'CCRU Numogram',
    description: 'Interactive visualization of the Decimal Labyrinth — zones, syzygies, currents, gates and planetary orbits.',
    siteName: 'CCRU Numogram',
    url: 'https://num.qliphoth.systems',
    type: 'website',
    images: [
      {
        url: 'https://num.qliphoth.systems/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CCRU Numogram — The Decimal Labyrinth',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCRU Numogram',
    description: 'Interactive visualization of the Decimal Labyrinth — zones, syzygies, currents, gates and planetary orbits.',
    images: ['https://num.qliphoth.systems/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}
        <Analytics />
      </body>
    </html>
  )
}
