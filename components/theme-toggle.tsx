'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from 'liquidcn'

// Subscribe to nothing (client-side only state)
const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  
  // Use useSyncExternalStore to handle hydration without useEffect
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="size-5 text-white/80 hover:text-white transition-colors" />
      ) : (
        <Moon className="size-5 text-foreground/80 hover:text-foreground transition-colors" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
