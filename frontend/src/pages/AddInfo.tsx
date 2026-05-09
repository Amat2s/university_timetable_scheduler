import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Lecturer, Student, Course } from '../types/objects';
import { LectureModal } from '../components/modals/LecturerModal';
import { StudentModal } from '../components/modals/StudentModel';
import { CourseModal } from '../components/modals/CourseModal';
import './page.css';

const COURSES_KEY = 'tts.addinfo.coursesList';
const LECTURERS_KEY = 'tts.addinfo.lecturersList';
const STUDENTS_KEY = 'tts.addinfo.studentsList';

function loadFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function AddInfo() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(() => loadFromStorage(COURSES_KEY, []));
  const [lecturers, setLecturers] = useState<Lecturer[]>(() => loadFromStorage(LECTURERS_KEY, []));
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage(STUDENTS_KEY, []));

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

  const addCourse = (course: Course): { success: boolean; errors: string[] } => {
    // Validation - Check all fields of Course are filled (course_id, name, lecture hours/cap, seminar hours/cap, tutorial groups hours/cap)
    const errors: string[] = [];
    if (!course.course_id?.trim()) {
      errors.push('Course code is required.');
    }

    if (!course.name?.trim()) {
      errors.push('Course name is required.');
    }

    if (!Array.isArray(course.lecture) || course.lecture.length !== 2) {
      errors.push('lecture must be a [hours, capacity] tuple');
    } else {
      const [hours, cap] = course.lecture;
      if (hours < 0) errors.push('lecture hours must non-negative');
      if (cap < 0) errors.push('lecture capacity must be non-negative');
    }

    if (!Array.isArray(course.seminar) || course.seminar.length !== 2) {
      errors.push('seminar must be a [hours, capacity] tuple');
    } else {
      const [hours, cap] = course.seminar;
      if (hours < 0) errors.push('seminar hours must be non-negative');
      if (cap < 0) errors.push('seminar capacity must be non-negative');
    }

    // Validate tutorials
    if (!Array.isArray(course.tutorials)) {
      errors.push('tutorials must be an array');
    } else if (course.tutorials.length === 0) {
      errors.push('at least one tutorial group is required');
    } else {
      course.tutorials.forEach(([hours, cap], i) => {
        if (hours <= 0) errors.push(`tutorial group ${i + 1}: hours must be greater than 0`);
        if (cap <= 0) errors.push(`tutorial group ${i + 1}: capacity must be greater than 0`);
      });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const existing = localStorage.getItem(COURSES_KEY);
    const courses: Course[] = existing ? JSON.parse(existing) : [];

    const duplicate = courses.some((c) => c.course_id === course.course_id);
    if (duplicate) {
      return { success: false, errors: [`course_id "${course.course_id}" already exists`] };
    }

    courses.push(course);
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));

    return { success: true, errors: [] };
  };

  const removeCourse = (idx: number) => {
    const updated = courses.filter((_, i) => i !== idx);
    setCourses(updated);
    window.localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
  };

  const addLecturer = (lecturer: Lecturer): { success: boolean; errors: string[] } => {
    // validation - check all fields of Lecturer are filled (id, title, first_name, last_name)
    const errors: string[] = [];

    if (!lecturer.id) {
      errors.push('Lecturer ID is required.');
    }

    if (!lecturer.title) {
      errors.push('Lecturer title is required.');
    }

    if (!lecturer.first_name?.trim()) {
      errors.push('Lecturer first name is required.');
    }

    if (!lecturer.last_name?.trim()) {
      errors.push('Lecturer last name is required.');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const existing = localStorage.getItem(LECTURERS_KEY);
    const lecturers: Lecturer[] = existing ? JSON.parse(existing) : [];

    const duplicate = lecturers.some((l) => l.id === lecturer.id);
    if (duplicate) {
      return { success: false, errors: [`lecturer ID "${lecturer.id}" already exists`] };
    }

    lecturers.push(lecturer);
    localStorage.setItem(LECTURERS_KEY, JSON.stringify(lecturers));

    return { success: true, errors: [] };
  };

  const removeLecturer = (idx: number) => {
    const updated = lecturers.filter((_, i) => i !== idx);
    setLecturers(updated);
    window.localStorage.setItem(LECTURERS_KEY, JSON.stringify(updated));
  };

  const addStudent = (student: Student): { success: boolean; errors: string[] } => {
    // validation - check all fields of Student are filled (id, title, first_name, last_name)
    const errors: string[] = [];

    if (!student.id) {
      errors.push('Student ID is required.');
    }

    if (!student.title) {
      errors.push('Student title is required.');
    }

    if (!student.first_name?.trim()) {
      errors.push('Student first name is required.');
    }

    if (!student.last_name?.trim()) {
      errors.push('Student last name is required.');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const existing = localStorage.getItem(STUDENTS_KEY);
    const students: Student[] = existing ? JSON.parse(existing) : [];

    const duplicate = students.some((s) => s.id === student.id);
    if (duplicate) {
      return { success: false, errors: [`student ID "${student.id}" already exists`] };
    }

    students.push(student);
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));

    return { success: true, errors: [] };
  };

  const removeStudent = (idx: number) => {
    const updated = students.filter((_, i) => i !== idx);
    setStudents(updated);
    window.localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
  };

  const handleNext = () => {
    navigate('/addCourses');
  };

  return (
    <main className="page-shell">
      <LectureModal
        isOpen={showLecturerModal || editingLecturer !== null}
        onClose={() => { setShowLecturerModal(false); setEditingLecturer(null); }}
        initialValues={editingLecturer ?? undefined}
        onSubmit={(lecturer) => {
          if (editingLecturer) {
            // editing
            const updated = lecturers.map((l) => l.id === editingLecturer.id ? lecturer : l);
            setLecturers(updated);
            localStorage.setItem(LECTURERS_KEY, JSON.stringify(updated));
            setEditingLecturer(null);
            setShowLecturerModal(false);
          } else {
            // adding new
          const { success, errors } = addLecturer(lecturer);
          if (!success) {
            alert('Error adding lecturer:\n' + errors.join('\n'));
          } else {
            setLecturers((prev) => [...prev, lecturer]);
            setShowLecturerModal(false);
          }
        }
        }}
      />
      <StudentModal
        isOpen={showStudentModal || editingStudent !== null}
        onClose={() => { setShowStudentModal(false); setEditingStudent(null); }}
        initialValues={editingStudent ?? undefined}
        onSubmit={(student) => {
          if (editingStudent) {
            // editing
            const updated = students.map((s) => s.id === editingStudent.id ? student : s);
            setStudents(updated);
            localStorage.setItem(STUDENTS_KEY, JSON.stringify(updated));
            setEditingStudent(null);
            setShowStudentModal(false);
          } else {
            // adding new
          const { success, errors } = addStudent(student);
          if (!success) {
            alert('Error adding student:\n' + errors.join('\n'));
          } else {
            setStudents((prev) => [...prev, student]);
            setShowStudentModal(false);
          }
          }
        }}
      />
      <CourseModal
        isOpen={showCourseModal || editingCourse !== null}
        onClose={() => { setShowCourseModal(false); setEditingCourse(null); }}
        initialValues={editingCourse ?? undefined}
        onSubmit={(course) => {
          if (editingCourse) {
            // editing
            const updated = courses.map((c) => c.course_id === editingCourse.course_id ? course : c);
            setCourses(updated);
            localStorage.setItem(COURSES_KEY, JSON.stringify(updated));
            setEditingCourse(null);
            setShowCourseModal(false);
          } else {
            // adding new
            const { success, errors } = addCourse(course);
            if (!success) {
              alert('Error adding course:\n' + errors.join('\n'));
            } else {
              setCourses((prev) => [...prev, course]);
              setShowCourseModal(false);
            }
          }
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/')}
          style={{ fontSize: '1.5rem', padding: '0.5rem' }}
        >
          ←
        </button>
        <h1>Add Course Information</h1>
        <button
          className="btn btn-ghost"
          onClick={handleNext}
          style={{ fontSize: '1.5rem', padding: '0.5rem' }}
        >
          →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Lecturers Column */}
        <div className="panel">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Lecturers</h2>
            <button className="btn btn-secondary" onClick={() => setShowLecturerModal(true)}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {lecturers.map((lecturer, idx) => (
              <div
                key={idx}
                className='list-item'
                onClick={() => setEditingLecturer(lecturer)}
              >
                <span>{[lecturer.title, '. ', lecturer.last_name]}</span>
                <button className="btn btn-ghost small" onClick={(e) => {e.stopPropagation(); removeLecturer(idx); }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Column */}
        <div className="panel">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Courses</h2>
            <button className="btn btn-secondary" onClick={() => setShowCourseModal(true)}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {courses.map((course, idx) => (
              <div
                key={idx}
                className='list-item'
                onClick={() => setEditingCourse(course)}
              >
                <span>{course.course_id}</span>
                <button className="btn btn-ghost small" onClick={(e) => { e.stopPropagation(); removeCourse(idx); }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Students Column */}
        <div className="panel">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Students</h2>
            <button className="btn btn-secondary" onClick={() => setShowStudentModal(true)}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {students.map((student, idx) => (
              <div
                key={idx}
                className='list-item'
                onClick={() => setEditingStudent(student)}
              >
                <span>{student.first_name}</span>
                <button className="btn btn-ghost small" onClick={(e) => { e.stopPropagation(); removeStudent(idx); }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
