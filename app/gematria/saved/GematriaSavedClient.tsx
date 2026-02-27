'use client'

import { CyberPageHeader } from '../../components/ui/CyberPageHeader'
import { CyberPanel } from '../../components/ui/CyberPanel'

export default function GematriaSavedClient() {
  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[980px] px-4 py-8">
        <CyberPageHeader
          className="mb-5"
          title="Gematria Saved Entries"
          description="Extension storage"
        />

        <CyberPanel
          id="gematria-saved-list"
          title="Saved"
          position={{ x: 0, y: 0 }}
          width="100%"
          draggable={false}
          onDragStart={() => {}}
          positionMode="relative"
          showToggle={false}
        >
          <div id="gematria-saved-root" className="px-3 py-3">
            <div className="rounded-md border border-dashed border-[#334155] bg-[#0b111a] p-4 text-sm text-gray-400">
              Install and enable the extension in <code>gematria/plugin</code>, then save phrases from tweet hover cards
              or right-click selection overlays.
            </div>
          </div>
        </CyberPanel>
      </div>
    </main>
  )
}
