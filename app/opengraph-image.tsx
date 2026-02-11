import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'CCRU Numogram — The Decimal Labyrinth'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ZONE_CLR: Record<number, string> = {
  0: '#aaaaaa', 1: '#ee44ee', 2: '#4488ff', 3: '#44cc77', 4: '#ee4444',
  5: '#ee8833', 6: '#ddcc33', 7: '#7755cc', 8: '#9944ee', 9: '#666666',
}

const PLANET_SYMBOL: Record<number, string> = {
  0: '\u2609', 1: '\u263F', 2: '\u2640', 3: '\u2641', 4: '\u2642',
  5: '\u2643', 6: '\u2644', 7: '\u2645', 8: '\u2646', 9: '\u2647',
}

const PLANET_NAME: Record<number, string> = {
  0: 'Sol', 1: 'Mercury', 2: 'Venus', 3: 'Earth', 4: 'Mars',
  5: 'Jupiter', 6: 'Saturn', 7: 'Uranus', 8: 'Neptune', 9: 'Pluto',
}

// Labyrinth layout positions, scaled to OG image
const POS: Record<number, { x: number; y: number }> = {
  6: { x: 340, y: 100 }, 3: { x: 510, y: 100 },
  8: { x: 425, y: 210 },
  7: { x: 245, y: 290 }, 1: { x: 605, y: 290 },
  2: { x: 245, y: 410 }, 4: { x: 605, y: 410 },
  5: { x: 425, y: 490 },
  9: { x: 340, y: 565 }, 0: { x: 510, y: 565 },
}

const SYZYGIES = [
  [4, 5], [3, 6], [2, 7], [1, 8], [0, 9],
]

export default function Image() {
  const nodeRadius = 24

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#070707',
          position: 'relative',
          fontFamily: 'monospace',
        }}
      >
        {/* Background grid */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Subtle grid lines */}
          {Array.from({ length: 25 }, (_, i) => (
            <line
              key={`vg-${i}`}
              x1={i * 50}
              y1={0}
              x2={i * 50}
              y2={630}
              stroke="#10ff5008"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line
              key={`hg-${i}`}
              x1={0}
              y1={i * 50}
              x2={1200}
              y2={i * 50}
              stroke="#10ff5008"
              strokeWidth={0.5}
            />
          ))}

          {/* Syzygy connections */}
          {SYZYGIES.map(([a, b]) => (
            <line
              key={`syz-${a}-${b}`}
              x1={POS[a].x}
              y1={POS[a].y}
              x2={POS[b].x}
              y2={POS[b].y}
              stroke="#ffffff"
              strokeWidth={1.5}
              opacity={0.12}
            />
          ))}

          {/* Zone nodes - glow circles */}
          {Object.entries(POS).map(([zStr, p]) => {
            const z = Number(zStr)
            return (
              <circle
                key={`glow-${z}`}
                cx={p.x}
                cy={p.y}
                r={nodeRadius + 8}
                fill={ZONE_CLR[z]}
                opacity={0.08}
              />
            )
          })}

          {/* Zone nodes - main circles */}
          {Object.entries(POS).map(([zStr, p]) => {
            const z = Number(zStr)
            return (
              <circle
                key={`node-${z}`}
                cx={p.x}
                cy={p.y}
                r={nodeRadius}
                fill="#0a0a0a"
                stroke={ZONE_CLR[z]}
                strokeWidth={2}
              />
            )
          })}
        </svg>

        {/* Zone labels - rendered as HTML for better text support */}
        {Object.entries(POS).map(([zStr, p]) => {
          const z = Number(zStr)
          return (
            <div
              key={`label-${z}`}
              style={{
                position: 'absolute',
                left: p.x - nodeRadius,
                top: p.y - nodeRadius,
                width: nodeRadius * 2,
                height: nodeRadius * 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: ZONE_CLR[z],
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                lineHeight: 1,
              }}
            >
              <span>{z}</span>
            </div>
          )
        })}

        {/* Planet names along right side */}
        {Object.entries(POS).map(([zStr, p]) => {
          const z = Number(zStr)
          const isLeft = p.x < 425
          return (
            <div
              key={`planet-${z}`}
              style={{
                position: 'absolute',
                left: isLeft ? p.x - nodeRadius - 80 : p.x + nodeRadius + 12,
                top: p.y - 9,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: ZONE_CLR[z],
                fontSize: 11,
                fontFamily: 'monospace',
                opacity: 0.6,
              }}
            >
              <span>{PLANET_SYMBOL[z]}</span>
              <span>{PLANET_NAME[z]}</span>
            </div>
          )
        })}

        {/* Title block - right side */}
        <div
          style={{
            position: 'absolute',
            right: 50,
            top: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: '#10ff50',
              opacity: 0.4,
              letterSpacing: '0.3em',
              fontFamily: 'monospace',
              marginBottom: 8,
            }}
          >
            CCRU //
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#e8e8e8',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            NUMOGRAM
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#10ff50',
              opacity: 0.5,
              letterSpacing: '0.15em',
              fontFamily: 'monospace',
              marginTop: 12,
            }}
          >
            THE DECIMAL LABYRINTH
          </div>
        </div>

        {/* Bottom info */}
        <div
          style={{
            position: 'absolute',
            right: 50,
            bottom: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: '#10ff50',
              opacity: 0.3,
              fontFamily: 'monospace',
              letterSpacing: '0.2em',
            }}
          >
            ZONES :: SYZYGIES :: CURRENTS :: GATES
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#888888',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
            }}
          >
            PLANETARY ORBITAL VISUALIZATION
          </div>
        </div>

        {/* Decorative corner markers */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 2, opacity: 0.15 }}>
          <div style={{ width: 24, height: 2, background: '#10ff50' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: 24, background: '#10ff50' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', opacity: 0.15 }}>
          <div style={{ width: 24, height: 2, background: '#10ff50', position: 'absolute', bottom: 0, right: 0 }} />
          <div style={{ width: 2, height: 24, background: '#10ff50', position: 'absolute', bottom: 0, right: 0 }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
