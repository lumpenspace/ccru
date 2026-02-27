import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { GlitchText } from './components/ui/GlitchText'

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
  title: 'qliphoth.systems',
  description: 'lemurian technology for the masses',
}

export default function GlobalHome({ searchParams }: { searchParams: SearchParams }) {
  if (hasNumogramQuery(searchParams)) {
    const query = toQueryString(searchParams)
    redirect(`/numogram${query ? `?${query}` : ''}`)
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col justify-center px-4 py-10">
        <h1>
          <GlitchText
            text="qliphoth.systems"
            className="text-2xl md:text-3xl tracking-[0.2em] normal-case text-gray-100"
          />
        </h1>
        <p className="mt-2 text-sm tracking-[0.08em] text-gray-400">
          lemurian technology for the masses
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/numogram"
            className="relative block border border-[#334155] bg-[#0b111a] p-4 pr-10 transition-colors hover:border-[#10ff50]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/numogram-logo.svg"
              alt=""
              aria-hidden="true"
              className="absolute right-3 top-3 h-4 w-4 opacity-90"
              style={{ filter: 'drop-shadow(0 0 3px rgba(16,255,80,0.4))' }}
            />
            <h2>
              <GlitchText text="Numogram" className="text-sm tracking-[0.16em]" />
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Interactive decimal labyrinth with shareable state and preview images.
            </p>
          </Link>

          <Link
            href="/components"
            className="relative block border border-[#334155] bg-[#0b111a] p-4 pr-10 transition-colors hover:border-[#10ff50]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.svg"
              alt=""
              aria-hidden="true"
              className="absolute right-3 top-3 h-4 w-4 rounded-sm opacity-90"
              style={{ filter: 'drop-shadow(0 0 3px rgba(16,255,80,0.4))' }}
            />
            <h2>
              <GlitchText text="Components" className="text-sm tracking-[0.16em]" />
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Try the core interface controls and interaction patterns used throughout the site.
            </p>
          </Link>

          <Link
            href="/gematria"
            className="relative block border border-[#334155] bg-[#0b111a] p-4 pr-10 transition-colors hover:border-[#10ff50]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gematria-logo.svg"
              alt=""
              aria-hidden="true"
              className="absolute right-3 top-3 h-4 w-4 opacity-90"
              style={{ filter: 'drop-shadow(0 0 3px rgba(16,255,80,0.4))' }}
            />
            <h2>
              <GlitchText text="Gematria" className="text-sm tracking-[0.16em]" />
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Chrome plugin for gematria overlays, cipher settings, and saved entries.
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
