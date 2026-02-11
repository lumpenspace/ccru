'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

// Data
import type { Layout, Layer, Region, Pos, HoverInfo, GateRender, CurrentRender } from './data/types'
import { ZONE_REGION } from './data/zones'
import { PLANETARY_DEFAULT_ANGLE } from './data/positions'
import { CURRENTS } from './data/currents'
import { GATE_LIST } from './data/gates'

// Lib
import { midpoint, syzMidBiased, loopPath, curveAway } from './lib/geometry'
import { getAnglesForDate } from './lib/planetary'

// Hooks
import { useIntro } from './hooks/useIntro'
import { useOrbitalAnimation } from './hooks/useOrbitalAnimation'
import { useTween } from './hooks/useTween'
import { useParallax } from './hooks/useParallax'
import { usePanelDrag } from './hooks/usePanelDrag'
import { useCanvasZoom } from './hooks/useCanvasPan'

// Components
import { Button } from './components/Button'
import { ButtonSet } from './components/ButtonSet'
import { Panel } from './components/Panel'
import { Projection } from './components/projection/Projection'
import { InfoDisplay } from './components/info/InfoDisplay'
import { PinnedBackground } from './components/info/PinnedBackground'
import { LayersPanel } from './components/panels/LayersPanel'
import { RegionsPanel } from './components/panels/RegionsPanel'
import { ZonesPanel } from './components/panels/ZonesPanel'
import { SyzygiesPanel } from './components/panels/SyzygiesPanel'
import { CurrentsPanel } from './components/panels/CurrentsPanel'
import { GatesPanel } from './components/panels/GatesPanel'

/* ═══════════════════════════════════════════════════════════════
   THE NUMOGRAM — The Decimal Labyrinth (CCRU)
   ═══════════════════════════════════════════════════════════════ */

// Layout icon SVGs
function OriginalIcon({ clr }: { clr: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <polygon
        points={Array.from({ length: 10 }, (_, i) => {
          const a = (i * 36 - 90) * Math.PI / 180
          const r = i % 2 === 0 ? 11 : 5.5
          return `${12 + Math.cos(a) * r},${12 + Math.sin(a) * r}`
        }).join(' ')}
        fill="none" stroke={clr} strokeWidth="1.2" strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.5" fill={clr} opacity="0.6" />
    </svg>
  )
}
function LabyrinthIcon({ clr }: { clr: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 C18 3 21 6 21 12 C21 18 17 21 12 21 C7 21 4.5 17.5 4.5 12 C4.5 7.5 7.5 5 12 5 C16 5 18.5 7.5 18.5 12 C18.5 16 15.5 18.5 12 18.5 C8.5 18.5 7 15.5 7 12 C7 9 9 7.5 12 7.5 C14.5 7.5 16 9.5 16 12 C16 14 14 15.5 12 15.5 C10.5 15.5 9.5 14 9.5 12 C9.5 10.5 10.5 9.5 12 9.5"
        stroke={clr} strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  )
}
function LadderIcon({ clr }: { clr: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <line x1="8" y1="4" x2="8" y2="22" stroke={clr} strokeWidth="1.2" />
      <line x1="16" y1="4" x2="16" y2="22" stroke={clr} strokeWidth="1.2" />
      {[7, 11, 15, 19].map(y => (
        <line key={y} x1="8" y1={y} x2="16" y2={y} stroke={clr} strokeWidth="0.8" opacity="0.6" />
      ))}
      <path d="M8.5 3.5 Q12 0 15.5 3.5" stroke={clr} strokeWidth="0.9" fill="none" />
      <path d="M8.5 3.5 Q12 6 15.5 3.5" stroke={clr} strokeWidth="0.9" fill="none" />
      <circle cx="12" cy="3.5" r="1" fill={clr} opacity="0.7" />
    </svg>
  )
}
function PlanetaryIcon({ clr }: { clr: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke={clr} strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill={clr} opacity="0.5" />
      <line x1="12" y1="7" x2="12" y2="17" stroke={clr} strokeWidth="0.7" opacity="0.4" />
      <line x1="7" y1="12" x2="17" y2="12" stroke={clr} strokeWidth="0.7" opacity="0.4" />
      <ellipse cx="12" cy="12" rx="10.5" ry="10.5" stroke={clr} strokeWidth="0.6" strokeDasharray="2 2.5" opacity="0.5" />
      <circle cx="22" cy="10" r="1.8" fill={clr} opacity="0.6" />
    </svg>
  )
}

