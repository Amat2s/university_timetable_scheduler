import { useState } from 'react';
import type { Lecturer, Student, Course, Subject } from '../../types/objects';
import './ModalStyle.css';

const COURSES_KEY = 'tts.addinfo.coursesList';
const LECTURERS_KEY = 'tts.addinfo.lecturersList';
const STUDENTS_KEY = 'tts.addinfo.studentsList';
const SUBJECTS_KEY = 'tts.subjects.v1';

function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: Subject) => void;
  initialValues?: Subject;
};

export const SubjectModal = ({ isOpen, onClose, onSubmit, initialValues }: Props) => {
  if (!isOpen) return null;

  const courses = loadFromStorage<Course[]>(COURSES_KEY, []);
  const lecturers = loadFromStorage<Lecturer[]>(LECTURERS_KEY, []);
  const students = loadFromStorage<Student[]>(STUDENTS_KEY, []);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(
    initialValues?.course ?? null
  );
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(
    initialValues?.lecturer ?? null
  );
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Student[]>(
    initialValues?.students ?? []
  );

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    return fullName.includes(studentSearch.toLowerCase()) && !selectedStudents.some((selected) => selected.id === s.id);
  });

  const addStudent = (student: Student) => {
    setSelectedStudents((prev) => [...prev, student]);
    setStudentSearch('');
  };

  const removeStudent = (student: Student) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id));
  };

  const existingSubjects = loadFromStorage<Subject[]>(SUBJECTS_KEY, []);

    const availableCourses = courses.filter((c) =>
    !existingSubjects.some((s) => s.course.course_id === c.course_id) ||
    c.course_id === initialValues?.course.course_id
    );

  const handleSubmit = () => {
    if (!selectedCourse || !selectedLecturer) {
      alert('Please select a course and lecturer');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    onSubmit({ course: selectedCourse, lecturer: selectedLecturer, students: selectedStudents });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{initialValues ? 'Edit Subject' : 'Create Subject'}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--white-dim)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '3px',
              lineHeight: 1,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(160,21,21,0.2)';
              e.currentTarget.style.color = 'var(--white)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--white-dim)';
            }}
          >
            ×
          </button>
        </div>

        {/* Course Selector */}
        <div>
          <label
            style={{
              display: 'block',
              color: 'var(--white-dim)',
              marginBottom: '0.35rem',
              fontSize: '0.9rem',
            }}
          >
            Course
          </label>
          <select
            value={selectedCourse?.course_id}
            onChange={(e) => {
              const course = courses.find((c) => c.course_id === e.target.value);
              setSelectedCourse(course ?? null);
            }}
          >
            <option value="">— select a course —</option>
            {availableCourses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_id} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lecturer selector */}
        <div>
          <label
            style={{
              display: 'block',
              color: 'var(--white-dim)',
              marginBottom: '0.35rem',
              fontSize: '0.9rem',
            }}
          >
            Lecturer
          </label>
          <select
            value={selectedLecturer?.id}
            onChange={(e) => {
              const lecturer = lecturers.find((l) => l.id === Number(e.target.value));
              setSelectedLecturer(lecturer ?? null);
            }}
          >
            <option value="">— select a lecturer —</option>
            {lecturers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}. {l.first_name} {l.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Student picker */}
        <div>
          <label
            style={{
              display: 'block',
              color: 'var(--white-dim)',
              marginBottom: '0.35rem',
              fontSize: '0.9rem',
            }}
          >
            Students
          </label>

          <input
            type="text"
            placeholder="Search students..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />

          {/* Dropdown results */}
          {studentSearch && filteredStudents.length > 0 && (
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '3px',
                marginTop: '0.25rem',
                maxHeight: '160px',
                overflowY: 'auto',
                background: 'var(--surface-raised)',
              }}
            >
              {filteredStudents.map((s) => (
                <div
                  key={s.first_name + s.last_name + s.id + s.title}
                  onClick={() => addStudent(s)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    color: 'var(--white)',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {s.title}. {s.first_name} {s.last_name}
                </div>
              ))}
            </div>
          )}

          {/* Selected students */}
          {selectedStudents.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {selectedStudents.map((s) => (
                <span
                  key={s.last_name + s.first_name + s.id + s.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: 'rgba(122,13,13,0.3)',
                    border: '1px solid var(--crimson)',
                    borderRadius: '3px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--white)',
                  }}
                >
                  {s.first_name} {s.last_name}
                  <button
                    onClick={() => removeStudent(s)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--white-dim)',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleSubmit}>Create Subject</button>
      </div>
    </div>
  );
};
