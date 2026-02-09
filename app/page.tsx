'use client'

import { useState, useCallback, useMemo } from 'react'

/* ═══════════════════════════════════════════════════════════════
   THE NUMOGRAM — The Decimal Labyrinth (CCRU)
   10 zones, 5 syzygies, 5 currents, 10 gates, 45 demons
   Three time-systems: Torque, Warp, Plex
   ═══════════════════════════════════════════════════════════════ */

type Region = 'torque' | 'warp' | 'plex'
type Pos = { x: number; y: number }
type Layout = 'labyrinth' | 'ladder' | 'original'

// ── Zone data ──────────────────────────────────────────────────
const ZONE_CLR: Record<number, string> = {
  0: '#aaaaaa', 1: '#ee44ee', 2: '#4488ff', 3: '#44cc77', 4: '#ee4444',
  5: '#ee8833', 6: '#ddcc33', 7: '#7755cc', 8: '#9944ee', 9: '#666666',
}
const ZONE_REGION: Record<number, Region> = {
  0: 'plex', 1: 'torque', 2: 'torque', 3: 'warp', 4: 'torque',
  5: 'torque', 6: 'warp', 7: 'torque', 8: 'torque', 9: 'plex',
}
const ZONE_PARTICLE: Record<number, string> = {
  0: 'eiaoung', 1: 'gl', 2: 'dt', 3: 'zx', 4: 'skr',
  5: 'ktt', 6: 'tch', 7: 'pb', 8: 'mnm', 9: 'tn',
}

// ── Position maps ─────────────────────────────────────────────

// Labyrinth: Warp top → Time Circuit hexagon → Plex bottom
const P_LABYRINTH: Record<number, Pos> = {
  6: { x: 330, y: 52 }, 3: { x: 470, y: 52 },
  8: { x: 400, y: 168 },
  7: { x: 252, y: 252 }, 1: { x: 548, y: 252 },
  2: { x: 252, y: 400 }, 4: { x: 548, y: 400 },
  5: { x: 400, y: 484 },
  9: { x: 330, y: 600 }, 0: { x: 470, y: 600 },
}

// Ladder: two columns, syzygies horizontal
const P_LADDER: Record<number, Pos> = {
  4: { x: 300, y: 100 }, 5: { x: 500, y: 100 },
  3: { x: 300, y: 220 }, 6: { x: 500, y: 220 },
  2: { x: 300, y: 340 }, 7: { x: 500, y: 340 },
  1: { x: 300, y: 460 }, 8: { x: 500, y: 460 },
  0: { x: 300, y: 580 }, 9: { x: 500, y: 580 },
}

// Original: CCRU diagram — syzygy pairs close, vertical flow
const P_ORIGINAL: Record<number, Pos> = {
  // Warp pair (top)
  3: { x: 320, y: 125 }, 6: { x: 430, y: 78 },
  // Right pair
  2: { x: 530, y: 290 }, 7: { x: 578, y: 390 },
  // Left pair
  5: { x: 260, y: 375 }, 4: { x: 190, y: 465 },
  // Center pair
  1: { x: 400, y: 545 }, 8: { x: 400, y: 650 },
  // Plex pair (bottom)
  9: { x: 400, y: 755 }, 0: { x: 400, y: 855 },
}

const CENTER: Record<Layout, Pos> = {
  labyrinth: { x: 400, y: 326 },
  ladder: { x: 400, y: 340 },
  original: { x: 400, y: 460 },
}

// ── Syzygies ─────────────────────────────────────────────────
const SYZYGIES = [
  { a: 4, b: 5, demon: 'Katak' },
  { a: 3, b: 6, demon: 'Djynxx' },
  { a: 2, b: 7, demon: 'Oddubb' },
  { a: 1, b: 8, demon: 'Murrumur' },
  { a: 0, b: 9, demon: 'Uttunul' },
]

// ── Currents (directed flows from syzygy differences) ──────────
const CURRENTS = [
  { name: 'Surge', from: 8, to: 7, label: '8−1=7' },
  { name: 'Hold', from: 2, to: 5, label: '7−2=5' },
  { name: 'Sink', from: 4, to: 1, label: '5−4=1' },
]

