import { NextRequest, NextResponse } from 'next/server'
import { readPlaces, writePlaces } from '@/lib/places-store'

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
