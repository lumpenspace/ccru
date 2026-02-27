'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CyberButton } from '../../components/ui/CyberButton'
import { CyberButtonGroup } from '../../components/ui/CyberButtonGroup'
import { CyberPageHeader } from '../../components/ui/CyberPageHeader'
import { CyberPanel } from '../../components/ui/CyberPanel'

const PLUGIN_VERSION = '0.1.0'
const ZIP_PATH = '/downloads/ccru-gematria-plugin.zip'

const installSteps = [
  'Download the zip below and extract it.',
  'Open chrome://extensions and enable Developer mode.',
  'Click Load unpacked and select the extracted folder.',
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

function usePluginInstalled() {
  const [installed, setInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    // Content script sets data-gematria-installed="1" on <html>.
    // It runs at document_idle so poll briefly to catch it.
    let attempts = 0
    const check = () => {
      if (document.documentElement.dataset.gematriaInstalled === '1') {
        setInstalled(true)
        return
      }
      attempts += 1
      if (attempts < 10) {
        setTimeout(check, 150)
      } else {
        setInstalled(false)
      }
    }
    check()
  }, [])

  return installed
}

const panelProps = {
  position: { x: 0, y: 0 } as const,
  width: '100%' as const,
  draggable: false as const,
  onDragStart: () => {},
  positionMode: 'relative' as const,
  showToggle: false,
}

export default function GematriaPluginClient() {
  const router = useRouter()
  const installed = usePluginInstalled()

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = ZIP_PATH
    a.download = `ccru-gematria-plugin-v${PLUGIN_VERSION}.zip`
    a.click()
  }, [])

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[980px] px-4 py-8">
        <CyberPageHeader
          className="mb-5"
          title="Gematria Chrome Plugin"
          description={
            installed
              ? `v${PLUGIN_VERSION} — installed`
              : `v${PLUGIN_VERSION} — Chrome extension for gematria overlays`
          }
        />

        <section className="space-y-4">
          {installed === true ? (
            <>
              <CyberPanel id="gematria-plugin-status" title="Status" {...panelProps}>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#10ff50]" />
                    <span className="text-[#10ff50]/90">Extension active</span>
                    <span className="text-xs text-gray-500">v{PLUGIN_VERSION}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    The gematria overlay is running on this page. Use the popup icon to configure
                    cyphers and interesting values.
                  </p>
                </div>
              </CyberPanel>

              <CyberPanel id="gematria-plugin-behavior" title="Behavior" {...panelProps}>
                <div className="px-4 py-3">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
                    {behaviorItems.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CyberPanel>

              <CyberPanel id="gematria-plugin-download" title="Download" {...panelProps}>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      <span className="text-gray-400">Re-download or share</span>
                      <span className="ml-2 text-xs text-gray-500">v{PLUGIN_VERSION}</span>
                    </div>
                    <CyberButton onClick={handleDownload}>Download .zip</CyberButton>
                  </div>
                </div>
              </CyberPanel>
            </>
          ) : (
            <>
              <CyberPanel id="gematria-plugin-download" title="Download" {...panelProps}>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      <span className="text-[#10ff50]/80 font-semibold">CCRU Gematria Overlay</span>
                      <span className="ml-2 text-xs text-gray-500">v{PLUGIN_VERSION}</span>
                    </div>
                    <CyberButton onClick={handleDownload}>Download .zip</CyberButton>
                  </div>
                  <p className="text-xs text-gray-500">
                    Packaged extension ready for Chrome side-loading. Extract and load via chrome://extensions.
                  </p>
                </div>
              </CyberPanel>

              <CyberPanel id="gematria-plugin-install" title="Install" {...panelProps}>
                <div className="px-4 py-3">
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-300">
                    {installSteps.map(step => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </CyberPanel>

              <CyberPanel id="gematria-plugin-behavior" title="Behavior" {...panelProps}>
                <div className="px-4 py-3">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
                    {behaviorItems.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CyberPanel>
            </>
          )}

          <CyberButtonGroup>
            <CyberButton onClick={() => router.push('/gematria/saved')}>Open Saved Entries</CyberButton>
            <CyberButton onClick={() => router.push('/gematria')}>Back to Gematria</CyberButton>
          </CyberButtonGroup>
        </section>
      </div>
    </main>
  )
}
