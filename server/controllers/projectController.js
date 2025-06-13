import {
  getProjectsByUser,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../models/Project.js';

export async function getAllProjects(req, res) {
  try {
    const projects = await getProjectsByUser(req.user.id);
    res.json(projects);
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export async function createNewProject(req, res) {
  const { title, preview, data } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Название обязательно' });
  }

  try {
    const newProject = await createProject({
      userId: req.user.id,
      title,
      preview,
      data,
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Ошибка при создании проекта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

export async function getProject(req, res) {
  const { id } = req.params;
  console.log('Запрос проекта с id:', id, 'от пользователя:', req.user?.id);

  try {
    const project = await getProjectById(id, req.user.id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }
    res.json(project);
  } catch (error) {
    console.error('Ошибка при получении проекта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}


export async function updateProjectById(req, res) {
  try {
    const userId = req.user.id; // из authMiddleware
    const projectId = req.params.id;
    const { title, preview, data } = req.body;

    // Можно добавить проверку, что проект принадлежит userId (если нужно)

    if (!title || !data) {
      return res.status(400).json({ message: 'Не хватает данных' });
    }

    const updated = await updateProject({
      id: projectId,
      userId,
      title,
      preview,
      data,
    });

    if (!updated) {
      return res.status(404).json({ message: 'Проект не найден или нет доступа' });
    }

    res.json({ message: 'Проект обновлён', project: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}


export async function removeProject(req, res) {
  const { id } = req.params;

  try {
    await deleteProject(id, req.user.id);
    res.json({ message: 'Проект удалён' });
  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
