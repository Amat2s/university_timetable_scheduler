import { Navigate, Route, Routes, Link } from 'react-router-dom'
import CoursesPage from './pages/CoursesPage'
import CreateCoursePage from './pages/CreateCoursePage'
import TimetablePage from './pages/TimetablePage'
import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="app-nav">
        <Link to="/">Home</Link>
        <Link to="/createCourse">Create Course</Link>
        <Link to="/timetable">Timetable</Link>
      </nav>

      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/createCourse" element={<CreateCoursePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App