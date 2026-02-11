'use client'

import React from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR } from '../../data/zones'
import { GATE_LIST } from '../../data/gates'

interface GatesPanelProps {
  hlZones: Set<number>
  selZones: Set<number>
  onHoverInfo: (info: HoverInfo | null) => void
  onSelectGate: (from: number, to: number) => void
  onToggleAll: () => void
}

export function GatesPanel({ hlZones, selZones, onHoverInfo, onSelectGate, onToggleAll }: GatesPanelProps) {
  return (
    <div className="px-3 pb-2.5 space-y-0.5">
      <button
        onClick={onToggleAll}
        className="flex items-center gap-1.5 w-full py-1 mb-0.5 transition-all hover:opacity-100"
        style={{ opacity: selZones.size > 0 ? 0.7 : 0.4 }}
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          {selZones.size === 10 ? (
            <>
              <rect x="1" y="1" width="14" height="14" rx="1" stroke="#10ff50" strokeWidth="1" fill="none" />
              <path d="M4 8L7 11L12 5" stroke="#10ff50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <rect x="1" y="1" width="14" height="14" rx="1" stroke="#555" strokeWidth="1" fill="none" />
              {selZones.size > 0 && (
                <rect x="4" y="4" width="8" height="8" rx="0.5" fill="#555" opacity="0.5" />
              )}
            </>
          )}
        </svg>
        <span className="text-[8px] tracking-[0.15em] uppercase font-mono"
          style={{ color: selZones.size === 10 ? '#10ff50' : '#555' }}
        >{selZones.size === 10 ? 'all' : selZones.size > 0 ? `${selZones.size}/10` : 'none'}</span>
      </button>
      {GATE_LIST.map(g => {
        const isHl = hlZones.has(g.from) || hlZones.has(g.to) || hlZones.has(9 - g.from)
        return (
          <div key={g.name}>
            <div
              className="flex items-center gap-2 py-0.5 cursor-pointer"
              style={{ opacity: isHl ? 1 : 0.5, transition: 'opacity 0.15s' }}
              onMouseEnter={() => onHoverInfo({ type: 'gate', gate: g })}
              onMouseLeave={() => onHoverInfo(null)}
              onClick={() => onSelectGate(g.from, g.to)}
            >
              <div className="w-1 h-3 flex-shrink-0 transition-all" style={{
                background: isHl ? '#cc44ff' : '#cc44ff44',
                boxShadow: isHl ? '0 0 4px #cc44ff66' : 'none',
              }} />
              <span style={{ color: '#cc44ff', fontSize: '10px' }}>{g.name}</span>
              <div className="flex items-center gap-0.5 text-[8px]">
                <span style={{ color: ZONE_CLR[g.from] }}>{g.from}</span>
                <span className="text-gray-700">{g.from === g.to ? '\u21BB' : '\u2192'}</span>
                <span style={{ color: ZONE_CLR[g.to] }}>{g.to}</span>
              </div>
              <span className="text-[7px] text-gray-700 ml-auto">{g.cum}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
