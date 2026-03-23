import { useState } from 'react'

export default function App() {
  const [words, setWords] = useState([])
  const [newWord, setNewWord] = useState('')
  const [newDef, setNewDef] = useState('')

  const addWord = () => {
    if (newWord && newDef) {
      setWords([...words, { term: newWord, definition: newDef }])
      setNewWord('')
      setNewDef('')
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#667eea', marginBottom: '30px' }}>YiShan - Memory App</h1>
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Add New Word</h2>
          <input
            type="text"
            placeholder="Word"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="text"
            placeholder="Definition"
            value={newDef}
            onChange={(e) => setNewDef(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={addWord}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Add Word
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Vocabulary ({words.length})</h2>
          {words.length === 0 ? (
            <p style={{ color: '#999' }}>No words yet. Add one to get started!</p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {words.map((word, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    padding: '15px',
                    borderRadius: '4px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: '#667eea', marginBottom: '5px' }}>
                    {word.term}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {word.definition}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}