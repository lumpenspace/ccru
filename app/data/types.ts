export type Region = 'torque' | 'warp' | 'plex'
export type Pos = { x: number; y: number }
export type Layout = 'labyrinth' | 'ladder' | 'original' | 'planetary'
export type Layer = 'syzygies' | 'currents' | 'gates' | 'pandemonium'
export type LabelVisibility = {
  numbers: boolean
  xenotation: boolean
  planets: boolean
}

export interface ZoneMeta {
  planet: string
  planetFull: string
  desc: string
  spinal: string
  meshTag: string
  door: string
  phaseCount: number
  lemurs: string[]
  lemurian: string
  centauri: string
}

export interface SyzygyData {
  a: number; b: number; demon: string; desc: string
}

export interface CurrentData {
  name: string; from: number; to: number; label: string; desc: string
}

export interface GateData {
  name: string; from: number; to: number; cum: number; desc: string; detail: string
}

export interface Demon {
  a: number; b: number; name: string; kind: string
}

export type HoverInfo =
  | { type: 'zone'; zone: number }
  | { type: 'syzygy'; data: SyzygyData }
  | { type: 'current'; data: CurrentData }
  | { type: 'gate'; gate: GateData }
  | { type: 'demon'; demon: Demon }

export type GateRender =
  | { type: 'loop'; loop: string; mid?: Pos }
  | { type: 'single'; path: string; mid?: Pos }
  | { type: 'ygate'; legA: string; legB: string; stem: string; junction: Pos }

export type CurrentRender =
  | { type: 'single'; path: string; mid: Pos }
  | { type: 'yshape'; legA: string; legB: string; stem: string; junction: Pos }
  | { type: 'loop'; legA: string; legB: string; loop: string; junction: Pos }
