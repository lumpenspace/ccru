import type { Layout, Layer, Region } from '../data/types'

const SHARE_PARAM_KEYS = [
  'date',
  'layers',
  'layout',
  'orbits',
  'particles',
  'region',
  'selected',
  'tc',
] as const

const SHARE_PARAM_KEY_SET = new Set<string>(SHARE_PARAM_KEYS)

const ALLOWED_LAYOUTS = new Set<Layout>(['labyrinth', 'ladder', 'original', 'planetary'])
const ALLOWED_LAYERS = new Set<Layer>(['syzygies', 'currents', 'gates', 'pandemonium'])
const ALLOWED_REGIONS = new Set<Region>(['torque', 'warp', 'plex'])

type ShareParamKey = (typeof SHARE_PARAM_KEYS)[number]
type ShareParamMap = Partial<Record<ShareParamKey, string>>

export interface CanonicalShareParams {
  params: ShareParamMap
  canonicalQuery: string
  sortedParamKeys: string[]
  sortedValues: string[]
}

type RawShareParams = URLSearchParams | Record<string, unknown>

function normalizeRawInput(input: RawShareParams): Map<string, string> {
  const entries = new Map<string, string>()

  if (input instanceof URLSearchParams) {
    input.forEach((v, k) => {
      const key = k.trim()
      const value = v.trim()
      if (!key || !value) return
      entries.set(key, value)
    })
    return entries
  }

  for (const [k, v] of Object.entries(input)) {
    if (typeof v !== 'string') continue
    const key = k.trim()
    const value = v.trim()
    if (!key || !value) continue
    entries.set(key, value)
  }
  return entries
}

function parseDigitSet(value: string): number[] | null {
  if (!value) return null
  const parts = value.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0 || parts.length > 10) return null

  const set = new Set<number>()
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null
    const n = Number(p)
    if (!Number.isInteger(n) || n < 0 || n > 9) return null
    set.add(n)
  }

  if (set.size === 0) return null
  return Array.from(set).sort((a, b) => a - b)
}

function parseCsvTokens(value: string): string[] {
  return value.split(',').map(part => part.trim()).filter(Boolean)
}

function normalizeDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [yy, mm, dd] = value.split('-').map(Number)
  if (!yy || !mm || !dd) return null
  if (yy < 1900 || yy > 2100) return null

  const dt = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(dt.getTime())) return null
  if (dt.getUTCFullYear() !== yy || dt.getUTCMonth() + 1 !== mm || dt.getUTCDate() !== dd) return null

  return value
}

function normalizeBooleanFlag(value: string): '0' | '1' | null {
  if (value === '0' || value === '1') return value
  return null
}

function fail(message: string): never {
  throw new Error(message)
}

export function canonicalizeShareParams(input: RawShareParams): CanonicalShareParams {
  const raw = normalizeRawInput(input)
  if (raw.size === 0) fail('No share params provided.')

  raw.forEach((_value, key) => {
    if (!SHARE_PARAM_KEY_SET.has(key)) {
      fail(`Unsupported share param "${key}".`)
    }
  })

  if (!raw.has('layout')) fail('Missing required share param "layout".')

  const layout = raw.get('layout') as Layout
  if (!ALLOWED_LAYOUTS.has(layout)) fail('Invalid layout value.')

  const params: ShareParamMap = {
    layout,
  }

  if (raw.has('selected')) {
    const selected = parseDigitSet(raw.get('selected') || '')
    if (!selected) fail('Invalid selected value. Must be unique digits in range 0-9.')
    params.selected = selected.join(',')
  }

  if (raw.has('layers')) {
    const tokens = parseCsvTokens(raw.get('layers') || '')
    if (tokens.length === 0 || tokens.length > ALLOWED_LAYERS.size) {
      fail('Invalid layers value.')
    }
    const normalized = Array.from(new Set(tokens))
    for (const layer of normalized) {
      if (!ALLOWED_LAYERS.has(layer as Layer)) {
        fail(`Invalid layer "${layer}".`)
      }
    }
    params.layers = normalized.sort((a, b) => a.localeCompare(b)).join(',')
  }

  if (raw.has('region')) {
    const region = raw.get('region') as Region
    if (!ALLOWED_REGIONS.has(region)) fail('Invalid region value.')
    params.region = region
  }

  if (raw.has('tc')) {
    const flag = normalizeBooleanFlag(raw.get('tc') || '')
    if (!flag) fail('Invalid tc value.')
    params.tc = flag
  }

  if (raw.has('particles')) {
    const flag = normalizeBooleanFlag(raw.get('particles') || '')
    if (!flag) fail('Invalid particles value.')
    params.particles = flag
  }

  if (raw.has('date')) {
    if (layout !== 'planetary') fail('Date is only valid for planetary layout.')
    const normalizedDate = normalizeDate(raw.get('date') || '')
    if (!normalizedDate) fail('Invalid date value.')
    params.date = normalizedDate
  }

  if (raw.has('orbits')) {
    if (layout !== 'planetary') fail('Orbits is only valid for planetary layout.')
    const flag = normalizeBooleanFlag(raw.get('orbits') || '')
    if (!flag) fail('Invalid orbits value.')
    params.orbits = flag
  }

  const sortedParamKeys = Object.keys(params).sort((a, b) => a.localeCompare(b))
  const canonical = new URLSearchParams()
  for (const key of sortedParamKeys) {
    canonical.set(key, params[key as ShareParamKey] as string)
  }

  const sortedValues = Array.from(
    new Set(sortedParamKeys.map(key => params[key as ShareParamKey] as string))
  ).sort((a, b) => a.localeCompare(b))

  return {
    params,
    canonicalQuery: canonical.toString(),
    sortedParamKeys,
    sortedValues,
  }
}
