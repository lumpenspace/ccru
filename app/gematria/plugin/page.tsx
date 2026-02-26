import type { Metadata } from 'next'

import GematriaPluginClient from './GematriaPluginClient'

export const metadata: Metadata = {
  title: 'Gematria Plugin :: QLIPHOTH Systems',
  description: 'Chrome extension module for CCRU gematria overlays and saved entries.',
}

export default function GematriaPluginPage() {
  return <GematriaPluginClient />
}
