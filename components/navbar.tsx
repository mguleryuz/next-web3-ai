'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from 'liquidcn/client'
import { WalletWidget } from './wallet-widget'
import { ThemeToggle } from './theme-toggle'

const navItems = [{ name: 'Home', link: '/' }]

function Logo() {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <Image
        src="/next.svg"
        alt="App"
        width={50}
        height={20}
        className="h-6 w-auto dark:invert"
      />
      <span className="font-medium text-foreground dark:text-white drop-shadow">App</span>
    </Link>
  )
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <ResizableNavbar menuOpen={isMobileMenuOpen}>
      {/* Desktop Navigation */}
      <NavBody>
        <Logo />
        <NavItems
          items={navItems}
          currentPath={pathname}
          LinkComponent={Link}
          className="[&_a]:text-foreground/80 [&_a:hover]:text-foreground dark:[&_a]:text-white/90 dark:[&_a:hover]:text-white"
        />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletWidget />
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <Logo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen}>
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground/90 hover:text-foreground dark:text-white/90 dark:hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-foreground/20 dark:border-white/20 w-full flex items-center justify-between">
            <WalletWidget />
            <ThemeToggle />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  )
}
