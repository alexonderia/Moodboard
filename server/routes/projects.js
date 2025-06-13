import express from 'express';
import {
  getAllProjects,
  createNewProject,
  getProject,
  updateProjectById,
  removeProject,
} from '../controllers/projectController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware); // защищаем все маршруты

router.get('/', getAllProjects);
router.post('/', createNewProject);
router.get('/:id', getProject);
router.put('/:id', updateProjectById);
router.delete('/:id', removeProject);

export default router;
