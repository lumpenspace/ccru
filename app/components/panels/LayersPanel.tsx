'use client'

import React from 'react'
import type { Layer } from '../../data/types'

interface LayersPanelProps {
  layers: Set<Layer>
  toggleLayer: (l: Layer) => void
  particlesOn: boolean
  onToggleParticles: () => void
}

const LAYER_DEFS: { id: Layer; label: string; clr: string; info: string }[] = [
  { id: 'syzygies', label: 'Syzygies', clr: '#e8e8e8',
    info: 'Five nine-sum twinnings (0+9, 1+8, 2+7, 3+6, 4+5). Each zone pairs with its complement to 9, generating the Barker spiral\u2019s fundamental architecture.' },
  { id: 'currents', label: 'Currents', clr: '#22ee66',
    info: 'Five directed flows from syzygy differences. Surge, Hold, and Sink drive the anticlockwise Time Circuit hydrocycle. Warp and Plex are autonomous self-referential loops of Outer-Time.' },
  { id: 'gates', label: 'Gates', clr: '#cc44ff',
    info: 'Ten channels of digital cumulation (0, 1, 3, 6, 10, 15, 21, 28, 36, 45). Each gate routes from a syzygy midpoint to a destination zone, mapping the numogram\u2019s navigational pathways.' },
  { id: 'pandemonium', label: 'Pandemonium', clr: '#cc3333',
    info: '45 demons of the Nma demonomy. Chronodemons link Time Circuit zones, xenodemons connect outer zones, amphidemons span both. Five syzygetic demons carry the nine-sum twinnings.' },
]

export function LayersPanel({ layers, toggleLayer, particlesOn, onToggleParticles }: LayersPanelProps) {
  return (
    <div className="px-3 pb-2.5 space-y-0.5">
      {LAYER_DEFS.map(l => (
        <div key={l.id}>
          <div
            className="flex items-center gap-2 py-0.5 cursor-pointer"
            style={{ opacity: layers.has(l.id) ? 1 : 0.3, transition: 'opacity 0.15s' }}
            onClick={() => toggleLayer(l.id)}
          >
            <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
              background: layers.has(l.id) ? l.clr : '#333',
              boxShadow: layers.has(l.id) ? `0 0 4px ${l.clr}66` : 'none',
            }} />
            <span className="text-gray-400 text-[10px]">{l.label}</span>
            <span className="text-[8px] text-gray-700 ml-auto">{layers.has(l.id) ? 'ON' : 'OFF'}</span>
          </div>
          {layers.has(l.id) && (
            <p className="text-[8px] text-gray-600 leading-relaxed pl-3 pb-1 italic">{l.info}</p>
          )}
        </div>
      ))}
      <div
        className="flex items-center gap-2 py-0.5 cursor-pointer mt-1 pt-1"
        style={{ opacity: particlesOn ? 1 : 0.3, transition: 'opacity 0.15s', borderTop: '1px solid rgba(255,255,255,0.04)' }}
        onClick={onToggleParticles}
      >
        <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
          background: particlesOn ? '#00ccff' : '#333',
          boxShadow: particlesOn ? '0 0 4px #00ccff66' : 'none',
        }} />
        <span className="text-gray-400 text-[10px]">Particles</span>
        <span className="text-[8px] text-gray-700 ml-auto">{particlesOn ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  )
}
