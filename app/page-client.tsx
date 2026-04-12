'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from './ui'

export interface LinkItem {
  date: string
  date_added?: string
  title: string
  url: string
  notes: string
  summary?: string
  relevance?: string
  tags?: string[]
  domain: string
}

function formatDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return iso
  return `${m[3]}.${m[2]}.${m[1]}`
}

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

function OgImage({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch(`/api/preview?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.image) setSrc(data.image)
        else setFailed(true)
      })
      .catch(() => setFailed(true))
  }, [url])

  if (failed || !src) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="card-media-img"
      onError={() => setFailed(true)}
    />
  )
}

function CardMedia({ link, onPlay }: { link: LinkItem; onPlay?: () => void }) {
  const ytId = extractYouTubeId(link.url)

  if (ytId) {
    return (
      <button type="button" className="card-media card-media-yt" onClick={onPlay}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`}
          alt={link.title}
          className="card-media-img"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
          }}
        />
        <div className="card-media-play">
          <svg viewBox="0 0 24 24" fill="white" width="48" height="48">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </button>
    )
  }

  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="card-media card-media-link">
      <OgImage url={link.url} />
      <div className="card-media-fallback">
        <span className="card-media-fallback-domain">{link.domain.replace(/^www\./, '')}</span>
        <span className="card-media-fallback-title">{link.title}</span>
      </div>
    </a>
  )
}

function YouTubeModal({ videoId, title, onClose }: { videoId: string; title: string; onClose: () => void }) {
  return (
    <div className="youtube-modal" onClick={onClose}>
      <div className="youtube-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="youtube-modal-close" onClick={onClose} aria-label="Close video">✕</button>
        <div className="youtube-player-wrapper">
          <iframe
            className="youtube-player"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

function LinkCard({ link }: { link: LinkItem }) {
  const [showVideo, setShowVideo] = useState(false)
  const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  const ytId = extractYouTubeId(link.url)

  return (
    <>
      <article className="simple-card">
        <div className="simple-card-top">
          <div className="simple-card-site">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?sz=64&domain=${link.domain}`}
              width={20}
              height={20}
              className="simple-card-favicon"
              alt=""
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
            />
            <span className="simple-card-domain">{link.domain.replace(/^www\./, '')}</span>
          </div>
          <span className="simple-card-date">{formatDate(link.date)}</span>
        </div>

        <CardMedia link={link} onPlay={() => setShowVideo(true)} />

        <a href={link.url} target="_blank" rel="noopener noreferrer" className="simple-card-link">
          <h2 className="simple-card-title">{link.title}</h2>
        </a>

        {link.notes && <p className="simple-card-text">{link.notes}</p>}
        {link.relevance && <p className="simple-card-callout">💡 {link.relevance}</p>}

        {link.tags && link.tags.length > 0 && (
          <div className="simple-card-tags">
            {link.tags.map((tag) => (
              <span key={tag} className="simple-card-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="simple-card-footer">{cleanUrl}</div>
      </article>

      {showVideo && ytId && (
        <YouTubeModal videoId={ytId} title={link.title} onClose={() => setShowVideo(false)} />
      )}
    </>
  )
}

export default function HomeClient({ initialLinks }: { initialLinks: LinkItem[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => Array.from(new Set(initialLinks.flatMap((l) => l.tags || []))).sort(), [initialLinks])

  const filtered = initialLinks.filter((l) => {
    const matchesTag = !activeTag || (l.tags && l.tags.includes(activeTag))
    const matchesQuery = !query || (
      l.title.toLowerCase().includes(query.toLowerCase()) ||
      l.notes.toLowerCase().includes(query.toLowerCase()) ||
      (l.relevance && l.relevance.toLowerCase().includes(query.toLowerCase())) ||
      (l.tags && l.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))) ||
      l.domain.toLowerCase().includes(query.toLowerCase())
    )
    return matchesTag && matchesQuery
  })

  const right = (
    <div className="ig-search-block">
      <input
        type="text"
        placeholder="Search saved links..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search links"
        className="ig-search-input"
        autoComplete="off"
        spellCheck={false}
      />
      <span className="ig-search-count">{`${filtered.length} links`}</span>
    </div>
  )

  return (
    <AppShell
      active="home"
      title="Henning's saved links"
      subtitle="Clear, fast, and visible first."
      right={right}
    >
      {allTags.length > 0 && (
        <div className="ig-chip-row">
          <button
            className={`ig-chip ${activeTag === null ? 'ig-chip-active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className={`ig-chip ${activeTag === tag ? 'ig-chip-active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="simple-card-grid">
        {filtered.map((link, i) => (
          <LinkCard key={`${link.url}-${i}`} link={link} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-state">No links match that search.</p>
      )}
    </AppShell>
  )
}
