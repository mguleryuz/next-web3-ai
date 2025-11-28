'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { WalletWidget } from './wallet-widget'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/25">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            App
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </nav>

        <WalletWidget />
      </div>
    </header>
  )
}

