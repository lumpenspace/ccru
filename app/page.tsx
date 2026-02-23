'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

// Data
import type { Layout, Layer, Region, Pos, HoverInfo, GateRender, CurrentRender, LabelVisibility } from './data/types'
import { ZONE_REGION } from './data/zones'
import { PLANETARY_DEFAULT_ANGLE, PLANETARY_SIZE } from './data/positions'
import { CURRENTS } from './data/currents'
import { GATE_LIST } from './data/gates'
import { SYZYGIES } from './data/syzygies'

// Lib
import { midpoint, syzMidBiased, loopPath, curveAway, quadPath } from './lib/geometry'
import { getAnglesForDate } from './lib/planetary'

// Hooks
import { useIntro } from './hooks/useIntro'
import { useOrbitalAnimation } from './hooks/useOrbitalAnimation'
import { useTween } from './hooks/useTween'
import { useParallax } from './hooks/useParallax'
import { usePanelDrag } from './hooks/usePanelDrag'
import { useCanvasZoom } from './hooks/useCanvasPan'
import { usePanelGroupLayout } from './hooks/usePanelGroupLayout'

// Components
import { Button } from './components/Button'
import { ButtonSet } from './components/ButtonSet'
import { Panel } from './components/Panel'
import { Projection } from './components/projection/Projection'
import { InfoDisplay } from './components/info/InfoDisplay'
import { PinnedBackground } from './components/info/PinnedBackground'
import { LayersPanel } from './components/panels/LayersPanel'
import { LabelsPanel } from './components/panels/LabelsPanel'
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

