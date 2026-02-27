'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'

import { NavigationTransitionContext } from '../components/navigation/CrtNavigationTransition'

type NavigateOptions = {
  replace?: boolean
  scroll?: boolean
}

export function useGlitchNavigate() {
  const router = useRouter()
  const navigateWithTransition = useContext(NavigationTransitionContext)

  return (href: string, options?: NavigateOptions) => {
    if (navigateWithTransition) {
      navigateWithTransition(href, options)
      return
    }

    if (options?.replace) {
      router.replace(href, { scroll: options.scroll })
      return
    }
    router.push(href, { scroll: options?.scroll })
  }
}
