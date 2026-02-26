'use client'

import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { Pill } from '../ui/Pill'

export type HoverCypher = {
  id?: string
  name: string
  shortName?: string
  chars: string
  values: number[]
  hue?: number
  saturation?: number
  lightness?: number
  diacriticsAsRegular?: boolean
  caseSensitive?: boolean
}

type HoverTarget = {
  label: string
  text: string
  x: number
  y: number
}

type CypherHoverTextProps = {
  cyphers: HoverCypher[]
  markdown?: string
  markup?: string
  className?: string
}

type ParsedParagraph = {
  text: string
  sentences: string[]
}

const NUMBER_CODES = new Set<number>([48, 49, 50, 51, 52, 53, 54, 55, 56, 57])
const DOT_PLACEHOLDER = '\uE000'
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+/gi
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

function protectDotTokens(text: string, regex: RegExp): string {
  return text.replace(regex, rawMatch => {
    const trailing = rawMatch.match(/[.!?]+$/)?.[0] || ''
    const token = trailing ? rawMatch.slice(0, -trailing.length) : rawMatch
    return token.replace(/\./g, DOT_PLACEHOLDER) + trailing
  })
}

function splitSentences(text: string): string[] {
  const protectedText = protectDotTokens(protectDotTokens(text, URL_RE), EMAIL_RE)
  const matches = protectedText.match(/[^.!?]+[.!?]*/g)
  if (!matches) {
    return [text].filter(part => part.trim().length > 0)
  }

  return matches
    .map(part => part.replaceAll(DOT_PLACEHOLDER, '.'))
    .filter(part => part.trim().length > 0)
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
}

function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const tokenRe = /(\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|__(.+?)__|`(.+?)`|\*(.+?)\*|_(.+?)_)/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = tokenRe.exec(text)) !== null) {
    const start = match.index
    if (start > last) {
      nodes.push(text.slice(last, start))
    }

    if (match[1].startsWith('[')) {
      const label = match[2]
      const href = match[3]
      nodes.push(
        <a
          key={`${keyPrefix}-link-${start}`}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-dotted underline-offset-2"
          onClick={e => e.stopPropagation()}
        >
          {label}
        </a>
      )
    } else if (match[4] || match[5]) {
      nodes.push(
        <strong key={`${keyPrefix}-strong-${start}`} className="font-semibold text-gray-100">
          {match[4] || match[5]}
        </strong>
      )
    } else if (match[6]) {
      nodes.push(
        <code
          key={`${keyPrefix}-code-${start}`}
          className="rounded border border-[#334155] bg-[#0b111a] px-1 py-[1px] text-[0.9em]"
        >
          {match[6]}
        </code>
      )
    } else {
      nodes.push(
        <em key={`${keyPrefix}-em-${start}`} className="italic text-gray-200">
          {match[7] || match[8]}
        </em>
      )
    }

    last = tokenRe.lastIndex
  }

  if (last < text.length) {
    nodes.push(text.slice(last))
  }

  return nodes
}

