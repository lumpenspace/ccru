'use client'

import React, { useState, useEffect, useRef } from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR, ZONE_REGION, ZONE_META, ZONE_PARTICLE } from '../../data/zones'
import { SYZYGIES } from '../../data/syzygies'
import { GATE_LIST } from '../../data/gates'
import { ALL_DEMONS } from '../../data/demons'
import { REGION_CLR } from '../../lib/constants'

// ── CP2077 Primitives ──────────────────────────────────────────

function GlitchText({ text, color, size = 12 }: { text: string; color: string; size?: number }) {
  const [display, setDisplay] = useState(text)
  const chars = '!@#$%^&*()_+-=[]{}|;:<>?/~'
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const startTime = performance.now()
    const duration = 200
    const resolved = text.split('')

    const animate = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const resolvedCount = Math.floor(progress * resolved.length)

      const result = resolved.map((char, i) => {
        if (i < resolvedCount) return char
        return chars[Math.floor(Math.random() * chars.length)]
      }).join('')

      setDisplay(result)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [text])

  return (
    <span
      className="font-bold tracking-[0.15em] uppercase"
      style={{
        color,
        fontSize: size,
        textShadow: `0 0 8px ${color}66, 0 0 20px ${color}22`,
      }}
    >{display}</span>
  )
}

function StatusDot({ color, pulse = true }: { color: string; pulse?: boolean }) {
  return (
    <span
      className="inline-block w-[5px] h-[5px] rounded-full flex-shrink-0"
      style={{
        background: color,
        boxShadow: `0 0 4px ${color}88`,
        animation: pulse ? 'pulse-dot 2s ease-in-out infinite' : undefined,
      }}
    />
  )
}

function DataRow({ label, value, color = '#10ff50' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] font-mono">
      <div className="w-[2px] h-2.5 flex-shrink-0" style={{ background: `${color}66` }} />
      <span className="tracking-[0.12em] uppercase text-gray-600 flex-shrink-0" style={{ fontSize: 8 }}>{label}</span>
      <span className="flex-1 text-gray-700 overflow-hidden" style={{ fontSize: 7, letterSpacing: '0.15em' }}>
        {'·'.repeat(30)}
      </span>
      <span style={{ color: `${color}cc` }}>{value}</span>
    </div>
  )
}

function NeonDivider({ color = '#10ff50' }: { color?: string }) {
  return (
    <div className="my-1.5 h-[1px] relative">
      <div className="absolute inset-0" style={{
        background: `linear-gradient(90deg, transparent 0%, ${color}44 20%, ${color}22 80%, transparent 100%)`,
      }} />
    </div>
  )
}

function SectionFrame({ title, color = '#10ff50', children }: { title?: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-2 py-1">
      {/* Corner marks */}
      <div className="absolute top-0 left-0 w-2 h-[1px]" style={{ background: `${color}55` }} />
      <div className="absolute top-0 left-0 w-[1px] h-2" style={{ background: `${color}55` }} />
      <div className="absolute bottom-0 right-0 w-2 h-[1px]" style={{ background: `${color}22` }} />
      <div className="absolute bottom-0 right-0 w-[1px] h-2" style={{ background: `${color}22` }} />
      {title && (
        <div className="text-[7px] tracking-[0.2em] uppercase mb-1" style={{ color: `${color}88` }}>{title}</div>
      )}
      {children}
    </div>
  )
}

// ── Zone Info ──────────────────────────────────────────────────

