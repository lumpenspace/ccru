import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

type SearchParams = Record<string, string | string[] | undefined>

const NUMOGRAM_QUERY_KEYS = new Set([
  'layout',
  'selected',
  'layers',
  'region',
  'tc',
  'particles',
  'date',
  'orbits',
  'img',
])

function toQueryString(searchParams: SearchParams): string {
  const params = new URLSearchParams()
  for (const [key, raw] of Object.entries(searchParams)) {
    if (typeof raw === 'string') {
      params.set(key, raw)
      continue
    }
    if (Array.isArray(raw)) {
      for (const value of raw) params.append(key, value)
    }
  }
  return params.toString()
}

function hasNumogramQuery(searchParams: SearchParams): boolean {
  return Object.keys(searchParams).some(key => NUMOGRAM_QUERY_KEYS.has(key))
}

export const metadata: Metadata = {
  title: 'QLIPHOTH Systems',
  description: 'Global entrypoint for Numogram, Cifers, Components, and the standalone Gematria module.',
}

export default function GlobalHome({ searchParams }: { searchParams: SearchParams }) {
  if (hasNumogramQuery(searchParams)) {
    const query = toQueryString(searchParams)
    redirect(`/numogram${query ? `?${query}` : ''}`)
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col justify-center px-4 py-10">
        <h1 className="text-2xl md:text-3xl uppercase tracking-[0.2em] text-gray-100">QLIPHOTH Systems</h1>
        <p className="mt-2 text-sm tracking-[0.08em] text-gray-400">
          Shared homepage for the project tools.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/numogram"
            className="block border border-[#334155] bg-[#0b111a] p-4 transition-colors hover:border-[#10ff50]"
          >
            <h2 className="text-sm uppercase tracking-[0.16em] text-[#10ff50]">Numogram</h2>
            <p className="mt-2 text-sm text-gray-300">
              Interactive decimal labyrinth with shareable state and preview images.
            </p>
          </Link>

          <Link
            href="/cyphers"
            className="block border border-[#334155] bg-[#0b111a] p-4 transition-colors hover:border-[#10ff50]"
          >
            <h2 className="text-sm uppercase tracking-[0.16em] text-[#10ff50]">Cifers</h2>
            <p className="mt-2 text-sm text-gray-300">
              CCRU gematria page with React component notes, Chrome plugin scaffold, and live calculator.
            </p>
          </Link>

          <Link
            href="/components"
            className="block border border-[#334155] bg-[#0b111a] p-4 transition-colors hover:border-[#10ff50]"
          >
            <h2 className="text-sm uppercase tracking-[0.16em] text-[#10ff50]">Components</h2>
            <p className="mt-2 text-sm text-gray-300">
              Showcase of extracted UI primitives and the cypher hover React component.
            </p>
          </Link>

          <Link
            href="/gematria"
            className="block border border-[#334155] bg-[#0b111a] p-4 transition-colors hover:border-[#10ff50]"
          >
            <h2 className="text-sm uppercase tracking-[0.16em] text-[#10ff50]">Gematria</h2>
            <p className="mt-2 text-sm text-gray-300">
              Standalone module for the Chrome plugin, settings, and saved phrase list.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
