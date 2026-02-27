'use client'

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type NavigateOptions = {
  replace?: boolean
  scroll?: boolean
}

type NavigateFn = (href: string, options?: NavigateOptions) => void

const NAV_GLITCH_MS = 280
const NAV_SETTLE_MS = 220
const NAV_FAILSAFE_MS = 1600

export const NavigationTransitionContext = createContext<NavigateFn | null>(null)

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function CrtNavigationTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [transitioning, setTransitioning] = useState(false)
  const transitioningRef = useRef(false)
  const failSafeTimerRef = useRef<number | null>(null)

  const stopTransition = useCallback(() => {
    if (failSafeTimerRef.current !== null) {
      window.clearTimeout(failSafeTimerRef.current)
      failSafeTimerRef.current = null
    }
    transitioningRef.current = false
    setTransitioning(false)
  }, [])

  const startTransition = useCallback((navigate: () => void) => {
    if (typeof window === 'undefined' || prefersReducedMotion()) {
      navigate()
      return
    }

    if (transitioningRef.current) return

    transitioningRef.current = true
    setTransitioning(true)

    if (failSafeTimerRef.current !== null) {
      window.clearTimeout(failSafeTimerRef.current)
    }
    failSafeTimerRef.current = window.setTimeout(stopTransition, NAV_FAILSAFE_MS)

    window.setTimeout(navigate, NAV_GLITCH_MS)
  }, [stopTransition])

  const navigateWithTransition = useCallback<NavigateFn>((href, options) => {
    startTransition(() => {
      if (options?.replace) {
        router.replace(href, { scroll: options.scroll })
        return
      }
      router.push(href, { scroll: options?.scroll })
    })
  }, [router, startTransition])

  useEffect(() => {
    const handleClickCapture = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      if (anchor.dataset.noTransition === 'true') return

      const href = anchor.getAttribute('href')
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return
      }

      const nextUrl = new URL(href, window.location.href)
      if (nextUrl.origin !== window.location.origin) return

      const next = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
      if (next === current) return

      event.preventDefault()
      navigateWithTransition(next)
    }

    document.addEventListener('click', handleClickCapture, true)
    return () => document.removeEventListener('click', handleClickCapture, true)
  }, [navigateWithTransition])

  // End the overlay shortly after the new route renders.
  useEffect(() => {
    if (!transitioningRef.current) return
    const timer = window.setTimeout(stopTransition, NAV_SETTLE_MS)
    return () => window.clearTimeout(timer)
  }, [pathname, stopTransition])

  useEffect(() => {
    return () => {
      if (failSafeTimerRef.current !== null) {
        window.clearTimeout(failSafeTimerRef.current)
      }
    }
  }, [])

  const contextValue = useMemo(() => navigateWithTransition, [navigateWithTransition])

  return (
    <NavigationTransitionContext.Provider value={contextValue}>
      {transitioning && <div className="page-nav-crt-glitch-overlay" aria-hidden="true" />}
      <div className={transitioning ? 'page-nav-crt-glitch-content' : ''}>{children}</div>
    </NavigationTransitionContext.Provider>
  )
}
