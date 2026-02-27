import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'
import { CrtNavigationTransitionProvider } from './components/navigation/CrtNavigationTransition'

export const metadata: Metadata = {
  title: 'QLIPHOTH Systems',
  description: 'Global homepage for CCRU Numogram and Cifers tools.',
  metadataBase: new URL('https://num.qliphoth.systems'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
  openGraph: {
    title: 'QLIPHOTH Systems',
    description: 'Global homepage for CCRU Numogram and Cifers tools.',
    siteName: 'QLIPHOTH Systems',
    url: 'https://num.qliphoth.systems',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'QLIPHOTH Systems',
    description: 'Global homepage for CCRU Numogram and Cifers tools.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CrtNavigationTransitionProvider>{children}</CrtNavigationTransitionProvider>
        <Analytics />
      </body>
    </html>
  )
}
