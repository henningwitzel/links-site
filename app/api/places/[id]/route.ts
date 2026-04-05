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

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const places = await readPlaces()
  const nextPlaces = places.filter((place) => place.id !== id)

  if (nextPlaces.length === places.length) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 })
  }

  await writePlaces(nextPlaces)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const places = await readPlaces()
  const index = places.findIndex((place) => place.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 })
  }

  places[index] = {
    ...places[index],
    visited: Boolean(body.visited),
  }

  await writePlaces(places)
  return NextResponse.json(places[index])
}
