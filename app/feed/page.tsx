import links from '../../data/links.json'
import FeedClient from './page-client'
import type { LinkItem } from '../page-client'

export default function FeedPage() {
  const normalized: LinkItem[] = (links as Partial<LinkItem>[])
    .filter((link) => link.url && link.title)
    .map((link) => ({
      url: link.url ?? '',
      title: link.title ?? '',
      notes: link.notes ?? '',
      summary: (link as LinkItem & { summary?: string }).summary,
      domain: link.domain ?? 'link',
      relevance: link.relevance,
      tags: link.tags ?? [],
      date: link.date ?? link.date_added ?? '',
      date_added: link.date_added,
    } as LinkItem))

  return <FeedClient initialLinks={normalized} />
}
