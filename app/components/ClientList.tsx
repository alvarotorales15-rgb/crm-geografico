'use client'

import { useEffect, useState } from 'react'

interface Client {
  id: string
  name: string
  company: string
  city: string
  segment: string
  status: string
  province: { name: string }
}

interface ClientListProps {
  refresh: number
  onClientSelect: (client: Client) => void
}

export default function ClientList({ refresh, onClientSelect }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data))
  }, [refresh])

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.company?.toLowerCase().includes(filter.toLowerCase()) ||
    c.city?.toLowerCase().includes(filter.toLowerCase())
  )

  const segmentColor: Record<string, string> = {
    persona_fisica: '#15803d',
    persona_juridica: '#1a5fb4',
    cooperativa: '#7c3aed',
    cdc: '#b45309'
  }

  const segmentBg: Record<string, string> = {
    persona_fisica: '#dcfce7',
    persona_juridica: '#e8f0fc',
    cooperativa: '#ede9fe',
    cdc: '#fef3c7'
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          placeholder="Buscar cliente..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            width: '100%', padding: '7px 10px',
            border: '1px solid #ddd', borderRadius: '8px',
            fontSize: '13px'
          }}
        />
        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
          {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.map(client => (
          <div
            key={client.id}
            onClick={() => onClientSelect(client)}
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: segmentBg[client.segment] || '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '500',
              color: segmentColor[client.segment] || '#374151',
              flexShrink: 0
            }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {client.name}
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>
                {client.city} · {client.province?.name}
              </div>
            </div>
            <span style={{
              fontSize: '10px', fontWeight: '500',
              padding: '2px 7px', borderRadius: '10px',
              background: segmentBg[client.segment] || '#f3f4f6',
              color: segmentColor[client.segment] || '#374151',
              whiteSpace: 'nowrap'
            }}>
              {client.segment === 'persona_fisica' ? 'Persona Física' :
 client.segment === 'persona_juridica' ? 'Persona Jurídica' :
 client.segment === 'cooperativa' ? 'Cooperativa' :
 client.segment === 'cdc' ? 'CDC' : client.segment}
 
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
