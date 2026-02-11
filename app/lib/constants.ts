import type { Region } from '../data/types'

export const TWEEN_DURATION = 600

export const REGION_CLR: Record<Region, string> = {
  torque: '#00ccff',
  warp: '#44cc77',
  plex: '#aa6633',
}

export const TC_EDGES: [number, number][] = [[1, 8], [8, 7], [7, 2], [2, 5], [5, 4], [4, 1]]
export const TC_CURRENTS = new Set(['Surge', 'Hold', 'Sink'])
export const TC_SYZYGIES: [number, number][] = [[1, 8], [2, 7], [4, 5]]
