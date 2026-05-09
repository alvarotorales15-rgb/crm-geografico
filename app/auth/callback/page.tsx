'use client'

import { useEffect } from 'react'

export default function AuthCallback() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const type = params.get('type')
      if (type === 'recovery') {
        window.location.replace('/reset-password' + hash)
      } else {
        window.location.replace('/')
      }
    } else {
      window.location.replace('/')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <p style={{ color: '#6b7280' }}>Redirigiendo...</p>
    </div>
  )
}
