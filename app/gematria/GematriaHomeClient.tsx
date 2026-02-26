'use client'

import { useRouter } from 'next/navigation'

import { CyberButton } from '../components/ui/CyberButton'
import { CyberButtonGroup } from '../components/ui/CyberButtonGroup'
import { CyberPageHeader } from '../components/ui/CyberPageHeader'
import { CyberPanel } from '../components/ui/CyberPanel'

export default function GematriaHomeClient() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[980px] px-4 py-8">
        <CyberPageHeader
          className="mb-5"
          title="Gematria"
          description="Standalone module for plugin tooling and saved phrase workflow."
          links={[
            { href: '/', label: 'Home' },
            { href: '/cyphers', label: 'Cifers' },
            { href: '/components', label: 'Components' },
          ]}
        />

        <section className="space-y-4">
          <CyberPanel
            id="gematria-plugin"
            title="Chrome Plugin"
            position={{ x: 0, y: 0 }}
            width="100%"
            draggable={false}
            onDragStart={() => {}}
            positionMode="relative"
            showToggle={false}
          >
            <div className="space-y-4 px-3 py-3">
              <p className="text-sm text-gray-300">
                Install and configure the unpacked extension under <code>gematria/plugin</code>.
              </p>
              <CyberButtonGroup>
                <CyberButton onClick={() => router.push('/gematria/plugin')}>Open Plugin Docs</CyberButton>
                <CyberButton onClick={() => router.push('/gematria/saved')}>Open Saved Entries</CyberButton>
              </CyberButtonGroup>
            </div>
          </CyberPanel>
        </section>
      </div>
    </main>
  )
}
