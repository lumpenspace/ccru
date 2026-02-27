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
const BUTTONS_CODE = `(
  <>
    <CyberButtonGroup>
      <CyberButton active shortcut="g">Alpha</CyberButton>
      <CyberButton shortcut="h">Beta</CyberButton>
    </CyberButtonGroup>
    <CyberButtonGroup>
      <CyberButton shortcut="j">TC Off</CyberButton>
      <CyberButton active shortcut="k">TC Assist</CyberButton>
      <CyberButton shortcut="l">TC Full</CyberButton>
    </CyberButtonGroup>
  </>
)`
const RADIO_CHECKBOX_CODE = `(
  <>
    <div className="flex flex-wrap items-center gap-4">
      <CyberRadio name="showcase" checked label="Left" onChange={() => {}} />
      <CyberRadio name="showcase" label="Right" onChange={() => {}} />
    </div>
    <div className="mt-2 flex flex-wrap gap-2">
      <CyberCheckbox checked label="AQ" onChange={() => {}} accent="#facc15" />
      <CyberCheckbox checked label="Synx" onChange={() => {}} accent="#22d3ee" />
      <CyberCheckbox label="NQ" onChange={() => {}} />
    </div>
  </>
)`
const POPOVER_CODE = `(
  <>
    <GlitchText text="Signal Stable" color="#10ff50" />
    <CyberPopover
      trigger={<span className="cursor-help text-sm text-gray-300 underline decoration-dotted">Hover for popover</span>}
      content="Popover extracted from panel-side behavior. Supports plain content or richer JSX."
    />
  </>
)`
const INPUT_CODE = `(
  <>
    <CyberInput label="Phrase" value="CCRU numogram" onChange={() => {}} placeholder="Type phrase..." />
    <CyberTextArea label="Notes (markdown)" value={${JSON.stringify(SAMPLE_MD)}} onChange={() => {}} rows={5} />
    <CyberTextArea label="Interesting values" value="33, 93, 119" onChange={() => {}} pillCollection rows={3} />
  </>
)`
const PILL_CODE = `(
  <div className="flex flex-wrap gap-2">
    <Pill accent="#facc15">AQ 311</Pill>
    <Pill accent="#22d3ee">Synx 2201</Pill>
    <Pill accent="#fb7185" onClose={() => {}}>666</Pill>
  </div>
)`
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
  propsTypes: string
  heightClassName?: string
  codeHeightClassName?: string
}

function SplitShowcaseCard({
  splitVertical,
  code,
  onCodeChange,
  scope,
  propsTypes,
  heightClassName = 'h-[420px]',
  codeHeightClassName = 'h-[220px]',
}: SplitShowcaseCardProps) {
  const [propsOpen, setPropsOpen] = useState(true)

  return (
    <div className={`${heightClassName} overflow-hidden border border-[#1e293b] bg-[#060b12]`}>
      <LiveProvider code={code} scope={scope}>
        <SplitPanelGroup direction={splitVertical ? 'vertical' : 'horizontal'}>
          <SplitPanel defaultSize={46} minSize={26}>
            <div className="h-full overflow-auto p-3">
              <button
                type="button"
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setPropsOpen(v => !v)}
              >
                <span className="w-3 text-center text-[#10ff50]/60">{propsOpen ? '▾' : '▸'}</span>
                <span>Props</span>
              </button>
              {propsOpen && (
                <Highlight code={propsTypes.trim()} language="typescript" theme={themes.vsDark}>
                  {({ className: hlClass, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`mt-1.5 overflow-auto border border-[#1e293b] bg-[#050a11] py-2 pl-1 pr-2 text-[11px] leading-5 ${hlClass}`}
                      style={{ ...style, background: 'transparent' }}
                    >
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="inline-block w-5 text-right mr-2 select-none text-[10px]" style={{ color: '#334155' }}>{i + 1}</span>
                          {line.map((token, j) => (
                            <span key={j} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
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
          title="Components Showcase"
          description="Live-editable component library"
        />

        <CyberCardContainer title="Cypher Hover React Component" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={cypherCode}
            onCodeChange={setCypherCode}
            scope={{ CypherHoverText, CCRU_CIPHERS }}
            propsTypes={CYPHER_PROPS}
            heightClassName="h-[460px]"
            codeHeightClassName="h-[200px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title="Buttons + Group" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={buttonsCode}
            onCodeChange={setButtonsCode}
            scope={{ CyberButton, CyberButtonGroup }}
            propsTypes={BUTTONS_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title="Radio + Checkbox Chips" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={radioCode}
            onCodeChange={setRadioCode}
            scope={{ CyberRadio, CyberCheckbox }}
            propsTypes={RADIO_CHECKBOX_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title="Popover + Utilities" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={popoverCode}
            onCodeChange={setPopoverCode}
            scope={{ GlitchText, CyberPopover }}
            propsTypes={POPOVER_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title="Input + Text Fields" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={inputCode}
            onCodeChange={setInputCode}
            scope={{ CyberInput, CyberTextArea }}
            propsTypes={INPUT_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title="Pill" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={pillCode}
            onCodeChange={setPillCode}
            scope={{ Pill }}
            propsTypes={PILL_PROPS}
            heightClassName="h-[360px]"
            codeHeightClassName="h-[170px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title="Figure" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={figureCode}
            onCodeChange={setFigureCode}
            scope={{ Figure }}
            propsTypes={FIGURE_PROPS}
          />
        </CyberCardContainer>

        <CyberCardContainer title="Containers + Panels + Headers" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={containersCode}
            onCodeChange={setContainersCode}
            scope={{ CyberContainer, CyberPanel, CyberGridGroup, CyberStackGroup }}
            propsTypes={CONTAINERS_PROPS}
            heightClassName="h-[500px]"
            codeHeightClassName="h-[190px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title="Status + Data Display" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={dataDisplayCode}
            onCodeChange={setDataDisplayCode}
            scope={{ StatusDot, DataRow, NeonDivider, SectionFrame }}
            propsTypes={DATA_DISPLAY_PROPS}
            heightClassName="h-[500px]"
            codeHeightClassName="h-[240px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title="Glitch Effects" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={glitchCode}
            onCodeChange={setGlitchCode}
            scope={{ GlitchText, GlitchTransition }}
            propsTypes={GLITCH_PROPS}
            heightClassName="h-[400px]"
            codeHeightClassName="h-[180px]"
          />
        </CyberCardContainer>

        <CyberCardContainer title="Code Block" collapsible>
          <SplitShowcaseCard
            splitVertical={splitVertical}
            code={codeBlockCode}
            onCodeChange={setCodeBlockCode}
            scope={{ CyberCodeBlock }}
            propsTypes={CODEBLOCK_PROPS}
            heightClassName="h-[420px]"
            codeHeightClassName="h-[200px]"
          />
        </CyberCardContainer>
      </div>
    </main>
  )
}
