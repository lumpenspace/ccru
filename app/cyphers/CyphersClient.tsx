'use client'

import { useEffect, useMemo, useState } from 'react'

import { CCRU_CIPHERS } from './ccruCiphers'
import { calcGematria } from './gematria'
import { CyberButton } from '../components/ui/CyberButton'
import { CyberButtonGroup } from '../components/ui/CyberButtonGroup'
import { CyberCheckbox } from '../components/ui/CyberCheckbox'
import { CyberCodeBlock } from '../components/ui/CyberCodeBlock'
import { CyberInput } from '../components/ui/CyberInput'
import { CyberPageHeader } from '../components/ui/CyberPageHeader'
import { CyberPanel } from '../components/ui/CyberPanel'
import { CyberPopover } from '../components/ui/CyberPopover'
import { Pill } from '../components/ui/Pill'

type DocsTab = 'react' | 'chrome'

const REACT_COMPONENT_SNIPPET = `import { CypherHoverText } from '@/app/components/cyphers/CypherHoverText'
import { CCRU_CIPHERS } from '@/app/cyphers/ccruCiphers'

export default function Example() {
  const markdown = \`The numogram indexes language.
Hover each sentence for values.\`

  return <CypherHoverText cyphers={CCRU_CIPHERS} markdown={markdown} />
}`

const CHROME_PLUGIN_MANIFEST_SNIPPET = `{
  "manifest_version": 3,
  "name": "CCRU Cifers Overlay",
  "version": "0.1.0",
  "permissions": ["activeTab"],
  "action": { "default_title": "CCRU Cifers" },
  "content_scripts": [
    { "matches": ["<all_urls>"], "js": ["content.js"] }
  ]
}`

const CHROME_PLUGIN_CONTENT_SNIPPET = `// content.js
// Reuse CCRU ciphers from app/cyphers/ccruCiphers.ts
// and show sentence/paragraph gematria hover values in-page.`

const CIPHER_COLOR_BY_ID: Record<string, string> = {
  'alphanumeric-qabbala': '#ffe066',
  synx: '#46e0ff',
  'numeric-qwerty': '#00d4aa',
  qwerty: '#00f5ff',
  'alphanumeric-satanic': '#ff4d4d',
  'alphanumeric-primes': '#ffb84d',
  'alphanumeric-squares': '#7dd3ff',
  'alphanumeric-trigonal': '#ffd166',
  'archaic-alphanumeric': '#10ff50',
  'numeric-qwerty-primes': '#8affdb',
}

function cipherColor(id: string): string {
  return CIPHER_COLOR_BY_ID[id] || '#10ff50'
}

function countEnabled(enabled: Set<string>): number {
  let count = 0
  for (const cipher of CCRU_CIPHERS) {
    if (enabled.has(cipher.id)) count++
  }
  return count
}

function splitIntoBalancedLines<T>(items: T[]): T[][] {
  if (items.length <= 6) return [items]
  const midpoint = Math.ceil(items.length / 2)
  return [items.slice(0, midpoint), items.slice(midpoint)]
}

const DEFAULT_ENABLED_CIPHERS = new Set([
  'alphanumeric-qabbala',
  'synx',
  'qwerty',
])
const MOBILE_SELECTOR_BREAKPOINT = 820

