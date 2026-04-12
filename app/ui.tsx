'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

function useThemeMode() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    setMounted(true)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return { dark, toggleTheme, mounted }
}

function IconHome({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function IconFeed({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}

function IconPlaces({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconSun({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function IconMoon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

const NAV_ICONS: Record<string, (size?: number) => React.ReactNode> = {
  home: (s) => <IconHome size={s} />,
  places: (s) => <IconPlaces size={s} />,
}

const NAV_ITEMS = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/places', label: 'Places', key: 'places' },
] as const

export function AppShell({
  active,
  title,
  subtitle,
  children,
  right,
}: {
  active: 'home' | 'places'
  title: string
  subtitle: string
  children: React.ReactNode
  right?: React.ReactNode
}) {
  const { dark, toggleTheme, mounted } = useThemeMode()

  return (
    <>
      {/* Top nav — sticky, blur backdrop */}
      <nav className="top-nav">
        <div className="top-nav-inner">
          <Link href="/" className="top-nav-brand">links</Link>

          <div className="top-nav-chips">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`ig-chip ${active === item.key ? 'ig-chip-active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {mounted && (
            <button className="theme-toggle" onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <IconSun /> : <IconMoon />}
            </button>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="ig-page-title">{title}</h1>
            <p className="ig-page-sub">{subtitle}</p>
          </div>
          {right && <div>{right}</div>}
        </div>
        {children}
      </main>

      {/* Bottom tab bar — mobile only, fixed */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`bottom-nav-tab ${active === item.key ? 'bottom-nav-tab-active' : ''}`}
            aria-current={active === item.key ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">
              {NAV_ICONS[item.key]?.(22)}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