// ── Gates (digital cumulation) ────────────────────────────────
interface GateData {
  name: string; from: number; to: number; cum: number; desc: string
}
const GATE_LIST: GateData[] = [
  { name: 'Gt-00', from: 0, to: 0, cum: 0, desc: 'Zeroth Gate' },
  { name: 'Gt-01', from: 1, to: 1, cum: 1, desc: 'First Gate' },
  { name: 'Gt-03', from: 2, to: 3, cum: 3, desc: 'Lo-Way to the Crypt' },
  { name: 'Gt-06', from: 3, to: 6, cum: 6, desc: 'Gate to the Swirl' },
  { name: 'Gt-10', from: 4, to: 1, cum: 10, desc: 'Gate of Submergence' },
  { name: 'Gt-15', from: 5, to: 6, cum: 15, desc: 'Fifth Gate' },
  { name: 'Gt-21', from: 6, to: 3, cum: 21, desc: 'Sixth Gate' },
  { name: 'Gt-28', from: 7, to: 1, cum: 28, desc: 'Gate of Relapse' },
  { name: 'Gt-36', from: 8, to: 9, cum: 36, desc: 'Gate of Charon' },
  { name: 'Gt-45', from: 9, to: 9, cum: 45, desc: 'Gate of Pandemonium' },
]

// ── Pandemonium Matrix (all 45 demons) ─────────────────────────
const DEMON_NAMES: Record<string, string> = {
  '9:0': 'Uttunul', '8:1': 'Murrumur', '7:2': 'Oddubb', '6:3': 'Djynxx', '5:4': 'Katak',
  '1:0': 'Lurgo',
  '2:0': 'Duoddod', '2:1': 'Doogu',
  '3:0': 'Ixix', '3:1': 'Ixigool', '3:2': 'Ixidod',
  '4:0': 'Krako', '4:1': 'Sukugool', '4:2': 'Skoodu', '4:3': 'Skarkix',
  '5:0': 'Tokhatto', '5:1': 'Tukkamu', '5:2': 'Kuttadid', '5:3': 'Tikkitix',
  '6:0': 'Tchu', '6:1': 'Djungo', '6:2': 'Djuddha', '6:4': 'Tchakki', '6:5': 'Tchattuk',
  '7:0': 'Puppo', '7:1': 'Bubbamu', '7:3': 'Pabbakis', '7:4': 'Ababbatok',
  '7:5': 'Papatakoo', '7:6': 'Bobobja',
  '8:0': 'Minommo', '8:2': 'Nammamad', '8:3': 'Mummumix', '8:4': 'Numko',
  '8:5': 'Muntuk', '8:6': 'Mommoljo', '8:7': 'Mombbo',
  '9:1': 'Tuttagool', '9:2': 'Unnunddo', '9:3': 'Ununuttix', '9:4': 'Unnunaka',
  '9:5': 'Tukutu', '9:6': 'Unnutchi', '9:7': 'Nuttubab', '9:8': 'Ummnu',
}
const TC = new Set([1, 2, 4, 5, 7, 8])
interface Demon { a: number; b: number; name: string; kind: string }
const ALL_DEMONS: Demon[] = []
for (let i = 1; i < 10; i++)
  for (let j = 0; j < i; j++) {
    const key = `${i}:${j}`
    const isSyz = i + j === 9
    const kind = isSyz ? 'syzygy'
      : (TC.has(i) && TC.has(j)) ? 'chrono'
      : (!TC.has(i) && !TC.has(j)) ? 'xeno' : 'amphi'
    ALL_DEMONS.push({ a: i, b: j, name: DEMON_NAMES[key] || '?', kind })
  }

// ── Path helpers ──────────────────────────────────────────────