function OrbitIcon({ clr }: { clr: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5C16.4 5 20 8.1 20 12C20 15.9 16.4 19 12 19C7.6 19 4 15.9 4 12C4 8.1 7.6 5 12 5" stroke={clr} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M18.5 7L20 5M20 5L18 5.5M20 5L19.5 7" stroke={clr} strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill={clr} opacity="0.5" />
    </svg>
  )
}
function TodayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10.5" stroke="#555" strokeWidth="0.8" fill="none" />
      <circle cx="12" cy="12" r="7.5" stroke="#555" strokeWidth="0.6" fill="none" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        return <line key={i} x1={12 + Math.cos(a) * 7.5} y1={12 + Math.sin(a) * 7.5} x2={12 + Math.cos(a) * 10.5} y2={12 + Math.sin(a) * 10.5} stroke="#555" strokeWidth="0.6" />
      })}
      <line x1="3" y1="12" x2="21" y2="12" stroke="#555" strokeWidth="0.9" />
      <path d="M2 12L5 10.2V13.8Z" fill="#555" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="#555" strokeWidth="0.5" opacity="0.4" />
      <circle cx="12" cy="12" r="1.2" fill="#555" />
    </svg>
  )
}
function ResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12C20 16.4 16.4 20 12 20C9.2 20 6.8 18.6 5.4 16.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M4 8V12H8" stroke="#555" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
function OrbitsIcon({ clr }: { clr: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke={clr} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="12" cy="12" r="7.5" stroke={clr} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="12" cy="12" r="10.5" stroke={clr} strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill={clr} opacity="0.6" />
    </svg>
  )
}

