import type { Metadata } from 'next'

import GematriaHomeClient from './GematriaHomeClient'

export const metadata: Metadata = {
  title: 'Gematria :: QLIPHOTH Systems',
  description: 'Standalone gematria module with Chrome extension tooling and saved phrase list.',
}

export default function GematriaHomePage() {
  return <GematriaHomeClient />
}
