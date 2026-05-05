import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { CourseDraft } from '../components/CourseBuilder'

const COURSES_KEY = 'tts.courses.v1'
const LECTURERS_KEY = 'tts.lecturers.v1'
const STUDENTS_KEY = 'tts.students.v1'

function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as T
    return parsed
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function makeLocalId(): string {
  return `course_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export default function CreateCoursePage() {
  const navigate = useNavigate()
  const [courseId, setCourseId] = useState('')
  const [lecturer, setLecturer] = useState('') // selected lecturer (must be from list if present)
  const [studentsText, setStudentsText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const availableLecturers = loadFromStorage<string[]>(LECTURERS_KEY, [])
  const availableStudents = loadFromStorage<string[]>(STUDENTS_KEY, [])

  const handleSaveCourse = () => {
    const trimmedCourseId = courseId.trim()

    // Enforce lecturer selection from available list when the list is not empty
    if (!trimmedCourseId) {
      setError('Course code is required.')
      return
    }
    if (availableLecturers.length > 0 && !lecturer) {
      setError('Choose a lecturer from the list.')
      return
    }
    if (availableLecturers.length === 0 && !lecturer.trim()) {
      setError('Enter a lecturer (no lecturers are defined yet).')
      return
    }

    const studentsList = studentsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const studentsTextJoined = studentsList.join(', ')

    const nextCourse: CourseDraft = {
      id: makeLocalId(),
      course_id: trimmedCourseId,
      lecturer: lecturer.trim(),
      tutorial_groups: 1,
      studentsText: studentsTextJoined,
    }

    const existing = loadFromStorage<CourseDraft[]>(COURSES_KEY, [])
    saveToStorage(COURSES_KEY, [...existing, nextCourse])
    navigate('/')
  }

  return (
    <main className="page-shell">
        <div style={{ marginBottom: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>← Courses</button>
        </div>
      <header className="page-header">
        <p className="eyebrow">Create course</p>
        <h1>Add a new course</h1>
        <p className="page-copy">Choose a lecturer and students from the available lists.</p>
      </header>

      <section className="panel">
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button className="close-btn" type="button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="form-grid">
        <label className="field">
            <span>Course code</span>
            <input type="text" value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="THEO101" />
        </label>

        <label className="field">
            <span>Lecturer</span>
            {availableLecturers.length > 0 ? (
            <select value={lecturer} onChange={(e) => setLecturer(e.target.value)}>
                <option value="">— choose a lecturer —</option>
                {availableLecturers.map((l) => (
                <option key={l} value={l}>{l}</option>
                ))}
            </select>
            ) : (
            <input type="text" value={lecturer} onChange={(e) => setLecturer(e.target.value)} placeholder="Dr Augustine" />
            )}
        </label>

        <label className="field field-wide">
            <span>Students (comma-separated)</span>
            <textarea rows={4} value={studentsText} onChange={(e) => setStudentsText(e.target.value)} placeholder="Alice, Ben, Clara" />
        </label>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSaveCourse}>Save course</button>
          <Link className="btn btn-secondary" to="/">Cancel</Link>
        </div>
      </section>
    </main>
  )
}