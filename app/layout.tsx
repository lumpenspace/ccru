import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CCRU Numogram',
  description: 'Interactive visualization of the Decimal Labyrinth — explore zones, syzygies, currents, gates and demons across four layouts with planetary orbital mechanics.',
  metadataBase: new URL('https://num.qliphoth.systems'),
  openGraph: {
    title: 'CCRU Numogram',
    description: 'Interactive visualization of the Decimal Labyrinth — zones, syzygies, currents, gates and planetary orbits.',
    siteName: 'CCRU Numogram',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CCRU Numogram',
    description: 'Interactive visualization of the Decimal Labyrinth — zones, syzygies, currents, gates and planetary orbits.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
