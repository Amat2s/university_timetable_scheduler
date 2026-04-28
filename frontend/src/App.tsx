import { useState } from 'react'
import { Timetable } from './components/Timetable'
import { solverApi, type TimetableEntry } from './services/api'
import './App.css'

function App() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerateTimetable = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await solverApi.getSolve()
      if (response.status === 'success') {
        setTimetable(response.timetable)
        setHasGenerated(true)
      } else {
        setError('No valid timetable could be generated. Please try again.')
      }
    } catch (err) {
      setError(`Failed to generate timetable: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      await solverApi.downloadTimetable()
    } catch (err) {
      setError(`Failed to download timetable: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>University Timetable Scheduler</h1>
        <p>Constraint-based automatic scheduling system</p>
      </header>

      <div className="controls">
        <button
          onClick={handleGenerateTimetable}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Generating...' : 'Generate Timetable'}
        </button>
        {hasGenerated && (
          <button
            onClick={handleDownload}
            className="btn btn-secondary"
          >
            Download as Excel
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      {hasGenerated && timetable.length > 0 && (
        <div className="timetable-section">
          <h2>Generated Timetable</h2>
          <Timetable data={timetable} />
        </div>
      )}

      {hasGenerated && timetable.length === 0 && (
        <div className="info-message">
          <p>No timetable data available. Please generate a new one.</p>
        </div>
      )}
    </div>
  )
}

export default App
