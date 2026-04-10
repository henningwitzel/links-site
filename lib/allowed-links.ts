import links from '@/data/links.json'

// URLs we're willing to fetch/track. Pinning to the bundled set neutralizes
// SSRF against /api/preview and abuse against /api/track — nothing outside
// this set should ever be touched.
export const ALLOWED_LINK_URLS: ReadonlySet<string> = new Set(
  (links as Array<{ url?: unknown }>)
    .map((l) => (typeof l.url === 'string' ? l.url : null))
    .filter((u): u is string => u !== null),
)

export function isAllowedLinkUrl(url: string): boolean {
  return ALLOWED_LINK_URLS.has(url)
}