function normalizeMarkdownInput(markdown: string): string {
  return markdown
    .replace(/\r\n?/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
}

function fromMarkdown(markdown: string): ParsedParagraph[] {
  return normalizeMarkdownInput(markdown)
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(text => ({
      text,
      sentences: splitSentences(text),
    }))
}

function fromMarkup(markup: string): ParsedParagraph[] {
  if (typeof window !== 'undefined' && 'DOMParser' in window) {
    const doc = new window.DOMParser().parseFromString(markup, 'text/html')
    const pNodes = Array.from(doc.querySelectorAll('p'))
    if (pNodes.length > 0) {
      return pNodes
        .map(node => (node.textContent || '').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .map(text => ({ text, sentences: splitSentences(text) }))
    }
    const plain = (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
    if (!plain) return []
    return [{ text: plain, sentences: splitSentences(plain) }]
  }

  const plain = markup
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!plain) return []
  return [{ text: plain, sentences: splitSentences(plain) }]
}

function calcForCypher(text: string, cypher: HoverCypher): number {
  let prepared = text.replace(/\[.+\]/g, '').trim()

  if (cypher.diacriticsAsRegular !== false) {
    prepared = prepared.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }
  if (cypher.caseSensitive !== true) prepared = prepared.toLowerCase()

  const valueMap = new Map<number, number>()
  for (let i = 0; i < cypher.chars.length; i++) {
    valueMap.set(cypher.chars.charCodeAt(i), cypher.values[i])
  }

  let sum = 0
  for (let i = 0; i < prepared.length; i++) {
    const code = prepared.charCodeAt(i)
    const value = valueMap.get(code)
    if (value !== undefined) sum += value
  }

  if (!valueMap.has(49)) {
    let curNum = ''
    for (let i = 0; i < prepared.length; i++) {
      const code = prepared.charCodeAt(i)
      if (NUMBER_CODES.has(code)) {
        curNum += String(code - 48)
      } else if (curNum.length > 0 && code !== 44) {
        sum += Number(curNum)
        curNum = ''
      }
    }
    if (curNum.length > 0) sum += Number(curNum)
  }

  return sum
}

function cypherAccent(cypher: HoverCypher): string {
  if (
    typeof cypher.hue === 'number' &&
    typeof cypher.saturation === 'number' &&
    typeof cypher.lightness === 'number'
  ) {
    return `hsl(${cypher.hue} ${cypher.saturation}% ${cypher.lightness}%)`
  }
  return '#10ff50'
}

function splitIntoBalancedLines<T>(items: T[]): T[][] {
  if (items.length <= 6) return [items]
  const midpoint = Math.ceil(items.length / 2)
  return [items.slice(0, midpoint), items.slice(midpoint)]
}

export function CypherHoverText({ cyphers, markdown, markup, className = '' }: CypherHoverTextProps) {
  const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null)

  const paragraphs = useMemo(() => {
    if (markdown && markdown.trim().length > 0) return fromMarkdown(markdown)
    if (markup && markup.trim().length > 0) return fromMarkup(markup)
    return []
  }, [markdown, markup])

  const hoverValues = useMemo(() => {
    if (!hoverTarget) return []
    return cyphers.map((cypher, index) => ({
      cypher,
      value: calcForCypher(hoverTarget.text, cypher),
      accent: cypherAccent(cypher),
      key: cypher.id || cypher.name || `cypher-${index}`,
    }))
  }, [cyphers, hoverTarget])

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((paragraph, pIndex) => (
        <p
          key={`p-${pIndex}`}
          className="whitespace-pre-wrap leading-7 text-gray-300"
          onMouseEnter={e => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            setHoverTarget({
              label: `Paragraph ${pIndex + 1}`,
              text: stripInlineMarkdown(paragraph.text),
              x: rect.right + 12,
              y: rect.top + rect.height / 2,
            })
          }}
          onMouseLeave={() => setHoverTarget(null)}
        >
          {paragraph.sentences.map((sentence, sIndex) => (
            <span
              key={`p-${pIndex}-s-${sIndex}`}
              className="cursor-help rounded px-0.5 transition-colors hover:bg-[#10ff50]/10"
              onMouseEnter={e => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                setHoverTarget({
                  label: `Sentence ${pIndex + 1}.${sIndex + 1}`,
                  text: stripInlineMarkdown(sentence.trim()),
                  x: rect.right + 12,
                  y: rect.top + rect.height / 2,
                })
              }}
            >
              {renderInlineMarkdown(sentence, `p-${pIndex}-s-${sIndex}`)}
            </span>
          ))}
        </p>
      ))}

      {hoverTarget && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[140] w-[280px] border border-[#10ff50]/35 bg-[#060b12] px-2.5 py-2"
          style={{
            left: hoverTarget.x,
            top: hoverTarget.y,
            transform: 'translateY(-50%)',
            boxShadow: '0 0 14px rgba(16,255,80,0.14)',
          }}
        >
          <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[#10ff50]">{hoverTarget.label}</div>
          <div className="mb-2 space-y-1">
            {splitIntoBalancedLines(hoverValues).map((line, lineIndex) => (
              <div
                key={`line-${lineIndex}`}
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${Math.max(1, line.length)}, minmax(0, 1fr))` }}
              >
                {line.map(item => (
                  <Pill
                    key={item.key}
                    accent={item.accent}
                    className="w-full justify-center text-center text-[8px]"
                    title={`${item.cypher.shortName || item.cypher.name}: ${item.value}`}
                  >
                    {item.value}
                  </Pill>
                ))}
              </div>
            ))}
          </div>
          <div className="whitespace-pre-wrap text-[11px] text-gray-400">{hoverTarget.text}</div>
        </div>,
        document.body
      )}
    </div>
  )
}
