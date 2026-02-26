import type { Metadata } from 'next'

import CyphersClient from './CyphersClient'

export const metadata: Metadata = {
  title: 'Cifers :: CCRU Gematria',
  description: 'CCRU cifers toolkit with React component notes, Chrome plugin scaffold, and a live calculator.',
}

export default function CyphersPage() {
  return <CyphersClient />
}
