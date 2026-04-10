export interface LinkItem {
  url: string
  title: string
  type?: string
  author?: string
  summary?: string
  relevance?: string
  tags?: string[]
  date_added: string
  /** Alias for date_added — added by the API route for backward compat */
  date?: string
  domain: string
}

export interface Place {
  id: string
  name: string
  address: string
  category: string
  maps_url: string
  note: string
  description?: string
  what_to_order?: string
  tags: string[]
  date_added: string
  visited: boolean
  photo_url: string | null
  google_place_id?: string | null
}

export interface Preview {
  title?: string
  description?: string
  image?: string
  siteName?: string
}
