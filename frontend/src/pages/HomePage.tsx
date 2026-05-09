import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="page-shell">
      <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <h1>Timetable Scheduler</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Start by adding course information
        </p>
        <Link
          to="/addInfo"
          className="btn btn-primary"
          style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
        >
          Get Started →
        </Link>
      </div>
    </main>
  );
}
