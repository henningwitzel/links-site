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
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap',
      }}>
        <div style={{ marginRight: 'auto' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>links</div>
        </div>
        {[
          { href: '/', label: 'Home', key: 'home' },
          { href: '/feed', label: 'Feed', key: 'feed' },
          { href: '/places', label: 'Places', key: 'places' },
        ].map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`ig-chip ${active === item.key ? 'ig-chip-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        {mounted && (
          <button className="ig-chip" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
            {dark ? '☀️' : '🌙'}
          </button>
        )}
      </nav>

      <main style={{ padding: '1.25rem 1rem 3rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}>
          <div>
            <h1 className="ig-page-title">{title}</h1>
            <p className="ig-page-sub">{subtitle}</p>
          </div>
          {right && <div>{right}</div>}
        </div>
        {children}
      </main>
    </>
  )
}
