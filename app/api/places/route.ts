import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface Place {
  id: string
  name: string
  address: string
  category: string
  maps_url: string
  note: string
  tags: string[]
  date_added: string
  visited: boolean
}

const placesPath = path.join(process.cwd(), 'data', 'places.json')

async function readPlaces(): Promise<Place[]> {
  const raw = await fs.readFile(placesPath, 'utf8')
  return JSON.parse(raw) as Place[]
}

async function writePlaces(places: Place[]) {
  await fs.writeFile(placesPath, JSON.stringify(places, null, 2) + '\n', 'utf8')
}

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
  }

  if (!place.name || !place.address || !place.maps_url) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const places = await readPlaces()
  places.unshift(place)
  await writePlaces(places)

  return NextResponse.json(place, { status: 201 })
}
