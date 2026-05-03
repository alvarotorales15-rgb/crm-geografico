'use client'

import { useState, useEffect } from 'react'

interface Province {
  id: number
  name: string
}

interface ClientFormProps {
  onClientAdded: () => void
}

export default function ClientForm({ onClientAdded }: ClientFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    province_id: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    segment: 'persona_fisica',
    status: 'prospecto',
    patrimonio: '',
    account_number: '',
    notes: ''
  })

  useEffect(() => {
    fetch('/api/provinces')
      .then(res => res.json())
      .then(data => setProvinces(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        province_id: parseInt(form.province_id)
      })
    })

    if (response.ok) {
      setForm({
        name: '', company: '', province_id: '', city: '',
        address: '', phone: '', email: '', segment: 'persona_fisica',
        status: 'prospecto', patrimonio: '', account_number: '', notes: ''
      })
      onClientAdded()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input required placeholder="Nombre completo *" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        style={inputStyle} />
      <input placeholder="Empresa" value={form.company}
        onChange={e => setForm({ ...form, company: e.target.value })}
        style={inputStyle} />
      <select required value={form.province_id}
        onChange={e => setForm({ ...form, province_id: e.target.value })}
        style={inputStyle}>
        <option value="">Seleccionar provincia *</option>
        {provinces.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input required placeholder="Ciudad *" value={form.city}
        onChange={e => setForm({ ...form, city: e.target.value })}
        style={inputStyle} />
      <input placeholder="Dirección" value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
        style={inputStyle} />
      <input placeholder="Teléfono" value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
        style={inputStyle} />
      <input placeholder="Email" type="email" value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        style={inputStyle} />
      <input placeholder="Número de cuenta" value={form.account_number}
        onChange={e => setForm({ ...form, account_number: e.target.value })}
        style={inputStyle} />
      <select value={form.segment}
        onChange={e => setForm({ ...form, segment: e.target.value })}
        style={inputStyle}>
        <option value="persona_fisica">Persona Física</option>
        <option value="persona_juridica">Persona Jurídica</option>
        <option value="cooperativa">Cooperativa</option>
        <option value="cdc">CDC</option>
      </select>
      <select value={form.status}
        onChange={e => setForm({ ...form, status: e.target.value })}
        style={inputStyle}>
        <option value="prospecto">Prospecto</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </select>
      <select value={form.patrimonio}
        onChange={e => setForm({ ...form, patrimonio: e.target.value })}
        style={inputStyle}>
        <option value="">Patrimonio (opcional)</option>
        <option value="bajo">Bajo</option>
        <option value="medio">Medio</option>
        <option value="alto">Alto</option>
        <option value="muy_alto">Muy alto</option>
      </select>
      <textarea placeholder="Notas" value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })}
        style={{ ...inputStyle, minHeight: '80px' }} />
      <button type="submit" disabled={loading}
        style={{ padding: '10px', background: '#1a5fb4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
        {loading ? 'Guardando...' : '+ Guardar cliente'}
      </button>
    </form>
  )
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '13px',
  width: '100%'
}

