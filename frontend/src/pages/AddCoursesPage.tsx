import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solverApi } from '../services/api';
import type { CourseInfo, CoursePayload, SolveRequest } from '../services/api';
import { SubjectModal } from '../components/modals/SubjectModal';
import type { Lecturer, Student, Course, Subject } from '../types/objects';

const SUBJECTS_KEY = 'tts.subjects.v1';
const COURSES_KEY = 'tts.addinfo.coursesList';
const LECTURERS_KEY = 'tts.addinfo.lecturersList';
const STUDENTS_KEY = 'tts.addinfo.studentsList';
const TIMETABLE_KEY = 'tts.last-timetable.v1';

function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function AddCoursesPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadFromStorage<Subject[]>(SUBJECTS_KEY, [])
  );
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    const courses = loadFromStorage<Course[]>(COURSES_KEY, []);
    const lecturers = loadFromStorage<Lecturer[]>(LECTURERS_KEY, []);
    const students = loadFromStorage<Student[]>(STUDENTS_KEY, []);

    if (!courses.length || !lecturers.length || !students.length) {
      setError(
        'Please add at least one course, lecturer, and student in the Add Info page before creating a subject.'
      );
      return;
    }

    setEditingSubject(null);
    setShowSubjectModal(true);
  };

  const handleSubmit = (subject: Subject) => {
    if (editingSubject) {
      const updated = subjects.map((s) =>
        s.course.course_id === editingSubject.course.course_id ? subject : s
      );
      setSubjects(updated);
      saveToStorage(SUBJECTS_KEY, updated);
      setShowSubjectModal(false);
      setEditingSubject(null);
    } else {
      const updated = [...subjects, subject];
      setSubjects(updated);
      saveToStorage(SUBJECTS_KEY, updated);
      setShowSubjectModal(false);
      setEditingSubject(null);
    }
  };

  const deleteSubject = (subject: Subject) => {
    const updated = subjects.filter((s) => s.course.course_id !== subject.course.course_id);
    setSubjects(updated);
    saveToStorage(SUBJECTS_KEY, updated);
  };

  const handleSolve = async () => {
    if (subjects.length === 0) {
      setError('Add at least one course before solving.');
      return;
    }

    const request: CoursePayload[] = subjects.map((s) => ({
      course: { course_id: s.course.course_id, lecture: s.course.lecture, seminar: s.course.seminar, tutorials: s.course.tutorials },
      lecturer: s.lecturer.id,
      students: s.students.map((st) => st.id),
    }));

    const payload: SolveRequest = {
      courses: request,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await solverApi.solveTimetable(payload);
      if (response.status === 'success') {
        saveToStorage(TIMETABLE_KEY, response.timetable);
        navigate('/timetable');
      } else {
        setError('Solver could not find a valid timetable.');
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <SubjectModal
        isOpen={showSubjectModal || editingSubject !== null}
        onClose={() => {
          setShowSubjectModal(false);
          setEditingSubject(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingSubject ?? undefined}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/addInfo')}
          style={{ fontSize: '1.5rem', padding: '0.5rem' }}
        >
          ←
        </button>
        <h1>Subjects</h1>
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/timetable')}
          style={{ fontSize: '1.5rem', padding: '0.5rem' }}
        >
          →
        </button>
      </div>

      <div className="panel" style={{ marginBottom: '1rem' }}>
        <button
          className="btn btn-secondary"
          onClick={handleCreate}
          style={{ marginBottom: '1rem' }}
        >
          ＋ Add Subject
        </button>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            <span>{error}</span>
            <button className="close-btn" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {subjects.length === 0 ? (
          <p style={{ color: 'var(--white-dim)' }}>
            No subjects yet. Click "Add Subject" to create one.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {subjects.map((s) => (
              <div
                key={s.course.course_id}
                className="list-item"
                onClick={() => {
                  setEditingSubject(s);
                  setShowSubjectModal(true);
                }}
              >
                <div>
                  <strong>{s.course.course_id}</strong> — {s.course.name}
                  <span
                    style={{ color: 'var(--white-dim)', marginLeft: '1rem', fontSize: '0.9rem' }}
                  >
                    {s.lecturer.title}. {s.lecturer.last_name} · {s.students.length} students
                  </span>
                </div>
                <button
                  className="btn btn-ghost small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(s);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSolve}
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Generating...' : 'Generate Timetable'}
      </button>
    </main>
  );
}
