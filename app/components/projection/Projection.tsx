'use client'

import React from 'react'
import type { Layout, Layer, Pos, HoverInfo, GateRender, CurrentRender, LabelVisibility } from '../../data/types'
import { ZONE_CLR, ZONE_REGION, ZONE_META, PLANET_SYMBOL } from '../../data/zones'
import { PLANETARY_CX, PLANETARY_CY, PLANETARY_SIZE } from '../../data/positions'
import { SYZYGIES } from '../../data/syzygies'
import { CURRENTS } from '../../data/currents'
import { GATE_LIST } from '../../data/gates'
import { ALL_DEMONS } from '../../data/demons'
import { REGION_CLR, TC_EDGES, TC_CURRENTS, TC_SYZYGIES } from '../../lib/constants'
import { curveAway, syzMidBiased, syzTrianglePoints, midpoint } from '../../lib/geometry'
import { formatXenotationForDisplay } from '../../lib/xenotation'

interface ProjectionProps {
  layout: Layout
  pos: Record<number, Pos>
  ctr: Pos
  svgHeight: number
  layers: Set<Layer>
  hlZones: Set<number>
  selZones: Set<number>
  anyFocus: boolean
  tcActive: boolean
  showOrbits: boolean
  planetaryPos: Record<number, Pos>
  zoneOrder: number[]
  gateRenderData: Record<string, GateRender>
  currentRenderData: Record<string, CurrentRender>
  gateCalcFocusName: string | null
  labelVisibility: LabelVisibility
  particlesOn: boolean
  onHoverInfo: (info: HoverInfo | null) => void
  onPinInfo: (info: HoverInfo) => void
  onZoneNodeClick: (zone: number) => void
}

