import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = req.nextUrl.searchParams.get('place_id')

  if (!apiKey || !placeId) {
    return NextResponse.json({ photo_url: null })
  }

  try {
    const detailsRes = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=photos`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'photos',
      },
      cache: 'no-store',
    })

    if (!detailsRes.ok) {
      return NextResponse.json({ photo_url: null })
    }

    const data = await detailsRes.json() as { photos?: Array<{ name?: string }> }
    const photoName = data.photos?.[0]?.name

    if (!photoName) {
      return NextResponse.json({ photo_url: null })
    }

    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=600&key=${encodeURIComponent(apiKey)}`
    return NextResponse.json({ photo_url: photoUrl })
  } catch {
    return NextResponse.json({ photo_url: null })
  }
}
