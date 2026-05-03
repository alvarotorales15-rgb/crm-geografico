'use client'

import { useState, useEffect } from 'react'

interface Client {
  id: string
  name: string
  company: string
  city: string
  address: string
  phone: string
  email: string
  segment: string
  status: string
  patrimonio: string
  notes: string
  account_number: string
  province: { id: number, name: string }
}

interface Province {
  id: number
  name: string
}

interface ClientDetailProps {
  client: Client
  onClose: () => void
  onDeleted: () => void
  onUpdated: () => void
}

export default function ClientDetail({ client, onClose, onDeleted, onUpdated }: ClientDetailProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [form, setForm] = useState({
    name: client.name || '',
    company: client.company || '',
    province_id: client.province?.id || '',
    city: client.city || '',
    address: client.address || '',
    phone: client.phone || '',
    email: client.email || '',
    segment: client.segment || 'persona_fisica',
    status: client.status || 'prospecto',
    patrimonio: client.patrimonio || '',
    account_number: client.account_number || '',
    notes: client.notes || ''
  })

  useEffect(() => {
    fetch('/api/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data))
  }, [])

  const segmentBg: Record<string, string> = {
    persona_fisica: '#dcfce7',
    persona_juridica: '#e8f0fc',
    cooperativa: '#ede9fe',
    cdc: '#fef3c7'
  }
  const segmentColor: Record<string, string> = {
    persona_fisica: '#15803d',
    persona_juridica: '#1a5fb4',
    cooperativa: '#7c3aed',
    cdc: '#b45309'
  }
  const segmentLabel: Record<string, string> = {
    persona_fisica: 'Persona Física',
    persona_juridica: 'Persona Jurídica',
    cooperativa: 'Cooperativa',
    cdc: 'CDC'
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${client.name}?`)) return
    setLoading(true)
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    onDeleted()
  }

  const handleUpdate = async () => {
    setLoading(true)
    await fetch(`/api/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        province_id: parseInt(String(form.province_id))
      })
    })
    setEditing(false)
    setLoading(false)
    onUpdated()
  }

  const inputStyle = {
    padding: '7px 10px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '13px', width: '100%'
  }

  const rowStyle = {
    display: 'flex' as const, gap: '6px', fontSize: '13px',
    padding: '6px 0', borderBottom: '1px solid #f3f4f6'
  }

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: segmentBg[client.segment] || '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '600',
            color: segmentColor[client.segment] || '#374151'
          }}>
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{client.name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{client.company}</div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '18px', color: '#9ca3af', lineHeight: 1
        }}>×</button>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: segmentBg[client.segment] || '#f3f4f6', color: segmentColor[client.segment] || '#374151' }}>
          {segmentLabel[client.segment] || client.segment}
        </span>
        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: '#f3f4f6', color: '#374151' }}>
          {client.status}
        </span>
        {client.patrimonio && (
          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '10px', background: '#fef3c7', color: '#b45309' }}>
            {client.patrimonio}
          </span>
        )}
      </div>

      {!editing ? (
        <>
          <div>
            {[
              { label: 'Provincia', value: client.province?.name },
              { label: 'Ciudad', value: client.city },
              { label: 'Dirección', value: client.address },
              { label: 'Teléfono', value: client.phone },
              { label: 'Email', value: client.email },
              { label: 'N° cuenta', value: client.account_number },
              { label: 'Notas', value: client.notes },
            ].map(row => row.value ? (
              <div key={row.label} style={rowStyle}>
                <span style={{ color: '#6b7280', minWidth: '70px' }}>{row.label}</span>
                <span style={{ color: '#111827' }}>{row.value}</span>
              </div>
            ) : null)}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditing(true)} style={{
              flex: 1, padding: '8px', border: '1px solid #ddd',
              borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px'
            }}>Editar</button>
            <button onClick={handleDelete} disabled={loading} style={{
              flex: 1, padding: '8px', border: 'none',
              borderRadius: '8px', background: '#fee2e2', color: '#dc2626',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500'
            }}>Eliminar</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Empresa" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={inputStyle} />
            <select value={form.province_id} onChange={e => setForm({ ...form, province_id: e.target.value })} style={inputStyle}>
              <option value="">Seleccionar provincia</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input placeholder="Ciudad" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} style={inputStyle} />
            <input placeholder="Dirección" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} />
            <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input placeholder="Número de cuenta" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} style={inputStyle} />
            <select value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })} style={inputStyle}>
              <option value="persona_fisica">Persona Física</option>
              <option value="persona_juridica">Persona Jurídica</option>
              <option value="cooperativa">Cooperativa</option>
              <option value="cdc">CDC</option>
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              <option value="prospecto">Prospecto</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <select value={form.patrimonio} onChange={e => setForm({ ...form, patrimonio: e.target.value })} style={inputStyle}>
              <option value="">Patrimonio</option>
              <option value="bajo">Bajo</option>
              <option value="medio">Medio</option>
              <option value="alto">Alto</option>
              <option value="muy_alto">Muy alto</option>
            </select>
            <textarea placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: '70px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setEditing(false)} style={{
              flex: 1, padding: '8px', border: '1px solid #ddd',
              borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px'
            }}>Cancelar</button>
            <button onClick={handleUpdate} disabled={loading} style={{
              flex: 1, padding: '8px', border: 'none',
              borderRadius: '8px', background: '#1a5fb4', color: 'white',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500'
            }}>{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </>
      )}
    </div>
  )
}
