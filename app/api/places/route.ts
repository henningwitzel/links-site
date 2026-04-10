import { NextRequest, NextResponse } from 'next/server'
import { readPlaces, writePlaces } from '@/lib/places-store'
import type { Place } from '@/lib/types'

export async function GET() {
  const places = await readPlaces()
  return NextResponse.json(places)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const place: Place = {
    id: String(body.id ?? crypto.randomUUID()),
    name: String(body.name ?? ''),
    address: String(body.address ?? ''),
    category: String(body.category ?? 'other'),
    maps_url: String(body.maps_url ?? ''),
    note: String(body.note ?? ''),
    tags: Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag)) : [],
    date_added: String(body.date_added ?? new Date().toISOString().slice(0, 10)),
    visited: Boolean(body.visited),
    photo_url: body.photo_url == null ? null : String(body.photo_url),
    google_place_id: body.google_place_id == null ? null : String(body.google_place_id),
  }

  if (!place.name || !place.address || !place.maps_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const places = await readPlaces()
  places.unshift(place)
  await writePlaces(places)

  return NextResponse.json(place, { status: 201 })
}
