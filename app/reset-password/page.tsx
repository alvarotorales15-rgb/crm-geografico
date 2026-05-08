'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Contraseña actualizada. Redirigiendo...')
      setTimeout(() => window.location.replace('/'), 2000)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', outline: 'none'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <div style={{
        background: 'white', padding: '40px',
        borderRadius: '16px', border: '1px solid #e5e7eb',
        width: '100%', maxWidth: '380px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 6px' }}>Nueva contraseña</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Escribí tu nueva contraseña</p>
        </div>

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Nueva contraseña</label>
            <input type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Confirmar contraseña</label>
            <input type="password" required value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" style={inputStyle} />
          </div>

          {error && <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>{error}</div>}
          {message && <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '8px', fontSize: '13px', color: '#15803d' }}>{message}</div>}

          <button type="submit" disabled={loading} style={{
            padding: '11px', background: '#1a5fb4', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer', marginTop: '4px'
          }}>
            {loading ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}