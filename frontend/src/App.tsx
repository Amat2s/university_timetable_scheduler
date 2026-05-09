import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddInfoPage from './pages/AddInfo';
import AddCoursesPage from './pages/AddCoursesPage';
import TimetablePage from './pages/TimetablePage';
import './App.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/addInfo" element={<AddInfoPage />} />
        <Route path="/addCourses" element={<AddCoursesPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
