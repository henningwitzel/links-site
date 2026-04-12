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

const NAV_ITEMS = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/feed', label: 'Feed', key: 'feed' },
  { href: '/places', label: 'Places', key: 'places' },
] as const

export function AppShell({
  active,
  title,
  subtitle,
  children,
  right,
}: {
  active: 'home' | 'feed' | 'places'
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
              {dark ? '☀️' : '🌙'}
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
              {item.key === 'home' && '⌂'}
              {item.key === 'feed' && '☰'}
              {item.key === 'places' && '📍'}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
