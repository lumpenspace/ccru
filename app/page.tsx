import type { Metadata } from 'next'

import NumogramClient from './NumogramClient'
import type { Layout } from './data/types'
import { buildNumogramTitle } from './lib/shareTitle'

type SearchParams = Record<string, string | string[] | undefined>

function firstParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.length > 0) return v[0]
  return undefined
}

function parseSelectedIds(selected?: string): number[] {
  if (!selected) return []
  const set = new Set<number>()
  for (const part of selected.split(',')) {
    const n = Number(part.trim())
    if (Number.isInteger(n) && n >= 0 && n <= 9) set.add(n)
  }
  return Array.from(set).sort((a, b) => a - b)
}

function normalizeImageUrl(raw?: string): string | undefined {
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

function buildShareDescription(
  layout: string,
  selectedIds: number[],
  params: { region?: string; tc?: string; particles?: string; date?: string; orbits?: string }
): string {
  if (selectedIds.length === 0) {
    return 'Interactive visualization of the Decimal Labyrinth.'
  }

  const bits: string[] = [
    `${selectedIds.length} selected ${selectedIds.length === 1 ? 'zone' : 'zones'}`,
    `${layout} layout`,
  ]
  if (params.region) bits.push(`${params.region} region`)
  if (params.tc === '1') bits.push('tc enabled')
  if (params.particles === '1') bits.push('particles enabled')
  if (params.date) bits.push(`date ${params.date}`)
  if (params.orbits === '0') bits.push('orbits hidden')

  return bits.join(' · ')
}

export async function generateMetadata(
  { searchParams }: { searchParams: SearchParams }
): Promise<Metadata> {
  const layout = firstParam(searchParams.layout) || 'labyrinth'
  const selectedIds = parseSelectedIds(firstParam(searchParams.selected))
  const imageUrl = normalizeImageUrl(firstParam(searchParams.img))

  const title = buildNumogramTitle({
    layout: layout as Layout,
    selectedIds,
    layers: firstParam(searchParams.layers),
    particles: firstParam(searchParams.particles) as '0' | '1' | undefined,
    date: firstParam(searchParams.date),
    orbits: firstParam(searchParams.orbits) as '0' | '1' | undefined,
  })
  const description = buildShareDescription(layout, selectedIds, {
    region: firstParam(searchParams.region),
    tc: firstParam(searchParams.tc),
    particles: firstParam(searchParams.particles),
    date: firstParam(searchParams.date),
    orbits: firstParam(searchParams.orbits),
  })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default function Page() {
  return <NumogramClient />
}
