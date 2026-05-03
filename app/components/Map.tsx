'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'


const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })


import L from 'leaflet'

const iconBySegment = (segment: string) => {
  const colors: Record<string, string> = {
    persona_fisica: '#15803d',
    persona_juridica: '#1a5fb4',
    cooperativa: '#7c3aed',
    cdc: '#b45309'
  }
  const color = colors[segment] || '#6b7280'
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
  })
}

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Client {
  id: string
  name: string
  company: string
  city: string
  lat: number
  lng: number
  segment: string
  province: { name: string }
}

const segmentLabel: Record<string, string> = {
  persona_fisica: 'Persona Física',
  persona_juridica: 'Persona Jurídica',
  cooperativa: 'Cooperativa',
  cdc: 'CDC'
}

export default function Map() {
  const [geoData, setGeoData] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetch('/argentina.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(() => setGeoData(null))

    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data))
  }, [])

  const geoStyle = {
    fillColor: '#e8f0f8',
    weight: 1,
    color: '#4a90d9',
    fillOpacity: 0.6
  }

  return (
    <MapContainer
      center={[-38.4161, -63.6167]}
      zoom={4}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {geoData && <GeoJSON data={geoData} style={geoStyle} />}
     
        {clients.map(client =>
          client.lat && client.lng ? (
            <Marker key={client.id} position={[client.lat, client.lng]} icon={iconBySegment(client.segment)}>
              <Popup>
                <strong>{client.name}</strong><br />
                {client.company}<br />
                {client.city}, {client.province?.name}<br />
                <em>{segmentLabel[client.segment] || client.segment}</em>
              </Popup>
            </Marker>
          ) : null
        )}
      
      
    </MapContainer>
  )
}
