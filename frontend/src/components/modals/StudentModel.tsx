import type { Student, Title } from '../../types/objects';
import { useState } from 'react';
import './ModalStyle.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Student) => void;
  initialValues?: Student;
};

export const StudentModal = ({ isOpen, onClose, onSubmit, initialValues }: Props) => {
    if (!isOpen) return null;
    // Has input for all lecture fields: id (number), title (Title, dropdown with options from lecturers list), first_name (string), last_name (string)
    const [id, setId] = useState(initialValues?.id ?? '');
    const [title, setTitle] = useState<Title>(initialValues?.title ?? 'Mr');
    const [firstName, setFirstName] = useState(initialValues?.first_name ?? '');
    const [lastName, setLastName] = useState(initialValues?.last_name ?? '');

    const handleSubmit = () => {
        if (!id || !firstName || !lastName) {
            alert('Please fill in all fields');
            return;
        }

        onSubmit({ id: Number(id), title, first_name: firstName, last_name: lastName });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px' }}>
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
                <h2>{initialValues ? 'Edit Student' : 'Add Student'}</h2>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input 
                    type="number"
                    placeholder="ID"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    style={{ flex: '1 0 100px' }}
                />
                <select style={{ flex: '1 0 60px' }} value={title} onChange={(e) => setTitle(e.target.value as Title)}>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Fr">Fr</option>
                </select>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ flex: '2 0 150px' }}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ flex: '2 0 150px' }}
                />
                <button className='btn btn secondary' onClick={handleSubmit}>{initialValues? 'Save Changes' : 'Add Student'}</button>
                </div>
            </div>
        </div>
    );
};
