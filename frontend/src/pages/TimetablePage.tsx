import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Timetable } from '../components/timetable/Timetable';
import type { TimetableEntry } from '../services/api';

const TIMETABLE_KEY = 'tts.last-timetable.v1';

function loadTimetableFromStorage(): TimetableEntry[] {
  const saved = localStorage.getItem(TIMETABLE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as TimetableEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function TimetablePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => loadTimetableFromStorage());

  useEffect(() => {
    // If the home page passed a fresh timetable through navigation state, keep it.
    const state = location.state as { timetable?: TimetableEntry[] } | null;

    if (state?.timetable) {
      setTimetable(state.timetable);
      localStorage.setItem(TIMETABLE_KEY, JSON.stringify(state.timetable));
    }
  }, [location.state]);

  return (
    <main className="page-shell" style={{ maxWidth: '100%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0rem', position: 'relative' }}>
      <button
        className="btn btn-ghost"
        onClick={() => navigate('/addCourses')}
        style={{ position: 'absolute', left: '1.5rem', fontSize: '1.5rem' }}
      >
        ←
      </button>
      <h1 style={{ textAlign: 'center' }}>Timetable</h1>
    </div>
    <div>
      <section className="panel">
        {timetable.length > 0 ? (
          <Timetable timetable={timetable} />
        ) : (
          <div className="empty-state">
            <h2>No timetable yet</h2>
            <p>Go back to the home page, post the saved courses, and then come here again.</p>
          </div>
        )}
      </section>
    </div>
    </main>
  );
}
