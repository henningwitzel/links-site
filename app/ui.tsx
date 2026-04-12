'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function useThemeMode() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return { dark, toggleTheme }
}

function IconHome() {
  return <span className="ig-nav-icon" aria-hidden="true">⌂</span>
}

function IconFeed() {
  return <span className="ig-nav-icon" aria-hidden="true">▣</span>
}

function IconPlaces() {
  return <span className="ig-nav-icon" aria-hidden="true">⌖</span>
}

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
  const { dark, toggleTheme } = useThemeMode()

  return (
    <main className="ig-shell">
      <aside className="ig-sidebar">
        <div className="ig-brand-wrap">
          <div className="ig-brand">links</div>
          <div className="ig-brand-sub">Henning’s archive</div>
        </div>

        <nav className="ig-sidebar-nav" aria-label="Sections">
          <Link href="/" className={`ig-nav-link ${active === 'home' ? 'ig-nav-link-active' : ''}`}>
            <IconHome />
            <span>Home</span>
          </Link>
          <Link href="/feed" className={`ig-nav-link ${active === 'feed' ? 'ig-nav-link-active' : ''}`}>
            <IconFeed />
            <span>Feed</span>
          </Link>
          <Link href="/places" className={`ig-nav-link ${active === 'places' ? 'ig-nav-link-active' : ''}`}>
            <IconPlaces />
            <span>Places</span>
          </Link>
        </nav>

        <button className="theme-toggle ig-theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
          {dark ? '☀️ Light mode' : '🌙 Dark mode'}
        </button>
      </aside>

      <section className="ig-main">
        <header className="ig-topbar">
          <div>
            <h1 className="ig-page-title">{title}</h1>
            <p className="ig-page-sub">{subtitle}</p>
          </div>
          {right ? <div className="ig-topbar-right">{right}</div> : null}
        </header>
        {children}
      </section>

      <nav className="ig-mobile-nav" aria-label="Primary">
        <Link href="/" className={`ig-mobile-nav-link ${active === 'home' ? 'ig-mobile-nav-link-active' : ''}`}>
          <IconHome />
          <span>Home</span>
        </Link>
        <Link href="/feed" className={`ig-mobile-nav-link ${active === 'feed' ? 'ig-mobile-nav-link-active' : ''}`}>
          <IconFeed />
          <span>Feed</span>
        </Link>
        <Link href="/places" className={`ig-mobile-nav-link ${active === 'places' ? 'ig-mobile-nav-link-active' : ''}`}>
          <IconPlaces />
          <span>Places</span>
        </Link>
      </nav>
    </main>
  )
}
