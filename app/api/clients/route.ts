import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function geocode(city: string, provinceName: string) {
  try {
    const query = `${city}, ${provinceName}, Argentina`
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GeoClientes-CRM/1.0' }
    })
    const data = await res.json()
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
  } catch (e) {
    console.error('Geocoding error:', e)
  }
  return { lat: null, lng: null }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province_id = searchParams.get('province_id')
  const segment = searchParams.get('segment')

  let query = supabase
    .from('clients')
    .select('*, province:provinces(id, name)')
    .order('name')

  if (province_id) query = query.eq('province_id', province_id)
  if (segment) query = query.eq('segment', segment)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data: province } = await supabase
    .from('provinces')
    .select('name')
    .eq('id', body.province_id)
    .single()

  const { lat, lng } = await geocode(body.city, province?.name || '')

  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...body, lat, lng }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}