'use client'

import { AppShell } from '../ui'
import type { LinkItem } from '../page-client'

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
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString('en-GB', { month: 'long' })
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function FeedRow({ link }: { link: LinkItem }) {
  const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  const date = parseDateAdded(link)

  return (
    <article className="simple-feed-row">
      <div className="simple-feed-row-top">
        <div className="simple-card-site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?sz=64&domain=${link.domain}`}
            width={18}
            height={18}
            className="simple-card-favicon"
            alt=""
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
          />
          <span className="simple-card-domain">{link.domain.replace(/^www\./, '')}</span>
        </div>
        <span className="simple-card-date">{formatFullDate(date)}</span>
      </div>

      <a href={link.url} target="_blank" rel="noopener noreferrer" className="simple-card-link">
        <h2 className="simple-card-title">{link.title}</h2>
      </a>

      {link.summary && <p className="simple-card-text">{link.summary}</p>}
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
  )
}

function MonthDivider({ label }: { label: string }) {
  return (
    <div className="feed-month-divider" aria-label={`Links from ${label}`}>
      <span className="feed-month-label">{label}</span>
    </div>
  )
}

export default function FeedClient({ initialLinks }: { initialLinks: LinkItem[] }) {
  const groups: { key: string; label: string; items: LinkItem[] }[] = []
  for (const link of initialLinks) {
    const d = parseDateAdded(link)
    const key = monthKey(d)
    const last = groups[groups.length - 1]
    if (!last || last.key !== key) groups.push({ key, label: monthLabel(key), items: [link] })
    else last.items.push(link)
  }

  return (
    <AppShell
      active="feed"
      title="Archive feed"
      subtitle="Chronological and plain enough to not break."
    >
      {initialLinks.length === 0 ? (
        <p className="empty-state">No links yet.</p>
      ) : (
        <div className="simple-feed-list">
          {groups.map((group) => (
            <div key={group.key} className="feed-group">
              <MonthDivider label={group.label} />
              <div className="simple-feed-group">
                {group.items.map((link, i) => (
                  <FeedRow key={`${link.url}-${i}`} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
