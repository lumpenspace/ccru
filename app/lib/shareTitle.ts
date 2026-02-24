import type { Layout } from '../data/types'

type ShareTitleInput = {
  layout: Layout
  selectedIds: number[]
  layers?: string
  particles?: boolean | '0' | '1'
  date?: string
  orbits?: '0' | '1'
}

function flagEnabled(value: ShareTitleInput['particles']): boolean {
  return value === true || value === '1'
}

export function buildNumogramTitle(input: ShareTitleInput): string {
  const zonesPart = input.selectedIds.length > 0 ? input.selectedIds.join(',') : 'all'
  const settings: string[] = [`layout=${input.layout}`]

  if (input.layers) settings.push(`layers=${input.layers}`)
  if (flagEnabled(input.particles)) settings.push('particles=1')
  if (input.date) settings.push(`date=${input.date}`)
  if (input.orbits === '0') settings.push('orbits=0')

  return `NUMOGRAM :: [${zonesPart}] [${settings.join(' ')}]`
}
