'use client'

import { useCallback, useEffect, useState } from 'react'

import { CyberButton } from '../../components/ui/CyberButton'
import { CyberButtonGroup } from '../../components/ui/CyberButtonGroup'
import { CyberPageHeader } from '../../components/ui/CyberPageHeader'
import { CyberPanel } from '../../components/ui/CyberPanel'
import { useGlitchNavigate } from '../../hooks/useGlitchNavigate'
import { PLUGIN_VERSION, ZIP_PATH, ZIP_SHA256 } from './zipInfo'

const PLUGIN_SETUP_CLOSED_KEY = 'gematria_plugin_setup_closed'

const installSteps = [
  'Download the ZIP below and extract it.',
  'Open chrome://extensions and enable Developer mode.',
  'Click Load unpacked, then select the extracted folder.',
  'Pin the extension icon and configure interesting values and ciphers in the popup settings.',
  'Open Twitter/X and hover over tweets to view values and highlights.',
  'On non-Twitter pages, right-click selected text for quick value overlays.',
]

const behaviorItems = [
  'Tweet hover cards show values for all enabled ciphers.',
  'Tweets with matching interesting values are highlighted.',
  'The tweet composer shows live values near the audience selector.',
  'Selection overlays outside Twitter show values and include a save action.',
  'Saved items appear on /gematria from local extension storage.',
]

const beforeInstallFeatures = [
  'One-click download of the packaged Chrome plugin zip.',
  'Step-by-step install checklist for chrome://extensions.',
  'Install-state detection so you can verify when activation is complete.',
]

const afterInstallFeatures = [
  'Live gematria overlays on tweet hover cards and composer text.',
  'Interesting value highlights for faster scanning.',
  'Right-click selected text overlays on non-Twitter pages.',
  'Saved entries sync to the /gematria saved list view.',
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
  const navigate = useGlitchNavigate()
  const installed = usePluginInstalled()

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = ZIP_PATH
    a.download = `ccru-gematria-plugin-v${PLUGIN_VERSION}.zip`
    a.click()
  }, [])

  const closeSetup = useCallback(() => {
    try {
      window.localStorage.setItem(PLUGIN_SETUP_CLOSED_KEY, '1')
    } catch {}
    navigate('/gematria')
  }, [navigate])

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[980px] px-4 py-8">
        <CyberPageHeader
          className="mb-5"
          icon="/gematria-logo.svg"
          title="Gematria Chrome Plugin"
          titleHref="/gematria"
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
                    ciphers and interesting values.
                  </p>
                  <CyberButtonGroup>
                    <CyberButton onClick={closeSetup}>Close Setup</CyberButton>
                  </CyberButtonGroup>
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
                  <div className="rounded border border-[#334155] bg-[#0b111a] px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500">SHA-256</div>
                    <code className="mt-1 block break-all text-[11px] text-gray-300">{ZIP_SHA256}</code>
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
                    Packaged extension ready for Chrome sideloading. Extract and load it via chrome://extensions.
                  </p>
                  <div className="rounded border border-[#334155] bg-[#0b111a] px-2 py-1.5">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500">SHA-256</div>
                    <code className="mt-1 block break-all text-[11px] text-gray-300">{ZIP_SHA256}</code>
                  </div>
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

          <CyberPanel
            id="gematria-plugin-features"
            title="Features"
            {...panelProps}
            showToggle
            collapseDirection="vertical"
            defaultOpen={false}
          >
            <div className="space-y-4 px-4 py-3">
              <p className="text-xs text-gray-500">
                {installed
                  ? 'Current state: installed and active'
                  : installed === false
                    ? 'Current state: not installed yet'
                    : 'Current state: checking installation'}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-[#334155] bg-[#0b111a] p-3">
                  <div className="mb-2 text-xs uppercase tracking-[0.12em] text-[#facc15]">
                    Before Installation
                  </div>
                  <ul className="list-disc space-y-1.5 pl-5 text-xs text-gray-300">
                    {beforeInstallFeatures.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-[#334155] bg-[#0b111a] p-3">
                  <div className="mb-2 text-xs uppercase tracking-[0.12em] text-[#10ff50]">
                    After Installation
                  </div>
                  <ul className="list-disc space-y-1.5 pl-5 text-xs text-gray-300">
                    {afterInstallFeatures.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CyberPanel>

          <CyberButtonGroup>
            <CyberButton onClick={() => navigate('/gematria')}>Open Saved Entries</CyberButton>
            <CyberButton onClick={() => navigate('/gematria')}>Back to Gematria</CyberButton>
          </CyberButtonGroup>
        </section>
      </div>
    </main>
  )
}