export default function NumogramPage() {
  // ── State ──────────────────────────────────────────────────
  const [layout, setLayout] = useState<Layout>('original')
  const [layers, setLayers] = useState<Set<Layer>>(() => new Set<Layer>(['syzygies', 'currents', 'gates']))
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const [selZones, setSelZones] = useState<Set<number>>(new Set())
  const [hlRegion, setHlRegion] = useState<Region | null>(null)
  const [tcActive, setTcActive] = useState(false)
  const [hoveredLayout, setHoveredLayout] = useState<Layout | null>(null)
  const [particlesOn, setParticlesOn] = useState(false)
  const [showOrbits, setShowOrbits] = useState(true)
  const [planetDate, setPlanetDate] = useState('')
  const [pinnedInfo, setPinnedInfo] = useState<HoverInfo | null>(null)
  const [layersOpen, setLayersOpen] = useState(true)
  const [regionsOpen, setRegionsOpen] = useState(true)
  const [zonesOpen, setZonesOpen] = useState(true)
  const [syzOpen, setSyzOpen] = useState(true)
  const [currentsOpen, setCurrentsOpen] = useState(true)
  const [gatesOpen, setGatesOpen] = useState(true)

  const svgWrapRef = useRef<HTMLDivElement>(null)

  // ── Hooks ──────────────────────────────────────────────────
  const introPhase = useIntro()
  const { planetaryAngles, setPlanetaryAngles, orbiting, setOrbiting, onDateUpdateRef } = useOrbitalAnimation(layout, PLANETARY_DEFAULT_ANGLE)
  const { pos, ctr, svgHeight, planetaryPos, switchLayout } = useTween(layout, planetaryAngles)
  const parallax = useParallax(svgWrapRef)
  const { positions: panelPositions, startDrag, canvasPan, startCanvasDrag } = usePanelDrag()
  const { zoom, zoomOrigin } = useCanvasZoom(svgWrapRef)
  const orbitStartDateRef = useRef<Date | null>(null)

  // Keep orbit start date in sync
  useEffect(() => {
    if (orbiting && planetDate && !orbitStartDateRef.current) {
      orbitStartDateRef.current = new Date(planetDate + 'T12:00:00')
    }
    if (!orbiting) {
      orbitStartDateRef.current = null
    }
  }, [orbiting, planetDate])

  // Wire up the date update callback for orbital animation
  useEffect(() => {
    onDateUpdateRef.current = (elapsedYears: number) => {
      const start = orbitStartDateRef.current
      if (!start) return
      const ms = start.getTime() + elapsedYears * 365.25 * 24 * 3600 * 1000
      const d = new Date(ms)
      setPlanetDate(d.toISOString().slice(0, 10))
    }
    return () => { onDateUpdateRef.current = null }
  }, [onDateUpdateRef])

  // ── Callbacks ──────────────────────────────────────────────
  const toggleLayer = useCallback((l: Layer) => {
    setLayers(p => { const s = new Set(p); s.has(l) ? s.delete(l) : s.add(l); return s })
  }, [])

  const handleSwitchLayout = useCallback((newLayout: Layout) => {
    switchLayout()
    setLayout(newLayout)
  }, [switchLayout])

  const onHoverInfo = useCallback((info: HoverInfo | null) => setHoverInfo(info), [])
  const onPinInfo = useCallback((info: HoverInfo) => setPinnedInfo(info), [])
  const onToggleZone = useCallback((z: number) => {
    setSelZones(prev => {
      const next = new Set(prev)
      next.has(z) ? next.delete(z) : next.add(z)
      return next
    })
  }, [])

  const onToggleSyzygyPair = useCallback((a: number, b: number) => {
    setSelZones(prev => {
      const next = new Set(prev)
      if (next.has(a) && next.has(b)) { next.delete(a); next.delete(b) }
      else { next.add(a); next.add(b) }
      return next
    })
  }, [])

  const onSelectRegion = useCallback((r: Region | null) => {
    setHlRegion(r)
    setTcActive(false)
  }, [])

  const onToggleAllZones = useCallback(() => {
    setSelZones(prev => {
      if (prev.size === 10) return new Set()
      const all = new Set<number>()
      for (let z = 0; z <= 9; z++) all.add(z)
      return all
    })
    setHlRegion(null)
  }, [])

  const onToggleTC = useCallback(() => {
    setTcActive(prev => !prev)
    setHlRegion(null)
  }, [])

  const onSelectCurrent = useCallback((from: number, to: number) => {
    setSelZones(prev => {
      const next = new Set(prev)
      const partner = 9 - from
      if (next.has(from) && next.has(partner) && next.has(to)) {
        next.delete(from); next.delete(partner); next.delete(to)
      } else {
        next.add(from); next.add(partner); next.add(to)
      }
      return next
    })
  }, [])

  const onSelectGate = useCallback((from: number, to: number) => {
    setSelZones(prev => {
      const next = new Set(prev)
      const partner = 9 - from
      if (next.has(from) && next.has(partner) && next.has(to)) {
        next.delete(from); next.delete(partner); next.delete(to)
      } else {
        next.add(from); next.add(partner); next.add(to)
      }
      return next
    })
  }, [])

  // ── Computed values ────────────────────────────────────────
  const hlZones = useMemo(() => {
    if (tcActive) return new Set([1, 2, 4, 5, 7, 8])
    if (hlRegion) {
      const s = new Set<number>()
      for (let z = 0; z <= 9; z++) {
        if (ZONE_REGION[z] === hlRegion) s.add(z)
      }
      return s
    }
    const s = new Set<number>(selZones)
    if (hoverInfo) {
      switch (hoverInfo.type) {
        case 'zone': s.add(hoverInfo.zone); break
        case 'syzygy': s.add(hoverInfo.data.a); s.add(hoverInfo.data.b); break
        case 'current': {
          const c = hoverInfo.data
          s.add(c.from); s.add(9 - c.from); s.add(c.to); break
        }
        case 'gate': {
          const g = hoverInfo.gate
          s.add(g.from); s.add(9 - g.from); if (g.from !== g.to) s.add(g.to); break
        }
        case 'demon': s.add(hoverInfo.demon.a); s.add(hoverInfo.demon.b); break
      }
    }
    return s
  }, [hoverInfo, selZones, hlRegion, tcActive])

  const anyFocus = hlZones.size > 0

  const gateRenderData = useMemo(() => {
    const data: Record<string, GateRender> = {}
    const isPlanetary = layout === 'planetary'
    for (const gate of GATE_LIST) {
      if (gate.from === gate.to) {
        const pt = syzMidBiased(gate.from, pos)
        data[gate.name] = { type: 'loop', loop: loopPath(pt, pt.y > ctr.y ? 'below' : 'above') }
      } else if (layout === 'ladder') {
        const start = syzMidBiased(gate.from, pos)
        const end = pos[gate.to]
        data[gate.name] = { type: 'single', path: curveAway(start, end, ctr.x, ctr.y, 0.2) }
      } else {
        const zA = pos[gate.from]
        const zB = pos[9 - gate.from]
        const syzMid = midpoint(zA, zB)
        const dest = pos[gate.to]
        const jFrac = isPlanetary ? 0.6 : 1 / 3
        const junction = {
          x: syzMid.x + (dest.x - syzMid.x) * jFrac,
          y: syzMid.y + (dest.y - syzMid.y) * jFrac,
        }
        const legCurve = isPlanetary ? 0.35 : 0.15
        data[gate.name] = {
          type: 'ygate',
          legA: curveAway(zA, junction, ctr.x, ctr.y, legCurve),
          legB: curveAway(zB, junction, ctr.x, ctr.y, legCurve),
          stem: isPlanetary
            ? curveAway(junction, dest, ctr.x, ctr.y, 0.15)
            : `M${junction.x} ${junction.y}L${dest.x} ${dest.y}`,
          junction,
        }
      }
    }
    return data
  }, [pos, ctr, layout])

  const currentRenderData = useMemo(() => {
    const data: Record<string, CurrentRender> = {}
    const isPlanetary = layout === 'planetary'
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
        const isSelfRef = c.to === c.from || c.to === partner
        if (isSelfRef) {
          const pt = syzMidBiased(c.from, pos)
          const junction: Pos = { x: pt.x, y: pt.y + (pt.y > ctr.y ? 20 : -20) }
          const legCurve = isPlanetary ? 0.3 : 0.12
          data[c.name] = {
            type: 'loop',
            legA: curveAway(zA, junction, ctr.x, ctr.y, legCurve),
            legB: curveAway(zB, junction, ctr.x, ctr.y, legCurve),
            loop: loopPath(pt, pt.y > ctr.y ? 'below' : 'above'),
            junction,
          }
        } else {
          const jFrac = isPlanetary ? 0.55 : 0.35
          const junction: Pos = {
            x: syzMid.x + (dest.x - syzMid.x) * jFrac,
            y: syzMid.y + (dest.y - syzMid.y) * jFrac,
          }
          const legCurve = isPlanetary ? 0.3 : 0.12
          data[c.name] = {
            type: 'yshape',
            legA: curveAway(zA, junction, ctr.x, ctr.y, legCurve),
            legB: curveAway(zB, junction, ctr.x, ctr.y, legCurve),
            stem: isPlanetary
              ? curveAway(junction, dest, ctr.x, ctr.y, 0.12)
              : `M${junction.x} ${junction.y}L${dest.x} ${dest.y}`,
            junction,
          }
        }
      }
    }
    return data
  }, [pos, ctr, layout])

  const zoneOrder = useMemo(() => {
    if (layout === 'planetary') {
      // Depth-sort: lower y (farther) renders first, higher y (nearer) renders last
      return [0,1,2,3,4,5,6,7,8,9].sort((a, b) => pos[a].y - pos[b].y)
    }
    if (layout === 'labyrinth') return [6, 3, 8, 7, 1, 2, 4, 5, 9, 0]
    if (layout === 'ladder') return [4, 5, 3, 6, 2, 7, 1, 8, 0, 9]
    return [6, 3, 2, 7, 5, 4, 1, 8, 9, 0]
  }, [layout, pos])

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060609] text-gray-300 flex flex-col items-center justify-center px-4 py-8 font-mono select-none relative">

      {/* === Fixed top bar === */}
      <div className="fixed top-0 left-0 right-0 z-40 flex flex-col items-center pt-3 pb-1 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #060609 60%, transparent 100%)' }}
      >
        <div className="pointer-events-auto flex flex-col items-center">
          <ButtonSet>
            {(['original', 'labyrinth', 'ladder', 'planetary'] as Layout[]).map(l => {
              const active = layout === l
              const clr = active ? '#10ff50' : '#444'
              const icon = l === 'original' ? <OriginalIcon clr={clr} />
                : l === 'labyrinth' ? <LabyrinthIcon clr={clr} />
                : l === 'ladder' ? <LadderIcon clr={clr} />
                : <PlanetaryIcon clr={clr} />
              return (
                <Button key={l} active={active}
                  onClick={() => handleSwitchLayout(l)}
                  onMouseEnter={() => setHoveredLayout(l)}
                  onMouseLeave={() => setHoveredLayout(null)}
                >{icon}</Button>
              )
            })}
          </ButtonSet>
          <div className="h-4 flex items-center">
            {hoveredLayout && (
              <span className="text-[8px] tracking-[0.25em] uppercase font-mono"
                style={{ color: '#10ff50', textShadow: '0 0 8px rgba(16,255,80,0.4)' }}
              >{hoveredLayout}</span>
            )}
          </div>
        </div>

        {/* Planetary controls */}
        {layout === 'planetary' && (
          <div className="pointer-events-auto flex items-start gap-1.5">
            <ButtonSet cornerSize={6}>
              <Button active={orbiting} indicator onClick={() => setOrbiting(o => !o)} className="py-1.5">
                <OrbitIcon clr={orbiting ? '#10ff50' : '#555'} />
              </Button>
            </ButtonSet>
            <div className="flex flex-col items-stretch gap-1">
              <ButtonSet cornerSize={6}>
                <Button active={!!planetDate} onClick={() => {
                  setOrbiting(false)
                  const d = planetDate ? new Date(planetDate + 'T12:00:00') : new Date()
                  if (!planetDate) setPlanetDate(new Date().toISOString().slice(0, 10))
                  setPlanetaryAngles(getAnglesForDate(d))
                }} className="py-1.5">
                  <TodayIcon />
                </Button>
                <Button onClick={() => { setOrbiting(false); setPlanetaryAngles(PLANETARY_DEFAULT_ANGLE); setPlanetDate('') }} className="py-1.5">
                  <ResetIcon />
                </Button>
                <Button active={showOrbits} indicator onClick={() => setShowOrbits(o => !o)} className="py-1.5">
                  <OrbitsIcon clr={showOrbits ? '#10ff50' : '#555'} />
                </Button>
              </ButtonSet>
              {planetDate && (
                <input
                  type="date"
                  value={planetDate}
                  onChange={e => {
                    const val = e.target.value
                    setPlanetDate(val)
                    if (val) {
                      setOrbiting(false)
                      setPlanetaryAngles(getAnglesForDate(new Date(val + 'T12:00:00')))
                    }
                  }}
                  className="bg-transparent text-[10px] tracking-wider font-mono px-2 py-1 outline-none"
                  style={{
                    border: '1px solid rgba(16,255,80,0.12)',
                    color: '#10ff50',
                    clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background title layer */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-0"
        style={{
          transition: 'opacity 1.2s ease, filter 1.2s ease',
          opacity: introPhase === 'title' ? 1 : introPhase === 'fading' ? 0.06 : 0.04,
          filter: introPhase === 'title' ? 'blur(0px)' : 'blur(1px)',
        }}
      >
        <h1
          className="text-4xl md:text-6xl tracking-[0.35em] text-gray-300 uppercase font-mono"
          style={{
            textShadow: introPhase === 'title'
              ? '0 0 30px rgba(16,255,80,0.4), 0 0 60px rgba(16,255,80,0.15), 0 0 120px rgba(16,255,80,0.05)'
              : '0 0 8px rgba(16,255,80,0.1)',
            transition: 'text-shadow 1.2s ease, color 1.2s ease',
            color: introPhase === 'title' ? '#d1d5db' : '#333',
          }}
        >The Numogram</h1>
        <p
          className="text-xs md:text-sm tracking-[0.3em] mt-3 font-mono uppercase"
          style={{
            textShadow: introPhase === 'title' ? '0 0 20px rgba(16,255,80,0.25)' : 'none',
            transition: 'text-shadow 1.2s ease, color 1.2s ease',
            color: introPhase === 'title' ? '#6b7280' : '#222',
          }}
        >The Decimal Labyrinth &mdash; CCRU</p>
      </div>

      {/* Pinned background */}
      <PinnedBackground pinnedInfo={pinnedInfo} hoverInfo={hoverInfo} introPhase={introPhase} />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center w-full"
        style={{
          transition: 'opacity 1s ease',
          opacity: introPhase === 'title' ? 0 : introPhase === 'fading' ? 0.8 : 1,
        }}
      >
        <div style={{ height: layout === 'planetary' ? 72 : 48 }} />

        <div className="flex justify-center w-full" style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px)`,
        }}>
          <div ref={svgWrapRef} style={{
            transform: `translate(${parallax.x}px, ${parallax.y}px) scale(${zoom})`,
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            cursor: 'grab',
          }}
          onMouseDown={e => {
            if ((e.target as HTMLElement).tagName === 'DIV' || (e.target as SVGElement).tagName === 'svg') {
              startCanvasDrag(e)
            }
          }}>
            <Projection
              layout={layout}
              pos={pos}
              ctr={ctr}
              svgHeight={svgHeight}
              layers={layers}
              hlZones={hlZones}
              selZones={selZones}
              anyFocus={anyFocus}
              tcActive={tcActive}
              showOrbits={showOrbits}
              planetaryPos={planetaryPos}
              zoneOrder={zoneOrder}
              gateRenderData={gateRenderData}
              currentRenderData={currentRenderData}
              particlesOn={particlesOn}
              onHoverInfo={onHoverInfo}
              onPinInfo={onPinInfo}
              onToggleZone={onToggleZone}
            />
          </div>
        </div>
      </div>

      {/* === Panels === */}
      <Panel id="layers" title="Layers" position={panelPositions.layers} zIndex={40}
        open={layersOpen} onToggle={() => setLayersOpen(o => !o)} onDragStart={startDrag}>
        <LayersPanel layers={layers} toggleLayer={toggleLayer}
          particlesOn={particlesOn} onToggleParticles={() => setParticlesOn(p => !p)} />
      </Panel>

      <Panel id="zones" title="Zones" position={panelPositions.zones} zIndex={42}
        open={zonesOpen} onToggle={() => setZonesOpen(o => !o)} onDragStart={startDrag}>
        <ZonesPanel selZones={selZones} hlZones={hlZones}
          onToggleZone={onToggleZone} onToggleAll={onToggleAllZones} onHoverInfo={onHoverInfo} />
      </Panel>

      <Panel id="regions" title="Regions" position={panelPositions.regions} zIndex={41}
        open={regionsOpen} onToggle={() => setRegionsOpen(o => !o)} onDragStart={startDrag}>
        <RegionsPanel hlRegion={hlRegion} tcActive={tcActive}
          onSelectRegion={onSelectRegion} onToggleTC={onToggleTC} />
      </Panel>

      <Panel id="syz" title="Syzygies" position={panelPositions.syz} zIndex={44}
        open={syzOpen} onToggle={() => setSyzOpen(o => !o)} onDragStart={startDrag}>
        <SyzygiesPanel selZones={selZones} hlZones={hlZones}
          onToggleSyzygyPair={onToggleSyzygyPair} onHoverInfo={onHoverInfo} />
      </Panel>

      <Panel id="currents" title="Currents" position={panelPositions.currents} zIndex={43}
        open={currentsOpen} onToggle={() => setCurrentsOpen(o => !o)} onDragStart={startDrag}>
        <CurrentsPanel hlZones={hlZones} onHoverInfo={onHoverInfo}
          onSelectCurrent={onSelectCurrent} />
      </Panel>

      <Panel id="gates" title="Gates" position={panelPositions.gates} zIndex={45}
        open={gatesOpen} onToggle={() => setGatesOpen(o => !o)} onDragStart={startDrag}>
        <GatesPanel hlZones={hlZones} selZones={selZones} onHoverInfo={onHoverInfo}
          onSelectGate={onSelectGate} onToggleAll={onToggleAllZones} />
      </Panel>

      {/* === Info Display — fixed bottom-right, grows upward === */}
      <div
        className="fixed bottom-3 right-3 z-50 pointer-events-auto font-mono flex flex-col justify-end"
        style={{
          width: '30vw',
          maxHeight: '60vh',
          overflowY: 'auto',
        }}
      >
        <InfoDisplay hoverInfo={hoverInfo} pinnedInfo={pinnedInfo} />
      </div>
    </div>
  )
}
