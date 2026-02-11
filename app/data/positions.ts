import type { Pos, Layout } from './types'

export const P_ORIGINAL: Record<number, Pos> = {
  6: { x: 250, y: 85 }, 3: { x: 420, y: 115 },
  2: { x: 560, y: 275 }, 7: { x: 580, y: 400 },
  5: { x: 250, y: 370 }, 4: { x: 178, y: 480 },
  1: { x: 400, y: 550 }, 8: { x: 400, y: 660 },
  9: { x: 400, y: 770 }, 0: { x: 400, y: 875 },
}

export const P_LABYRINTH: Record<number, Pos> = {
  6: { x: 305, y: 60 }, 3: { x: 495, y: 60 },
  8: { x: 400, y: 220 },
  7: { x: 200, y: 335 }, 1: { x: 600, y: 335 },
  2: { x: 200, y: 540 }, 4: { x: 600, y: 540 },
  5: { x: 400, y: 655 },
  9: { x: 305, y: 815 }, 0: { x: 495, y: 815 },
}

export const P_LADDER: Record<number, Pos> = {
  4: { x: 260, y: 100 }, 5: { x: 540, y: 100 },
  3: { x: 260, y: 275 }, 6: { x: 540, y: 275 },
  2: { x: 260, y: 450 }, 7: { x: 540, y: 450 },
  1: { x: 260, y: 625 }, 8: { x: 540, y: 625 },
  0: { x: 260, y: 800 }, 9: { x: 540, y: 800 },
}

export const PLANETARY_CX = 400
export const PLANETARY_CY = 400

export const PLANETARY_RADIUS: Record<number, number> = {
  0: 0, 1: 55, 2: 95, 3: 130, 4: 165, 5: 210, 6: 255, 7: 295, 8: 330, 9: 360,
}

export const PLANETARY_DEFAULT_ANGLE: Record<number, number> = {
  0: 0, 1: 250, 2: 210, 3: 170, 4: 130, 5: 310, 6: 350, 7: 30, 8: 70, 9: 0,
}

export const PLANETARY_SIZE: Record<number, number> = {
  0: 30, 1: 12, 2: 16, 3: 17, 4: 14, 5: 26, 6: 24, 7: 21, 8: 20, 9: 11,
}

export const CENTER: Record<Layout, Pos> = {
  labyrinth: { x: 400, y: 438 },
  ladder: { x: 400, y: 450 },
  original: { x: 400, y: 460 },
  planetary: { x: 400, y: 400 },
}
