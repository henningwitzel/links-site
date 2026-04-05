import { NextResponse } from 'next/server'
import links from '../../../data/links.json'

export async function GET() {
  const normalized = (links as Record<string, unknown>[]).map((link) => ({
    ...link,
    date: link.date ?? link.date_added,
  }))
  return NextResponse.json(normalized)
}
