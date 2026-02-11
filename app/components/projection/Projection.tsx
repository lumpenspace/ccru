'use client'

import React, { useMemo } from 'react'
import type { Layout, Layer, Pos, HoverInfo, GateRender, CurrentRender } from '../../data/types'
import { ZONE_CLR, ZONE_REGION, ZONE_META, PLANET_SYMBOL } from '../../data/zones'
import { PLANETARY_CX, PLANETARY_CY, PLANETARY_SIZE } from '../../data/positions'
import { SYZYGIES } from '../../data/syzygies'
import { CURRENTS } from '../../data/currents'
import { GATE_LIST } from '../../data/gates'
import { ALL_DEMONS } from '../../data/demons'
import { REGION_CLR, TC_EDGES, TC_CURRENTS, TC_SYZYGIES } from '../../lib/constants'
import { curveAway, syzMidBiased, syzTrianglePoints, midpoint } from '../../lib/geometry'

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
  particlesOn: boolean
  onHoverInfo: (info: HoverInfo | null) => void
  onPinInfo: (info: HoverInfo) => void
  onToggleZone: (zone: number) => void
}

export const Projection = React.memo(function Projection({
  layout, pos, ctr, svgHeight, layers, hlZones, selZones, anyFocus,
  tcActive, showOrbits, planetaryPos, zoneOrder, gateRenderData,
  currentRenderData, particlesOn, onHoverInfo, onPinInfo, onToggleZone,
}: ProjectionProps) {

  const isPlanetary = layout === 'planetary'
  // In planetary mode, reduce unfocused path opacity to cut visual clutter
  const dimOpacity = isPlanetary ? 0.03 : 0.08

  return (
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
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="sphere-0" cx="42%" cy="42%" r="55%" fx="38%" fy="38%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="12%" stopColor="#ffffcc" />
          <stop offset="35%" stopColor="#ffcc44" />
          <stop offset="65%" stopColor="#ff8800" />
          <stop offset="100%" stopColor="#cc4400" />
        </radialGradient>
        <radialGradient id="sun-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffcc44" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#ff8800" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sun-corona" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffee88" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#ffaa44" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
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
        const hl = hlZones.has(g.from) || hlZones.has(g.to) || hlZones.has(9 - g.from)
        const opacity = hl ? 0.8 : anyFocus ? dimOpacity : (isPlanetary ? 0.25 : 0.5)
        const sw = hl ? 1.2 : 0.7
        const flt = hl ? 'url(#gl)' : undefined
        const evts = {
          onMouseEnter: () => onHoverInfo({ type: 'gate', gate: g }),
          onMouseLeave: () => onHoverInfo(null),
          onClick: () => onPinInfo({ type: 'gate', gate: g }),
        }

        if (rd.type === 'loop') {
          return (
            <g key={g.name}>
              <path d={rd.loop} fill="none" stroke="#cc44ff"
                strokeWidth={sw} strokeDasharray="3 2" opacity={opacity} filter={flt}
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
            const hl = tcActive || hlZones.has(c.from) || hlZones.has(c.to) || hlZones.has(partner)
            const opacity = hl ? 0.85 : anyFocus ? dimOpacity : (isPlanetary ? 0.3 : 0.6)
            const sw = hl ? 1.8 : 1.2
            const flt = hl ? 'url(#gl)' : undefined
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
                  <circle cx={rd.mid.x} cy={rd.mid.y} r={hl ? 4 : 3}
                    fill="#ffffff" stroke="#22ee66" strokeWidth={0.6}
                    opacity={opacity * 0.9} style={{ transition: 'opacity 0.15s', pointerEvents: 'none' }} />
                  <path d={rd.path} fill="none" stroke="transparent" strokeWidth={14}
                    style={{ cursor: 'pointer' }} {...evts} />
                </g>
              )
            }

            if (rd.type === 'loop') {
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
                  <path d={rd.legA} fill="none" stroke="transparent" strokeWidth={14}
                    style={{ cursor: 'pointer' }} {...evts} />
                  <path d={rd.legB} fill="none" stroke="transparent" strokeWidth={14}
                    style={{ cursor: 'pointer' }} {...evts} />
                  <path d={rd.loop} fill="none" stroke="transparent" strokeWidth={12}
                    style={{ cursor: 'pointer' }} {...evts} />
                </g>
              )
            }

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
        const dest = pos[c.to]
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
        const hl = tcActive || hlZones.has(s.a) || hlZones.has(s.b)
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
                  opacity={hl ? 0.7 : anyFocus ? (isPlanetary ? 0.03 : 0.1) : (isPlanetary ? 0.2 : 0.5)}
                  style={{ transition: 'opacity 0.15s' }} />
              )
            })}
            {hl && (() => {
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
        const isPlanetary = layout === 'planetary'
        const nodeR = isPlanetary ? PLANETARY_SIZE[z] : 21
        const isSun = isPlanetary && z === 0

        return (
          <g key={z} style={{ cursor: 'pointer' }}
            onMouseEnter={() => onHoverInfo({ type: 'zone', zone: z })}
            onMouseLeave={() => onHoverInfo(null)}
            onClick={() => {
              onPinInfo({ type: 'zone', zone: z })
              onToggleZone(z)
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
                <text x={p.x} y={p.y + (isSun ? 1 : 1)}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isSun ? '#fff8e0' : (act || hl ? clr : `${clr}bb`)}
                  fontSize={isSun ? 24 : Math.max(12, nodeR * 0.9)} fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >{PLANET_SYMBOL[z]}</text>
                <text x={p.x} y={p.y + nodeR + 11}
                  textAnchor="middle" dominantBaseline="central"
                  fill={act || hl ? clr : `${clr}66`}
                  fontSize="7" fontFamily="monospace"
                  opacity={act || hl ? 0.8 : 0.4}
                  style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
                >{z} {meta.planet}</text>
              </>
            ) : (
              <>
                <text x={p.x} y={p.y + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fill={act || hl ? clr : `${clr}aa`}
                  fontSize="17" fontWeight="bold" fontFamily="monospace"
                  style={{ pointerEvents: 'none' }}
                >{z}</text>
                <text x={p.x} y={p.y + 32}
                  textAnchor="middle" dominantBaseline="central"
                  fill={act || hl ? clr : `${clr}66`}
                  fontSize="7" fontFamily="monospace"
                  opacity={act || hl ? 0.8 : 0.4}
                  style={{ pointerEvents: 'none', transition: 'opacity 0.15s' }}
                >{meta.planet}</text>
              </>
            )}
            <circle cx={p.x} cy={p.y + nodeR + 19} r={2}
              fill={REGION_CLR[region]} opacity={0.3} />
          </g>
        )
      })}

      {/* Gate cumulation labels */}
      {layout !== 'ladder' && layers.has('gates') && !tcActive && GATE_LIST.filter(g => g.from !== g.to).map(g => {
        const rd = gateRenderData[g.name]
        if (!rd || rd.type !== 'ygate') return null
        const j = rd.junction
        const hl = hlZones.has(g.from) || hlZones.has(g.to) || hlZones.has(9 - g.from)
        return (
          <g key={`gl-${g.name}`} style={{ pointerEvents: 'none' }}>
            <circle cx={j.x} cy={j.y} r={9} fill="#060609" stroke="#cc44ff33" strokeWidth={0.5} />
            <text x={j.x} y={j.y + 1} textAnchor="middle" dominantBaseline="central"
              fill="#cc44ff" fontSize="7" fontFamily="monospace" fontStyle="italic"
              opacity={hl ? 0.9 : 0.5}>{g.cum}</text>
          </g>
        )
      })}

      {/* Gate loop labels */}
      {!tcActive && layers.has('gates') && GATE_LIST.filter(g => g.from === g.to).map(g => {
        const pt = syzMidBiased(g.from, pos)
        const below = pt.y > ctr.y
        return (
          <text key={`gloop-${g.name}`}
            x={pt.x} y={below ? pt.y + 42 : pt.y - 38}
            textAnchor="middle" fill="#cc44ff" fontSize="6" fontFamily="monospace"
            fontStyle="italic" opacity={0.4} style={{ pointerEvents: 'none' }}
          >{g.name} ({g.cum})</text>
        )
      })}

      {/* Particle animation layer */}
      {particlesOn && (
        <g style={{ pointerEvents: 'none' }}>
          {layers.has('currents') && CURRENTS.map(c => {
            const rd = currentRenderData[c.name]
            if (!rd) return null
            const stemPath = rd.type === 'yshape' ? rd.stem : rd.type === 'loop' ? rd.loop : rd.path
            return (
              <g key={`particle-c-${c.name}`}>
                <path id={`cp-${c.name}`} d={stemPath} fill="none" stroke="none" />
                {[0, 1].map(i => (
                  <circle key={i} r={2.5} fill="#22ee66" opacity={0.8} filter="url(#gl)">
                    <animateMotion dur="3s" begin={`${i * 1.5}s`} repeatCount="indefinite">
                      <mpath href={`#cp-${c.name}`} />
                    </animateMotion>
                    <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                ))}
              </g>
            )
          })}
          {layers.has('gates') && GATE_LIST.filter(g => g.from !== g.to).map(g => {
            const rd = gateRenderData[g.name]
            if (!rd || rd.type !== 'ygate') return null
            return (
              <g key={`particle-g-${g.name}`}>
                <path id={`gp-${g.name}`} d={rd.stem} fill="none" stroke="none" />
                <circle r={2} fill="#cc44ff" opacity={0.7} filter="url(#gl)">
                  <animateMotion dur="4s" repeatCount="indefinite">
                    <mpath href={`#gp-${g.name}`} />
                  </animateMotion>
                  <animate attributeName="r" values="1;2.5;1" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
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
          {Array.from(selZones).flatMap(z => {
            const paths: { id: string; d: string; clr: string; dur: number }[] = []
            const clr = ZONE_CLR[z]
            const partner = 9 - z

            if (layers.has('syzygies')) {
              const pa = pos[z], pb = pos[partner]
              paths.push({ id: `sp-syz-${z}`, d: `M${pa.x} ${pa.y}L${pb.x} ${pb.y}`, clr, dur: 2 })
            }
            if (layers.has('currents')) {
              for (const c of CURRENTS) {
                if (c.from === z || (9 - c.from) === z || c.to === z) {
                  const rd = currentRenderData[c.name]
                  if (rd) {
                    const stemPath = rd.type === 'yshape' ? rd.stem : rd.type === 'loop' ? rd.loop : rd.path
                    paths.push({ id: `sp-cur-${z}-${c.name}`, d: stemPath, clr, dur: 2.5 })
                    if (rd.type === 'yshape' || rd.type === 'loop') {
                      paths.push({ id: `sp-curA-${z}-${c.name}`, d: rd.legA, clr, dur: 1.5 })
                      paths.push({ id: `sp-curB-${z}-${c.name}`, d: rd.legB, clr, dur: 1.5 })
                    }
                  }
                }
              }
            }
            if (layers.has('gates')) {
              for (const g of GATE_LIST) {
                if (g.from === z || g.to === z || (9 - g.from) === z) {
                  const rd = gateRenderData[g.name]
                  if (rd) {
                    if (rd.type === 'loop') {
                      paths.push({ id: `sp-gate-${z}-${g.name}`, d: rd.loop, clr, dur: 2 })
                    } else if (rd.type === 'single') {
                      paths.push({ id: `sp-gate-${z}-${g.name}`, d: rd.path, clr, dur: 3 })
                    } else {
                      paths.push({ id: `sp-gate-${z}-${g.name}`, d: rd.stem, clr, dur: 3 })
                      paths.push({ id: `sp-gateA-${z}-${g.name}`, d: rd.legA, clr, dur: 1.5 })
                      paths.push({ id: `sp-gateB-${z}-${g.name}`, d: rd.legB, clr, dur: 1.5 })
                    }
                  }
                }
              }
            }
            if (layers.has('pandemonium')) {
              for (const d of ALL_DEMONS) {
                if (d.kind !== 'syzygy' && (d.a === z || d.b === z)) {
                  const pathD = curveAway(pos[d.a], pos[d.b], ctr.x, ctr.y, 0.25)
                  paths.push({ id: `sp-dem-${z}-${d.a}-${d.b}`, d: pathD, clr, dur: 3 })
                }
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
                  </circle>
                ))}
              </g>
            ))
          })}
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