function ZoneInfo({ zone }: { zone: number }) {
  const meta = ZONE_META[zone]
  const clr = ZONE_CLR[zone]
  const demons = ALL_DEMONS.filter(d => d.a === zone || d.b === zone)
  const gate = GATE_LIST.find(g => g.from === zone)
  const syz = SYZYGIES.find(s => s.a === zone || s.b === zone)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GlitchText text={`Zone ${zone}`} color={clr} />
        <StatusDot color={clr} />
        <span className="text-[8px] tracking-[0.15em] uppercase ml-auto" style={{ color: REGION_CLR[ZONE_REGION[zone]] }}>
          {ZONE_REGION[zone]}
        </span>
      </div>

      <div className="text-[9px] font-mono" style={{ color: `${clr}88` }}>{meta.planetFull}</div>
      <p className="text-[8px] text-gray-500 leading-relaxed italic">{meta.desc}</p>

      <NeonDivider color={clr} />

      <SectionFrame color={clr}>
        {syz && <DataRow label="SYZ" value={`${syz.a}+${syz.b}=9 (${syz.demon})`} color={clr} />}
        <DataRow label="PARTICLE" value={ZONE_PARTICLE[zone]} color={clr} />
        {meta.spinal && <DataRow label="MU_TANTRA" value={`${meta.spinal} spine`} color={clr} />}
        <DataRow label="MESH_TAG" value={meta.meshTag} color={clr} />
        <DataRow label="PHASE_CT" value={String(meta.phaseCount)} color={clr} />
      </SectionFrame>

      {meta.door && (
        <>
          <NeonDivider color={clr} />
          <SectionFrame title="DOOR" color={clr}>
            <div className="text-[8px] text-gray-400 italic">{meta.door}</div>
          </SectionFrame>
        </>
      )}

      {gate && (
        <>
          <NeonDivider color="#cc44ff" />
          <SectionFrame title="GATE" color="#cc44ff">
            <div className="text-[9px]">
              <span style={{ color: '#cc44ff' }}>{gate.name}</span>
              <span className="text-gray-600"> {'\u2192'} Zone {gate.to}</span>
            </div>
            <div className="text-[8px] text-gray-500 italic">{gate.desc}</div>
          </SectionFrame>
        </>
      )}

      <NeonDivider color={clr} />
      <SectionFrame title="LEMURIAN ETHNOGRAPHY" color={clr}>
        <p className="text-[8px] text-gray-600 leading-relaxed">{meta.lemurian}</p>
      </SectionFrame>

      {meta.lemurs.length > 0 && (
        <>
          <NeonDivider color={clr} />
          <SectionFrame title={`PHASE-${zone} LEMURS (${meta.phaseCount})`} color={clr}>
            <div className="space-y-0.5">
              {meta.lemurs.map(l => (
                <div key={l} className="text-[8px] italic" style={{ color: `${clr}77` }}>{l}</div>
              ))}
            </div>
          </SectionFrame>
        </>
      )}

      <div className="text-[7px] text-gray-700 pt-1 tracking-[0.1em]">
        {demons.length} DEMONS IN PANDEMONIUM
      </div>
    </div>
  )
}

// ── Syzygy Info ────────────────────────────────────────────────

function SyzygyInfo({ data }: { data: HoverInfo & { type: 'syzygy' } }) {
  const s = data.data
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GlitchText text={`Syzygy ${s.a}::${s.b}`} color="#e8e8e8" />
        <StatusDot color="#e8e8e8" />
      </div>
      <DataRow label="TWINNING" value={`${s.a} + ${s.b} = 9`} color="#e8e8e8" />
      <DataRow label="DEMON" value={s.demon} color="#e8e8e8" />
      <NeonDivider color="#e8e8e8" />
      <p className="text-[8px] text-gray-500 leading-relaxed italic">{s.desc}</p>
      <NeonDivider color="#e8e8e8" />
      <SectionFrame color="#e8e8e8">
        <div className="text-[9px]">
          <span style={{ color: ZONE_CLR[s.a] }}>Zone {s.a}</span>
          <span className="text-gray-700"> ({ZONE_META[s.a].planet}) {'\u2194'} </span>
          <span style={{ color: ZONE_CLR[s.b] }}>Zone {s.b}</span>
          <span className="text-gray-700"> ({ZONE_META[s.b].planet})</span>
        </div>
        <DataRow
          label="CURRENT_DIFF"
          value={`${s.b}\u2212${s.a}=${s.b - s.a}${s.b - s.a === s.a ? ' (self-ref)' : ` \u2192 Z${s.b - s.a}`}`}
          color="#e8e8e8"
        />
      </SectionFrame>
    </div>
  )
}

// ── Current Info ───────────────────────────────────────────────

function CurrentInfo({ data }: { data: HoverInfo & { type: 'current' } }) {
  const c = data.data
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GlitchText text={`${c.name} Current`} color="#22ee66" />
        <StatusDot color="#22ee66" />
      </div>
      <DataRow label="FORMULA" value={c.label} color="#22ee66" />
      <NeonDivider color="#22ee66" />
      <p className="text-[8px] text-gray-500 leading-relaxed italic">{c.desc}</p>
      <NeonDivider color="#22ee66" />
      <SectionFrame color="#22ee66">
        <div className="text-[9px]">
          <span className="text-gray-600">FROM: </span>
          <span style={{ color: ZONE_CLR[c.from] }}>Zone {c.from}</span>
          <span className="text-gray-700"> ({ZONE_META[c.from].planet})</span>
        </div>
        <div className="text-[9px]">
          <span className="text-gray-600">TO: </span>
          <span style={{ color: ZONE_CLR[c.to] }}>Zone {c.to}</span>
          <span className="text-gray-700"> ({ZONE_META[c.to].planet})</span>
        </div>
      </SectionFrame>
      <div className="text-[7px] text-gray-700 tracking-[0.1em]">
        TIME CIRCUIT FLOW (ANTICLOCKWISE)
      </div>
    </div>
  )
}

// ── Gate Info ──────────────────────────────────────────────────

