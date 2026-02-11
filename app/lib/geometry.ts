import type { Pos } from '../data/types'

export function midpoint(a: Pos, b: Pos): Pos {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export function syzMidBiased(zone: number, pos: Record<number, Pos>): Pos {
  const a = pos[zone], b = pos[9 - zone]
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
  return { x: mx + (a.x - mx) * 0.15, y: my + (a.y - my) * 0.15 }
}

export function quadPath(from: Pos, to: Pos, bulge: number): string {
  if (Math.abs(bulge) < 0.5) return `M${from.x} ${from.y}L${to.x} ${to.y}`
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
  const dx = to.x - from.x, dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len, py = dx / len
  return `M${from.x} ${from.y}Q${mx + px * bulge} ${my + py * bulge} ${to.x} ${to.y}`
}

export function loopPath(p: Pos, dir: 'below' | 'above'): string {
  const r = 13, off = 20
  if (dir === 'below')
    return `M${p.x - r} ${p.y + off}A${r} ${r} 0 1 0 ${p.x + r} ${p.y + off}A${r} ${r} 0 1 0 ${p.x - r} ${p.y + off}`
  return `M${p.x - r} ${p.y - off}A${r} ${r} 0 1 1 ${p.x + r} ${p.y - off}A${r} ${r} 0 1 1 ${p.x - r} ${p.y - off}`
}

export function curveAway(from: Pos, to: Pos, cx: number, cy: number, factor = 0.2): string {
  const dx = to.x - from.x, dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
  const px = -dy / dist, py = dx / dist
  const dot = px * (cx - mx) + py * (cy - my)
  const sign = dot > 0 ? -1 : 1
  return quadPath(from, to, sign * dist * factor)
}

export function syzTrianglePoints(zone: number, pos: Record<number, Pos>): string {
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
