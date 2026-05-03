import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const { data, error } = await supabase
    .from('clients')
    .select('*, province:provinces(id, name)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await request.json()

  const { data: province } = await supabase
    .from('provinces')
    .select('name')
    .eq('id', body.province_id)
    .single()

  let lat = null
  let lng = null

  if (body.city && province?.name) {
    try {
      const query = `${body.city}, ${province.name}, Argentina`
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      const res = await fetch(url, { headers: { 'User-Agent': 'GeoClientes-CRM/1.0' } })
      const data = await res.json()
      if (data.length > 0) {
        lat = parseFloat(data[0].lat)
        lng = parseFloat(data[0].lon)
      }
    } catch (e) {
      console.error('Geocoding error:', e)
    }
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ ...body, lat, lng, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}


export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Cliente eliminado' })
}
