import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'

import { PLANETARY_DEFAULT_ANGLE, P_LABYRINTH, P_LADDER, P_ORIGINAL } from '@/app/data/positions'
import type { Layout, Pos } from '@/app/data/types'
import { computePlanetaryPositions, getAnglesForDate } from '@/app/lib/planetary'
import { canonicalizeShareParams } from '@/app/lib/shareParams'

export const runtime = 'edge'

const WIDTH = 1200
const HEIGHT = 630

const ZONE_CLR: Record<number, string> = {
  0: '#aaaaaa',
  1: '#ee44ee',
  2: '#4488ff',
  3: '#44cc77',
  4: '#ee4444',
  5: '#ee8833',
  6: '#ddcc33',
  7: '#7755cc',
  8: '#9944ee',
  9: '#666666',
}

const SYZYGIES: Array<[number, number]> = [
  [4, 5], [3, 6], [2, 7], [1, 8], [0, 9],
]

const PLOT = { x: 70, y: 45, w: 700, h: 540 }

function getLayoutPositions(layout: Layout, date?: string): Record<number, Pos> {
  switch (layout) {
    case 'original':
      return P_ORIGINAL
    case 'ladder':
      return P_LADDER
    case 'planetary': {
      const angles = date
        ? getAnglesForDate(new Date(`${date}T12:00:00`))
        : PLANETARY_DEFAULT_ANGLE
      return computePlanetaryPositions(angles)
    }
    case 'labyrinth':
    default:
      return P_LABYRINTH
  }
}

function scalePositions(points: Record<number, Pos>): Record<number, Pos> {
  const values = Object.values(points)
  const minX = Math.min(...values.map(p => p.x))
  const maxX = Math.max(...values.map(p => p.x))
  const minY = Math.min(...values.map(p => p.y))
  const maxY = Math.max(...values.map(p => p.y))

  const spanX = Math.max(1, maxX - minX)
  const spanY = Math.max(1, maxY - minY)
  const scale = Math.min(PLOT.w / spanX, PLOT.h / spanY)

  const contentW = spanX * scale
  const contentH = spanY * scale
  const offsetX = PLOT.x + (PLOT.w - contentW) / 2
  const offsetY = PLOT.y + (PLOT.h - contentH) / 2

  const out: Record<number, Pos> = {}
  for (let z = 0; z <= 9; z++) {
    out[z] = {
      x: offsetX + (points[z].x - minX) * scale,
      y: offsetY + (points[z].y - minY) * scale,
    }
  }
  return out
}

function parseSelected(selected: string): Set<number> {
  const set = new Set<number>()
  for (const part of selected.split(',')) {
    const n = Number(part.trim())
    if (Number.isInteger(n) && n >= 0 && n <= 9) set.add(n)
  }
  return set
}

function formatShareTitle(selectedIds: number[]): string {
  if (selectedIds.length === 0) return 'IDS :: NONE'
  return `IDS :: ${selectedIds.join(' · ')}`
}

function formatShareSubtitle(
  layout: Layout,
  selectedIds: number[],
  params: {
    region?: string
    layers?: string
    tc?: string
    particles?: string
    date?: string
    orbits?: string
  }
): string {
  const bits: string[] = [
    `${selectedIds.length} selected ${selectedIds.length === 1 ? 'zone' : 'zones'}`,
    `${layout.toUpperCase()} layout`,
  ]
  if (params.region) bits.push(`${params.region.toUpperCase()} region`)
  if (params.layers) bits.push(`${params.layers.split(',').filter(Boolean).length} layers`)
  if (params.tc === '1') bits.push('TC enabled')
  if (params.particles === '1') bits.push('particles enabled')
  if (params.date) bits.push(`date ${params.date}`)
  if (params.orbits === '0') bits.push('orbits hidden')
  return bits.join(' · ')
}

