import type { Metadata } from 'next'

import GematriaSavedClient from './GematriaSavedClient'

export const metadata: Metadata = {
  title: 'Gematria Saved :: QLIPHOTH Systems',
  description: 'Saved phrases and gematria values captured by the gematria Chrome plugin.',
}

export default function GematriaSavedPage() {
  return <GematriaSavedClient />
}
