import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Timetable } from '../components/Timetable'
import type { TimetableEntry } from '../services/api'

const TIMETABLE_KEY = 'tts.last-timetable.v1'

function loadTimetableFromStorage(): TimetableEntry[] {
  const saved = window.localStorage.getItem(TIMETABLE_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved) as TimetableEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function TimetablePage() {
  const location = useLocation()
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => loadTimetableFromStorage())

  useEffect(() => {
    // If the home page passed a fresh timetable through navigation state, keep it.
    const state = location.state as { timetable?: TimetableEntry[] } | null

    if (state?.timetable) {
      setTimetable(state.timetable)
      window.localStorage.setItem(TIMETABLE_KEY, JSON.stringify(state.timetable))
    }
  }, [location.state])

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Timetable</p>
        <h1>Generated timetable</h1>
        <p className="page-copy">
          This page shows the timetable returned by the solver.
        </p>
      </header>

      <section className="panel">
        <div className="page-actions">
          <Link className="btn btn-secondary" to="/">
            Back to home
          </Link>
        </div>

        {timetable.length > 0 ? (
          <Timetable data={timetable} />
        ) : (
          <div className="empty-state">
            <h2>No timetable yet</h2>
            <p>Go back to the home page, post the saved courses, and then come here again.</p>
          </div>
        )}
      </section>
    </main>
  )
}