export async function GET(req: NextRequest) {
  try {
    const canonical = canonicalizeShareParams(req.nextUrl.searchParams)
    const layout = (canonical.params.layout || 'labyrinth') as Layout
    const selected = parseSelected(canonical.params.selected || '')
    const selectedIds = Array.from(selected).sort((a, b) => a - b)
    const date = canonical.params.date
    const showOrbits = canonical.params.orbits !== '0'

    const positions = scalePositions(getLayoutPositions(layout, date))
    const layoutLabel = layout.toUpperCase()
    const selectedLabel = selectedIds.join(', ')
    const titleText = formatShareTitle(selectedIds)
    const subtitleText = formatShareSubtitle(layout, selectedIds, canonical.params)

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            background: 'radial-gradient(circle at 24% 28%, #0f1824 0%, #07090f 58%, #05060a 100%)',
            color: '#d1d5db',
            fontFamily: 'monospace',
          }}
        >
          <svg
            width={WIDTH}
            height={HEIGHT}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ position: 'absolute', inset: 0 }}
          >
            {Array.from({ length: 25 }, (_, i) => (
              <line
                key={`grid-x-${i}`}
                x1={i * 50}
                y1={0}
                x2={i * 50}
                y2={HEIGHT}
                stroke="#10ff500a"
                strokeWidth={0.8}
              />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <line
                key={`grid-y-${i}`}
                x1={0}
                y1={i * 50}
                x2={WIDTH}
                y2={i * 50}
                stroke="#10ff5009"
                strokeWidth={0.8}
              />
            ))}

            {layout === 'planetary' && showOrbits && (
              <>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(zone => {
                  const dx = positions[zone].x - positions[0].x
                  const dy = positions[zone].y - positions[0].y
                  const r = Math.sqrt(dx * dx + dy * dy)
                  return (
                    <circle
                      key={`orbit-${zone}`}
                      cx={positions[0].x}
                      cy={positions[0].y}
                      r={r}
                      fill="none"
                      stroke="#10ff5024"
                      strokeWidth={1}
                      strokeDasharray="4 6"
                    />
                  )
                })}
              </>
            )}

            {SYZYGIES.map(([a, b]) => (
              <line
                key={`syz-${a}-${b}`}
                x1={positions[a].x}
                y1={positions[a].y}
                x2={positions[b].x}
                y2={positions[b].y}
                stroke="#d4d4d4"
                strokeWidth={1.4}
                opacity={0.26}
              />
            ))}

            {Array.from({ length: 10 }, (_, z) => z).map(z => {
              const isSelected = selected.has(z)
              return (
                <circle
                  key={`glow-${z}`}
                  cx={positions[z].x}
                  cy={positions[z].y}
                  r={isSelected ? 36 : 26}
                  fill={ZONE_CLR[z]}
                  opacity={isSelected ? 0.34 : 0.12}
                />
              )
            })}

            {Array.from({ length: 10 }, (_, z) => z).map(z => {
              const isSelected = selected.has(z)
              return (
                <circle
                  key={`node-${z}`}
                  cx={positions[z].x}
                  cy={positions[z].y}
                  r={isSelected ? 20 : 16}
                  fill="#090a0f"
                  stroke={ZONE_CLR[z]}
                  strokeWidth={isSelected ? 3 : 2}
                />
              )
            })}
          </svg>

          {Array.from({ length: 10 }, (_, z) => z).map(z => (
            <div
              key={`digit-${z}`}
              style={{
                position: 'absolute',
                left: positions[z].x - 10,
                top: positions[z].y - 12,
                width: 20,
                height: 24,
                textAlign: 'center',
                color: ZONE_CLR[z],
                fontWeight: 700,
                fontSize: 18,
                lineHeight: 1.2,
                textShadow: selected.has(z) ? '0 0 9px rgba(16,255,80,0.45)' : 'none',
              }}
            >
              {z}
            </div>
          ))}

          <div
            style={{
              position: 'absolute',
              right: 56,
              top: 64,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 8,
            }}
          >
            <div style={{ color: '#10ff50', opacity: 0.55, letterSpacing: '0.22em', fontSize: 13 }}>
              CCRU //
            </div>
            <div
              style={{
                color: '#f3f4f6',
                fontSize: titleText.length > 24 ? 36 : 44,
                fontWeight: 700,
                lineHeight: 1.05,
                maxWidth: 380,
                textAlign: 'right',
                wordBreak: 'break-word',
              }}
            >
              {titleText}
            </div>
            <div
              style={{
                color: '#10ff50',
                opacity: 0.78,
                letterSpacing: '0.1em',
                fontSize: 12,
                maxWidth: 390,
                textAlign: 'right',
                lineHeight: 1.25,
              }}
            >
              {subtitleText}
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: 56,
              bottom: 58,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 5,
              fontSize: 11,
              letterSpacing: '0.08em',
            }}
          >
            <div style={{ color: '#10ff50', opacity: 0.85 }}>
              LAYOUT :: {layoutLabel}
            </div>
            <div style={{ color: '#d1d5db', opacity: 0.9 }}>
              SELECTED :: {selectedLabel || 'NONE'}
            </div>
            {canonical.params.date && (
              <div style={{ color: '#9ca3af' }}>
                DATE :: {canonical.params.date}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid share params.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
