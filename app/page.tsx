'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import ClientForm from './components/ClientForm'
import ClientList from './components/ClientList'
import ClientDetail from './components/ClientDetail'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const [refresh, setRefresh] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const exportToExcel = async () => {
    const { utils, writeFile } = await import('xlsx')
    const res = await fetch('/api/clients')
    const clients = await res.json()
    const data = clients.map((c: any) => ({
      'Nombre': c.name, 'Empresa': c.company, 'Provincia': c.province?.name,
      'Ciudad': c.city, 'Dirección': c.address, 'Teléfono': c.phone,
      'Email': c.email, 'N° Cuenta': c.account_number,
      'Segmento': c.segment === 'persona_fisica' ? 'Persona Física' :
                  c.segment === 'persona_juridica' ? 'Persona Jurídica' :
                  c.segment === 'cooperativa' ? 'Cooperativa' :
                  c.segment === 'cdc' ? 'CDC' : c.segment,
      'Estado': c.status, 'Patrimonio': c.patrimonio, 'Notas': c.notes,
      'Fecha de alta': new Date(c.created_at).toLocaleDateString('es-AR')
    }))
    const ws = utils.json_to_sheet(data)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Clientes')
    writeFile(wb, 'clientes.xlsx')
  }

  const importFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { read, utils } = await import('xlsx')
    const data = await file.arrayBuffer()
    const wb = read(data)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = utils.sheet_to_json(ws) as any[]
    const provincesRes = await fetch('/api/provinces')
    const provinces = await provincesRes.json()
    const segmentMap: Record<string, string> = {
      'Persona Física': 'persona_fisica', 'Persona Jurídica': 'persona_juridica',
      'Cooperativa': 'cooperativa', 'CDC': 'cdc'
    }
    let imported = 0
    for (const row of rows) {
      const province = provinces.find((p: any) =>
        p.name.toLowerCase() === (row['Provincia'] || '').toLowerCase()
      )
      if (!province) continue
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: row['Nombre'] || '', company: row['Empresa'] || '',
          province_id: province.id, city: row['Ciudad'] || '',
          address: row['Dirección'] || '', phone: row['Teléfono'] || '',
          email: row['Email'] || '', account_number: row['N° Cuenta'] || '',
          segment: segmentMap[row['Segmento']] || 'persona_fisica',
          status: row['Estado'] || 'prospecto', patrimonio: row['Patrimonio'] || '',
          notes: row['Notas'] || ''
        })
      })
      imported++
    }
    alert(`Se importaron ${imported} clientes correctamente.`)
    setRefresh(r => r + 1)
    e.target.value = ''
  }

  return (
    <main style={{ display: 'flex', height: '100vh', width: '100%', margin: 0, padding: 0 }}>
      <div style={{
        width: '320px', flexShrink: 0, background: 'white',
        borderRight: '1px solid #e5e7eb', display: 'flex',
        flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>GeoClientes</h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>CRM Geográfico</p>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.replace('/login') }}
              style={{ padding: '6px 10px', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              Salir
            </button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { setShowForm(!showForm); setSelectedClient(null) }}
              style={{ flex: 1, padding: '7px 0', background: '#1a5fb4', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
              {showForm ? '← Lista' : '+ Nuevo'}
            </button>
            <button onClick={exportToExcel}
              style={{ flex: 1, padding: '7px 0', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              Exportar
            </button>
            <label style={{ flex: 1, padding: '7px 0', background: '#0f766e', color: 'white', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}>
              Importar
              <input type="file" accept=".xlsx,.xls" onChange={importFromExcel} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {showForm ? (
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <ClientForm onClientAdded={() => { setRefresh(r => r + 1); setShowForm(false) }} />
            </div>
          ) : selectedClient ? (
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <ClientDetail
                client={selectedClient}
                onClose={() => setSelectedClient(null)}
                onDeleted={() => { setSelectedClient(null); setRefresh(r => r + 1) }}
                onUpdated={() => { setSelectedClient(null); setRefresh(r => r + 1) }}
              />
            </div>
          ) : (
            <ClientList refresh={refresh} onClientSelect={(client) => setSelectedClient(client)} />
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Map key={refresh} />
      </div>
    </main>
  )
}
