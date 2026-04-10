'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { LinkItem } from '@/lib/types'

// ── YouTube helpers ─────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// ── Date formatting ─────────────────────────────────────────────────────────

function parseDateAdded(link: LinkItem): Date {
  const iso = link.date_added || link.date || ''
  return new Date(iso + 'T00:00:00')
}

function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  const now = new Date()
  // If it's the current year, omit the year
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString('en-GB', { month: 'long' })
  }
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

// ── Feed item component ─────────────────────────────────────────────────────

function FeedItem({ link, onClickLink }: {
  link: LinkItem
  onClickLink: (url: string) => void
}) {
  const [ytModal, setYtModal] = useState(false)
  const isYouTube = /(?:youtube\.com|youtu\.be)/.test(link.url)
  const videoId = isYouTube ? extractYouTubeId(link.url) : null
  const date = parseDateAdded(link)

  const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  const truncatedUrl = cleanUrl.length > 60 ? cleanUrl.slice(0, 60) + '…' : cleanUrl

  function handleClick() {
    onClickLink(link.url)
    if (isYouTube && videoId) {
      setYtModal(true)
    }
  }

  return (
    <>
      <article className="feed-item">
        {/* Left gutter: favicon + vertical timeline line */}
        <div className="feed-gutter" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?sz=32&domain=${link.domain}`}
            width={20}
            height={20}
            className="card-favicon feed-favicon"
            alt=""
            onError={e => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
          />
          <div className="feed-line" />
        </div>

        {/* Right: content */}
        <div className="feed-content">
          {/* Thumbnail — YouTube or link-out */}
          {isYouTube && videoId && (
            <button
              type="button"
              className="feed-yt-thumb"
              onClick={handleClick}
              aria-label={`Play ${link.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt={link.title}
                className="feed-yt-img"
              />
              <span className="feed-yt-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}

          {/* Title */}
          {isYouTube && videoId ? (
            <button
              type="button"
              className="feed-title feed-title-btn"
              onClick={handleClick}
            >
              {link.title}
            </button>
          ) : (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="feed-title"
              onClick={() => onClickLink(link.url)}
            >
              {link.title}
            </a>
          )}

          {/* Summary — prefer summary over notes */}
          {link.summary && (
            <p className="feed-summary">{link.summary}</p>
          )}

          {/* Relevance callout */}
          {link.relevance && (
            <p className="card-relevance feed-relevance">💡 {link.relevance}</p>
          )}

          {/* Meta row: domain · date · tags */}
          <div className="feed-meta">
            <span className="feed-domain">{truncatedUrl}</span>
            <span className="feed-dot" aria-hidden="true">·</span>
            <time className="feed-date" dateTime={link.date_added || link.date || ''}>
              {formatFullDate(date)}
            </time>
            {link.tags && link.tags.length > 0 && (
              <>
                <span className="feed-dot" aria-hidden="true">·</span>
                <span className="feed-tags">
                  {link.tags.map(t => (
                    <span key={t} className="card-tag">{t}</span>
                  ))}
                </span>
              </>
            )}
          </div>
        </div>
      </article>

      {/* YouTube modal */}
      {ytModal && videoId && (
        <div
          className="youtube-modal"
          onClick={() => setYtModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Playing: ${link.title}`}
        >
          <div className="youtube-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="youtube-modal-close"
              onClick={() => setYtModal(false)}
              aria-label="Close video"
            >
              ✕
            </button>
            <div className="youtube-player-wrapper">
              <iframe
                className="youtube-player"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={link.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Month divider ───────────────────────────────────────────────────────────

function MonthDivider({ label }: { label: string }) {
  return (
    <div className="feed-month-divider" aria-label={`Links from ${label}`}>
      <span className="feed-month-label">{label}</span>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────

function initDark(): boolean {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('theme')
  const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (isDark) document.documentElement.setAttribute('data-theme', 'dark')
  return isDark
}

export default function FeedPage() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [dark, setDark] = useState(initDark)

  function toggleTheme() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  useEffect(() => {
    fetch('/api/links')
      .then(r => r.json())
      .then((data: LinkItem[]) => {
        // Sort newest-first
        const sorted = [...data].sort((a, b) => {
          const da = a.date_added || a.date || ''
          const db = b.date_added || b.date || ''
          return db.localeCompare(da)
        })
        setLinks(sorted)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  function handleClick(url: string) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).catch(() => {})
  }

  // Group by month key for dividers
  const groups: { key: string; label: string; items: LinkItem[] }[] = []
  for (const link of links) {
    const d = parseDateAdded(link)
    const key = monthKey(d)
    const last = groups[groups.length - 1]
    if (!last || last.key !== key) {
      groups.push({ key, label: monthLabel(key), items: [link] })
    } else {
      last.items.push(link)
    }
  }

  return (
    <main className="page-wrap">
      {/* ── Header ── */}
      <header className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title font-serif">Henning&apos;s Link Collection</h1>
            <p className="header-sub">Things worth coming back to</p>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        <nav className="section-nav" aria-label="Sections">
          <Link href="/" className="section-nav-link">Links</Link>
          <Link href="/places" className="section-nav-link">Places</Link>
          <Link href="/feed" className="section-nav-link section-nav-link-active">Feed</Link>
        </nav>
      </header>

      {/* ── Loading skeletons ── */}
      {!loaded && (
        <div className="feed-skeleton">
          {[80, 60, 90, 70].map((w, i) => (
            <div key={i} className="feed-skeleton-item">
              <div className="feed-skeleton-favicon" />
              <div className="feed-skeleton-body">
                <div className="skeleton-line skeleton-line-title" style={{ width: `${w}%` }} />
                <div className="skeleton-line skeleton-line-notes" />
                <div className="skeleton-line skeleton-line-notes2" />
                <div className="skeleton-line skeleton-line-url" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Feed ── */}
      {loaded && (
        <div className="feed-list" role="feed" aria-label="Link feed">
          {links.length === 0 && (
            <p className="empty-state">No links yet.</p>
          )}
          {groups.map(group => (
            <div key={group.key} className="feed-group">
              <MonthDivider label={group.label} />
              {group.items.map((link, i) => (
                <FeedItem
                  key={`${link.url}-${i}`}
                  link={link}
                  onClickLink={handleClick}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
