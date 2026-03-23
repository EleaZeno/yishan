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
      <h1>YiShan</h1>
      <p>Memory App</p>
      <p>Loading...</p>
    </div>
  )
}