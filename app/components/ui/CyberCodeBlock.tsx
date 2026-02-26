'use client'

import { Highlight, themes } from 'prism-react-renderer'

type CyberCodeBlockProps = {
  code: string
  language?: string
  className?: string
}

export function CyberCodeBlock({
  code,
  language = 'tsx',
  className = '',
}: CyberCodeBlockProps) {
  return (
    <div className={`overflow-auto border border-[#1e293b] bg-[#050a11] ${className}`}>
      <Highlight code={code.trim()} language={language as never} theme={themes.vsDark}>
        {({ className: prismClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`m-0 p-3 text-[12px] leading-5 ${prismClassName}`}
            style={{ ...style, background: 'transparent' }}
          >
            {tokens.map((line, lineIndex) => (
              <div key={lineIndex} {...getLineProps({ line })}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
