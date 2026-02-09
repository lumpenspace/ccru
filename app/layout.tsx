import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CCRU Numogram',
  description: 'The Decimal Labyrinth',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