function midpoint(a: Pos, b: Pos): Pos {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Syzygy midpoint biased 15% toward the given zone */
function syzMidBiased(zone: number, pos: Record<number, Pos>): Pos {
  const a = pos[zone], b = pos[9 - zone]
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
  return { x: mx + (a.x - mx) * 0.15, y: my + (a.y - my) * 0.15 }
}

function quadPath(from: Pos, to: Pos, bulge: number): string {
  if (Math.abs(bulge) < 0.5) return `M${from.x} ${from.y}L${to.x} ${to.y}`
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len, py = dx / len
  return `M${from.x} ${from.y}Q${mx + px * bulge} ${my + py * bulge} ${to.x} ${to.y}`
}

function loopPath(p: Pos, dir: 'below' | 'above'): string {
  const r = 13, off = 20
  if (dir === 'below')
    return `M${p.x - r} ${p.y + off}A${r} ${r} 0 1 0 ${p.x + r} ${p.y + off}A${r} ${r} 0 1 0 ${p.x - r} ${p.y + off}`
  return `M${p.x - r} ${p.y - off}A${r} ${r} 0 1 1 ${p.x + r} ${p.y - off}A${r} ${r} 0 1 1 ${p.x - r} ${p.y - off}`
}

function curveAway(from: Pos, to: Pos, cx: number, cy: number, factor = 0.2): string {
  const dx = to.x - from.x, dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
  const px = -dy / dist, py = dx / dist
  const dot = px * (cx - mx) + py * (cy - my)
  const sign = dot > 0 ? -1 : 1
  return quadPath(from, to, sign * dist * factor)
}

/** Compute syzygy directional triangle vertices inside zone circle */
function syzTrianglePoints(zone: number, pos: Record<number, Pos>): string {
  const partner = 9 - zone
  const p = pos[zone], pp = pos[partner]
  const dx = pp.x - p.x, dy = pp.y - p.y
  const angle = Math.atan2(dy, dx)
  const tipDist = 8, baseSize = 5
  const tipX = p.x + Math.cos(angle) * tipDist
  const tipY = p.y + Math.sin(angle) * tipDist
  const b1x = p.x + Math.cos(angle + Math.PI * 0.75) * baseSize
  const b1y = p.y + Math.sin(angle + Math.PI * 0.75) * baseSize
  const b2x = p.x + Math.cos(angle - Math.PI * 0.75) * baseSize
  const b2y = p.y + Math.sin(angle - Math.PI * 0.75) * baseSize
  return `${tipX},${tipY} ${b1x},${b1y} ${b2x},${b2y}`
}

/* ═══════ COMPONENT ════════════════════════════════════════════ */

type Layer = 'syzygies' | 'currents' | 'gates' | 'pandemonium'
type HoverInfo =
  | { type: 'zone'; zone: number }
  | { type: 'syzygy'; a: number; b: number; demon: string }
  | { type: 'current'; name: string; label: string }
  | { type: 'gate'; gate: GateData }
  | { type: 'demon'; demon: Demon }

const REGION_CLR: Record<Region, string> = { torque: '#00ccff', warp: '#44cc77', plex: '#aa6633' }

export default function NumogramPage() {
  const [layout, setLayout] = useState<Layout>('original')
  const [layers, setLayers] = useState<Set<Layer>>(
    () => new Set(['syzygies', 'currents', 'gates']),
  )
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const [selZone, setSelZone] = useState<number | null>(null)

  const toggleLayer = useCallback((l: Layer) => {
    setLayers(p => { const s = new Set(p); s.has(l) ? s.delete(l) : s.add(l); return s })
  }, [])

  const pos = layout === 'labyrinth' ? P_LABYRINTH
            : layout === 'ladder' ? P_LADDER
            : P_ORIGINAL
  const ctr = CENTER[layout]
  const focusZone = (hoverInfo?.type === 'zone' ? hoverInfo.zone : null) ?? selZone
  const svgHeight = layout === 'original' ? 920 : 680

  const hlZones = useMemo(() => {
    if (!hoverInfo) return new Set<number>()
    switch (hoverInfo.type) {
      case 'zone': return new Set([hoverInfo.zone])
      case 'syzygy': return new Set([hoverInfo.a, hoverInfo.b])
      case 'current': {
        const c = CURRENTS.find(c => c.name === hoverInfo.name)
        return c ? new Set([c.from, 9 - c.from, c.to]) : new Set<number>()
      }
      case 'gate': {
        const g = hoverInfo.gate
        return g.from === g.to
          ? new Set([g.from, 9 - g.from])
          : new Set([g.from, 9 - g.from, g.to])
      }
      case 'demon': return new Set([hoverInfo.demon.a, hoverInfo.demon.b])
      default: return new Set<number>()
    }
  }, [hoverInfo])

  // Gate render data: Y-gates (original/labyrinth) or single paths (ladder)
  type GateRender =
    | { type: 'loop'; loop: string }
    | { type: 'single'; path: string }
    | { type: 'ygate'; legA: string; legB: string; stem: string; junction: Pos }
  const gateRenderData = useMemo(() => {
    const data: Record<string, GateRender> = {}
    for (const gate of GATE_LIST) {
      if (gate.from === gate.to) {
        const pt = syzMidBiased(gate.from, pos)
        data[gate.name] = { type: 'loop', loop: loopPath(pt, pt.y > ctr.y ? 'below' : 'above') }
      } else if (layout === 'ladder') {
        const start = syzMidBiased(gate.from, pos)
        const end = pos[gate.to]
        data[gate.name] = { type: 'single', path: curveAway(start, end, ctr.x, ctr.y, 0.2) }
      } else {
        // Y-gate: both syzygy zones converge at junction, then stem to destination
        const zA = pos[gate.from]
        const zB = pos[9 - gate.from]
        const syzMid = midpoint(zA, zB)
        const dest = pos[gate.to]
        const junction = {
          x: syzMid.x + (dest.x - syzMid.x) / 3,
          y: syzMid.y + (dest.y - syzMid.y) / 3,
        }
        data[gate.name] = {
          type: 'ygate',
          legA: curveAway(zA, junction, ctr.x, ctr.y, 0.15),
          legB: curveAway(zB, junction, ctr.x, ctr.y, 0.15),
          stem: `M${junction.x} ${junction.y}L${dest.x} ${dest.y}`,
          junction,
        }
      }
    }
    return data
  }, [pos, ctr, layout])

  // Current render data (Y-shape in original/labyrinth, single in ladder)
  type CurrentRender =
    | { type: 'single'; path: string; mid: Pos }
    | { type: 'yshape'; legA: string; legB: string; stem: string; junction: Pos }

  const currentRenderData = useMemo(() => {
    const data: Record<string, CurrentRender> = {}
    for (const c of CURRENTS) {
      const partner = 9 - c.from
      if (layout === 'ladder') {
        const start = pos[c.from]
        const end = pos[c.to]
        const mid = midpoint(start, end)
        data[c.name] = { type: 'single', path: curveAway(start, end, ctr.x, ctr.y, 0.15), mid }
      } else {
        const zA = pos[c.from]
        const zB = pos[partner]
        const syzMid = midpoint(zA, zB)
        const dest = pos[c.to]
        const junction = {
          x: syzMid.x + (dest.x - syzMid.x) * 0.35,
          y: syzMid.y + (dest.y - syzMid.y) * 0.35,
        }
        data[c.name] = {
          type: 'yshape',
          legA: curveAway(zA, junction, ctr.x, ctr.y, 0.12),
          legB: curveAway(zB, junction, ctr.x, ctr.y, 0.12),
          stem: `M${junction.x} ${junction.y}L${dest.x} ${dest.y}`,
          junction,
        }
      }
    }
    return data
  }, [pos, ctr, layout])

  // Warp self-referential loop (6−3=3)
  const warpLoop = useMemo(() => {
    const p3 = pos[3], p6 = pos[6]
    const [left, right] = p3.x < p6.x ? [p3, p6] : [p6, p3]
    return `M${left.x + 18} ${left.y + 10}C${left.x + 60} ${left.y + 55} ${right.x - 60} ${right.y + 55} ${right.x - 18} ${right.y + 10}`
  }, [pos])

  // Plex self-referential loop (9−0=9)
  const plexLoop = useMemo(() => {
    const p0 = pos[0], p9 = pos[9]
    const [left, right] = p0.x < p9.x ? [p0, p9] : [p9, p0]
    if (layout === 'labyrinth') {
      return `M${left.x - 18} ${left.y - 10}C${left.x - 60} ${left.y - 55} ${right.x + 60} ${right.y - 55} ${right.x + 18} ${right.y - 10}`
    }
    return `M${left.x + 18} ${left.y + 10}C${left.x + 60} ${left.y + 55} ${right.x - 60} ${right.y + 55} ${right.x - 18} ${right.y + 10}`
  }, [pos, layout])

  const zoneOrder = layout === 'labyrinth'
    ? [6, 3, 8, 7, 1, 2, 4, 5, 9, 0]
    : layout === 'ladder'
    ? [4, 5, 3, 6, 2, 7, 1, 8, 0, 9]
    : [6, 3, 2, 7, 5, 4, 1, 8, 9, 0]

  return (
    <div className="min-h-screen bg-[#060609] text-gray-300 flex flex-col items-center px-4 py-8 font-mono select-none">
      <h1 className="text-sm tracking-[0.4em] text-gray-500 uppercase">The Numogram</h1>
      <p className="text-[9px] text-gray-700 mt-1 mb-4 tracking-wide">
        The Decimal Labyrinth &mdash; CCRU
      </p>

      {/* Layout toggle */}
      <div className="flex gap-1 mb-6">
        {(['original', 'labyrinth', 'ladder'] as Layout[]).map(l => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            className={`px-3 py-1 text-[10px] tracking-wider uppercase rounded transition-colors ${
              layout === l
                ? 'bg-white/10 text-gray-300'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex gap-6 items-start">
        {/* ═══ SVG ═══ */}
        <svg viewBox={`0 0 800 ${svgHeight}`} className="w-[580px] flex-shrink-0" style={{ overflow: 'visible' }}>
          <defs>
            <filter id="gl"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="gl2"><feGaussianBlur stdDeviation="5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <marker id="arr-c" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="7" markerHeight="5" orient="auto">
              <path d="M0,0.5 L7,3 L0,5.5" fill="#22ee66" />
            </marker>
            <marker id="arr-g" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="6" markerHeight="4" orient="auto">
              <path d="M0,0.5 L7,3 L0,5.5" fill="#cc44ff" />
            </marker>
          </defs>

          {/* Region labels */}
          {layout === 'labyrinth' ? (
            <>
              <text x={400} y={20} textAnchor="middle" fill="#44cc77" fontSize="9" opacity={0.4} fontFamily="monospace">WARP</text>
              <text x={400} y={328} textAnchor="middle" fill="#00ccff" fontSize="9" opacity={0.25} fontFamily="monospace">TORQUE</text>
              <text x={400} y={648} textAnchor="middle" fill="#aa6633" fontSize="9" opacity={0.4} fontFamily="monospace">PLEX</text>
            </>
          ) : layout === 'ladder' ? (
            <>
              <text x={215} y={224} textAnchor="end" fill="#44cc77" fontSize="8" opacity={0.35} fontFamily="monospace">WARP</text>
              <text x={215} y={584} textAnchor="end" fill="#aa6633" fontSize="8" opacity={0.35} fontFamily="monospace">PLEX</text>
            </>
          ) : (
            <>
              <text x={375} y={38} textAnchor="middle" fill="#44cc77" fontSize="8" opacity={0.35} fontFamily="monospace">WARP</text>
              <text x={400} y={905} textAnchor="middle" fill="#aa6633" fontSize="8" opacity={0.35} fontFamily="monospace">PLEX</text>
            </>
          )}

          {/* ── Pandemonium layer ── */}
          {layers.has('pandemonium') && ALL_DEMONS.filter(d => d.kind !== 'syzygy').map(d => {
            const hl = hlZones.has(d.a) || hlZones.has(d.b)
            const clr = d.kind === 'chrono' ? '#00ccff' : d.kind === 'xeno' ? '#cc3333' : '#cc8833'
            return (
              <path
                key={`d-${d.a}:${d.b}`}
                d={curveAway(pos[d.a], pos[d.b], ctr.x, ctr.y, 0.25)}
                fill="none"
                stroke={clr}
                strokeWidth={hl ? 1 : 0.4}
                opacity={hl ? 0.6 : focusZone !== null ? 0.03 : 0.08}
                filter={hl ? 'url(#gl)' : undefined}
                style={{ transition: 'opacity 0.15s', cursor: 'pointer' }}
                onMouseEnter={() => setHoverInfo({ type: 'demon', demon: d })}
                onMouseLeave={() => setHoverInfo(null)}
              />
            )
          })}

          {/* ── Gates layer ── */}
          {layers.has('gates') && GATE_LIST.map(g => {
            const rd = gateRenderData[g.name]
            if (!rd) return null
            const hl = hlZones.has(g.from) || hlZones.has(g.to) || hlZones.has(9 - g.from)
            const opacity = hl ? 0.8 : focusZone !== null ? 0.08 : 0.3
            const sw = hl ? 1.2 : 0.7
            const flt = hl ? 'url(#gl)' : undefined
            const evts = {
              onMouseEnter: () => setHoverInfo({ type: 'gate', gate: g }),
              onMouseLeave: () => setHoverInfo(null),
            }

            if (rd.type === 'loop') {
              return (
                <path key={g.name} d={rd.loop} fill="none" stroke="#cc44ff"
                  strokeWidth={sw} strokeDasharray="3 2" opacity={opacity} filter={flt}
                  style={{ transition: 'opacity 0.15s', cursor: 'pointer' }} {...evts} />
              )
            }

            if (rd.type === 'single') {
              return (
                <path key={g.name} d={rd.path} fill="none" stroke="#cc44ff"
                  strokeWidth={sw} strokeDasharray="5 3" opacity={opacity} markerEnd="url(#arr-g)" filter={flt}
                  style={{ transition: 'opacity 0.15s', cursor: 'pointer' }} {...evts} />
              )
            }

            // Y-gate: two legs converge at junction, then stem to destination
            return (
              <g key={g.name} style={{ cursor: 'pointer' }} {...evts}>
                <path d={rd.legA} fill="none" stroke="#cc44ff" strokeWidth={sw * 0.8}
                  strokeDasharray="3 3" opacity={opacity * 0.7} filter={flt}
                  style={{ transition: 'opacity 0.15s' }} />
                <path d={rd.legB} fill="none" stroke="#cc44ff" strokeWidth={sw * 0.8}
                  strokeDasharray="3 3" opacity={opacity * 0.7} filter={flt}
                  style={{ transition: 'opacity 0.15s' }} />
                <path d={rd.stem} fill="none" stroke="#cc44ff" strokeWidth={sw}
                  strokeDasharray="5 3" opacity={opacity} markerEnd="url(#arr-g)" filter={flt}
                  style={{ transition: 'opacity 0.15s' }} />
              </g>
            )
          })}

          {/* ── Currents layer ── */}
          {layers.has('currents') && (
            <>
              {CURRENTS.map(c => {
                const rd = currentRenderData[c.name]
                if (!rd) return null
                const partner = 9 - c.from
                const hl = hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(partner)
                const opacity = hl ? 0.85 : focusZone !== null ? 0.08 : 0.4
                const sw = hl ? 1.8 : 1.2
                const flt = hl ? 'url(#gl)' : undefined
                const evts = {
                  onMouseEnter: () => setHoverInfo({ type: 'current', name: c.name, label: c.label }),
                  onMouseLeave: () => setHoverInfo(null),
                }

                if (rd.type === 'single') {
                  return (
                    <g key={c.name} style={{ cursor: 'pointer' }} {...evts}>
                      <path d={rd.path} fill="none" stroke="#22ee66" strokeWidth={sw}
                        opacity={opacity} markerEnd="url(#arr-c)" filter={flt}
                        style={{ transition: 'opacity 0.15s' }} />
                      <circle cx={rd.mid.x} cy={rd.mid.y} r={hl ? 4 : 3}
                        fill="#ffffff" stroke="#22ee66" strokeWidth={0.6}
                        opacity={opacity * 0.9} style={{ transition: 'opacity 0.15s' }} />
                    </g>
                  )
                }

                return (
                  <g key={c.name} style={{ cursor: 'pointer' }} {...evts}>
                    <path d={rd.legA} fill="none" stroke="#22ee66" strokeWidth={sw * 0.7}
                      opacity={opacity * 0.7} filter={flt}
                      style={{ transition: 'opacity 0.15s' }} />
                    <path d={rd.legB} fill="none" stroke="#22ee66" strokeWidth={sw * 0.7}
                      opacity={opacity * 0.7} filter={flt}
                      style={{ transition: 'opacity 0.15s' }} />
                    <circle cx={rd.junction.x} cy={rd.junction.y} r={hl ? 5 : 3.5}
                      fill="#ffffff" stroke="#22ee66" strokeWidth={0.8}
                      opacity={opacity} style={{ transition: 'opacity 0.15s' }} />
                    <path d={rd.stem} fill="none" stroke="#22ee66" strokeWidth={sw}
                      opacity={opacity} markerEnd="url(#arr-c)" filter={flt}
                      style={{ transition: 'opacity 0.15s' }} />
                  </g>
                )
              })}
              {/* Warp self-referential (6−3=3) */}
              <path
                d={warpLoop} fill="none" stroke="#44cc77" strokeWidth={1.2}
                opacity={hlZones.has(3) || hlZones.has(6) ? 0.7 : focusZone !== null ? 0.08 : 0.3}
                style={{ transition: 'opacity 0.15s' }}
              />
              <text
                x={(pos[3].x + pos[6].x) / 2}
                y={Math.max(pos[3].y, pos[6].y) + 62}
                textAnchor="middle" fill="#44cc77" fontSize="7" opacity={0.3} fontFamily="monospace"
              >6−3=3</text>
              {/* Plex self-referential (9−0=9) */}
              <path
                d={plexLoop} fill="none" stroke="#aa6633" strokeWidth={1.2}
                opacity={hlZones.has(9) || hlZones.has(0) ? 0.7 : focusZone !== null ? 0.08 : 0.3}
                style={{ transition: 'opacity 0.15s' }}
              />
              <text
                x={(pos[9].x + pos[0].x) / 2}
                y={layout === 'labyrinth'
                  ? Math.min(pos[9].y, pos[0].y) - 58
                  : Math.max(pos[9].y, pos[0].y) + 62}
                textAnchor="middle" fill="#aa6633" fontSize="7" opacity={0.3} fontFamily="monospace"
              >9−0=9</text>
            </>
          )}

          {/* Current labels */}
          {layers.has('currents') && CURRENTS.map(c => {
            const rd = currentRenderData[c.name]
            if (!rd) return null
            const labelPos = rd.type === 'yshape' ? rd.junction : rd.mid
            const dest = pos[c.to]
            const dx = dest.x - labelPos.x, dy = dest.y - labelPos.y
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const off = rd.type === 'yshape' ? 16 : 14
            return (
              <text
                key={`cl-${c.name}`}
                x={labelPos.x + (-dy / len) * off}
                y={labelPos.y + (dx / len) * off + 1}
                textAnchor="middle"
                fill="#22ee66"
                fontSize="7"
                opacity={0.4}
                fontFamily="monospace"
                style={{ pointerEvents: 'none' }}
              >
                {c.name}
              </text>
            )
          })}

          {/* ── Syzygies layer (dots in all modes) ── */}
          {layers.has('syzygies') && SYZYGIES.map(s => {
            const hl = hlZones.has(s.a) || hlZones.has(s.b)
            const pa = pos[s.a], pb = pos[s.b]
            const dx = pb.x - pa.x, dy = pb.y - pa.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const r = 21 // zone circle radius
            const startT = dist > 0 ? r / dist : 0
            const endT = dist > 0 ? 1 - r / dist : 1
            const span = endT - startT
            const numDots = Math.max(3, Math.min(10, Math.round(dist / 30)))

            return (
              <g
                key={`s-${s.a}:${s.b}`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverInfo({ type: 'syzygy', a: s.a, b: s.b, demon: s.demon })}
                onMouseLeave={() => setHoverInfo(null)}
              >
                {/* Invisible hit area */}
                <line
                  x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke="transparent" strokeWidth={14}
                />
                {Array.from({ length: numDots }, (_, i) => {
                  const t = startT + span * (i + 1) / (numDots + 1)
                  const x = pa.x + dx * t
                  const y = pa.y + dy * t
                  const dotR = 1.0 + (t - startT) / span * 1.5
                  return (
                    <circle
                      key={i}
                      cx={x} cy={y} r={dotR}
                      fill="#e8e8e8"
                      opacity={hl ? 0.7 : focusZone !== null ? 0.1 : 0.3}
                      style={{ transition: 'opacity 0.15s' }}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* ── Zone nodes ── */}
          {zoneOrder.map(z => {
            const p = pos[z]
            const clr = ZONE_CLR[z]
            const act = focusZone === z
            const hl = hlZones.has(z)
            const region = ZONE_REGION[z]

            return (
              <g
                key={z}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoverInfo({ type: 'zone', zone: z })}
                onMouseLeave={() => setHoverInfo(null)}
                onClick={() => setSelZone(v => v === z ? null : z)}
              >
                {act && (
                  <circle cx={p.x} cy={p.y} r={28} fill="none" stroke={clr} strokeWidth={0.5} opacity={0.3} filter="url(#gl2)" />
                )}
                <circle
                  cx={p.x} cy={p.y} r={21}
                  fill={`${clr}18`}
                  stroke={act || hl ? clr : `${clr}44`}
                  strokeWidth={act ? 1.6 : hl ? 1.2 : 0.7}
                />
                {/* Directional triangle pointing toward syzygy partner */}
                <polygon
                  points={syzTrianglePoints(z, pos)}
                  fill={clr}
                  opacity={act || hl ? 0.5 : 0.2}
                  style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
                />
                <text
                  x={p.x} y={p.y + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill={act || hl ? clr : `${clr}aa`}
                  fontSize="17" fontWeight="bold" fontFamily="monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {z}
                </text>
                {/* Region dot */}
                <circle
                  cx={p.x} cy={p.y + 28} r={2}
                  fill={REGION_CLR[region]}
                  opacity={0.3}
                />
              </g>
            )
          })}

          {/* Gate cumulation labels (original/labyrinth — near junction) */}
          {layout !== 'ladder' && layers.has('gates') && GATE_LIST.filter(g => g.from !== g.to).map(g => {
            const rd = gateRenderData[g.name]
            if (!rd || rd.type !== 'ygate') return null
            const j = rd.junction
            return (
              <g key={`gl-${g.name}`} style={{ pointerEvents: 'none' }}>
                <circle cx={j.x} cy={j.y} r={7} fill="#06060988" />
                <text x={j.x} y={j.y + 1} textAnchor="middle" dominantBaseline="central" fill="#cc44ff" fontSize="7" fontFamily="monospace" fontStyle="italic" opacity={0.6}>
                  {g.cum}
                </text>
              </g>
            )
          })}
        </svg>

        {/* ═══ Right Panel ═══ */}
        <div className="flex flex-col gap-3 min-w-[160px] max-w-[180px] pt-1 text-[10px]">
          {/* Layers */}
          <div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] mb-2 uppercase">Layers</p>
            {([
              { id: 'syzygies' as Layer, label: 'Syzygies', clr: '#e8e8e8' },
              { id: 'currents' as Layer, label: 'Currents', clr: '#22ee66' },
              { id: 'gates' as Layer, label: 'Gates', clr: '#cc44ff' },
              { id: 'pandemonium' as Layer, label: 'Pandemonium', clr: '#cc3333' },
            ]).map(l => (
              <div
                key={l.id}
                className="flex items-center gap-2 py-0.5 cursor-pointer"
                style={{ opacity: layers.has(l.id) ? 1 : 0.25, transition: 'opacity 0.15s' }}
                onClick={() => toggleLayer(l.id)}
              >
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: l.clr }} />
                <span className="text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Regions */}
          <div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] mb-2 uppercase">Regions</p>
            <div className="space-y-1 text-gray-500">
              <div><span style={{ color: '#00ccff' }}>Torque</span> <span className="text-gray-700">1 2 4 5 7 8</span></div>
              <div><span style={{ color: '#44cc77' }}>Warp</span> <span className="text-gray-700">3 6</span></div>
              <div><span style={{ color: '#aa6633' }}>Plex</span> <span className="text-gray-700">0 9</span></div>
            </div>
          </div>

          {/* Time Circuit */}
          <div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] mb-1.5 uppercase">Time Circuit</p>
            <p className="text-gray-600 leading-relaxed">1→8→7→2→5→4→1</p>
            <p className="text-gray-700 text-[9px] mt-0.5">anticlockwise</p>
          </div>

          {/* Info panel */}
          {hoverInfo && (
            <div className="p-2.5 border border-gray-800/60 rounded leading-relaxed text-gray-500 space-y-0.5">
              {hoverInfo.type === 'zone' && (() => {
                const z = hoverInfo.zone
                const demons = ALL_DEMONS.filter(d => d.a === z || d.b === z)
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold" style={{ color: ZONE_CLR[z] }}>Zone {z}</span>
                      <span className="text-gray-700 text-[9px]">{ZONE_REGION[z]}</span>
                    </div>
                    <div className="text-gray-600">Syzygy: {z} ↔ {9 - z}</div>
                    <div className="text-gray-600">Particle: <span className="text-gray-400 italic">{ZONE_PARTICLE[z]}</span></div>
                    <div className="text-gray-700 text-[9px] mt-1">{demons.length} demons</div>
                  </>
                )
              })()}
              {hoverInfo.type === 'syzygy' && (
                <>
                  <div>Syzygy <span className="text-white font-bold">{hoverInfo.a}::{hoverInfo.b}</span></div>
                  <div>Demon: <span className="text-gray-300 italic">{hoverInfo.demon}</span></div>
                  <div className="text-gray-700 text-[9px]">{hoverInfo.a}+{hoverInfo.b}=9</div>
                </>
              )}
              {hoverInfo.type === 'current' && (
                <>
                  <div>Current: <span className="text-white font-bold" style={{ color: '#22ee66' }}>{hoverInfo.name}</span></div>
                  <div className="text-gray-600">{hoverInfo.label}</div>
                </>
              )}
              {hoverInfo.type === 'gate' && (
                <>
                  <div>
                    <span className="text-white font-bold" style={{ color: '#cc44ff' }}>{hoverInfo.gate.name}</span>
                    <span className="text-gray-700 ml-2">{hoverInfo.gate.from}→{hoverInfo.gate.to}</span>
                  </div>
                  <div className="text-gray-400 italic">{hoverInfo.gate.desc}</div>
                  <div className="text-gray-700 text-[9px]">Σ = {hoverInfo.gate.cum}</div>
                </>
              )}
              {hoverInfo.type === 'demon' && (
                <>
                  <div>
                    <span className="text-gray-300 italic">{hoverInfo.demon.name}</span>
                    <span className="text-gray-700 ml-2">{hoverInfo.demon.a}::{hoverInfo.demon.b}</span>
                  </div>
                  <div className="text-gray-700">{hoverInfo.demon.kind}demon</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