export default function CyphersClient() {
  const [phrase, setPhrase] = useState('CCRU')
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(DEFAULT_ENABLED_CIPHERS)
  )
  const [docsOpen, setDocsOpen] = useState(false)
  const [docsTab, setDocsTab] = useState<DocsTab>('react')
  const [isMobile, setIsMobile] = useState(false)

  const enabledCount = useMemo(() => countEnabled(enabled), [enabled])
  const enabledCiphers = useMemo(
    () => CCRU_CIPHERS.filter(cipher => enabled.has(cipher.id)),
    [enabled]
  )

  const rows = useMemo(() => {
    return CCRU_CIPHERS
      .filter(cipher => enabled.has(cipher.id))
      .map(cipher => ({
        cipher,
        value: calcGematria(phrase, cipher),
      }))
  }, [enabled, phrase])

  const phraseWords = useMemo(
    () => phrase.split(/\s+/).map(word => word.trim()).filter(Boolean),
    [phrase]
  )

  const wordBreakdown = useMemo(
    () =>
      phraseWords.map(word => ({
        word,
        values: enabledCiphers.map(cipher => ({
          id: cipher.id,
          symbol: cipher.icon,
          value: calcGematria(word, cipher),
          accent: cipherColor(cipher.id),
        })),
      })),
    [enabledCiphers, phraseWords]
  )

  const toggleCipher = (id: string) => {
    setEnabled(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_SELECTOR_BREAKPOINT)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const resultGridClass = 'grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4'

  return (
    <main className="min-h-screen bg-[#05070d] text-gray-200 font-mono">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 md:py-8">
        <CyberPageHeader
          className="mb-5"
          title="Cifers"
          description="Live CCRU gematria calculator"
          links={[
            { href: '/', label: 'Home' },
            { href: '/numogram', label: 'Numogram' },
            { href: '/components', label: 'Components' },
          ]}
        />

        <CyberPanel
          id="cifers-select"
          title={`CCRU Cifers (${enabledCount}/${CCRU_CIPHERS.length})`}
          position={isMobile ? { x: 8, y: 64 } : { x: 12, y: 64 }}
          width={isMobile ? 'calc(100vw - 16px)' : 420}
          draggable={false}
          onDragStart={() => {}}
          positionMode="fixed"
          zIndex={60}
          defaultOpen
          collapseDirection="side"
          maxBodyHeight={900}
        >
          <div className="px-3 py-3">
            <div className="mb-2 flex justify-end">
              <CyberButtonGroup className="items-center">
                <CyberButton size="sm" onClick={() => setEnabled(new Set(CCRU_CIPHERS.map(cipher => cipher.id)))}>All</CyberButton>
                <CyberButton size="sm" onClick={() => setEnabled(new Set())}>None</CyberButton>
              </CyberButtonGroup>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CCRU_CIPHERS.map(cipher => {
                const checked = enabled.has(cipher.id)
                const accent = cipherColor(cipher.id)
                return (
                  <CyberPopover
                    key={cipher.id}
                    trigger={
                      <CyberCheckbox
                        checked={checked}
                        label={cipher.name}
                        icon={cipher.icon}
                        accent={accent}
                        onChange={() => toggleCipher(cipher.id)}
                        className="w-full justify-start gap-1.5 px-2 py-1 text-[9px]"
                      />
                    }
                    content={
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>
                          {cipher.name}
                        </div>
                        <div className="text-[11px] text-gray-300">{cipher.summary}</div>
                      </div>
                    }
                  />
                )
              })}
            </div>
          </div>
        </CyberPanel>

        <section className="space-y-4">
          <CyberPanel
            id="cifers-input"
            title="Input"
            position={{ x: 0, y: 0 }}
            width="100%"
            draggable={false}
            onDragStart={() => {}}
            positionMode="relative"
            showToggle={false}
          >
            <div className="space-y-3 px-3 py-3">
              <CyberInput
                label="Phrase"
                value={phrase}
                onChange={setPhrase}
                placeholder="Type text..."
              />
              {rows.length === 0 ? (
                <div className="text-center text-sm text-gray-500">No cifers enabled.</div>
              ) : (
                <div className="w-full space-y-1">
                  {splitIntoBalancedLines(rows).map((line, lineIndex) => (
                    <div
                      key={`sentence-line-${lineIndex}`}
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${Math.max(1, line.length)}, minmax(0, 1fr))` }}
                    >
                      {line.map(row => {
                        const accent = cipherColor(row.cipher.id)
                        return (
                          <Pill
                            key={row.cipher.id}
                            accent={accent}
                            className="w-full justify-center text-center text-[10px]"
                            title={`${row.cipher.name}: ${row.value}`}
                          >
                            {row.cipher.icon} {row.value}
                          </Pill>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center text-[10px] uppercase tracking-[0.12em] text-gray-500">Sentence Word Map</div>
              {wordBreakdown.length === 0 ? (
                <div className="text-center text-xs text-gray-500">Type a phrase to see per-word values.</div>
              ) : (
                <div className={resultGridClass}>
                  {wordBreakdown.map((entry, index) => (
                    <div key={`${entry.word}-${index}`} className="flex w-full flex-col items-center gap-1 border border-[#1e293b] bg-[#070d14] px-1.5 py-1">
                      <span className="text-xs text-gray-200">{entry.word}</span>
                      <div className="w-full space-y-1">
                        {splitIntoBalancedLines(entry.values).map((line, lineIndex) => (
                          <div
                            key={`${entry.word}-line-${lineIndex}`}
                            className="grid gap-1"
                            style={{ gridTemplateColumns: `repeat(${Math.max(1, line.length)}, minmax(0, 1fr))` }}
                          >
                            {line.map(item => (
                              <Pill
                                key={`${entry.word}-${item.id}`}
                                accent={item.accent}
                                className="w-full justify-center text-center text-[8px]"
                                title={`${item.symbol}: ${item.value}`}
                              >
                                {item.symbol} {item.value}
                              </Pill>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CyberPanel>
        </section>

        <section className="mt-6 space-y-3">
          <CyberPanel
            id="cifers-docs"
            title="Secondary Docs"
            position={{ x: 0, y: 0 }}
            width="100%"
            draggable={false}
            onDragStart={() => {}}
            positionMode="relative"
            open={docsOpen}
            onToggle={() => setDocsOpen(v => !v)}
            collapseDirection="vertical"
            maxBodyHeight={1200}
          >
            <div className="space-y-3 px-3 py-3">
              <CyberButtonGroup>
                <CyberButton active={docsTab === 'react'} onClick={() => setDocsTab('react')}>React Component</CyberButton>
                <CyberButton active={docsTab === 'chrome'} onClick={() => setDocsTab('chrome')}>Chrome Plugin</CyberButton>
              </CyberButtonGroup>

              {docsTab === 'react' && (
                <CyberCodeBlock code={REACT_COMPONENT_SNIPPET} language="tsx" />
              )}
              {docsTab === 'chrome' && (
                <div className="space-y-4">
                  <CyberCodeBlock code={CHROME_PLUGIN_MANIFEST_SNIPPET} language="json" />
                  <CyberCodeBlock code={CHROME_PLUGIN_CONTENT_SNIPPET} language="js" />
                </div>
              )}
            </div>
          </CyberPanel>
        </section>
      </div>
    </main>
  )
}
