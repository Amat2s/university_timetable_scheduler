import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { solverApi, type CoursePayload, type SolveRequest, type TimetableEntry } from '../services/api'
import type { CourseDraft } from '../components/CourseBuilder'

/*
  Home page layout:
  - Right column: course list and actions
  - Left column: split into two stacked panels:
      - Top: Add / list lecturers
      - Bottom: Add / list students

  Storage keys:
  - tts.courses.v1  (existing)
  - tts.lecturers.v1
  - tts.students.v1
  - tts.last-timetable.v1
*/

const COURSES_KEY = 'tts.courses.v1'
const LECTURERS_KEY = 'tts.lecturers.v1'
const STUDENTS_KEY = 'tts.students.v1'
const TIMETABLE_KEY = 'tts.last-timetable.v1'

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

function buildSolveRequest(courses: CourseDraft[]): SolveRequest {
  const payload: CoursePayload[] = courses
    .map((course) => ({
      course_id: course.course_id.trim(),
      lecturer: course.lecturer.trim(),
      tutorial_groups: Number.isFinite(course.tutorial_groups) && course.tutorial_groups > 0
        ? Math.trunc(course.tutorial_groups)
        : 1,
      students: course.studentsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }))
    .filter((course) => course.course_id.length > 0 && course.lecturer.length > 0)

  return { courses: payload }
}

export default function CoursesPage() {
  const navigate = useNavigate()

  // Page state: courses already handled elsewhere; we read them for summary.
  const [courses, setCourses] = useState<CourseDraft[]>(() => loadFromStorage<CourseDraft[]>(COURSES_KEY, []))

  // New left-side state: lecturers and students lists
  const [courseId, setCourseId] = useState('')
  const [course, setCourse] = useState('')

  const [switcher, setSwitcher] = useState(false)

  const [lecturerName, setLecturerName] = useState('')
  const [lecturers, setLecturers] = useState<string[]>(() => loadFromStorage<string[]>(LECTURERS_KEY, []))

  const [studentName, setStudentName] = useState('')
  const [students, setStudents] = useState<string[]>(() => loadFromStorage<string[]>(STUDENTS_KEY, []))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep local course list in sync if other pages change storage
  useEffect(() => {
    const onStorage = () => setCourses(loadFromStorage<CourseDraft[]>(COURSES_KEY, []))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Persist lecturers & students when they change
  useEffect(() => saveToStorage(LECTURERS_KEY, lecturers), [lecturers])
  useEffect(() => saveToStorage(STUDENTS_KEY, students), [students])

  const hasCourses = courses.length > 0

  const switchView = () => setSwitcher((s) => !s)

  const courseCards = useMemo(
    () =>
      courses.map((course) => ({
        ...course,
        students: course.studentsText.split(',').map((s) => s.trim()).filter(Boolean),
      })),
    [courses],
  )

  const deleteCourse = (id: string) => {
    const next = courses.filter((c) => c.id !== id)
    setCourses(next)
    saveToStorage(COURSES_KEY, next)
  }

  // Add/remove courses
  // const addCourse = () => {
  //   const id = courseId.trim()
  //   if (!id) return
  //   if (!courses.includes(id)) {
  //     setCourse((s) => [...s, id])
  //     setCourseId('')
  //   }
  // }

  // Add/remove lecturers
  const addLecturer = () => {
    const name = lecturerName.trim()
    if (!name) return
    if (!lecturers.includes(name)) {
      setLecturers((s) => [...s, name])
      setLecturerName('')
    }
  }
  const removeLecturer = (name: string) => setLecturers((s) => s.filter((x) => x !== name))

  // Add/remove students
  const addStudent = () => {
    const name = studentName.trim()
    if (!name) return
    if (!students.includes(name)) {
      setStudents((s) => [...s, name])
      setStudentName('')
    }
  }
  const removeStudent = (name: string) => setStudents((s) => s.filter((x) => x !== name))

  // Post courses to solver and navigate to timetable
  const handleSolveAndGoToTimetable = async () => {
    const request = buildSolveRequest(courses)
    if (request.courses.length === 0) {
      setError('Add at least one complete course before sending it to the solver.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await solverApi.solveTimetable(request)
      if (response.status === 'success') {
        saveToStorage(TIMETABLE_KEY, response.timetable)
        navigate('/timetable')
        return
      }
      saveToStorage(TIMETABLE_KEY, [])
      setError('The solver could not find a valid timetable for the current course list.')
    } catch (err) {
      setError(`Failed to send course data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = () => navigate('/createCourse')

  return (
    <>
    <header className="page-header">
      <button className="btn btn-ghost switcher" onClick={switchView}>
        {switcher ? 'Create Courses' : 'Add course information'}
      </button>
    </header>
    <main className="page-shell home-grid">
      
      {switcher ? (
      <>
      <aside className="left-column">

        <section className="panel panel-section">
          <h3>Courses</h3>
          <p className="panel-note">Create course IDs</p>

          <div className="form-row">
            <input className="field-input" placeholder="Dr Augustine" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} />
            <button className="btn btn-primary" onClick={addLecturer}>Add</button>
          </div>
        </section>

        <section className="panel panel-section">
          <h3>Lecturers</h3>
          <p className="panel-note">Add lecturers here. You can later choose these names when creating courses.</p>

          <div className="form-row">
            <input className="field-input" placeholder="Dr Augustine" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} />
            <button className="btn btn-primary" onClick={addLecturer}>Add</button>
          </div>

          <ul className="entity-list">
            {lecturers.length === 0 && <li className="muted">No lecturers added</li>}
            {lecturers.map((l) => (
              <li key={l} className="entity-row">
                <span>{l}</span>
                <button className="btn btn-ghost small" onClick={() => removeLecturer(l)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel-section">
          <h3>Students</h3>
          <p className="panel-note">Add individual students here; you can also paste lists when creating courses.</p>

          <div className="form-row">
            <input className="field-input" placeholder="Alice" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            <button className="btn btn-primary" onClick={addStudent}>Add</button>
          </div>

          <ul className="entity-list">
            {students.length === 0 && <li className="muted">No students added</li>}
            {students.map((s) => (
              <li key={s} className="entity-row">
                <span>{s}</span>
                <button className="btn btn-ghost small" onClick={() => removeStudent(s)}>Remove</button>
              </li>
            ))}
          </ul>
        </section>
      </aside>
      </>
      ):(
      
      
      <>
      <section className="panel right-column">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow">Home</p>
            <h1>Saved Courses</h1>
            <p className="page-copy">Use the buttons to post the courses to the solver or to create a new one.</p>
          </div>

          <div className="page-actions" style={{ marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/createCourse')}>＋ Create</button>
            <button className="btn btn-primary" onClick={handleSolveAndGoToTimetable} disabled={loading}>
              {loading ? 'Sending...' : 'Post courses and open timetable'}
            </button>
          </div>
        </header>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button className="close-btn" type="button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {!hasCourses ? (
          <div className="empty-state">
            <h2>No courses yet</h2>
            <p>Click “Create a new course” to add your first course.</p>
          </div>
        ) : (
          <div className="course-summary-list">
            {courseCards.map((course) => (
              <article key={course.id} className="course-summary-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h2>{course.course_id}</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost small" onClick={() => deleteCourse(course.id)}>Delete</button>
                  </div>
                </div>
                <p><strong>Lecturer:</strong> {course.lecturer}</p>
                <p><strong>Tutorial groups:</strong> {course.tutorial_groups}</p>
                <p><strong>Students:</strong> {course.students.length > 0 ? course.students.join(', ') : 'None listed'}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      </>
      )}
    </main>
    </>
  )
}