function GateInfo({ data }: { data: HoverInfo & { type: 'gate' } }) {
  const g = data.gate
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GlitchText text={g.name} color="#cc44ff" />
        <StatusDot color="#cc44ff" />
        <span className="text-[8px] text-gray-600 ml-auto">{g.desc}</span>
      </div>
      <DataRow label="CUMULATION" value={String(g.cum)} color="#cc44ff" />
      <DataRow
        label="CHANNEL"
        value={g.from === g.to ? `Z${g.from} \u2192 self` : `Z${g.from} \u2192 Z${g.to}`}
        color="#cc44ff"
      />
      <NeonDivider color="#cc44ff" />
      <p className="text-[8px] text-gray-500 leading-relaxed italic">{g.detail}</p>
      <NeonDivider color="#cc44ff" />
      <SectionFrame color="#cc44ff">
        <div className="text-[9px]">
          <span className="text-gray-600">SOURCE SYZ: </span>
          <span style={{ color: ZONE_CLR[g.from] }}>Zone {g.from}</span>
          <span className="text-gray-700"> ({ZONE_META[g.from].planet}) {'\u2194'} </span>
          <span style={{ color: ZONE_CLR[9 - g.from] }}>Zone {9 - g.from}</span>
          <span className="text-gray-700"> ({ZONE_META[9 - g.from].planet})</span>
        </div>
        <div className="text-[9px]">
          <span className="text-gray-600">CHANNEL TO: </span>
          <span style={{ color: ZONE_CLR[g.to] }}>Zone {g.to}</span>
          <span className="text-gray-700"> ({ZONE_META[g.to].planet})</span>
        </div>
      </SectionFrame>
    </div>
  )
}

// ── Demon Info ─────────────────────────────────────────────────

function DemonInfo({ data }: { data: HoverInfo & { type: 'demon' } }) {
  const d = data.demon
  const kindClr = d.kind === 'chrono' ? '#00ccff'
    : d.kind === 'xeno' ? '#cc3333'
    : d.kind === 'amphi' ? '#cc8833' : '#e8e8e8'
  const kindDesc = d.kind === 'chrono'
    ? 'CHRONODEMON \u2014 both zones within Time Circuit'
    : d.kind === 'xeno'
    ? 'XENODEMON \u2014 both zones outside Time Circuit'
    : d.kind === 'amphi'
    ? 'AMPHIDEMON \u2014 spans TC and outer regions'
    : 'SYZYGETIC \u2014 carries a nine-sum twinning'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GlitchText text={d.name} color={kindClr} />
        <StatusDot color={kindClr} />
        <span className="text-[8px] text-gray-600 ml-auto">{d.a}::{d.b}</span>
      </div>
      <div className="text-[7px] tracking-[0.12em]" style={{ color: `${kindClr}bb` }}>{kindDesc}</div>
      <NeonDivider color={kindClr} />
      <SectionFrame color={kindClr}>
        <div className="text-[9px]">
          <span style={{ color: ZONE_CLR[d.a] }}>Zone {d.a}</span>
          <span className="text-gray-700"> ({ZONE_META[d.a].planet}) {'\u2014'} </span>
          <span style={{ color: ZONE_CLR[d.b] }}>Zone {d.b}</span>
          <span className="text-gray-700"> ({ZONE_META[d.b].planet})</span>
        </div>
      </SectionFrame>
    </div>
  )
}

// ── Main InfoDisplay ───────────────────────────────────────────

interface InfoDisplayProps {
  hoverInfo: HoverInfo | null
  pinnedInfo: HoverInfo | null
}

export function InfoDisplay({ hoverInfo, pinnedInfo }: InfoDisplayProps) {
  const info = hoverInfo || pinnedInfo

  if (!info) {
    return (
      <div className="px-3 pb-3">
        <div className="text-[8px] text-gray-700 leading-relaxed tracking-[0.08em] uppercase">
          <span style={{ color: '#10ff5044' }}>[</span>
          <span className="italic"> AWAITING INPUT </span>
          <span style={{ color: '#10ff5044' }}>]</span>
        </div>
        <div className="text-[7px] text-gray-800 mt-1 italic">
          Hover over zones, syzygies, currents, gates or demons to explore the Decimal Labyrinth.
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 pb-3">
      {info.type === 'zone' && <ZoneInfo zone={info.zone} />}
      {info.type === 'syzygy' && <SyzygyInfo data={info as HoverInfo & { type: 'syzygy' }} />}
      {info.type === 'current' && <CurrentInfo data={info as HoverInfo & { type: 'current' }} />}
      {info.type === 'gate' && <GateInfo data={info as HoverInfo & { type: 'gate' }} />}
      {info.type === 'demon' && <DemonInfo data={info as HoverInfo & { type: 'demon' }} />}
    </div>
  )
}
