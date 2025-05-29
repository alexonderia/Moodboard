import React, { useState } from 'react';
import { useNavigate , Routes, Route } from 'react-router-dom';
import AuthForm from './pages/AuthPage/AuthForm';
import EditorPage from './pages/EditorPage/EditorPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import './pages/ProjectsPage/ProjectsPage.css';
import './pages/EditorPage/EditorPage.css';
import './pages/AuthPage/AuthForm.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem('token', token);
    setUser(user);
    navigate('/projects');
  };

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AuthForm />} />
      <Route path="/projects" element={<ProjectsPage user={user} />} />
      <Route path="/editor/new" element={<EditorPage user={user} />} />
      <Route path="/editor/:id" element={<EditorPage user={user} />} />
    </Routes>
  );
}

export default App;