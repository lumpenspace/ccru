import type { Pos } from '../data/types'
import { PLANETARY_CX, PLANETARY_CY, PLANETARY_RADIUS } from '../data/positions'

export const ORBITAL_PERIOD: Record<number, number> = {
  0: Infinity, 1: 0.24, 2: 0.62, 3: 1, 4: 1.88, 5: 11.86, 6: 29.46, 7: 84.01, 8: 164.8, 9: 248.1,
}

export const J2000_MEAN_LONGITUDE: Record<number, number> = {
  0: 0, 1: 252.25, 2: 181.98, 3: 100.46, 4: 355.45, 5: 34.40, 6: 49.94, 7: 313.23, 8: 304.88, 9: 238.93,
}

export function computePlanetaryPositions(angles: Record<number, number>): Record<number, Pos> {
  const positions: Record<number, Pos> = {}
  for (let z = 0; z <= 9; z++) {
    const r = PLANETARY_RADIUS[z]
    const a = (angles[z] - 90) * Math.PI / 180
    positions[z] = {
      x: PLANETARY_CX + Math.cos(a) * r,
      y: PLANETARY_CY + Math.sin(a) * r,
    }
  }
  return positions
}

export function getAnglesForDate(date: Date = new Date()): Record<number, number> {
  const now = date
  const j2000 = new Date(2000, 0, 1, 12, 0, 0)
  const yearsSinceJ2000 = (now.getTime() - j2000.getTime()) / (365.25 * 24 * 3600 * 1000)
  const angles: Record<number, number> = {}
  for (let z = 0; z <= 9; z++) {
    if (z === 0) { angles[z] = 0; continue }
    const period = ORBITAL_PERIOD[z]
    angles[z] = (J2000_MEAN_LONGITUDE[z] + (360 / period) * yearsSinceJ2000) % 360
  }
  return angles
}
