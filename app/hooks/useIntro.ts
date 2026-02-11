import { useState, useEffect } from 'react'

export type IntroPhase = 'title' | 'fading' | 'done'

export function useIntro() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>('title')

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase('fading'), 2200)
    const t2 = setTimeout(() => setIntroPhase('done'), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return introPhase
}
