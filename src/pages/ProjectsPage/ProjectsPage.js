import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateUser, deleteUser } from '../../api/auth';
import { fetchProjects, createProject, deleteProject } from '../../api/projects';
import './ProjectsPage.css';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);  
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [profileData, setProfileData] = useState({
    name: user?.username || '',
    password: '',
    passwordConfirm: '',
    created_at: user?.created_at || '',
  });
  const [profileError, setProfileError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

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
    if (!title.trim()) {
      setError('Название проекта не может быть пустым');
      return;
    }
    try {
      const res = await createProject({ title });
      setProjects([...projects, res.data]);
      setShowCreateModal(false);      
      setNewProjectTitle('');
      setError(null);
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

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async () => {
    setProfileError(null);

    if (profileData.password !== profileData.passwordConfirm) {
      setProfileError('Пароли не совпадают');
      return;
    }

    try {
      setProfileLoading(true);
      await updateUser({
        username: profileData.name,
        password: profileData.password || undefined,
      });

      setUser((prev) => ({ ...prev, username: profileData.name }));
      localStorage.setItem('user', JSON.stringify({ ...user, username: profileData.name }));

      setShowProfileModal(false);
      setProfileLoading(false);
    } catch (err) {
      setProfileError('Ошибка при обновлении профиля');
      setProfileLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm('Вы уверены, что хотите удалить профиль? Это действие необратимо.');
    if (!confirmed) return;

    try {
      await deleteUser();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      alert('Не удалось удалить профиль');
    }
  };



  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="dashboard-title">Мои проекты</h2>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="custom-button"
            onClick={() => setShowProfileModal(true)}
            title="Редактировать профиль"
          >
            <FontAwesomeIcon icon="user" /> Профиль
          </button>

          <button
            className="custom-button cancel"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}
            title="Выйти из аккаунта"
          >
            <FontAwesomeIcon icon="right-to-bracket" /> Выйти
          </button>
        </div>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            {project.preview ? (
              <img
                className="project-thumbnail"
                src={project.preview}
                alt={`Превью проекта ${project.title}`}
                onClick={() => navigate(`/editor/${project.id}`)}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <div className="project-thumbnail placeholder" onClick={() => navigate(`/editor/${project.id}`)} style={{ cursor: 'pointer' }} />
            )}

            <div className="project-footer">
              <div 
                className="project-title"
                onClick={() => navigate(`/editor/${project.id}`)}
                style={{ cursor: 'pointer', flex: 1 }}
              >
                {project.title}
              </div>
              <button
                className="delete-button"
                title="Удалить проект"
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmed = window.confirm('Вы уверены? Это действие безвозвратно удалит проект.');
                  if (confirmed) {
                    handleDeleteProject(project.id);
                  }
                }}
              >
                <FontAwesomeIcon icon="trash" />
              </button>
            </div>
          </div>
        ))}

        <div className="project-card new" onClick={() => setShowCreateModal(true)}>
          <div className="new-project-icon">+</div>
          <div className="project-footer">
            <div className="project-title">Создать новый проект</div>
          </div>
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {showCreateModal && (
        <div className="custom-modal-container">
          <div className="custom-modal-content">
            <h3>Создание нового проекта</h3>
            <input
              type="text" class="custom-input"
              placeholder="Введите название проекта"              
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateProject(e.target.value);
                }
              }}
            />
            <div className="button-row">
              <button
                className="custom-button cancel"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewProjectTitle('');
                  setError(null);
                }}
              >
                Отмена
              </button>
              <button
                className="custom-button create"
                onClick={() => handleCreateProject(newProjectTitle)}
              >
                Создать
              </button>
            </div>

          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="custom-modal-container">
          <div className="custom-modal-content">
            <h3>Редактирование профиля</h3>
            <input
              type="text"
              name="name"
              className="custom-input"
              placeholder="Имя пользователя"
              value={profileData.name}
              onChange={handleProfileChange}
              autoFocus
            />
            <input
              type="password"
              name="password"
              className="custom-input"
              placeholder="Новый пароль (оставьте пустым, если не менять)"
              value={profileData.password}
              onChange={handleProfileChange}
            />
            <input
              type="password"
              name="passwordConfirm"
              className="custom-input"
              placeholder="Подтверждение пароля"
              value={profileData.passwordConfirm}
              onChange={handleProfileChange}
            />
            
            <div className="profile-meta">
              <p>Дата создания профиля: {profileData.created_at ? profileData.created_at.slice(0, 10) : 'Дата недоступна'}</p>              
            </div>
            

            {profileError && <p className="auth-error">{profileError}</p>}
            <div className="button-row">
              <button
                className="custom-button cancel"
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileError(null);
                }}
                disabled={profileLoading}
              >
                Отмена
              </button>
              <button
                className="custom-button create"
                onClick={handleProfileSubmit}
                disabled={profileLoading}
              >
                {profileLoading ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button
                className="custom-button danger"
                onClick={handleDeleteProfile}
                disabled={profileLoading}
              >
                Удалить профиль
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;