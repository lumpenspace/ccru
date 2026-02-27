'use client'

import { useEffect, useState } from 'react'
import { Panel as SplitPanel, PanelGroup as SplitPanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live'
import { Highlight, themes } from 'prism-react-renderer'

import { CypherHoverText } from './cyphers/CypherHoverText'
import { CyberButton } from './ui/CyberButton'
import { CyberButtonGroup } from './ui/CyberButtonGroup'
import { CyberCardContainer } from './ui/CyberCardContainer'
import { CyberCheckbox } from './ui/CyberCheckbox'
import { CyberContainer } from './ui/CyberContainer'
import { CyberGridGroup } from './ui/CyberGridGroup'
import { CyberInput } from './ui/CyberInput'
import { CyberPageHeader } from './ui/CyberPageHeader'
import { CyberPanel } from './ui/CyberPanel'
import { CyberPopover } from './ui/CyberPopover'
import { Pill } from './ui/Pill'
import { CyberRadio } from './ui/CyberRadio'
import { CyberStackGroup } from './ui/CyberStackGroup'
import { CyberTextArea } from './ui/CyberTextArea'
import { Figure } from './ui/Figure'
import { GlitchText } from './ui/GlitchText'
import { GlitchTransition } from './ui/GlitchTransition'
import { StatusDot } from './ui/StatusDot'
import { DataRow } from './ui/DataRow'
import { NeonDivider } from './ui/NeonDivider'
import { SectionFrame } from './ui/SectionFrame'
import { CyberCodeBlock } from './ui/CyberCodeBlock'
import { CCRU_CIPHERS } from '../cyphers/ccruCiphers'

const SAMPLE_MD = `The numogram bends language into sequences and returns hidden arithmetic.
Each sentence is a unit of drift.

**Hover a sentence or a paragraph:** and compare cypher values side by side.
This mirrors the CCRU category ciphers from cyphers.news.`

const CYPHER_CODE = `<CypherHoverText cyphers={CCRU_CIPHERS} markdown={${JSON.stringify(SAMPLE_MD)}} />`
const BUTTONS_CODE = `(() => {
  function Demo() {
    const [activeButton, setActiveButton] = useState('alpha')
    const [tcMode, setTcMode] = useState('assist')

    return (
      <>
        <CyberButtonGroup>
          <CyberButton
            active={activeButton === 'alpha'}
            shortcut="g"
            onClick={() => setActiveButton('alpha')}
          >
            Alpha
          </CyberButton>
          <CyberButton
            active={activeButton === 'beta'}
            shortcut="h"
            onClick={() => setActiveButton('beta')}
          >
            Beta
          </CyberButton>
        </CyberButtonGroup>
        <CyberButtonGroup>
          <CyberButton active={tcMode === 'off'} shortcut="j" onClick={() => setTcMode('off')}>
            TC Off
          </CyberButton>
          <CyberButton active={tcMode === 'assist'} shortcut="k" onClick={() => setTcMode('assist')}>
            TC Assist
          </CyberButton>
          <CyberButton active={tcMode === 'full'} shortcut="l" onClick={() => setTcMode('full')}>
            TC Full
          </CyberButton>
        </CyberButtonGroup>
      </>
    )
  }

  return <Demo />
})()`
const RADIO_CHECKBOX_CODE = `(() => {
  function Demo() {
    const [side, setSide] = useState('left')
    const [chips, setChips] = useState({ aq: true, synx: true, nq: false })

    const toggle = key => setChips(prev => ({ ...prev, [key]: !prev[key] }))

    return (
      <>
        <div className="flex flex-wrap items-center gap-4">
          <CyberRadio name="showcase" checked={side === 'left'} label="Left" onChange={() => setSide('left')} />
          <CyberRadio name="showcase" checked={side === 'right'} label="Right" onChange={() => setSide('right')} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <CyberCheckbox checked={chips.aq} label="AQ" onChange={() => toggle('aq')} accent="#facc15" />
          <CyberCheckbox checked={chips.synx} label="Synx" onChange={() => toggle('synx')} accent="#22d3ee" />
          <CyberCheckbox checked={chips.nq} label="NQ" onChange={() => toggle('nq')} />
        </div>
      </>
    )
  }

  return <Demo />
})`
const POPOVER_CODE = `(
  <>
    <GlitchText text="Signal Stable" color="#10ff50" />
    <CyberPopover
      trigger={<span className="cursor-help text-sm text-gray-300 underline decoration-dotted">Hover for popover</span>}
      content="Popover extracted from panel-side behavior. Supports plain content or richer JSX."
    />
  </>
)`
const INPUT_CODE = `(() => {
  function Demo() {
    const [phrase, setPhrase] = useState('CCRU numogram')
    const [notes, setNotes] = useState(${JSON.stringify(SAMPLE_MD)})
    const [values, setValues] = useState('33, 93, 119')

    return (
      <>
        <CyberInput label="Phrase" value={phrase} onChange={setPhrase} placeholder="Type phrase..." />
        <CyberTextArea label="Notes (markdown)" value={notes} onChange={setNotes} rows={5} />
        <CyberTextArea label="Interesting values" value={values} onChange={setValues} pillCollection rows={3} />
      </>
    )
  }

  return <Demo />
})`
const PILL_CODE = `(() => {
  function Demo() {
    const initialPills = [
      { id: 'aq', accent: '#facc15', label: 'AQ 311' },
      { id: 'synx', accent: '#22d3ee', label: 'Synx 2201' },
      { id: 'sat', accent: '#fb7185', label: '666' },
    ]
    const [pills, setPills] = useState(initialPills)

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {pills.map(pill => (
            <Pill
              key={pill.id}
              accent={pill.accent}
              onClose={() => setPills(prev => prev.filter(entry => entry.id !== pill.id))}
            >
              {pill.label}
            </Pill>
          ))}
        </div>
        <button
          type="button"
          className="text-[10px] uppercase tracking-[0.12em] text-gray-500 hover:text-gray-300"
          onClick={() => setPills(initialPills)}
        >
          Reset Pills
        </button>
      </div>
    )
  }

  return <Demo />
})`
const FIGURE_CODE = `(
  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
    <Figure title="AQ" value={311} accent="#facc15" showDisplaySystem />
    <Figure title="Synx" value={2201} accent="#22d3ee" showDisplaySystem restDisplaySystem="decimal" hoverDisplaySystem="tic-xenotation" />
    <Figure title="Satanic" value={666} accent="#fb7185" showDisplaySystem restDisplaySystem="decimal" hoverDisplaySystem="binary" />
  </div>
)`
const CONTAINERS_CODE = `(
  <>
    <CyberGridGroup columns={2}>
      <CyberStackGroup>
        <CyberContainer title="Container A" collapsible defaultOpen>
          <div className="text-xs text-gray-400">collapsible prop enabled.</div>
        </CyberContainer>
        <CyberContainer title="Container B" collapsible>
          <div className="text-xs text-gray-400">Use this for stacked control panels.</div>
        </CyberContainer>
      </CyberStackGroup>
      <div className="relative h-[220px] border border-[#334155] bg-[#070d14]">
        <CyberPanel
          id="showcase-panel"
          title="Panel Primitive"
          position={{ x: 10, y: 10 }}
          width={260}
          collapseDirection="side"
          defaultOpen
          draggable={false}
          onDragStart={() => {}}
          positionMode="absolute"
        >
          <div className="px-3 py-2 text-xs text-gray-400">Shared panel/header primitives.</div>
        </CyberPanel>
      </div>
    </CyberGridGroup>
  </>
)`

const DATA_DISPLAY_CODE = `(
  <div className="space-y-2">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1.5">
        <StatusDot color="#10ff50" />
        <span className="text-xs text-gray-300">Online</span>
      </span>
      <span className="flex items-center gap-1.5">
        <StatusDot color="#facc15" pulse={false} />
        <span className="text-xs text-gray-300">Idle</span>
      </span>
      <span className="flex items-center gap-1.5">
        <StatusDot color="#fb7185" />
        <span className="text-xs text-gray-300">Alert</span>
      </span>
    </div>
    <NeonDivider />
    <SectionFrame title="Gate Analysis" color="#22d3ee">
      <DataRow label="Zone" value="9::0" color="#22d3ee" />
      <DataRow label="Current" value="Gt-35" />
      <DataRow label="Plex" value="5+7" />
    </SectionFrame>
    <NeonDivider color="#facc15" />
    <SectionFrame title="Summary">
      <DataRow label="Active" value="3/9" />
      <DataRow label="Status" value="nominal" />
    </SectionFrame>
  </div>
)`

const GLITCH_CODE = `(
  <div className="space-y-4">
    <GlitchText text="SIGNAL ACQUIRED" color="#10ff50" />
    <GlitchText text="WARNING DRIFT DETECTED" color="#fb7185" />
    <div className="flex items-center gap-3 mt-2">
      <span className="text-[9px] uppercase tracking-[0.15em] text-gray-600">Value</span>
      <GlitchTransition value={311} className="text-lg font-bold text-[#facc15]" />
    </div>
  </div>
)`

const CODEBLOCK_CODE = `<CyberCodeBlock
  language="typescript"
  code={\`function calcGematria(
  phrase: string,
  cipher: Map<string, number>
): number {
  let sum = 0
  for (const char of phrase.toLowerCase()) {
    sum += cipher.get(char) ?? 0
  }
  return sum
}\`}
/>`

const INSTALL_GITHUB_CODE = `npm install git+https://github.com/lumpenspace/ccru.git`

const CYPHER_IMPORT = `import { CypherHoverText, CCRU_CIPHERS } from 'ccru/components'`
const BUTTONS_IMPORT = `import { CyberButton, CyberButtonGroup } from 'ccru/components'`
const RADIO_CHECKBOX_IMPORT = `import { CyberRadio, CyberCheckbox } from 'ccru/components'`
const POPOVER_IMPORT = `import { GlitchText, CyberPopover } from 'ccru/components'`
const INPUT_IMPORT = `import { CyberInput, CyberTextArea } from 'ccru/components'`
const PILL_IMPORT = `import { Pill } from 'ccru/components'`
const FIGURE_IMPORT = `import { Figure } from 'ccru/components'`
const CONTAINERS_IMPORT = `import {
  CyberContainer,
  CyberPanel,
  CyberGridGroup,
  CyberStackGroup,
} from 'ccru/components'`
const DATA_DISPLAY_IMPORT = `import { StatusDot, DataRow, NeonDivider, SectionFrame } from 'ccru/components'`
const GLITCH_IMPORT = `import { GlitchText, GlitchTransition } from 'ccru/components'`
const CODEBLOCK_IMPORT = `import { CyberCodeBlock } from 'ccru/components'`

const CYPHER_PROPS = `type HoverCypher = {
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

type CypherHoverTextProps = {
  cyphers: HoverCypher[]
  markdown?: string
  markup?: string
  className?: string
}`

const BUTTONS_PROPS = `type CyberButtonProps = {
  onClick?: () => void
  active?: boolean
  indicator?: boolean
  disabled?: boolean
  shortcut?: string
  size?: 'md' | 'sm'
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  className?: string
  children: React.ReactNode
}

type CyberButtonGroupProps = {
  children: React.ReactNode
  cornerSize?: number
  className?: string
}`

const RADIO_CHECKBOX_PROPS = `type CyberRadioProps = {
  checked: boolean
  label: string
  onChange: () => void
  name?: string
  disabled?: boolean
}

type CyberCheckboxProps = {
  checked: boolean
  label: string
  onChange: () => void
  disabled?: boolean
  icon?: React.ReactNode
  accent?: string
  className?: string
}`

const POPOVER_PROPS = `type GlitchTextProps = {
  text: string
  color?: string
  className?: string
}

type CyberPopoverProps = {
  trigger: React.ReactNode
  content: React.ReactNode
}`

const INPUT_PROPS = `type CyberInputProps = {
  label: string
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

type CyberTextAreaProps = {
  label: string
  value: string
  onChange: (next: string) => void
  rows?: number
  placeholder?: string
  pillCollection?: boolean
}`

const PILL_PROPS = `type PillProps = {
  children: React.ReactNode
  accent?: string
  onClose?: () => void
  closeLabel?: string
  className?: string
  title?: string
}`

const FIGURE_PROPS = `type FigureProps = {
  title: string
  value: string | number
  accent?: string
  className?: string
  size?: 'md' | 'sm'
  align?: 'left' | 'center'
  showDisplaySystem?: boolean
  displaySystem?: 'decimal' | 'binary' | 'tic-xenotation'
  restDisplaySystem?: 'decimal' | 'binary' | 'tic-xenotation'
  hoverDisplaySystem?: 'decimal' | 'binary' | 'tic-xenotation'
}`

const CONTAINERS_PROPS = `type CyberContainerProps = {
  title: string
  children: React.ReactNode
  draggable?: boolean
  collapsible?: boolean
  defaultOpen?: boolean
  defaultPosition?: { x: number; y: number }
  width?: number
  className?: string
}

interface CyberPanelProps {
  id: string
  title: string
  position: { x: number; y: number }
  width?: number | string
  open?: boolean
  onToggle?: () => void
  defaultOpen?: boolean
  onActivate?: (panelId: string) => void
  onHeightChange?: (panelId: string, height: number) => void
  draggable?: boolean
  onDragStart: (panelId: string, e: React.MouseEvent) => void
  zIndex?: number
  maxBodyHeight?: number
  scrollable?: boolean
  showToggle?: boolean
  collapseDirection?: 'none' | 'vertical' | 'side'
  headerRight?: React.ReactNode
  positionMode?: 'fixed' | 'absolute' | 'relative'
  children: React.ReactNode
}`

const DATA_DISPLAY_PROPS = `type StatusDotProps = {
  color: string
  pulse?: boolean          // default true
  className?: string
}

type DataRowProps = {
  label: string
  value: string
  color?: string           // default '#10ff50'
}

type NeonDividerProps = {
  color?: string           // default '#10ff50'
}

type SectionFrameProps = {
  title?: string
  color?: string           // default '#10ff50'
  children: React.ReactNode
}`

const GLITCH_PROPS = `type GlitchTextProps = {
  text: string
  color?: string           // default '#10ff50'
  className?: string
}

type GlitchTransitionProps = {
  value: string | number   // glitches on change
  className?: string
}`

const CODEBLOCK_PROPS = `type CyberCodeBlockProps = {
  code: string
  language?: string        // default 'tsx'
  className?: string
}`

type SplitShowcaseCardProps = {
  splitVertical: boolean
  code: string
  onCodeChange: (code: string) => void
  scope: Record<string, unknown>
  importCode: string
  propsTypes: string
  heightClassName?: string
  codeHeightClassName?: string
}

type HighlightCodeProps = {
  code: string
  language: string
  className?: string
}

function HighlightCode({ code, language, className = '' }: HighlightCodeProps) {
  return (
    <Highlight code={code.trim()} language={language} theme={themes.vsDark}>
      {({ className: hlClass, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`mt-1.5 overflow-auto border border-[#1e293b] bg-[#050a11] py-2 pl-1 pr-2 text-[11px] leading-5 ${hlClass} ${className}`}
          style={{ ...style, background: 'transparent' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span
                className="mr-2 inline-block w-5 select-none text-right text-[10px]"
                style={{ color: '#334155' }}
              >
                {i + 1}
              </span>
              {line.map((token, j) => (
                <span key={j} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

function SplitShowcaseCard({
  splitVertical,
  code,
  onCodeChange,
  scope,
  importCode,
  propsTypes,
  heightClassName = 'h-[420px]',
  codeHeightClassName = 'h-[220px]',
}: SplitShowcaseCardProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [propsOpen, setPropsOpen] = useState(false)

  return (
    <div className={`${heightClassName} overflow-hidden border border-[#1e293b] bg-[#060b12]`}>
      <LiveProvider code={code} scope={scope}>
        <SplitPanelGroup direction={splitVertical ? 'vertical' : 'horizontal'}>
          <SplitPanel defaultSize={46} minSize={26}>
            <div className="h-full overflow-auto p-3">
              <button
                type="button"
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setImportOpen(v => !v)}
              >
                <span className="w-3 text-center text-[#10ff50]/60">{importOpen ? '▾' : '▸'}</span>
                <span>Import</span>
              </button>
              {importOpen && (
                <>
                  <div className="mt-1.5 text-[9px] uppercase tracking-[0.15em] text-gray-600">Import</div>
                  <HighlightCode code={importCode} language="typescript" />
                </>
              )}
              <button
                type="button"
                className="mt-2.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setPropsOpen(v => !v)}
              >
                <span className="w-3 text-center text-[#10ff50]/60">{propsOpen ? '▾' : '▸'}</span>
                <span>Props</span>
              </button>
              {propsOpen && (
                <HighlightCode code={propsTypes} language="typescript" />
              )}
              <div className="mt-2.5 mb-1 text-[9px] uppercase tracking-[0.15em] text-gray-600">Editor</div>
              <div className={`overflow-auto border border-[#1e293b] bg-[#050a11] p-2 ${codeHeightClassName}`}>
                <LiveEditor
                  onChange={onCodeChange}
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: 13,
                    lineHeight: 1.5,
                    minHeight: '100%',
                    color: '#e5e7eb',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>
          </SplitPanel>
          <PanelResizeHandle
            className={`${splitVertical ? 'h-1.5' : 'w-1.5'} bg-[#1e293b] hover:bg-[#10ff50]/40 transition-colors`}
          />
          <SplitPanel defaultSize={54} minSize={30}>
            <div className="h-full overflow-auto p-3">
              <div className="mb-1 text-[9px] uppercase tracking-[0.15em] text-gray-600">Preview</div>
              <div className="border border-[#1e293b] bg-[#050a11] p-3">
                <LivePreview />
              </div>
              <LiveError className="mt-2 border border-[#7f1d1d] bg-[#450a0a] px-2 py-1 text-xs text-rose-200" />
            </div>
          </SplitPanel>
        </SplitPanelGroup>
      </LiveProvider>
    </div>
  )
}

export default function ComponentsShowcasePage() {
  const [splitVertical, setSplitVertical] = useState(false)
  const [cypherCode, setCypherCode] = useState(CYPHER_CODE)
  const [buttonsCode, setButtonsCode] = useState(BUTTONS_CODE)
  const [radioCode, setRadioCode] = useState(RADIO_CHECKBOX_CODE)
  const [popoverCode, setPopoverCode] = useState(POPOVER_CODE)
  const [inputCode, setInputCode] = useState(INPUT_CODE)
  const [pillCode, setPillCode] = useState(PILL_CODE)
  const [figureCode, setFigureCode] = useState(FIGURE_CODE)
  const [containersCode, setContainersCode] = useState(CONTAINERS_CODE)
  const [dataDisplayCode, setDataDisplayCode] = useState(DATA_DISPLAY_CODE)
  const [glitchCode, setGlitchCode] = useState(GLITCH_CODE)
  const [codeBlockCode, setCodeBlockCode] = useState(CODEBLOCK_CODE)
  const glitchTitle = (text: string) => (
    <GlitchText text={text} className="text-[10px] tracking-[0.16em]" />
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const query = window.matchMedia('(max-width: 920px)')
    const apply = (matches: boolean) => setSplitVertical(matches)
    apply(query.matches)
    const onChange = (event: MediaQueryListEvent) => apply(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-6 font-mono text-gray-200 md:py-8">
      <div className="mx-auto w-full max-w-[1160px] space-y-6">
        <CyberPageHeader
          icon="/icon.svg"
          title={<GlitchText text="Components Showcase" className="text-[9px] tracking-[0.28em]" />}
          description="Live-editable component library"
        />

        <CyberCardContainer title={glitchTitle('Installation')} collapsible defaultOpen>
          <div className="border border-[#1e293b] bg-[#060b12] p-3">
            <div className="text-[9px] uppercase tracking-[0.15em] text-gray-600">Install From GitHub URL</div>
            <HighlightCode code={INSTALL_GITHUB_CODE} language="bash" />
          </div>
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Cypher Hover React Component')} collapsible defaultOpen>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={cypherCode}
            onCodeChange={setCypherCode}
            scope={{ CypherHoverText, CCRU_CIPHERS }}
            importCode={CYPHER_IMPORT}
            propsTypes={CYPHER_PROPS}
            heightClassName="h-[460px]"
            codeHeightClassName="h-[200px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Buttons + Group')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={buttonsCode}
            onCodeChange={setButtonsCode}
            scope={{ CyberButton, CyberButtonGroup, useState }}
            importCode={BUTTONS_IMPORT}
            propsTypes={BUTTONS_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Radio + Checkbox Chips')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={radioCode}
            onCodeChange={setRadioCode}
            scope={{ CyberRadio, CyberCheckbox, useState }}
            importCode={RADIO_CHECKBOX_IMPORT}
            propsTypes={RADIO_CHECKBOX_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Popover + Utilities')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={popoverCode}
            onCodeChange={setPopoverCode}
            scope={{ GlitchText, CyberPopover }}
            importCode={POPOVER_IMPORT}
            propsTypes={POPOVER_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Input + Text Fields')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={inputCode}
            onCodeChange={setInputCode}
            scope={{ CyberInput, CyberTextArea, useState }}
            importCode={INPUT_IMPORT}
            propsTypes={INPUT_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Pill')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={pillCode}
            onCodeChange={setPillCode}
            scope={{ Pill, useState }}
            importCode={PILL_IMPORT}
            propsTypes={PILL_PROPS}
            heightClassName="h-[360px]"
            codeHeightClassName="h-[170px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Figure')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={figureCode}
            onCodeChange={setFigureCode}
            scope={{ Figure }}
            importCode={FIGURE_IMPORT}
            propsTypes={FIGURE_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Containers + Panels + Headers')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={containersCode}
            onCodeChange={setContainersCode}
            scope={{ CyberContainer, CyberPanel, CyberGridGroup, CyberStackGroup }}
            importCode={CONTAINERS_IMPORT}
            propsTypes={CONTAINERS_PROPS}
            heightClassName="h-[500px]"
            codeHeightClassName="h-[190px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Status + Data Display')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={dataDisplayCode}
            onCodeChange={setDataDisplayCode}
            scope={{ StatusDot, DataRow, NeonDivider, SectionFrame }}
            importCode={DATA_DISPLAY_IMPORT}
            propsTypes={DATA_DISPLAY_PROPS}
            heightClassName="h-[500px]"
            codeHeightClassName="h-[240px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Glitch Effects')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={glitchCode}
            onCodeChange={setGlitchCode}
            scope={{ GlitchText, GlitchTransition }}
            importCode={GLITCH_IMPORT}
            propsTypes={GLITCH_PROPS}
            heightClassName="h-[400px]"
            codeHeightClassName="h-[180px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title={glitchTitle('Code Block')} collapsible defaultOpen={false}>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={codeBlockCode}
            onCodeChange={setCodeBlockCode}
            scope={{ CyberCodeBlock }}
            importCode={CODEBLOCK_IMPORT}
            propsTypes={CODEBLOCK_PROPS}
            heightClassName="h-[420px]"
            codeHeightClassName="h-[200px]"
          />
        </CyberCardContainer>
      </div>
    </main>
  )
}