export const Projection = React.memo(function Projection({
  layout, pos, ctr, svgHeight, layers, hlZones, selZones, anyFocus,
  tcActive, showOrbits, planetaryPos, zoneOrder, gateRenderData,
  currentRenderData, gateCalcFocusName, labelVisibility, particlesOn, onHoverInfo, onPinInfo, onZoneNodeClick,
}: ProjectionProps) {

  const isPlanetary = layout === 'planetary'
  const sunClr = ZONE_CLR[0]
  // In planetary mode, reduce unfocused path opacity to cut visual clutter
  const dimOpacity = isPlanetary ? 0.03 : 0.08
  const getCurrentDestZone = (from: number, to: number, name: string) => (
    name === 'Warp' || name === 'Plex' ? Math.min(from, 9 - from) : to
  )
  const plexExpr = (cum: number): string | null => {
    if (cum < 10) return null
    let current = cum
    let expr = ''
    let first = true
    while (current >= 10) {
      const digits = String(current).split('').map(d => Number(d))
      const sum = digits.reduce((acc, d) => acc + d, 0)
      if (first) {
        expr = `${digits.join('+')}=${sum}`
        first = false
      } else {
        expr += `=${sum}`
      }
      current = sum
    }
    return expr
  }
  const pathTerminals = (d: string): { start: Pos; end: Pos } | null => {
    const nums = d.match(/-?\d*\.?\d+/g)
    if (!nums || nums.length < 4) return null
    const vals = nums.map(Number)
    return {
      start: { x: vals[0], y: vals[1] },
      end: { x: vals[vals.length - 2], y: vals[vals.length - 1] },
    }
  }
  const pickClosestPathHalf = (paths: string[], zone: number): { path: string; fromStart: boolean } | null => {
    const target = pos[zone]
    let best: { path: string; fromStart: boolean; dist: number } | null = null
    for (const d of paths) {
      const t = pathTerminals(d)
      if (!t) continue
      const ds = (t.start.x - target.x) ** 2 + (t.start.y - target.y) ** 2
      const de = (t.end.x - target.x) ** 2 + (t.end.y - target.y) ** 2
      const candidate = ds <= de
        ? { path: d, fromStart: true, dist: ds }
        : { path: d, fromStart: false, dist: de }
      if (!best || candidate.dist < best.dist) best = candidate
    }
    return best ? { path: best.path, fromStart: best.fromStart } : null
  }
  const gradientVectorForPath = (d: string, fromStart: boolean): { from: Pos; to: Pos } | null => {
    const t = pathTerminals(d)
    if (!t) return null
    return fromStart
      ? { from: t.start, to: t.end }
      : { from: t.end, to: t.start }
  }

  return (
    <svg viewBox={`0 0 800 ${svgHeight}`} className="w-[580px] flex-shrink-0" style={{ overflow: 'visible' }}>
      <defs>
        <filter id="gl"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="gl2"><feGaussianBlur stdDeviation="5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <marker id="arr-c" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="9" markerHeight="7" orient="auto">
          <path d="M0,0.5 L7,3 L0,5.5" fill="#22ee66" />
        </marker>
        <marker id="arr-g" viewBox="0 0 8 6" refX="7" refY="3" markerWidth="8" markerHeight="6" orient="auto">
          <path d="M0,0.5 L7,3 L0,5.5" fill="#cc44ff" />
        </marker>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="sphere-0" cx="42%" cy="42%" r="55%" fx="38%" fy="38%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="10%" stopColor="#eeeeee" />
          <stop offset="28%" stopColor={sunClr} />
          <stop offset="62%" stopColor={sunClr} stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2b2b2b" />
        </radialGradient>
        <radialGradient id="sun-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sunClr} stopOpacity="0.35" />
          <stop offset="40%" stopColor={sunClr} stopOpacity="0.1" />
          <stop offset="100%" stopColor={sunClr} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sunClr} stopOpacity="0.45" />
          <stop offset="50%" stopColor={sunClr} stopOpacity="0.12" />
          <stop offset="100%" stopColor={sunClr} stopOpacity="0" />
        </radialGradient>
        {layout === 'planetary' && [1,2,3,4,5,6,7,8,9].map(z => {
          const pp = planetaryPos[z]
          const dx = PLANETARY_CX - pp.x
          const dy = PLANETARY_CY - pp.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = dx / dist, ny = dy / dist
          const fxP = 50 + nx * 35, fyP = 50 + ny * 35
          const clr = ZONE_CLR[z]
          return (
            <radialGradient key={`sphere-${z}`} id={`sphere-${z}`}
              cx="50%" cy="50%" r="50%" fx={`${fxP}%`} fy={`${fyP}%`}>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="8%" stopColor="#ffffee" stopOpacity="0.95" />
              <stop offset="22%" stopColor={clr} stopOpacity="0.95" />
              <stop offset="50%" stopColor={clr} stopOpacity="0.55" />
              <stop offset="75%" stopColor="#111111" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0.98" />
            </radialGradient>
          )
        })}
      </defs>

      {/* Region labels */}
      <RegionLabels layout={layout} showOrbits={showOrbits} />

      {/* Pandemonium layer */}
      {layers.has('pandemonium') && !tcActive && ALL_DEMONS.filter(d => d.kind !== 'syzygy').map(d => {
        const hl = hlZones.has(d.a) || hlZones.has(d.b)
        const clr = d.kind === 'chrono' ? '#00ccff' : d.kind === 'xeno' ? '#cc3333' : '#cc8833'
        const pathD = curveAway(pos[d.a], pos[d.b], ctr.x, ctr.y, 0.25)
        return (
          <g key={`d-${d.a}:${d.b}`}>
            <path d={pathD} fill="none" stroke={clr}
              strokeWidth={hl ? 1 : 0.4}
              opacity={hl ? 0.6 : anyFocus ? 0.03 : (isPlanetary ? 0.06 : 0.15)}
              filter={hl ? 'url(#gl)' : undefined}
              style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
            <path d={pathD} fill="none" stroke="transparent" strokeWidth={12}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHoverInfo({ type: 'demon', demon: d })}
              onMouseLeave={() => onHoverInfo(null)}
              onClick={() => onPinInfo({ type: 'demon', demon: d })} />
          </g>
        )
      })}

      {/* Gates layer */}
      {layers.has('gates') && !tcActive && GATE_LIST.map(g => {
        const rd = gateRenderData[g.name]
        if (!rd) return null
        const fromSel = selZones.has(g.from)
        const toSel = selZones.has(g.to)
        const selectedCount = g.from === g.to
          ? (fromSel ? 1 : 0)
          : (fromSel ? 1 : 0) + (toSel ? 1 : 0)
        const terminalCount = g.from === g.to ? 1 : 2
        const partialSel = selectedCount > 0 && selectedCount < terminalCount
        const hl = hlZones.has(g.from) || hlZones.has(g.to)
        const fullHl = hl && !partialSel
        const opacity = fullHl ? 0.8 : anyFocus ? dimOpacity : (isPlanetary ? 0.25 : 0.5)
        const sw = fullHl ? 1.2 : 0.7
        const flt = fullHl ? 'url(#gl)' : undefined
        const evts = {
          onMouseEnter: () => onHoverInfo({ type: 'gate', gate: g }),
          onMouseLeave: () => onHoverInfo(null),
          onClick: () => onPinInfo({ type: 'gate', gate: g }),
        }

        if (rd.type === 'loop') {
          return (
            <g key={g.name}>
              <path d={rd.loop} fill="none" stroke="#cc44ff"
                strokeWidth={sw} strokeDasharray="3 2" opacity={opacity} markerEnd="url(#arr-g)" filter={flt}
                style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
              <path d={rd.loop} fill="none" stroke="transparent" strokeWidth={12}
                style={{ cursor: 'pointer' }} {...evts} />
            </g>
          )
        }

        if (rd.type === 'single') {
          return (
            <g key={g.name}>
              <path d={rd.path} fill="none" stroke="#cc44ff"
                strokeWidth={sw} strokeDasharray="5 3" opacity={opacity} markerEnd="url(#arr-g)" filter={flt}
                style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
              {partialSel && (
                (() => {
                  const gv = gradientVectorForPath(rd.path, fromSel)
                  const gradId = `gate-half-${g.name}`
                  return (
                    <>
                      {gv && (
                        <defs>
                          <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
                            x1={gv.from.x} y1={gv.from.y} x2={gv.to.x} y2={gv.to.y}>
                            <stop offset="0%" stopColor="#cc44ff" stopOpacity={1} />
                            <stop offset="45%" stopColor="#cc44ff" stopOpacity={0.18} />
                            <stop offset="60%" stopColor="#cc44ff" stopOpacity={0} />
                            <stop offset="100%" stopColor="#cc44ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      )}
                      <path
                        d={rd.path}
                        fill="none"
                        stroke={gv ? `url(#${gradId})` : '#cc44ff'}
                        strokeWidth={1.2}
                        opacity={0.95}
                        filter="url(#gl)"
                        style={{ pointerEvents: 'none' }}
                      />
                    </>
                  )
                })()
              )}
              <path d={rd.path} fill="none" stroke="transparent" strokeWidth={12}
                style={{ cursor: 'pointer' }} {...evts} />
            </g>
          )
        }

        return (
          <g key={g.name}>
            <path d={rd.legA} fill="none" stroke="#cc44ff" strokeWidth={sw * 0.8}
              strokeDasharray="3 3" opacity={opacity * 0.7} filter={flt}
              style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
            <path d={rd.legB} fill="none" stroke="#cc44ff" strokeWidth={sw * 0.8}
              strokeDasharray="3 3" opacity={opacity * 0.7} filter={flt}
              style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
            <path d={rd.stem} fill="none" stroke="#cc44ff" strokeWidth={sw}
              strokeDasharray="5 3" opacity={opacity} markerEnd="url(#arr-g)" filter={flt}
              style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
            <path d={rd.legA} fill="none" stroke="transparent" strokeWidth={12}
              style={{ cursor: 'pointer' }} {...evts} />
            <path d={rd.legB} fill="none" stroke="transparent" strokeWidth={12}
              style={{ cursor: 'pointer' }} {...evts} />
            <path d={rd.stem} fill="none" stroke="transparent" strokeWidth={12}
              style={{ cursor: 'pointer' }} {...evts} />
          </g>
        )
      })}

      {/* Currents layer */}
      {layers.has('currents') && (
        <>
          {CURRENTS.filter(c => !tcActive || TC_CURRENTS.has(c.name)).map(c => {
            const rd = currentRenderData[c.name]
            if (!rd) return null
            const partner = 9 - c.from
            const destZone = getCurrentDestZone(c.from, c.to, c.name)
            const terminals = Array.from(new Set(
              rd.type === 'single'
                ? [c.from, destZone]
                : rd.type === 'yshape'
                  ? [c.from, partner, destZone]
                  : [c.from, partner]
            ))
            const selectedTerminals = terminals.filter(z => selZones.has(z))
            const partialSel = selectedTerminals.length > 0 && selectedTerminals.length < terminals.length
            const partialZone = selectedTerminals.length === 1 ? selectedTerminals[0] : null
            const hl = tcActive || hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(partner)
            const fullHl = hl && !partialSel
            const opacity = fullHl ? 0.85 : anyFocus ? dimOpacity : (isPlanetary ? 0.3 : 0.6)
            const sw = fullHl ? 1.8 : 1.2
            const flt = fullHl ? 'url(#gl)' : undefined
            const evts = {
              onMouseEnter: () => onHoverInfo({ type: 'current', data: c }),
              onMouseLeave: () => onHoverInfo(null),
              onClick: () => onPinInfo({ type: 'current', data: c }),
            }

            if (rd.type === 'single') {
              return (
                <g key={c.name}>
                  <path d={rd.path} fill="none" stroke="#22ee66" strokeWidth={sw}
                    opacity={opacity} markerEnd="url(#arr-c)" filter={flt}
                    style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                  {partialSel && partialZone !== null && (
                    (() => {
                      const fromStart = partialZone === c.from
                      const gv = gradientVectorForPath(rd.path, fromStart)
                      const gradId = `cur-half-single-${c.name}`
                      return (
                        <>
                          {gv && (
                            <defs>
                              <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
                                x1={gv.from.x} y1={gv.from.y} x2={gv.to.x} y2={gv.to.y}>
                                <stop offset="0%" stopColor="#22ee66" stopOpacity={1} />
                                <stop offset="45%" stopColor="#22ee66" stopOpacity={0.22} />
                                <stop offset="60%" stopColor="#22ee66" stopOpacity={0} />
                                <stop offset="100%" stopColor="#22ee66" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          )}
                          <path
                            d={rd.path}
                            fill="none"
                            stroke={gv ? `url(#${gradId})` : '#22ee66'}
                            strokeWidth={1.8}
                            opacity={0.95}
                            filter="url(#gl)"
                            style={{ pointerEvents: 'none' }}
                          />
                        </>
                      )
                    })()
                  )}
                  <circle cx={rd.mid.x} cy={rd.mid.y} r={fullHl ? 4 : 3}
                    fill="#ffffff" stroke="#22ee66" strokeWidth={0.6}
                    opacity={opacity * 0.9} style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                  <path d={rd.path} fill="none" stroke="transparent" strokeWidth={14}
                    style={{ cursor: 'pointer' }} {...evts} />
                </g>
              )
            }

            if (rd.type === 'loop') {
              const partialLeg = partialZone !== null ? pickClosestPathHalf([rd.legA, rd.legB], partialZone) : null
              return (
                <g key={c.name}>
                  <path d={rd.legA} fill="none" stroke="#22ee66" strokeWidth={sw * 0.7}
                    opacity={opacity * 0.7} filter={flt}
                    style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                  <path d={rd.legB} fill="none" stroke="#22ee66" strokeWidth={sw * 0.7}
                    opacity={opacity * 0.7} filter={flt}
                    style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                  <path d={rd.loop} fill="none" stroke="#22ee66"
                    strokeWidth={sw} opacity={opacity} filter={flt}
                    style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                  {partialSel && partialLeg && (
                    (() => {
                      const gv = gradientVectorForPath(partialLeg.path, partialLeg.fromStart)
                      const gradId = `cur-half-loop-${c.name}`
                      return (
                        <>
                          {gv && (
                            <defs>
                              <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
                                x1={gv.from.x} y1={gv.from.y} x2={gv.to.x} y2={gv.to.y}>
                                <stop offset="0%" stopColor="#22ee66" stopOpacity={1} />
                                <stop offset="100%" stopColor="#22ee66" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          )}
                          <path
                            d={partialLeg.path}
                            fill="none"
                            stroke={gv ? `url(#${gradId})` : '#22ee66'}
                            strokeWidth={1.25}
                            opacity={0.95}
                            filter="url(#gl)"
                            style={{ pointerEvents: 'none' }}
                          />
                        </>
                      )
                    })()
                  )}
                  <path d={rd.legA} fill="none" stroke="transparent" strokeWidth={14}
                    style={{ cursor: 'pointer' }} {...evts} />
                  <path d={rd.legB} fill="none" stroke="transparent" strokeWidth={14}
                    style={{ cursor: 'pointer' }} {...evts} />
                  <path d={rd.loop} fill="none" stroke="transparent" strokeWidth={12}
                    style={{ cursor: 'pointer' }} {...evts} />
                </g>
              )
            }

            const partialLeg = partialZone !== null ? pickClosestPathHalf([rd.legA, rd.legB], partialZone) : null
            return (
              <g key={c.name}>
                <path d={rd.legA} fill="none" stroke="#22ee66" strokeWidth={sw * 0.7}
                  opacity={opacity * 0.7} filter={flt}
                  style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                <path d={rd.legB} fill="none" stroke="#22ee66" strokeWidth={sw * 0.7}
                  opacity={opacity * 0.7} filter={flt}
                  style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                <circle cx={rd.junction.x} cy={rd.junction.y} r={hl ? 5 : 3.5}
                  fill="#ffffff" stroke="#22ee66" strokeWidth={0.8}
                  opacity={opacity} style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                <path d={rd.stem} fill="none" stroke="#22ee66" strokeWidth={sw}
                  opacity={opacity} markerEnd="url(#arr-c)" filter={flt}
                  style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                {partialSel && partialZone !== null && (
                  partialZone === destZone ? (
                    (() => {
                      const gv = gradientVectorForPath(rd.stem, false)
                      const gradId = `cur-half-yshape-stem-${c.name}`
                      return (
                        <>
                          {gv && (
                            <defs>
                              <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
                                x1={gv.from.x} y1={gv.from.y} x2={gv.to.x} y2={gv.to.y}>
                                <stop offset="0%" stopColor="#22ee66" stopOpacity={1} />
                                <stop offset="100%" stopColor="#22ee66" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          )}
                          <path
                            d={rd.stem}
                            fill="none"
                            stroke={gv ? `url(#${gradId})` : '#22ee66'}
                            strokeWidth={1.8}
                            opacity={0.95}
                            filter="url(#gl)"
                            style={{ pointerEvents: 'none' }}
                          />
                        </>
                      )
                    })()
                  ) : partialLeg ? (
                    (() => {
                      const gv = gradientVectorForPath(partialLeg.path, partialLeg.fromStart)
                      const gradId = `cur-half-yshape-leg-${c.name}`
                      return (
                        <>
                          {gv && (
                            <defs>
                              <linearGradient id={gradId} gradientUnits="userSpaceOnUse"
                                x1={gv.from.x} y1={gv.from.y} x2={gv.to.x} y2={gv.to.y}>
                                <stop offset="0%" stopColor="#22ee66" stopOpacity={1} />
                                <stop offset="100%" stopColor="#22ee66" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                          )}
                          <path
                            d={partialLeg.path}
                            fill="none"
                            stroke={gv ? `url(#${gradId})` : '#22ee66'}
                            strokeWidth={1.25}
                            opacity={0.95}
                            filter="url(#gl)"
                            style={{ pointerEvents: 'none' }}
                          />
                        </>
                      )
                    })()
                  ) : null
                )}
                <path d={rd.legA} fill="none" stroke="transparent" strokeWidth={14}
                  style={{ cursor: 'pointer' }} {...evts} />
                <path d={rd.legB} fill="none" stroke="transparent" strokeWidth={14}
                  style={{ cursor: 'pointer' }} {...evts} />
                <path d={rd.stem} fill="none" stroke="transparent" strokeWidth={14}
                  style={{ cursor: 'pointer' }} {...evts} />
              </g>
            )
          })}
        </>
      )}

      {/* Current labels */}
      {layers.has('currents') && CURRENTS.filter(c => !tcActive || TC_CURRENTS.has(c.name)).map(c => {
        const rd = currentRenderData[c.name]
        if (!rd) return null
        const labelPos = rd.type === 'single' ? rd.mid : rd.junction
        const dest = pos[getCurrentDestZone(c.from, c.to, c.name)]
        const dx = dest.x - labelPos.x, dy = dest.y - labelPos.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const off = rd.type === 'single' ? 14 : 18
        const hl = hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(9 - c.from)
        return (
          <g key={`cl-${c.name}`} style={{ pointerEvents: 'none' }}>
            <text
              x={labelPos.x + (-dy / len) * off}
              y={labelPos.y + (dx / len) * off - 3}
              textAnchor="middle" fill="#22ee66" fontSize="8" fontWeight="bold"
              opacity={hl ? 0.85 : 0.45} fontFamily="monospace"
            >{c.name}</text>
            <text
              x={labelPos.x + (-dy / len) * off}
              y={labelPos.y + (dx / len) * off + 7}
              textAnchor="middle" fill="#22ee66" fontSize="6"
              opacity={hl ? 0.6 : 0.3} fontFamily="monospace"
            >{c.label}</text>
          </g>
        )
      })}

      {/* Syzygies layer */}
      {layers.has('syzygies') && SYZYGIES.filter(s => !tcActive || TC_SYZYGIES.some(t => t[0] === s.a && t[1] === s.b)).map(s => {
        const selectedCount = (selZones.has(s.a) ? 1 : 0) + (selZones.has(s.b) ? 1 : 0)
        const partialSel = selectedCount > 0 && selectedCount < 2
        const hl = tcActive || hlZones.has(s.a) || hlZones.has(s.b)
        const fullHl = hl && !partialSel
        const pa = pos[s.a], pb = pos[s.b]
        const dx = pb.x - pa.x, dy = pb.y - pa.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const r = 21
        const startT = dist > 0 ? r / dist : 0
        const endT = dist > 0 ? 1 - r / dist : 1
        const span = endT - startT
        const numDots = Math.max(3, Math.min(10, Math.round(dist / 30)))

        return (
          <g key={`s-${s.a}:${s.b}`} style={{ cursor: 'pointer' }}
            onMouseEnter={() => onHoverInfo({ type: 'syzygy', data: s })}
            onMouseLeave={() => onHoverInfo(null)}
            onClick={() => onPinInfo({ type: 'syzygy', data: s })}
          >
            <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="transparent" strokeWidth={14} />
            {Array.from({ length: numDots }, (_, i) => {
              const t = startT + span * (i + 1) / (numDots + 1)
              const x = pa.x + dx * t
              const y = pa.y + dy * t
              const dotR = 1.0 + (t - startT) / span * 1.5
              return (
                <circle key={i} cx={x} cy={y} r={dotR} fill="#e8e8e8"
                  opacity={fullHl ? 0.7 : anyFocus ? (isPlanetary ? 0.03 : 0.1) : (isPlanetary ? 0.2 : 0.5)}
                  style={{ transition: 'opacity 0.15s' }} />
              )
            })}
            {fullHl && (() => {
              const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2
              const ndx = -dy / (dist || 1), ndy = dx / (dist || 1)
              return (
                <text x={mx + ndx * 14} y={my + ndy * 14}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#e8e8e8" fontSize="7" fontStyle="italic" fontFamily="monospace"
                  opacity={0.7} style={{ pointerEvents: 'none' }}
                >{s.demon}</text>
              )
            })()}
          </g>
        )
      })}

      {/* Zone nodes */}
      {zoneOrder.map(z => {
        const p = pos[z]
        const clr = ZONE_CLR[z]
        const act = selZones.has(z)
        const hl = hlZones.has(z)
        const region = ZONE_REGION[z]
        const meta = ZONE_META[z]
        const xenotation = formatXenotationForDisplay(z)
        const isPlanetary = layout === 'planetary'
        const nodeR = isPlanetary ? PLANETARY_SIZE[z] : 21
        const isSun = isPlanetary && z === 0
        const showNumber = labelVisibility.numbers
        const showPlanet = labelVisibility.planets
        const showXenotation = labelVisibility.xenotation && xenotation.length > 0
        const lowerLabels: string[] = []
        if (showNumber) lowerLabels.push(String(z))
        if (showXenotation) lowerLabels.push(xenotation)
        if (showPlanet) lowerLabels.push(meta.planet)
        const regionDotY = p.y + nodeR + 10 + (lowerLabels.length > 0 ? lowerLabels.length * 8 + 2 : 0)

        return (
          <g key={z} style={{ cursor: 'pointer' }}
            onMouseEnter={() => onHoverInfo({ type: 'zone', zone: z })}
            onMouseLeave={() => onHoverInfo(null)}
            onClick={() => {
              onPinInfo({ type: 'zone', zone: z })
              onZoneNodeClick(z)
            }}
          >
            {isSun && (
              <>
                <circle cx={p.x} cy={p.y} r={nodeR * 3} fill="url(#sun-halo)" opacity={0.2} style={{ pointerEvents: 'none' }} />
                <circle cx={p.x} cy={p.y} r={nodeR * 1.8} fill="url(#sun-corona)" opacity={0.5} style={{ pointerEvents: 'none' }} />
              </>
            )}
            {act && (
              <circle cx={p.x} cy={p.y} r={nodeR + 7} fill="none" stroke={clr} strokeWidth={0.5} opacity={0.3} filter="url(#gl2)" />
            )}
            <circle cx={p.x} cy={p.y} r={nodeR}
              fill={isPlanetary ? `url(#sphere-${z})` : `${clr}18`}
              stroke={isSun ? 'none' : (act || hl ? clr : `${clr}44`)}
              strokeWidth={isSun ? 0 : (act ? 1.6 : hl ? 1.2 : 0.7)}
              filter={isSun ? 'url(#sunGlow)' : undefined} />
            {!isSun && (
              <polygon points={syzTrianglePoints(z, pos)} fill={clr}
                opacity={act || hl ? 0.5 : 0.2}
                style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }} />
            )}
            {isPlanetary ? (
              <>
                {showPlanet && (
                  <text x={p.x} y={p.y + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#000000"
                    fontSize={isSun ? 24 : Math.max(12, nodeR * 0.9)} fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >{PLANET_SYMBOL[z]}</text>
                )}
                {!showPlanet && showNumber && (
                  <text x={p.x} y={p.y + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill={act || hl ? clr : `${clr}aa`}
                    fontSize={Math.max(12, nodeR * 0.85)} fontWeight="bold" fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >{z}</text>
                )}
                {lowerLabels.map((label, idx) => (
                  <text
                    key={`${z}-planetary-label-${idx}`}
                    x={p.x}
                    y={p.y + nodeR + 10 + (idx + 1) * 8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={act || hl ? clr : `${clr}66`}
                    fontSize={idx === 0 ? '7' : '6.5'}
                    fontFamily="monospace"
                    fontStyle={label === xenotation ? 'italic' : 'normal'}
                    opacity={act || hl ? 0.8 : 0.4}
                    style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
                  >
                    {label}
                  </text>
                ))}
              </>
            ) : (
              <>
                {showNumber && (
                  <text x={p.x} y={p.y + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fill={act || hl ? clr : `${clr}aa`}
                    fontSize="17" fontWeight="bold" fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >{z}</text>
                )}
                {showXenotation && (
                  <text x={p.x} y={p.y + 24}
                    textAnchor="middle" dominantBaseline="central"
                    fill={act || hl ? clr : `${clr}70`}
                    fontSize="6.5" fontFamily="monospace" fontStyle="italic"
                    opacity={act || hl ? 0.82 : 0.44}
                    style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
                  >{xenotation}</text>
                )}
                {showPlanet && (
                  <text x={p.x} y={p.y + (showXenotation ? 32 : 30)}
                    textAnchor="middle" dominantBaseline="central"
                    fill={act || hl ? clr : `${clr}66`}
                    fontSize="7" fontFamily="monospace"
                    opacity={act || hl ? 0.8 : 0.4}
                    style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
                  >{meta.planet}</text>
                )}
              </>
            )}
            <circle cx={p.x} cy={regionDotY} r={2}
              fill={REGION_CLR[region]} opacity={0.3} />
          </g>
        )
      })}

      {/* Gate meeting labels */}
      {layout !== 'ladder' && layers.has('gates') && !tcActive && GATE_LIST.map(g => {
        const rd = gateRenderData[g.name]
        if (!rd) return null
        const sumExpr = plexExpr(g.cum)
        const gateLabel = String(g.from)
        const showCalc = gateCalcFocusName === g.name
        const hl = hlZones.has(g.from) || hlZones.has(g.to)
        const gateEvts = {
          onMouseEnter: () => onHoverInfo({ type: 'gate', gate: g }),
          onMouseLeave: () => onHoverInfo(null),
          onClick: () => onPinInfo({ type: 'gate', gate: g }),
        }
        let j: Pos
        if (rd.type === 'single') {
          j = rd.mid || midpoint(pos[g.to], pos[g.from])
        } else if (rd.type === 'loop') {
          if (rd.mid) j = rd.mid
          else {
            const pt = syzMidBiased(g.from, pos)
            j = { x: pt.x, y: pt.y + (pt.y > ctr.y ? 20 : -20) }
          }
        } else {
          j = rd.junction
        }
        return (
          <g key={`gl-${g.name}`} style={{ cursor: 'pointer' }} {...gateEvts}>
            <circle cx={j.x} cy={j.y} r={showCalc && sumExpr ? 12 : 9}
              fill="#060609" stroke="#cc44ff33" strokeWidth={0.5} />
            {rd.type === 'loop' && (
              <circle
                cx={j.x}
                cy={j.y}
                r={showCalc && sumExpr ? 15 : 12}
                fill="none"
                stroke="#cc44ff66"
                strokeWidth={0.7}
                opacity={hl ? 0.8 : 0.45}
              />
            )}
            {showCalc && sumExpr && (
              <text x={j.x} y={j.y - 12} textAnchor="middle"
                fill="#cc44ff" fontSize="8.5" fontFamily="monospace"
                fontStyle="italic" opacity={hl ? 0.86 : 0.5}
              >{g.cum}</text>
            )}
            <text x={j.x} y={j.y - (showCalc && sumExpr ? 2 : 0)} textAnchor="middle" dominantBaseline="central"
              fill="#cc44ff" fontSize="7" fontFamily="monospace" fontStyle="italic"
              opacity={hl ? 0.92 : 0.55}
            >{gateLabel}</text>
            {showCalc && sumExpr && (
              <text x={j.x} y={j.y + 8} textAnchor="middle"
                fill="#cc44ff" fontSize="8" fontFamily="monospace"
                fontStyle="italic" opacity={hl ? 0.8 : 0.45}
              >{sumExpr}</text>
            )}
            <circle
              cx={j.x}
              cy={j.y}
              r={showCalc && sumExpr ? 18 : 14}
              fill="transparent"
            />
          </g>
        )
      })}

      {/* Particle animation layer */}
      {particlesOn && (
        <g style={{ pointerEvents: 'none' }}>
          {layers.has('currents') && CURRENTS.map(c => {
            const rd = currentRenderData[c.name]
            if (!rd) return null
            const startClrA = ZONE_CLR[c.from]
            const startClrB = ZONE_CLR[9 - c.from]
            if (rd.type === 'yshape') {
              const inboundDur = 1.8
              const stemDur = 2.4
              return (
                <g key={`particle-c-${c.name}`}>
                  <path id={`cp-legA-${c.name}`} d={rd.legA} fill="none" stroke="none" />
                  <path id={`cp-legB-${c.name}`} d={rd.legB} fill="none" stroke="none" />
                  <path id={`cp-stem-${c.name}`} d={rd.stem} fill="none" stroke="none" />

                  <circle r={2.4} fill={startClrA} opacity={0.92} filter="url(#gl)">
                    <animateMotion dur={`${inboundDur}s`} begin="0s" repeatCount="indefinite">
                      <mpath href={`#cp-legA-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0.98;0.18;0.98" dur="0.9s" repeatCount="indefinite" />
                  </circle>
                  <circle r={2.4} fill={startClrB} opacity={0.92} filter="url(#gl)">
                    <animateMotion dur={`${inboundDur}s`} begin="0s" repeatCount="indefinite">
                      <mpath href={`#cp-legB-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0.18;0.98;0.18" dur="0.9s" repeatCount="indefinite" />
                  </circle>

                  {[0, 1].map(i => (
                    <circle key={`stem-${i}`} r={2.4}
                      fill={i === 0 ? startClrA : startClrB} opacity={0.95} filter="url(#gl)">
                      <animateMotion dur={`${stemDur}s`} begin={`${inboundDur + i * (stemDur / 2)}s`} repeatCount="indefinite">
                        <mpath href={`#cp-stem-${c.name}`} />
                      </animateMotion>
                      <animate attributeName="fill"
                        values={i === 0
                          ? `${startClrA};${startClrB};${startClrA}`
                          : `${startClrB};${startClrA};${startClrB}`}
                        dur={`${stemDur / 2}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </g>
              )
            }
            const stemPath = rd.type === 'loop' ? rd.loop : rd.path
            return (
              <g key={`particle-c-${c.name}`}>
                <path id={`cp-${c.name}`} d={stemPath} fill="none" stroke="none" />
                {[0, 1].map(i => (
                  <circle key={i} r={2.5} fill={i === 0 ? startClrA : startClrB} opacity={0.92} filter="url(#gl)">
                    <animateMotion dur="3s" begin={`${i * 1.5}s`} repeatCount="indefinite">
                      <mpath href={`#cp-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="fill"
                      values={i === 0
                        ? `${startClrA};${startClrB};${startClrA}`
                        : `${startClrB};${startClrA};${startClrB}`}
                      dur="1.5s" repeatCount="indefinite" />
                  </circle>
                ))}
              </g>
            )
          })}
          {layers.has('gates') && GATE_LIST.filter(g => g.from !== g.to).map(g => {
            const rd = gateRenderData[g.name]
            if (!rd || rd.type === 'loop') return null
            const gatePath = rd.type === 'single' ? rd.path : rd.stem
            const destClr = ZONE_CLR[g.to]
            const sourceClr = ZONE_CLR[g.from]
            return (
              <g key={`particle-g-${g.name}`}>
                <path id={`gp-${g.name}`} d={gatePath} fill="none" stroke="none" />
                <circle r={2} fill={destClr} opacity={0.7} filter="url(#gl)">
                  <animateMotion dur="4s" repeatCount="indefinite">
                    <mpath href={`#gp-${g.name}`} />
                  </animateMotion>
                  <animate attributeName="r" values="1;2.5;1" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="fill"
                    values={`${destClr};${sourceClr};${destClr}`}
                    dur="4s" repeatCount="indefinite" />
                </circle>
              </g>
            )
          })}
          {(() => {
            const tcZones = [1, 8, 7, 2, 5, 4, 1]
            const tcPath = tcZones.map((z, i) => {
              const p = pos[z]
              return i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`
            }).join(' ')
            return (
              <>
                <path id="tc-path" d={tcPath} fill="none" stroke="none" />
                {[0, 1, 2].map(i => (
                  <circle key={`tc-${i}`} r={3} fill="#00ccff" opacity={0.7} filter="url(#gl)">
                    <animateMotion dur="8s" begin={`${i * 2.67}s`} repeatCount="indefinite">
                      <mpath href="#tc-path" />
                    </animateMotion>
                    <animate attributeName="r" values="2;4;2" dur="2.67s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.67s" repeatCount="indefinite" />
                  </circle>
                ))}
              </>
            )
          })()}
        </g>
      )}

      {/* Selection-triggered particle flow */}
      {selZones.size > 0 && (
        <g style={{ pointerEvents: 'none' }}>
          {layers.has('currents') && CURRENTS.filter(c => {
            const rd = currentRenderData[c.name]
            if (!rd) return false
            const partner = 9 - c.from
            const dest = getCurrentDestZone(c.from, c.to, c.name)
            const terminals = Array.from(new Set(
              rd.type === 'single'
                ? [c.from, dest]
                : rd.type === 'yshape'
                  ? [c.from, partner, dest]
                  : [c.from, partner]
            ))
            return terminals.every(z => selZones.has(z))
          }).map(c => {
            const rd = currentRenderData[c.name]
            if (!rd) return null
            const startClrA = ZONE_CLR[c.from]
            const startClrB = ZONE_CLR[9 - c.from]

            if (rd.type === 'yshape') {
              const inboundDur = 1.8
              const stemDur = 2.4
              return (
                <g key={`sp-cur-${c.name}`}>
                  <path id={`sp-cur-legA-${c.name}`} d={rd.legA} fill="none" stroke="none" />
                  <path id={`sp-cur-legB-${c.name}`} d={rd.legB} fill="none" stroke="none" />
                  <path id={`sp-cur-stem-${c.name}`} d={rd.stem} fill="none" stroke="none" />

                  <circle r={2.5} fill={startClrA} opacity={0.95} filter="url(#gl)">
                    <animateMotion dur={`${inboundDur}s`} begin="0s" repeatCount="indefinite">
                      <mpath href={`#sp-cur-legA-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0.98;0.18;0.98" dur="0.9s" repeatCount="indefinite" />
                  </circle>
                  <circle r={2.5} fill={startClrB} opacity={0.95} filter="url(#gl)">
                    <animateMotion dur={`${inboundDur}s`} begin="0s" repeatCount="indefinite">
                      <mpath href={`#sp-cur-legB-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0.18;0.98;0.18" dur="0.9s" repeatCount="indefinite" />
                  </circle>

                  {[0, 1].map(i => (
                    <circle key={`stem-${i}`} r={2.5}
                      fill={i === 0 ? startClrA : startClrB} opacity={0.95} filter="url(#gl)">
                      <animateMotion dur={`${stemDur}s`} begin={`${inboundDur + i * (stemDur / 2)}s`} repeatCount="indefinite">
                        <mpath href={`#sp-cur-stem-${c.name}`} />
                      </animateMotion>
                      <animate attributeName="fill"
                        values={i === 0
                          ? `${startClrA};${startClrB};${startClrA}`
                          : `${startClrB};${startClrA};${startClrB}`}
                        dur={`${stemDur / 2}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </g>
              )
            }

            const stemPath = rd.type === 'loop' ? rd.loop : rd.path
            return (
              <g key={`sp-cur-${c.name}`}>
                <path id={`sp-cur-${c.name}`} d={stemPath} fill="none" stroke="none" />
                {[0, 1].map(i => (
                  <circle key={i} r={2.5} fill={i === 0 ? startClrA : startClrB} opacity={0.92} filter="url(#gl)">
                    <animateMotion dur="3s" begin={`${i * 1.5}s`} repeatCount="indefinite">
                      <mpath href={`#sp-cur-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="r" values="1.5;3.5;1.5" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.95;0.4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                ))}
              </g>
            )
          })}
          {(() => {
            const paths: { id: string; d: string; clr: string; dur: number; gateFill?: { start: string; end: string } }[] = []

            if (layers.has('syzygies')) {
              for (const s of SYZYGIES) {
                if (!selZones.has(s.a) || !selZones.has(s.b)) continue
                const pa = pos[s.a]
                const pb = pos[s.b]
                paths.push({ id: `sp-syz-${s.a}-${s.b}`, d: `M${pa.x} ${pa.y}L${pb.x} ${pb.y}`, clr: ZONE_CLR[s.a], dur: 2 })
              }
            }
            if (layers.has('gates')) {
              for (const g of GATE_LIST) {
                if (!selZones.has(g.from) || !selZones.has(g.to)) continue
                const rd = gateRenderData[g.name]
                if (!rd) continue
                const gateFill = { start: ZONE_CLR[g.to], end: ZONE_CLR[g.from] }
                const clr = ZONE_CLR[g.from]
                if (rd.type === 'loop') {
                  paths.push({ id: `sp-gate-${g.name}`, d: rd.loop, clr, dur: 2, gateFill })
                } else if (rd.type === 'single') {
                  paths.push({ id: `sp-gate-${g.name}`, d: rd.path, clr, dur: 3, gateFill })
                } else {
                  paths.push({ id: `sp-gate-${g.name}`, d: rd.stem, clr, dur: 3, gateFill })
                  paths.push({ id: `sp-gateA-${g.name}`, d: rd.legA, clr, dur: 1.5, gateFill })
                  paths.push({ id: `sp-gateB-${g.name}`, d: rd.legB, clr, dur: 1.5, gateFill })
                }
              }
            }
            if (layers.has('pandemonium')) {
              for (const d of ALL_DEMONS) {
                if (d.kind === 'syzygy') continue
                if (!selZones.has(d.a) || !selZones.has(d.b)) continue
                const pathD = curveAway(pos[d.a], pos[d.b], ctr.x, ctr.y, 0.25)
                paths.push({ id: `sp-dem-${d.a}-${d.b}`, d: pathD, clr: ZONE_CLR[d.a], dur: 3 })
              }
            }

            return paths.map(p => (
              <g key={p.id}>
                <path id={p.id} d={p.d} fill="none" stroke="none" />
                {[0, 1].map(i => (
                  <circle key={i} r={2.5} fill={p.clr} opacity={0.8} filter="url(#gl)">
                    <animateMotion dur={`${p.dur}s`} begin={`${i * p.dur / 2}s`} repeatCount="indefinite">
                      <mpath href={`#${p.id}`} />
                    </animateMotion>
                    <animate attributeName="r" values="1.5;3.5;1.5" dur={`${p.dur / 2}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${p.dur / 2}s`} repeatCount="indefinite" />
                    {p.gateFill && (
                      <animate attributeName="fill"
                        values={`${p.gateFill.start};${p.gateFill.end};${p.gateFill.start}`}
                        dur={`${p.dur}s`} repeatCount="indefinite" />
                    )}
                  </circle>
                ))}
              </g>
            ))
          })()}
        </g>
      )}

      {/* Time Circuit overlay */}
      {tcActive && (
        <g style={{ pointerEvents: 'none' }}>
          {TC_EDGES.map(([a, b], i) => {
            const pa = pos[a], pb = pos[b]
            return (
              <line key={`tc-edge-${i}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="#00ccff" strokeWidth={1.5} opacity={0.6}
                filter="url(#gl)" />
            )
          })}
          {(() => {
            const tcZones = [1, 8, 7, 2, 5, 4, 1]
            const tcPath = tcZones.map((z, i) => {
              const p = pos[z]
              return i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`
            }).join(' ')
            return (
              <>
                <path id="tc-active-path" d={tcPath} fill="none" stroke="none" />
                {[0, 1, 2, 3].map(i => (
                  <circle key={`tc-active-${i}`} r={3.5} fill="#00ccff" opacity={0.8} filter="url(#gl)">
                    <animateMotion dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite">
                      <mpath href="#tc-active-path" />
                    </animateMotion>
                    <animate attributeName="r" values="2;4.5;2" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
                  </circle>
                ))}
              </>
            )
          })()}
        </g>
      )}
    </svg>
  )
})

// Internal sub-component for region labels
function RegionLabels({ layout, showOrbits }: { layout: Layout; showOrbits: boolean }) {
  if (layout === 'labyrinth') {
    return (
      <>
        <text x={400} y={20} textAnchor="middle" fill="#44cc77" fontSize="9" opacity={0.4} fontFamily="monospace">WARP</text>
        <text x={400} y={438} textAnchor="middle" fill="#00ccff" fontSize="9" opacity={0.25} fontFamily="monospace">TORQUE</text>
        <text x={400} y={865} textAnchor="middle" fill="#aa6633" fontSize="9" opacity={0.4} fontFamily="monospace">PLEX</text>
      </>
    )
  }
  if (layout === 'ladder') {
    return (
      <>
        <text x={175} y={280} textAnchor="end" fill="#44cc77" fontSize="8" opacity={0.35} fontFamily="monospace">WARP</text>
        <text x={175} y={804} textAnchor="end" fill="#aa6633" fontSize="8" opacity={0.35} fontFamily="monospace">PLEX</text>
      </>
    )
  }
  if (layout === 'planetary') {
    return (
      <>
        {showOrbits && [55, 95, 130, 165, 210, 255, 295, 330, 360].map(r => (
          <circle key={`orb-${r}`} cx={400} cy={400} r={r}
            fill="none" stroke="#ffffff" strokeWidth={0.6} opacity={0.2}
            strokeDasharray="3 5" />
        ))}
        <text x={400} y={18} textAnchor="middle" fill="#aa6633" fontSize="7" opacity={0.3} fontFamily="monospace">
          LEMURIAN PLANETWORK
        </text>
      </>
    )
  }
  return (
    <>
      <text x={335} y={45} textAnchor="middle" fill="#44cc77" fontSize="8" opacity={0.35} fontFamily="monospace">WARP</text>
      <text x={400} y={930} textAnchor="middle" fill="#aa6633" fontSize="8" opacity={0.35} fontFamily="monospace">PLEX</text>
    </>
  )
}
