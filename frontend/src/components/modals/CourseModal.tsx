import type { Course } from '../../types/objects';
import { useState } from 'react';
import './ModalStyle.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => void;
  initialValues?: Course;
};

type SessionRowProps = {
  label: string;
  hours: number;
  cap: number;
  onHoursChange: (hours: number) => void;
  onCapChange: (cap: number) => void;
};

const SessionRow = ({ label, hours, cap, onHoursChange, onCapChange }: SessionRowProps) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <span style={{ width: '80px', color: 'var(--white-dim)', fontStyle: 'italic', flexShrink: 0 }}>
      {label}
    </span>

    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <button onClick={() => onHoursChange(Math.max(0, hours - 1))}>−</button>
      <span style={{ width: '20px', textAlign: 'center', color: 'var(--gold)' }}>{hours}</span>
      <button onClick={() => onHoursChange(Math.min(4, hours + 1))}>+</button>
      <span style={{ color: 'var(--white-dim)', fontSize: '0.85rem' }}>hrs</span>
    </div>

    <input
      type="number"
      placeholder="Capacity"
      value={cap === 0 ? '' : cap}
      disabled={hours === 0}
      min={1}
      onChange={(e) => onCapChange(Number(e.target.value))}
      style={{
        width: '120px',
        flexShrink: 0,
        opacity: hours === 0 ? 0.35 : 1,
        cursor: hours === 0 ? 'not-allowed' : 'text',
      }}
    />
  </div>
);

export const CourseModal = ({ isOpen, onClose, onSubmit, initialValues }: Props) => {
  if (!isOpen) return null;
  // Has input for all lecture fields: id (number), title (Title, dropdown with options from lecturers list), first_name (string), last_name (string)
  const [id, setId] = useState(initialValues?.course_id ?? '');
  const [name, setName] = useState(initialValues?.name ?? '');
  const [lectureHours, setLectureHours] = useState(initialValues?.lecture[0] ?? 0);
  const [lectureCap, setLectureCap] = useState(initialValues?.lecture[1] ?? 0);
  const [seminarHours, setSeminarHours] = useState(initialValues?.seminar[0] ?? 0);
  const [seminarCap, setSeminarCap] = useState(initialValues?.seminar[1] ?? 0);
  const [tutorials, setTutorials] = useState<Array<{ hours: number; cap: number }>>(
    initialValues?.tutorials.map(([hours, cap]) => ({ hours, cap })) ?? []
  );

  const addTutorial = () => setTutorials((prev) => [...prev, { hours: 1, cap: 0 }]);

  const removeTutorial = (index: number) =>
    setTutorials((prev) => prev.filter((_, i) => i !== index));

  const updateTutorial = (index: number, field: 'hours' | 'cap', value: number) =>
    setTutorials((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));

  const handleSubmit = () => {
    if (!id || !name) {
      alert('Please fill in all fields');
      return;
    }

    if (!lectureHours && !seminarHours) {
      alert('Course must have at least a lecture or seminar component');
      return;
    }

    if (lectureHours && !lectureCap) {
      alert('Please set lecture capacity');
      return;
    }

    if (seminarHours && !seminarCap) {
      alert('Please set seminar capacity');
      return;
    }

    // TODO - If no tuts, send confirmation dialog

    for (let i = 0; i < tutorials.length; i++) {
      const t = tutorials[i];
      if (t.cap == 0) {
        alert(`Please set capacity for Tutorial ${i + 1}`);
        return;
      }
    }

    onSubmit({
      course_id: id,
      name: name,
      lecture: [lectureHours, lectureCap],
      seminar: [seminarHours, seminarCap],
      tutorials: tutorials.map((t) => [t.hours, t.cap]),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            border: 'none',
            color: 'var(--white-dim)',
            fontSize: '2rem',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '0.25rem',
          }}
        >
          ×
        </button>
        <h2>{initialValues ? 'Edit Course' : 'Add Course'}</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            style={{ maxWidth: '150px' }}
            type="text"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <SessionRow
            label="Lecture"
            hours={lectureHours}
            cap={lectureCap}
            onHoursChange={(h) => {
              setLectureHours(h);
              if (h === 0) setLectureCap(0);
            }}
            onCapChange={setLectureCap}
          />
          <SessionRow
            label="Seminar"
            hours={seminarHours}
            cap={seminarCap}
            onHoursChange={(h) => {
              setSeminarHours(h);
              if (h === 0) setSeminarCap(0);
            }}
            onCapChange={setSeminarCap}
          />
        </div>
        <div>-----------------------------------------------------------------------</div>
        {/* Tutorials - Could be AI slop, review later*/}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tutorials.map((t, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  width: '80px',
                  color: 'var(--white-dim)',
                  fontStyle: 'italic',
                  flexShrink: 0,
                }}
              >
                Tut. {idx + 1}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button onClick={() => updateTutorial(idx, 'hours', Math.max(1, t.hours - 1))}>
                  −
                </button>
                <span style={{ width: '20px', textAlign: 'center', color: 'var(--gold)' }}>
                  {t.hours}
                </span>
                <button onClick={() => updateTutorial(idx, 'hours', Math.min(4, t.hours + 1))}>
                  +
                </button>
                <span style={{ color: 'var(--white-dim)', fontSize: '0.85rem' }}>hrs</span>
              </div>

              <input
                type="number"
                placeholder="Capacity"
                value={t.cap === 0 ? '' : t.cap}
                min={1}
                onChange={(e) => updateTutorial(idx, 'cap', Number(e.target.value))}
                style={{ width: '120px', flexShrink: 0 }}
              />

              <button
                onClick={() => removeTutorial(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--crimson-light)',
                  cursor: 'pointer',
                  fontSize: '2rem',
                }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            className="btn-secondary"
            onClick={addTutorial}
            style={{ alignSelf: 'flex-start' }}
          >
            + Add Tutorial
          </button>
        </div>
        <button onClick={handleSubmit}>{initialValues ? 'Save Changes' : 'Add Course'}</button>
      </div>
    </div>
  );
};
