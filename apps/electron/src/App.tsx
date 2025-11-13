import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const handleAnalyze = async () => {
    try {
      const response = await window.electron.analyzeRequest({
        content: 'Sample content for analysis',
        analysisType: 'summary',
      })
      console.log('Analysis Response:', response)
      alert('Analysis request sent. Check console for response.')
    } catch (error) {
      console.error('Error:', error)
      alert('Error sending analysis request')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Scaling Memory</h1>
        <p>Electron + React + Vite Application</p>
      </header>

      <main className="app-main">
        <div className="placeholder-content">
          <h2>Welcome to Scaling Memory</h2>
          <p>This is a placeholder interface for the Electron application.</p>

          <section className="feature-section">
            <h3>Features</h3>
            <ul>
              <li>Electron-based desktop application</li>
              <li>React + Vite for fast development</li>
              <li>TypeScript for type safety</li>
              <li>IPC channel for AI analysis requests</li>
              <li>macOS support via electron-builder</li>
            </ul>
          </section>

          <section className="demo-section">
            <h3>Demo</h3>
            <div className="demo-buttons">
              <button
                className="demo-button primary"
                onClick={() => setCount(count + 1)}
              >
                Count: {count}
              </button>
              <button className="demo-button" onClick={handleAnalyze}>
                Send AI Analysis Request
              </button>
            </div>
          </section>

          <section className="info-section">
            <h3>Monorepo Structure</h3>
            <p>This application is part of a monorepo with:</p>
            <ul>
              <li>
                <code>@scaling-memory/shared</code> - Shared types and utilities
              </li>
              <li>
                <code>@scaling-memory/electron</code> - Electron application
              </li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>Build with Electron, React, and Vite</p>
      </footer>
    </div>
  )
}

export default App
