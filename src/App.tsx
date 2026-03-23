import { useState } from 'react'

export default function App() {
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
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>YiShan</h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>Memory App</p>
      <p style={{ marginTop: '40px', opacity: 0.7 }}>Loading...</p>
    </div>
  )
}