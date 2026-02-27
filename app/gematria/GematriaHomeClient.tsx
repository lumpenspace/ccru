'use client'

import { useEffect, useState } from 'react'

import { CyberButton } from '../components/ui/CyberButton'
import { CyberButtonGroup } from '../components/ui/CyberButtonGroup'
import { CyberPageHeader } from '../components/ui/CyberPageHeader'
import { CyberPanel } from '../components/ui/CyberPanel'
import { HomeLink } from '../components/ui/HomeLink'
import { useGlitchNavigate } from '../hooks/useGlitchNavigate'

const PLUGIN_SETUP_CLOSED_KEY = 'gematria_plugin_setup_closed'

function readPluginSetupClosedState() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(PLUGIN_SETUP_CLOSED_KEY) === '1'
  } catch {
    return false
  }
}

function savePluginSetupClosedState(closed: boolean) {
  if (typeof window === 'undefined') return
  try {
    if (closed) window.localStorage.setItem(PLUGIN_SETUP_CLOSED_KEY, '1')
    else window.localStorage.removeItem(PLUGIN_SETUP_CLOSED_KEY)
  } catch {}
}

function usePluginInstalled() {
  const [installed, setInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    let attempts = 0
    const check = () => {
      if (document.documentElement.dataset.gematriaInstalled === '1') {
        setInstalled(true)
        return
      }
      attempts += 1
      if (attempts < 10) setTimeout(check, 150)
      else setInstalled(false)
    }
    check()
  }, [])

  return installed
}

export default function GematriaHomeClient() {
  const navigate = useGlitchNavigate()
  const installed = usePluginInstalled()
  const [pluginSetupClosed, setPluginSetupClosed] = useState<boolean>(() => readPluginSetupClosedState())
  const shouldShowPluginSetup = installed !== true || !pluginSetupClosed

  useEffect(() => {
    if (installed !== false) return
    savePluginSetupClosedState(false)
    setPluginSetupClosed(false)
  }, [installed])

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[980px] px-4 py-8">
        <CyberPageHeader
          className="mb-5"
          icon="/gematria-logo.svg"
          title="Gematria"
          description={installed ? 'Saved entries from extension storage' : 'Chrome plugin setup and saved phrase workflow'}
          actions={<HomeLink href="/gematria/plugin" label="Docs" boxed={false} />}
        />

        <section className="space-y-4">
          {shouldShowPluginSetup && (
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
                  {installed === true
                    ? 'Plugin installed successfully.'
                    : <>Install and configure the Chrome plugin from <code>gematria/plugin</code>.</>}
                </p>
                <CyberButtonGroup>
                  <CyberButton onClick={() => navigate('/gematria/plugin')}>Open Plugin Docs</CyberButton>
                  {installed === true && (
                    <CyberButton
                      onClick={() => {
                        savePluginSetupClosedState(true)
                        setPluginSetupClosed(true)
                      }}
                    >
                      Close
                    </CyberButton>
                  )}
                </CyberButtonGroup>
              </div>
            </CyberPanel>
          )}

          <CyberPanel
            id="gematria-saved-list"
            title="Saved Items"
            position={{ x: 0, y: 0 }}
            width="100%"
            draggable={false}
            onDragStart={() => {}}
            positionMode="relative"
            showToggle={false}
          >
            <div id="gematria-saved-root" className="px-3 py-3">
              <div className="rounded-md border border-dashed border-[#334155] bg-[#0b111a] p-4 text-sm text-gray-400">
                the items you save will end up here
              </div>
            </div>
          </CyberPanel>
        </section>
      </div>
    </main>
  )
}
