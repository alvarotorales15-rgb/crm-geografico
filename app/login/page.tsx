'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Revisá tu email para confirmar tu cuenta.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos')
      else window.location.replace('/')
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
          <h1 style={{ fontSize: '22px', fontWeight: '600', margin: '0 0 6px' }}>GeoClientes</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {isRegister ? 'Creá tu cuenta' : 'Ingresá a tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '5px' }}>Contraseña</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '8px', fontSize: '13px', color: '#15803d' }}>
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '11px', background: '#1a5fb4', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer', marginTop: '4px'
          }}>
            {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(''); setMessage('') }}
            style={{ color: '#1a5fb4', cursor: 'pointer', fontWeight: '500' }}
          >
            {isRegister ? 'Ingresá' : 'Registrate'}
          </span>
        </p>
      </div>
    </div>
  )
}
