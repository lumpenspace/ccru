'use client'

import { useRouter } from 'next/navigation'

import { CyberButton } from '../../components/ui/CyberButton'
import { CyberButtonGroup } from '../../components/ui/CyberButtonGroup'
import { CyberPageHeader } from '../../components/ui/CyberPageHeader'
import { CyberPanel } from '../../components/ui/CyberPanel'

const installSteps = [
  'Open chrome://extensions and enable Developer mode.',
  'Click Load unpacked and select this repo directory: gematria/plugin.',
  'Pin the extension icon and set interesting values + cyphers in popup settings.',
  'Open Twitter/X and hover tweets to view values and highlight matches.',
  'Use right-click selected text on non-Twitter pages for quick value overlays.',
]

const behaviorItems = [
  'Tweet hover cards show values for all selected cyphers.',
  'Tweets with values in interesting-values settings are highlighted.',
  'Tweet composer shows live values near the audience selector.',
  'Selection overlays outside Twitter support value display and save action.',
  'Saved items render on /gematria/saved from local extension storage.',
]

export default function GematriaPluginClient() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[980px] px-4 py-8">
        <CyberPageHeader
          className="mb-5"
          title="Gematria Chrome Plugin"
          description="Unpacked extension source in gematria/plugin."
          links={[
            { href: '/gematria', label: 'Gematria' },
            { href: '/gematria/saved', label: 'Saved' },
            { href: '/components', label: 'Components' },
          ]}
        />

        <section className="space-y-4">
          <CyberPanel
            id="gematria-plugin-install"
            title="Install"
            position={{ x: 0, y: 0 }}
            width="100%"
            draggable={false}
            onDragStart={() => {}}
            positionMode="relative"
            showToggle={false}
          >
            <div className="px-4 py-3">
              <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-300">
                {installSteps.map(step => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </CyberPanel>

          <CyberPanel
            id="gematria-plugin-behavior"
            title="Behavior"
            position={{ x: 0, y: 0 }}
            width="100%"
            draggable={false}
            onDragStart={() => {}}
            positionMode="relative"
            showToggle={false}
          >
            <div className="px-4 py-3">
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
                {behaviorItems.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CyberPanel>

          <CyberButtonGroup>
            <CyberButton onClick={() => router.push('/gematria/saved')}>Open Saved Entries</CyberButton>
            <CyberButton onClick={() => router.push('/gematria')}>Back to Gematria</CyberButton>
          </CyberButtonGroup>
        </section>
      </div>
    </main>
  )
}
