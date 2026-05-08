'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false })

import L from 'leaflet'
import { useMap } from 'react-leaflet'

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

const segmentLabel: Record<string, string> = {
  persona_fisica: 'Persona Física',
  persona_juridica: 'Persona Jurídica',
  cooperativa: 'Cooperativa',
  cdc: 'CDC'
}

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

function ClusterLayer({ clients }: { clients: Client[] }) {
  const map = useMap()
  const clusterRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    import('leaflet.markercluster').then(() => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
      }

      const cluster = (L as any).markerClusterGroup({
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
      })

      clients.forEach(client => {
        if (!client.lat || !client.lng) return
        const marker = L.marker([client.lat, client.lng], {
          icon: iconBySegment(client.segment)
        })
        marker.bindPopup(`
          <strong>${client.name}</strong><br/>
          ${client.company ? client.company + '<br/>' : ''}
          ${client.city}, ${client.province?.name}<br/>
          <em>${segmentLabel[client.segment] || client.segment}</em>
        `)
        cluster.addLayer(marker)
      })

      map.addLayer(cluster)
      clusterRef.current = cluster
    })

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
      }
    }
  }, [clients, map])

  return null
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
      <ClusterLayer clients={clients} />
    </MapContainer>
  )
}