const MOBILE_SELECTOR_BREAKPOINT = 820
const PANEL_GROUP_ORDER = ['layers', 'labels', 'zones', 'regions', 'syz', 'currents', 'gates'] as const
type PanelId = (typeof PANEL_GROUP_ORDER)[number]
const PANEL_GROUP_DEFAULT_HEIGHTS: Record<PanelId, number> = {
  layers: 34,
  labels: 34,
  zones: 34,
  regions: 34,
  syz: 34,
  currents: 34,
  gates: 34,
}
const DEFAULT_LAYERS: Layer[] = ['syzygies', 'currents', 'gates']
const DESKTOP_PANEL_BASE_Y = 64
const DESKTOP_PANEL_GAP = 18
const DESKTOP_PANEL_LEFT_X = 12
const DESKTOP_PANEL_RIGHT_X = 216
const PANEL_WIDTH = 180
const INFO_PANEL_WIDTH = 320
const SOURCE_LINKS = [
  { label: '1', href: 'http://www.ccru.net/declab.htm' },
  { label: '2', href: 'https://socialecologies.wordpress.com/2025/08/17/the-numogram-diagram-time-circuits-and-acceleration/' },
  { label: '3', href: 'https://oh4.co/site/numogrammaticism.html' },
  { label: '4', href: 'https://drive.google.com/file/d/1ReZnkaZxsdNgEFghEZqDvpDoxhhTWHQ6/view?usp=drive_link' },
] as const

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
  const [selectionStart, setSelectionStart] = useState<Pos | null>(null)
  const [selectionNow, setSelectionNow] = useState<Pos | null>(null)
  const [layersOpen, setLayersOpen] = useState(true)
  const [labelsOpen, setLabelsOpen] = useState(true)
  const [regionsOpen, setRegionsOpen] = useState(true)
  const [zonesOpen, setZonesOpen] = useState(true)
  const [syzOpen, setSyzOpen] = useState(true)
  const [currentsOpen, setCurrentsOpen] = useState(true)
  const [gatesOpen, setGatesOpen] = useState(true)

  const svgWrapRef = useRef<HTMLDivElement>(null)
  const mobileSelectorInitRef = useRef(false)
  const selectionAdditiveRef = useRef(false)
  const suppressNextCanvasClickRef = useRef(false)
  const desktopPanelLayoutInitRef = useRef(false)
  const infoPanelInitRef = useRef(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [shareCopied, setShareCopied] = useState(false)
  const [desktopPanelHeights, setDesktopPanelHeights] = useState<Partial<Record<PanelId, number>>>({})
  const [labelVisibility, setLabelVisibility] = useState<LabelVisibility>({
    numbers: true,
    xenotation: false,
    planets: true,
  })

  // ── Hooks ──────────────────────────────────────────────────
  const introPhase = useIntro()
  const { planetaryAngles, setPlanetaryAngles, orbiting, setOrbiting, onDateUpdateRef } = useOrbitalAnimation(layout, PLANETARY_DEFAULT_ANGLE)
  const { pos, ctr, svgHeight, planetaryPos, switchLayout } = useTween(layout, planetaryAngles)
  const parallax = useParallax(svgWrapRef)
  const {
    positions: panelPositions,
    zIndexes: panelZ,
    activatePanel,
    startDrag,
    canvasPan,
    setCanvasPan,
    setPanelPositions,
    startCanvasDrag,
  } = usePanelDrag()
  const { positions: mobilePanelPositions, onItemHeight: onMobilePanelHeight } = usePanelGroupLayout<PanelId>({
    order: PANEL_GROUP_ORDER,
    defaultHeights: PANEL_GROUP_DEFAULT_HEIGHTS,
    baseX: 8,
    baseY: 64,
    gap: 6,
  })
  const { zoom, zoomOrigin, setZoom, setZoomOrigin } = useCanvasZoom(svgWrapRef)
  const orbitStartDateRef = useRef<Date | null>(null)
  const urlHydratedRef = useRef(false)
  const pendingShareSelectionRef = useRef<number[] | null>(null)

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

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  useEffect(() => {
    if (mobileSelectorInitRef.current || viewport.w <= 0) return
    mobileSelectorInitRef.current = true
    if (viewport.w <= MOBILE_SELECTOR_BREAKPOINT) {
      setLayersOpen(false)
      setLabelsOpen(false)
      setZonesOpen(false)
      setRegionsOpen(false)
      setSyzOpen(false)
      setCurrentsOpen(false)
      setGatesOpen(false)
    }
  }, [viewport.w])

  useEffect(() => {
    if (infoPanelInitRef.current) return
    if (viewport.w <= 0) return
    if (viewport.w <= MOBILE_SELECTOR_BREAKPOINT) return

    const margin = 12
    const gap = 12
    const viewW = viewport.w
    const maxLeft = Math.max(margin, viewW - INFO_PANEL_WIDTH - margin)
    const svgEl = svgWrapRef.current?.querySelector('svg')
    const svgRect = svgEl?.getBoundingClientRect()
    const rightOfDiagram = svgRect ? Math.round(svgRect.right + gap) : maxLeft
    const left = Math.max(margin, Math.min(rightOfDiagram, maxLeft))

    setPanelPositions(prev => ({
      ...prev,
      info: { x: left, y: DESKTOP_PANEL_BASE_Y },
    }))
    infoPanelInitRef.current = true
  }, [viewport.w, setPanelPositions])

  // ── Callbacks ──────────────────────────────────────────────
  const toggleLayer = useCallback((l: Layer) => {
    setLayers(p => { const s = new Set(p); s.has(l) ? s.delete(l) : s.add(l); return s })
  }, [])

  const toggleLabelVisibility = useCallback((key: keyof LabelVisibility) => {
    setLabelVisibility(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleSwitchLayout = useCallback((newLayout: Layout) => {
    switchLayout()
    setLayout(newLayout)
  }, [switchLayout])

  const onHoverInfo = useCallback((info: HoverInfo | null) => {
    setHoverInfo(info)
  }, [])
  const onPinInfo = useCallback((info: HoverInfo) => {
    setPinnedInfo(info)
    if (info.type === 'gate') {
      setSelZones(new Set<number>([info.gate.from, info.gate.to]))
    }
  }, [])
  const clearInfoFocus = useCallback(() => {
    setHoverInfo(null)
    setPinnedInfo(null)
  }, [])

  const fitSelectionToView = useCallback((zones: number[]) => {
    if (zones.length === 0) return
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
    const xs = zones.map(z => pos[z].x)
    const ys = zones.map(z => pos[z].y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const boundsW = Math.max(90, (maxX - minX) + 120)
    const boundsH = Math.max(90, (maxY - minY) + 120)
    const zoomX = 800 / boundsW
    const zoomY = svgHeight / boundsH
    const targetZoom = clamp(Math.min(zoomX, zoomY) * 0.86, 0.7, 3.8)

    setCanvasPan({ x: 0, y: 0 })
    setZoomOrigin({ x: (cx / 800) * 100, y: (cy / svgHeight) * 100 })
    setZoom(targetZoom)

    window.requestAnimationFrame(() => {
      const svgEl = svgWrapRef.current?.querySelector('svg') as SVGSVGElement | null
      const ctm = svgEl?.getScreenCTM()
      if (!svgEl || !ctm) return
      const pt = svgEl.createSVGPoint()
      pt.x = cx
      pt.y = cy
      const sp = pt.matrixTransform(ctm)
      const targetX = viewport.w <= MOBILE_SELECTOR_BREAKPOINT ? viewport.w * 0.5 : viewport.w * 0.54
      const targetY = viewport.h * 0.52
      const dx = targetX - sp.x
      const dy = targetY - sp.y
      setCanvasPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    })
  }, [pos, svgHeight, setCanvasPan, setZoomOrigin, setZoom, viewport.w, viewport.h])
  const finalizeSelection = useCallback((end: Pos) => {
    if (!selectionStart) return
    const left = Math.min(selectionStart.x, end.x)
    const right = Math.max(selectionStart.x, end.x)
    const top = Math.min(selectionStart.y, end.y)
    const bottom = Math.max(selectionStart.y, end.y)
    const w = right - left
    const h = bottom - top
    const dragLike = w >= 4 || h >= 4
    if (!dragLike) {
      setSelectionStart(null)
      setSelectionNow(null)
      return
    }

    const svgEl = svgWrapRef.current?.querySelector('svg') as SVGSVGElement | null
    const ctm = svgEl?.getScreenCTM()
    if (!svgEl || !ctm) {
      setSelectionStart(null)
      setSelectionNow(null)
      return
    }

    const selected = new Set<number>()
    for (let z = 0; z <= 9; z++) {
      const pt = svgEl.createSVGPoint()
      pt.x = pos[z].x
      pt.y = pos[z].y
      const sp = pt.matrixTransform(ctm)
      if (sp.x >= left && sp.x <= right && sp.y >= top && sp.y <= bottom) {
        selected.add(z)
      }
    }
    setSelZones(prev => {
      if (selectionAdditiveRef.current) {
        const next = new Set(prev)
        selected.forEach(z => next.add(z))
        return next
      }
      return selected
    })
    suppressNextCanvasClickRef.current = true
    setSelectionStart(null)
    setSelectionNow(null)
  }, [selectionStart, pos])

  useEffect(() => {
    if (!selectionStart) return
    const onMove = (e: MouseEvent) => {
      setSelectionNow({ x: e.clientX, y: e.clientY })
    }
    const onUp = (e: MouseEvent) => {
      finalizeSelection({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [selectionStart, finalizeSelection])

  useEffect(() => {
    if (urlHydratedRef.current) return
    if (typeof window === 'undefined') return
    urlHydratedRef.current = true

    const params = new URLSearchParams(window.location.search)
    if (!params.toString()) return

    const layoutParam = params.get('layout')
    if (layoutParam === 'original' || layoutParam === 'labyrinth' || layoutParam === 'ladder' || layoutParam === 'planetary') {
      setLayout(layoutParam)
    }

    const layersParam = params.get('layers')
    if (layersParam !== null) {
      const allowed: Layer[] = ['syzygies', 'currents', 'gates', 'pandemonium']
      const parsed = layersParam
        .split(',')
        .map(s => s.trim())
        .filter((s): s is Layer => (allowed as string[]).includes(s))
      setLayers(new Set(parsed))
    }

    const regionParam = params.get('region')
    if (regionParam === 'torque' || regionParam === 'warp' || regionParam === 'plex') {
      setHlRegion(regionParam)
    }
    setTcActive(params.get('tc') === '1')
    setParticlesOn(params.get('particles') === '1')

    const orbitsParam = params.get('orbits')
    if (orbitsParam === '0') setShowOrbits(false)
    if (orbitsParam === '1') setShowOrbits(true)

    const dateParam = params.get('date')
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setPlanetDate(dateParam)
      setOrbiting(false)
      setPlanetaryAngles(getAnglesForDate(new Date(`${dateParam}T12:00:00`)))
    }

    const selectedParam = params.get('selected')
    if (selectedParam) {
      const parsed = Array.from(new Set(
        selectedParam
          .split(',')
          .map(s => Number(s.trim()))
          .filter(n => Number.isInteger(n) && n >= 0 && n <= 9)
      )).sort((a, b) => a - b)
      if (parsed.length > 0) {
        setSelZones(new Set(parsed))
        pendingShareSelectionRef.current = parsed
      }
    }
  }, [setPlanetaryAngles, setOrbiting])

  useEffect(() => {
    const zones = pendingShareSelectionRef.current
    if (!zones || zones.length === 0) return
    if (viewport.w <= 0 || viewport.h <= 0) return
    const timer = window.setTimeout(() => {
      fitSelectionToView(zones)
      pendingShareSelectionRef.current = null
    }, 80)
    return () => window.clearTimeout(timer)
  }, [layout, viewport.w, viewport.h, fitSelectionToView])

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
    const terminals = new Set<number>([from, 9 - from, to])
    setSelZones(prev => {
      const next = new Set(prev)
      const currentSelected = Array.from(terminals).every(z => next.has(z))
      if (currentSelected) {
        terminals.forEach(z => next.delete(z))
      } else {
        terminals.forEach(z => next.add(z))
      }
      return next
    })
  }, [])

  const onSelectGate = useCallback((from: number, to: number) => {
    const terminals = new Set<number>([from, to])
    setSelZones(prev => {
      const next = new Set(prev)
      const gateSelected = Array.from(terminals).every(z => next.has(z))
      if (gateSelected) {
        terminals.forEach(z => next.delete(z))
      } else {
        terminals.forEach(z => next.add(z))
      }
      return next
    })
  }, [])

  const onClearSelection = useCallback(() => {
    setSelZones(new Set())
  }, [])

  const onRemoveSelectedInfo = useCallback((info: HoverInfo) => {
    setSelZones(prev => {
      const next = new Set(prev)
      if (info.type === 'zone') {
        next.delete(info.zone)
        return next
      }
      if (info.type === 'syzygy') {
        next.delete(info.data.a)
        next.delete(info.data.b)
        return next
      }
      if (info.type === 'current') {
        next.delete(info.data.from)
        next.delete(9 - info.data.from)
        next.delete(info.data.to)
        return next
      }
      if (info.type === 'gate') {
        next.delete(info.gate.from)
        next.delete(info.gate.to)
        return next
      }
      next.delete(info.demon.a)
      next.delete(info.demon.b)
      return next
    })
  }, [])

  const onZoneNodeClick = useCallback((zone: number) => {
    setSelZones(prev => {
      const next = new Set(prev)
      if (next.has(zone)) next.delete(zone)
      else next.add(zone)
      return next
    })
  }, [])

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null
      if (!el) return false
      if (el.isContentEditable) return true
      const tag = el.tagName
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (isTypingTarget(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()

      if (key === 'escape') {
        setSelZones(new Set())
        return
      }

      const layoutByKey: Partial<Record<string, Layout>> = {
        a: 'original',
        s: 'labyrinth',
        d: 'ladder',
        f: 'planetary',
      }
      const nextLayout = layoutByKey[key]
      if (nextLayout) {
        e.preventDefault()
        handleSwitchLayout(nextLayout)
        return
      }

      if (!/^[0-9]$/.test(key)) return
      const zone = Number(key)
      const gate = GATE_LIST.find(g => g.from === zone)
      if (!gate) return
      e.preventDefault()
      onSelectGate(gate.from, gate.to)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSwitchLayout, onSelectGate])

  // ── Computed values ────────────────────────────────────────
  const isMobile = viewport.w > 0 && viewport.w <= MOBILE_SELECTOR_BREAKPOINT
  const isDesktop = viewport.w > MOBILE_SELECTOR_BREAKPOINT
  const mobilePanelWidth = useMemo(() => {
    if (!isMobile) return PANEL_WIDTH
    return Math.max(170, Math.min(240, viewport.w - 16))
  }, [isMobile, viewport.w])
  const panelHeaderLeft = isMobile ? 8 : DESKTOP_PANEL_LEFT_X
  const panelHeaderWidth = isMobile
    ? mobilePanelWidth
    : (DESKTOP_PANEL_RIGHT_X + PANEL_WIDTH - DESKTOP_PANEL_LEFT_X)

  const onPanelHeight = useCallback((panelId: string, height: number) => {
    if (!isMobile && !isDesktop) return
    if (isMobile) {
      onMobilePanelHeight(panelId, height)
      return
    }
    if (!(panelId in PANEL_GROUP_DEFAULT_HEIGHTS)) return
    const id = panelId as PanelId
    setDesktopPanelHeights(prev => {
      if (Math.abs((prev[id] ?? 0) - height) < 0.5) return prev
      return { ...prev, [id]: height }
    })
  }, [isDesktop, isMobile, onMobilePanelHeight])

  useEffect(() => {
    if (desktopPanelLayoutInitRef.current) return
    if (!isDesktop) return

    const layersH = desktopPanelHeights.layers
    const labelsH = desktopPanelHeights.labels
    const zonesH = desktopPanelHeights.zones
    const regionsH = desktopPanelHeights.regions
    const currentsH = desktopPanelHeights.currents
    if (!(layersH && labelsH && zonesH && regionsH && currentsH)) return

    const labelsY = DESKTOP_PANEL_BASE_Y + layersH + DESKTOP_PANEL_GAP
    const zonesY = labelsY + labelsH + DESKTOP_PANEL_GAP
    const syzY = zonesY + zonesH + DESKTOP_PANEL_GAP
    const currentsY = DESKTOP_PANEL_BASE_Y + regionsH + DESKTOP_PANEL_GAP
    const gatesY = currentsY + currentsH + DESKTOP_PANEL_GAP

    setPanelPositions(prev => ({
      ...prev,
      layers: { x: DESKTOP_PANEL_LEFT_X, y: DESKTOP_PANEL_BASE_Y },
      labels: { x: DESKTOP_PANEL_LEFT_X, y: Math.round(labelsY) },
      zones: { x: DESKTOP_PANEL_LEFT_X, y: Math.round(zonesY) },
      syz: { x: DESKTOP_PANEL_LEFT_X, y: Math.round(syzY) },
      regions: { x: DESKTOP_PANEL_RIGHT_X, y: DESKTOP_PANEL_BASE_Y },
      currents: { x: DESKTOP_PANEL_RIGHT_X, y: Math.round(currentsY) },
      gates: { x: DESKTOP_PANEL_RIGHT_X, y: Math.round(gatesY) },
    }))
    desktopPanelLayoutInitRef.current = true
  }, [desktopPanelHeights, isDesktop, setPanelPositions])

  const hlZones = useMemo(() => {
    if (tcActive) return new Set([1, 2, 4, 5, 7, 8])
    if (hlRegion) {
      const s = new Set<number>()
      for (let z = 0; z <= 9; z++) {
        if (ZONE_REGION[z] === hlRegion) s.add(z)
      }
      return s
    }
    if (hoverInfo?.type === 'gate') {
      return new Set<number>([hoverInfo.gate.from, hoverInfo.gate.to])
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
        case 'demon': s.add(hoverInfo.demon.a); s.add(hoverInfo.demon.b); break
      }
    }
    return s
  }, [hoverInfo, selZones, hlRegion, tcActive])

  const selectedInfos = useMemo<HoverInfo[]>(() => {
    if (selZones.size === 0) return []
    const infos: HoverInfo[] = []
    const seen = new Set<string>()
    const pushUnique = (key: string, info: HoverInfo) => {
      if (seen.has(key)) return
      seen.add(key)
      infos.push(info)
    }

    if (layers.has('gates')) {
      for (const g of GATE_LIST) {
        if (selZones.has(g.from) && selZones.has(g.to)) {
          pushUnique(`gate:${g.name}`, { type: 'gate', gate: g })
        }
      }
    }
    if (layers.has('currents')) {
      for (const c of CURRENTS) {
        const partner = 9 - c.from
        if (selZones.has(c.from) && selZones.has(partner) && selZones.has(c.to)) {
          pushUnique(`current:${c.name}`, { type: 'current', data: c })
        }
      }
    }
    if (layers.has('syzygies')) {
      for (const s of SYZYGIES) {
        if (selZones.has(s.a) && selZones.has(s.b)) {
          pushUnique(`syzygy:${s.a}:${s.b}`, { type: 'syzygy', data: s })
        }
      }
    }
    Array.from(selZones).sort((a, b) => a - b).forEach(z => {
      pushUnique(`zone:${z}`, { type: 'zone', zone: z })
    })

    return infos
  }, [selZones, layers])

  const onShareExplanation = useCallback(async () => {
    if (selZones.size === 0) return
    const selectedIds = Array.from(selZones).sort((a, b) => a - b)
    const shareTitle = `IDS :: ${selectedIds.join(', ')}`
    const summaryBits: string[] = [
      `${selectedIds.length} selected ${selectedIds.length === 1 ? 'zone' : 'zones'}`,
      `${layout} layout`,
    ]
    if (hlRegion) summaryBits.push(`${hlRegion} region`)
    if (tcActive) summaryBits.push('tc enabled')
    if (particlesOn) summaryBits.push('particles enabled')
    if (layout === 'planetary' && planetDate) summaryBits.push(`date ${planetDate}`)
    if (layout === 'planetary' && !showOrbits) summaryBits.push('orbits hidden')
    const shareSubtitle = summaryBits.join(' · ')

    const baseParams = new URLSearchParams()
    baseParams.set('layout', layout)
    if (selectedIds.length > 0) {
      baseParams.set('selected', selectedIds.join(','))
    }
    const layerIds = Array.from(layers).sort()
    const defaultLayerIds = [...DEFAULT_LAYERS].sort()
    if (layerIds.join(',') !== defaultLayerIds.join(',')) {
      baseParams.set('layers', layerIds.join(','))
    }
    if (hlRegion) baseParams.set('region', hlRegion)
    if (tcActive) baseParams.set('tc', '1')
    if (particlesOn) baseParams.set('particles', '1')
    if (layout === 'planetary') {
      if (planetDate) baseParams.set('date', planetDate)
      if (!showOrbits) baseParams.set('orbits', '0')
    }

    let finalParams = new URLSearchParams(baseParams)
    try {
      const response = await fetch('/api/share-image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ params: Object.fromEntries(baseParams.entries()) }),
      })
      if (response.ok) {
        const data = await response.json() as { imageUrl?: unknown; canonicalQuery?: unknown }
        if (typeof data.canonicalQuery === 'string' && data.canonicalQuery.length > 0) {
          finalParams = new URLSearchParams(data.canonicalQuery)
        }
        if (typeof data.imageUrl === 'string' && data.imageUrl.length > 0) {
          finalParams.set('img', data.imageUrl)
        }
      }
    } catch {
      // Non-fatal: share still works without an uploaded preview image.
    }

    finalParams = new URLSearchParams(Array.from(finalParams.entries()).sort(([a], [b]) => a.localeCompare(b)))
    const query = finalParams.toString()
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareSubtitle, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 1200)
    } catch {
      // User-cancelled share or unavailable clipboard permissions.
    }
  }, [layout, selZones, layers, hlRegion, tcActive, particlesOn, planetDate, showOrbits])

  const anyFocus = hlZones.size > 0

  const gateRenderData = useMemo(() => {
    const data: Record<string, GateRender> = {}
    const isPlanetary = layout === 'planetary'
    const connectionVectors: Record<number, Pos> = {
      0: { x: 0, y: 0 }, 1: { x: 0, y: 0 }, 2: { x: 0, y: 0 }, 3: { x: 0, y: 0 }, 4: { x: 0, y: 0 },
      5: { x: 0, y: 0 }, 6: { x: 0, y: 0 }, 7: { x: 0, y: 0 }, 8: { x: 0, y: 0 }, 9: { x: 0, y: 0 },
    }
    const clearanceSegments: Array<{ a: Pos; b: Pos }> = []
    const connectedByZone: Record<number, Set<number>> = {
      0: new Set(), 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(),
      5: new Set(), 6: new Set(), 7: new Set(), 8: new Set(), 9: new Set(),
    }
    const gateLanes = new Map<string, { lane: number }>()
    const zoneRadius = (z: number) => (layout === 'planetary' ? PLANETARY_SIZE[z] : 21)
    const addConnected = (a: number, b: number) => {
      if (a === b) return
      connectedByZone[a].add(b)
      connectedByZone[b].add(a)
    }
    const addConnectionVector = (a: number, b: number, weight = 1) => {
      const pa = pos[a]
      const pb = pos[b]
      const dx = pb.x - pa.x
      const dy = pb.y - pa.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / len
      const uy = dy / len
      connectionVectors[a].x += ux * weight
      connectionVectors[a].y += uy * weight
      connectionVectors[b].x -= ux * weight
      connectionVectors[b].y -= uy * weight
      clearanceSegments.push({ a: pa, b: pb })
      addConnected(a, b)
    }
    for (const g of GATE_LIST) {
      if (g.from === g.to) continue
      addConnectionVector(g.from, g.to, 1.2)
    }
    for (const c of CURRENTS) {
      const partner = 9 - c.from
      const dest = (c.name === 'Warp' || c.name === 'Plex') ? Math.min(c.from, partner) : c.to
      addConnectionVector(c.from, dest, 1)
      addConnectionVector(partner, dest, 1)
    }
    for (let z = 0; z <= 4; z++) {
      addConnectionVector(z, 9 - z, 0.5)
    }
    SYZYGIES.forEach(s => addConnectionVector(s.a, s.b, 0.4))
    const gateEndpoints = (fromZone: number, toZone: number): { start: Pos; end: Pos } => {
      const from = pos[fromZone]
      const to = pos[toZone]
      const dx = to.x - from.x
      const dy = to.y - from.y
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const rFrom = zoneRadius(fromZone)
      const rTo = zoneRadius(toZone)
      if (len <= rFrom + rTo + 2) return { start: from, end: to }
      const ux = dx / len
      const uy = dy / len
      return {
        start: { x: from.x + ux * rFrom, y: from.y + uy * rFrom },
        end: { x: to.x - ux * rTo, y: to.y - uy * rTo },
      }
    }
    const selfChannelArc = (z: number): { path: string; mid: Pos } => {
      const c = pos[z]
      const r = zoneRadius(z)
      const crowdVec = connectionVectors[z]
      const crowdMag = Math.sqrt(crowdVec.x * crowdVec.x + crowdVec.y * crowdVec.y)
      const preferredOutward = crowdMag > 0.001
        ? Math.atan2(-crowdVec.y, -crowdVec.x)
        : Math.atan2(c.y - ctr.y, c.x - ctr.x)
      let nearest = Number.POSITIVE_INFINITY
      connectedByZone[z].forEach(other => {
        const p = pos[other]
        const dx = p.x - c.x
        const dy = p.y - c.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < nearest) nearest = d
      })
      const baseReach = r * (isPlanetary ? 3.4 : 3.1)
      const adaptiveReach = Number.isFinite(nearest)
        ? Math.min(r * (isPlanetary ? 6.0 : 5.0), nearest * 0.78)
        : baseReach
      const loopReach = Math.max(baseReach, adaptiveReach)
      const pointSegDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
        const dx = bx - ax
        const dy = by - ay
        const l2 = dx * dx + dy * dy
        if (l2 <= 1e-6) {
          const ddx = px - ax
          const ddy = py - ay
          return Math.sqrt(ddx * ddx + ddy * ddy)
        }
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
        const qx = ax + t * dx
        const qy = ay + t * dy
        const ddx = px - qx
        const ddy = py - qy
        return Math.sqrt(ddx * ddx + ddy * ddy)
      }
      let outward = preferredOutward
      let bestScore = -Infinity
      const radialOut = Math.atan2(c.y - ctr.y, c.x - ctr.x)
      for (let i = 0; i < 72; i++) {
        const a = -Math.PI + (i / 72) * Math.PI * 2
        const px = c.x + Math.cos(a) * loopReach
        const py = c.y + Math.sin(a) * loopReach
        let minClearance = Number.POSITIVE_INFINITY
        for (const seg of clearanceSegments) {
          const d = pointSegDist(px, py, seg.a.x, seg.a.y, seg.b.x, seg.b.y)
          if (d < minClearance) minClearance = d
        }
        const alignPreferred = Math.cos(a - preferredOutward)
        const alignRadial = Math.cos(a - radialOut)
        const score = minClearance + alignPreferred * 10 + alignRadial * 2
        if (score > bestScore) {
          bestScore = score
          outward = a
        }
      }
      const spread = Math.PI / 3 // 60° each side => 120° apart
      const startA = outward - spread
      const endA = outward + spread
      const sx = c.x + Math.cos(startA) * r
      const sy = c.y + Math.sin(startA) * r
      const ex = c.x + Math.cos(endA) * r
      const ey = c.y + Math.sin(endA) * r
      const cx = c.x + Math.cos(outward) * loopReach
      const cy = c.y + Math.sin(outward) * loopReach
      const baseMid: Pos = {
        x: (sx + 2 * cx + ex) / 4,
        y: (sy + 2 * cy + ey) / 4,
      }
      const mid: Pos = {
        x: baseMid.x + Math.cos(outward) * (isPlanetary ? r * 0.6 : r * 0.8),
        y: baseMid.y + Math.sin(outward) * (isPlanetary ? r * 0.6 : r * 0.8),
      }
      return { path: `M${sx} ${sy}Q${cx} ${cy} ${ex} ${ey}`, mid }
    }
    const concaveGatePath = (start: Pos, end: Pos, lane: number): { path: string; mid: Pos } => {
      const dx = end.x - start.x
      const dy = end.y - start.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const mx = (start.x + end.x) / 2
      const my = (start.y + end.y) / 2
      const px = -dy / dist
      const py = dx / dist
      // Force a single concave family for gates: bend away from the diagram center.
      const dot = px * (ctr.x - mx) + py * (ctr.y - my)
      const towardCenter = dot >= 0 ? 1 : -1
      const baseBulge = -towardCenter * dist * (isPlanetary ? 0.14 : 0.18)
      const laneBulge = lane * (isPlanetary ? 7 : 10)
      const bulge = baseBulge + laneBulge
      const cx = mx + px * bulge
      const cy = my + py * bulge
      return {
        path: `M${start.x} ${start.y}Q${cx} ${cy} ${end.x} ${end.y}`,
        mid: { x: (start.x + 2 * cx + end.x) / 4, y: (start.y + 2 * cy + end.y) / 4 },
      }
    }

    if (layout !== 'ladder') {
      const byDestination = new Map<number, typeof GATE_LIST>()
      for (const gate of GATE_LIST) {
        if (gate.from === gate.to) continue
        const group = byDestination.get(gate.to)
        if (group) group.push(gate)
        else byDestination.set(gate.to, [gate])
      }
      byDestination.forEach(group => {
        const ordered = [...group].sort((a, b) => a.from - b.from)
        const mid = (ordered.length - 1) / 2
        ordered.forEach((gate, index) => {
          gateLanes.set(gate.name, { lane: index - mid })
        })
      })
    }

    for (const gate of GATE_LIST) {
      if (gate.from === gate.to) {
        const selfArc = selfChannelArc(gate.from)
        data[gate.name] = { type: 'loop', loop: selfArc.path, mid: selfArc.mid }
      } else {
        const { start, end } = gateEndpoints(gate.from, gate.to)
        const lane = layout === 'ladder' ? 0 : (gateLanes.get(gate.name)?.lane ?? 0)
        const { path, mid } = concaveGatePath(start, end, lane)
        data[gate.name] = {
          type: 'single',
          path,
          mid,
        }
      }
    }
    return data
  }, [pos, ctr, layout])

  const currentRenderData = useMemo(() => {
    const data: Record<string, CurrentRender> = {}
    const isPlanetary = layout === 'planetary'
    const curveTowardCenter = (from: Pos, to: Pos, factor: number): string => {
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const mx = (from.x + to.x) / 2
      const my = (from.y + to.y) / 2
      const px = -dy / dist
      const py = dx / dist
      const dot = px * (ctr.x - mx) + py * (ctr.y - my)
      const sign = dot > 0 ? 1 : -1
      return quadPath(from, to, sign * dist * factor)
    }
    const equilateralCentroid = (a: Pos, b: Pos, preferInside: boolean): Pos => {
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const px = -dy / dist
      const py = dx / dist
      const centerDot = px * (ctr.x - mx) + py * (ctr.y - my)
      const towardCenter = centerDot >= 0 ? 1 : -1
      const side = preferInside ? towardCenter : -towardCenter
      const centroidOffset = (Math.sqrt(3) / 6) * dist
      return { x: mx + px * side * centroidOffset, y: my + py * side * centroidOffset }
    }
    const splitPairRoute = (dest: Pos, junction: Pos, bulgeFactor: number) => {
      const dx = junction.x - dest.x
      const dy = junction.y - dest.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const mx = (dest.x + junction.x) / 2
      const my = (dest.y + junction.y) / 2
      const px = -dy / dist
      const py = dx / dist
      // For the shared destination/junction segment:
      // dest->junction bends inward (concave), junction->dest bends outward (convex).
      const towardCenter = px * (ctr.x - mx) + py * (ctr.y - my) >= 0 ? 1 : -1
      const bulge = towardCenter * dist * bulgeFactor
      return {
        legToJunction: quadPath(dest, junction, bulge),
        stemToDest: quadPath(junction, dest, bulge),
      }
    }

    for (const c of CURRENTS) {
      const partner = 9 - c.from
      const lowerSyzygyZone = Math.min(c.from, partner)
      const convergesToLower = c.name === 'Warp' || c.name === 'Plex'
      const toZone = convergesToLower ? lowerSyzygyZone : c.to
      if (layout === 'ladder') {
        if (convergesToLower) {
          const zA = pos[c.from]
          const zB = pos[partner]
          const dest = pos[toZone]
          const other = c.from === toZone ? zB : zA
          const junction = equilateralCentroid(dest, other, true)
          const destIsA = c.from === toZone
          const nonDestSource = destIsA ? zB : zA
          const nonDestLeg = c.name === 'Plex' && !destIsA
            ? curveTowardCenter(nonDestSource, junction, 0.12)
            : curveAway(nonDestSource, junction, ctr.x, ctr.y, 0.12)
          const split = splitPairRoute(dest, junction, 0.24)
          data[c.name] = {
            type: 'yshape',
            legA: destIsA ? split.legToJunction : nonDestLeg,
            legB: destIsA ? nonDestLeg : split.legToJunction,
            stem: split.stemToDest,
            junction,
          }
        } else {
          const start = pos[c.from]
          const end = pos[c.to]
          const mid = midpoint(start, end)
          data[c.name] = { type: 'single', path: curveAway(start, end, ctr.x, ctr.y, 0.15), mid }
        }
      } else {
        const zA = pos[c.from]
        const zB = pos[partner]
        const syzMid = midpoint(zA, zB)
        const dest = pos[toZone]
        const isSelfRef = !convergesToLower && (c.to === c.from || c.to === partner)
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
          if (convergesToLower) {
            const destIsA = c.from === toZone
            const other = destIsA ? zB : zA
            const junction = equilateralCentroid(dest, other, true)
            const legCurve = isPlanetary ? 0.3 : 0.14
            const nonDestLeg = c.name === 'Plex' && !destIsA
              ? curveTowardCenter(other, junction, legCurve)
              : curveAway(other, junction, ctr.x, ctr.y, legCurve)
            const split = splitPairRoute(dest, junction, isPlanetary ? 0.2 : 0.3)
            data[c.name] = {
              type: 'yshape',
              legA: destIsA ? split.legToJunction : nonDestLeg,
              legB: destIsA ? nonDestLeg : split.legToJunction,
              stem: split.stemToDest,
              junction,
            }
            continue
          }
          const jFrac = isPlanetary ? 0.55 : 0.35
          const dx = dest.x - syzMid.x
          const dy = dest.y - syzMid.y
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const px = -dy / len
          const py = dx / len
          const centerDot = px * (ctr.x - syzMid.x) + py * (ctr.y - syzMid.y)
          const towardCenter = centerDot >= 0 ? 1 : -1
          const classOffset = towardCenter * (isPlanetary ? 7 : 11) // currents inside by default
          const junction: Pos = {
            x: syzMid.x + dx * jFrac + px * classOffset,
            y: syzMid.y + dy * jFrac + py * classOffset,
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

  const gateCalcFocusName = hoverInfo?.type === 'gate'
    ? hoverInfo.gate.name
    : pinnedInfo?.type === 'gate'
      ? pinnedInfo.gate.name
      : null
  const selectionRect = useMemo(() => {
    if (!selectionStart || !selectionNow) return null
    const left = Math.min(selectionStart.x, selectionNow.x)
    const top = Math.min(selectionStart.y, selectionNow.y)
    return {
      left,
      top,
      width: Math.abs(selectionNow.x - selectionStart.x),
      height: Math.abs(selectionNow.y - selectionStart.y),
    }
  }, [selectionStart, selectionNow])

  const infoPanelWidth = useMemo(() => {
    if (!isMobile) return INFO_PANEL_WIDTH
    return Math.max(240, Math.min(360, viewport.w - 16))
  }, [isMobile, viewport.w])

  const canvasCursor = useMemo(() => {
    if (selectionStart) return 'crosshair'
    return hoverInfo ? 'grab' : 'crosshair'
  }, [selectionStart, hoverInfo])

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden bg-[#060609] text-gray-300 flex flex-col items-center justify-center px-4 py-8 font-mono select-none relative">

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
        className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-[70]"
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
        >NUMOGRAM</h1>
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
            cursor: canvasCursor,
          }}
          onMouseDown={e => {
            if (e.button === 1 || e.altKey) {
              startCanvasDrag(e)
              return
            }
            if (((e.target as HTMLElement).tagName === 'DIV' || (e.target as SVGElement).tagName === 'svg') && e.button === 0) {
              selectionAdditiveRef.current = e.shiftKey
              const start = { x: e.clientX, y: e.clientY }
              setSelectionStart(start)
              setSelectionNow(start)
            }
          }}
          onClick={e => {
            if ((e.target as HTMLElement).tagName === 'DIV' || (e.target as SVGElement).tagName === 'svg') {
              if (suppressNextCanvasClickRef.current) {
                suppressNextCanvasClickRef.current = false
                return
              }
              clearInfoFocus()
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
              gateCalcFocusName={gateCalcFocusName}
              labelVisibility={labelVisibility}
              particlesOn={particlesOn}
              onHoverInfo={onHoverInfo}
              onPinInfo={onPinInfo}
              onZoneNodeClick={onZoneNodeClick}
            />
          </div>
        </div>
      </div>

      {selectionRect && (
        <div
          className="fixed pointer-events-none z-[55]"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
            border: '1px solid rgba(16,255,80,0.85)',
            background: 'rgba(16,255,80,0.12)',
            boxShadow: 'inset 0 0 10px rgba(16,255,80,0.18)',
          }}
        />
      )}

      <div
        className="fixed z-[46] font-mono pointer-events-auto"
        style={{ left: panelHeaderLeft, top: 14, width: panelHeaderWidth }}
      >
        <div
          className="px-2.5 py-1.5"
          style={{
            border: '1px solid rgba(16,255,80,0.16)',
            background: 'linear-gradient(180deg, rgba(8,12,20,0.82) 0%, rgba(4,7,13,0.9) 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[9px] tracking-[0.28em] uppercase"
              style={{ color: '#10ff50', textShadow: '0 0 6px rgba(16,255,80,0.3)' }}
            >
              Numogram
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[8px] tracking-[0.18em] uppercase text-gray-500">Sources</span>
              {SOURCE_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[8px] tracking-[0.12em] transition-opacity hover:opacity-100"
                  style={{ color: '#6b7280', opacity: 0.85 }}
                  aria-label={`Source ${link.label}`}
                >
                  [{link.label}]
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === Panels === */}
      <Panel id="layers" title="Layers"
        position={isMobile ? mobilePanelPositions.layers : panelPositions.layers}
        width={mobilePanelWidth}
        zIndex={panelZ.layers}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={layersOpen} onToggle={() => setLayersOpen(o => !o)} onDragStart={startDrag}>
        <LayersPanel layers={layers} toggleLayer={toggleLayer}
          particlesOn={particlesOn} onToggleParticles={() => setParticlesOn(p => !p)} />
      </Panel>

      <Panel id="labels" title="Labels"
        position={isMobile ? mobilePanelPositions.labels : panelPositions.labels}
        width={mobilePanelWidth}
        zIndex={panelZ.labels}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={labelsOpen} onToggle={() => setLabelsOpen(o => !o)} onDragStart={startDrag}>
        <LabelsPanel labels={labelVisibility} onToggleLabel={toggleLabelVisibility} />
      </Panel>

      <Panel id="zones" title="Zones"
        position={isMobile ? mobilePanelPositions.zones : panelPositions.zones}
        width={mobilePanelWidth}
        zIndex={panelZ.zones}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={zonesOpen} onToggle={() => setZonesOpen(o => !o)} onDragStart={startDrag}>
        <ZonesPanel selZones={selZones} hlZones={hlZones}
          onToggleZone={onToggleZone} onToggleAll={onToggleAllZones} onHoverInfo={onHoverInfo} />
      </Panel>

      <Panel id="regions" title="Regions"
        position={isMobile ? mobilePanelPositions.regions : panelPositions.regions}
        width={mobilePanelWidth}
        zIndex={panelZ.regions}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={regionsOpen} onToggle={() => setRegionsOpen(o => !o)} onDragStart={startDrag}>
        <RegionsPanel hlRegion={hlRegion} tcActive={tcActive}
          onSelectRegion={onSelectRegion} onToggleTC={onToggleTC} />
      </Panel>

      <Panel id="syz" title="Syzygies"
        position={isMobile ? mobilePanelPositions.syz : panelPositions.syz}
        width={mobilePanelWidth}
        zIndex={panelZ.syz}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={syzOpen} onToggle={() => setSyzOpen(o => !o)} onDragStart={startDrag}>
        <SyzygiesPanel selZones={selZones} hlZones={hlZones}
          onToggleSyzygyPair={onToggleSyzygyPair} onHoverInfo={onHoverInfo} />
      </Panel>

      <Panel id="currents" title="Currents"
        position={isMobile ? mobilePanelPositions.currents : panelPositions.currents}
        width={mobilePanelWidth}
        zIndex={panelZ.currents}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={currentsOpen} onToggle={() => setCurrentsOpen(o => !o)} onDragStart={startDrag}>
        <CurrentsPanel selZones={selZones} hlZones={hlZones} onHoverInfo={onHoverInfo}
          onSelectCurrent={onSelectCurrent} />
      </Panel>

      <Panel id="gates" title="Gates"
        position={isMobile ? mobilePanelPositions.gates : panelPositions.gates}
        width={mobilePanelWidth}
        zIndex={panelZ.gates}
        draggable={!isMobile}
        onHeightChange={onPanelHeight}
        onActivate={activatePanel}
        open={gatesOpen} onToggle={() => setGatesOpen(o => !o)} onDragStart={startDrag}>
        <GatesPanel hlZones={hlZones} selZones={selZones} onHoverInfo={onHoverInfo}
          onSelectGate={onSelectGate} onToggleAll={onToggleAllZones} />
      </Panel>

      {/* === Selection Panel === */}
      <Panel
        id="info"
        title="Selection"
        position={isMobile
          ? { x: 8, y: viewport.h > 0 ? Math.max(64, viewport.h - 320) : 64 }
          : panelPositions.info}
        width={infoPanelWidth}
        zIndex={panelZ.info}
        draggable={!isMobile}
        onActivate={activatePanel}
        onDragStart={startDrag}
        showToggle={false}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{ borderBottom: '1px solid rgba(16,255,80,0.12)' }}
        >
          <span
            className="text-[8px] tracking-[0.25em] uppercase"
            style={{ color: '#10ff50', textShadow: '0 0 8px rgba(16,255,80,0.25)' }}
          >
            {`Selected Elements${selectedInfos.length > 0 ? ` (${selectedInfos.length})` : ''}`}
          </span>
          <button
            className="ml-auto text-[8px] uppercase tracking-[0.15em] px-2 py-1"
            style={{
              color: selZones.size > 0 ? '#6b7280' : '#4b5563',
              border: `1px solid ${selZones.size > 0 ? 'rgba(107,114,128,0.35)' : 'rgba(75,85,99,0.25)'}`,
              background: selZones.size > 0 ? 'rgba(107,114,128,0.06)' : 'rgba(55,65,81,0.08)',
              opacity: selZones.size > 0 ? 1 : 0.45,
            }}
            onClick={onClearSelection}
            disabled={selZones.size === 0}
          >
            clear
          </button>
          <button
            className="text-[8px] uppercase tracking-[0.15em] px-2 py-1"
            style={{
              color: selZones.size > 0
                ? (shareCopied ? '#10ff50' : '#6b7280')
                : '#4b5563',
              border: `1px solid ${
                selZones.size > 0
                  ? (shareCopied ? 'rgba(16,255,80,0.35)' : 'rgba(107,114,128,0.35)')
                  : 'rgba(75,85,99,0.25)'
              }`,
              background: selZones.size > 0
                ? (shareCopied ? 'rgba(16,255,80,0.08)' : 'rgba(107,114,128,0.06)')
                : 'rgba(55,65,81,0.08)',
              opacity: selZones.size > 0 ? 1 : 0.45,
            }}
            onClick={onShareExplanation}
            disabled={selZones.size === 0}
          >
            {shareCopied ? 'copied' : 'share'}
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '52vh' }}>
          <InfoDisplay
            hoverInfo={null}
            pinnedInfo={pinnedInfo}
            selectedInfos={selectedInfos}
            onRemoveSelectedInfo={onRemoveSelectedInfo}
          />
        </div>
      </Panel>

      {/* Controls hint */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[72] pointer-events-none">
        <div
          className="px-3 py-1 text-[9px] md:text-[10px] tracking-[0.14em] uppercase font-mono text-center"
          style={{
            color: 'rgba(16,255,80,0.75)',
            background: 'linear-gradient(180deg, rgba(6,10,16,0.72) 0%, rgba(3,6,12,0.8) 100%)',
            border: '1px solid rgba(16,255,80,0.2)',
            boxShadow: '0 0 16px rgba(16,255,80,0.08)',
            whiteSpace: 'normal',
            maxWidth: 'calc(100vw - 16px)',
          }}
        >
          click + drag to select · alt + drag to move · scroll to zoom · digits to toggle gates · asdf to change view
        </div>
      </div>
    </div>
  )
}
