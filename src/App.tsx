import { useState, useEffect } from 'react'

export default function App() {
  const [ready, setReady] = useState(false)
  
  useEffect(() => {
    setReady(true)
  }, [])
  
  if (!ready) return null
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>蹇嗛棯</h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>绉戝璁板繂锛岃繃鐩笉蹇?/p>
      <p style={{ marginTop: '40px', opacity: 0.7 }}>搴旂敤鍔犺浇涓?..</p>
    </div>
  )
}