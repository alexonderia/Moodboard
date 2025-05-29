import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjects, createProject, deleteProject } from '../../api/projects';
import './ProjectsPage.css';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        const res = await fetchProjects();
        setProjects(res.data);
      } catch (err) {
        setError('Ошибка при загрузке проектов');
      }
    };

    fetchProjectsData();
  }, []);

  const handleCreateProject = async (title) => {
    try {
      const res = await createProject({ title });
      setProjects([...projects, res.data]);
      setShowCreateModal(false);
    } catch (err) {
      setError('Ошибка при создании проекта');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(projects.filter((project) => project.id !== id));
    } catch (err) {
      setError('Ошибка при удалении проекта');
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Мои проекты</h2>
      <div className="project-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card" onClick={() => navigate(`/editor/${project.id}`)}>
            <div className="project-thumbnail"></div>
            <div className="project-title">{project.title}</div>
          </div>
        ))}
        <div className="project-card new" onClick={() => setShowCreateModal(true)}>
          <div className="new-project-icon">+</div>
          <div className="project-title">Создать новый проект</div>
        </div>
      </div>
      {error && <p className="auth-error">{error}</p>}
      {showCreateModal && (
        <div className="custom-modal-container">
          <div className="custom-modal-content">
            <h3>Создание нового проекта</h3>
            <label>Название проекта</label>
            <input
              type="text"
              placeholder="Введите название проекта"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateProject(e.target.value);
                }
              }}
            />
            <button onClick={() => setShowCreateModal(false)}>Отмена</button>
            <button onClick={() => handleCreateProject(document.querySelector('input').value)}>Создать</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;