'use client'

import React, { useState, useEffect } from 'react'
import type { HoverInfo } from '../../data/types'
import { ZONE_CLR, ZONE_REGION, ZONE_META, ZONE_PARTICLE } from '../../data/zones'
import { SYZYGIES } from '../../data/syzygies'
import { GATE_LIST } from '../../data/gates'
import { ALL_DEMONS } from '../../data/demons'
import { REGION_CLR } from '../../lib/constants'
import { plexExpr } from '../../lib/numogram'
import { PanelGroup } from '../panels/PanelGroup'
import type { PanelGroupItem } from '../panels/PanelGroup'
import { GlitchText } from '../ui/GlitchText'
import { StatusDot } from '../ui/StatusDot'
import { DataRow } from '../ui/DataRow'
import { NeonDivider } from '../ui/NeonDivider'
import { SectionFrame } from '../ui/SectionFrame'

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
  const plex = plexExpr(g.cum)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <GlitchText text={g.name} color="#cc44ff" />
        <StatusDot color="#cc44ff" />
        <span className="text-[8px] text-gray-600 ml-auto">{g.desc}</span>
      </div>
      <DataRow label="CUMULATION" value={String(g.cum)} color="#cc44ff" />
      {plex && (
        <DataRow label="PLEX" value={plex} color="#cc44ff" />
      )}
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
          <span className="text-gray-600">FLOW: </span>
          <span style={{ color: ZONE_CLR[g.from] }}>Zone {g.from}</span>
          <span className="text-gray-700"> ({ZONE_META[g.from].planet}) {'\u2192'} </span>
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
  selectedInfos?: HoverInfo[]
  onRemoveSelectedInfo?: (info: HoverInfo) => void
  onHoverSelectedInfo?: (info: HoverInfo | null) => void
}

function selectedInfoKey(info: HoverInfo): string {
  switch (info.type) {
    case 'zone': return `zone:${info.zone}`
    case 'syzygy': return `syzygy:${info.data.a}:${info.data.b}`
    case 'current': return `current:${info.data.name}`
    case 'gate': return `gate:${info.gate.name}`
    case 'demon': return `demon:${info.demon.a}:${info.demon.b}:${info.demon.kind}`
  }
}

function selectedInfoMeta(info: HoverInfo): { title: string; color: string } {
  switch (info.type) {
    case 'zone':
      return { title: `Zone ${info.zone}`, color: ZONE_CLR[info.zone] }
    case 'syzygy':
      return { title: `Syzygy ${info.data.a}::${info.data.b}`, color: '#e8e8e8' }
    case 'current':
      return { title: `${info.data.name} Current`, color: '#22ee66' }
    case 'gate':
      return { title: info.gate.name, color: '#cc44ff' }
    case 'demon':
      return {
        title: info.demon.name,
        color: info.demon.kind === 'chrono' ? '#00ccff'
          : info.demon.kind === 'xeno' ? '#cc3333'
          : info.demon.kind === 'amphi' ? '#cc8833' : '#e8e8e8',
      }
  }
}

function renderInfoContent(info: HoverInfo) {
  if (info.type === 'zone') return <ZoneInfo zone={info.zone} />
  if (info.type === 'syzygy') return <SyzygyInfo data={info as HoverInfo & { type: 'syzygy' }} />
  if (info.type === 'current') return <CurrentInfo data={info as HoverInfo & { type: 'current' }} />
  if (info.type === 'gate') return <GateInfo data={info as HoverInfo & { type: 'gate' }} />
  return <DemonInfo data={info as HoverInfo & { type: 'demon' }} />
}

function NumogramIntro() {
  return (
    <div className="space-y-2">
      <SectionFrame color="#10ff50">
        <p className="text-[8px] text-gray-400 leading-relaxed italic">
          The Numogram is a decimal labyrinth: ten zones (0-9), paired syzygies that sum to nine,
          and pathways that map transitions through the system.
        </p>
        <NeonDivider color="#10ff50" />
        <p className="text-[8px] text-gray-500 leading-relaxed">
          Currents track differential flows across syzygetic pairs. Gates track culminations
          (triangular sums), then reduce multi-digit values by summation to determine the
          connecting source.
        </p>
        <NeonDivider color="#10ff50" />
        <p className="text-[8px] text-gray-600 leading-relaxed">
          Use hover and selection to inspect zones, currents, gates, and demons as a navigational
          map of recursive time and drift between torque, warp, and plex.
        </p>
        <NeonDivider color="#10ff50" />
        <p className="text-[8px] text-gray-500 leading-relaxed">
          Controls: click + drag to select, alt + drag to move, scroll to zoom, digits to toggle
          gates, ASDF to change view.
        </p>
      </SectionFrame>
      <div className="text-[7px] text-gray-700 tracking-[0.1em] uppercase">
        Click empty space to return here.
      </div>
    </div>
  )
}

export function InfoDisplay({
  hoverInfo,
  pinnedInfo,
  selectedInfos = [],
  onRemoveSelectedInfo,
  onHoverSelectedInfo,
}: InfoDisplayProps) {
  const info = hoverInfo || pinnedInfo
  const selectedByKey = new Map(selectedInfos.map(si => [selectedInfoKey(si), si]))
  const selectedKeys = selectedInfos.map(selectedInfoKey)
  const selectedIdsKey = selectedKeys.join('|')
  const [orderedKeys, setOrderedKeys] = useState<string[]>([])

  useEffect(() => {
    if (selectedInfos.length === 0) {
      setOrderedKeys([])
      return
    }
    const valid = new Set(selectedKeys)
    setOrderedKeys(prev => {
      const kept = prev.filter(k => valid.has(k))
      const appended = selectedKeys.filter(k => !kept.includes(k))
      const next = [...kept, ...appended]
      if (next.length === prev.length && next.every((k, i) => k === prev[i])) return prev
      return next
    })
  }, [selectedInfos.length, selectedIdsKey])

  if (selectedInfos.length > 0) {
    const groupItems = orderedKeys.reduce<PanelGroupItem[]>((acc, key) => {
        const si = selectedByKey.get(key)
        if (!si) return acc
        const meta = selectedInfoMeta(si)
        acc.push({
          id: key,
          title: meta.title,
          color: meta.color,
          content: renderInfoContent(si),
          onRemove: onRemoveSelectedInfo ? () => onRemoveSelectedInfo(si) : undefined,
          onHoverStart: onHoverSelectedInfo ? () => onHoverSelectedInfo(si) : undefined,
          onHoverEnd: onHoverSelectedInfo ? () => onHoverSelectedInfo(null) : undefined,
        })
        return acc
      }, [])
    groupItems.unshift({
      id: 'base:numogram',
      title: 'Numogram',
      color: '#10ff50',
      content: <NumogramIntro />,
    })

    return (
      <div className="px-2 pb-2">
        <PanelGroup
          items={groupItems}
          openLastOnItemsChange
        />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="px-2 pb-2">
        <PanelGroup
          items={[{
            id: 'base:numogram',
            title: 'Numogram',
            color: '#10ff50',
            content: <NumogramIntro />,
          }]}
        />
      </div>
    )
  }

  return (
    <div className="px-3 pb-3">
      {renderInfoContent(info)}
    </div>
  )
}
