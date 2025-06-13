import express from 'express';
import { register, login, updateUser, deleteUser  } from '../controllers/authController.js';

import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


router.post('/register', register);
router.post('/login', login);
router.put('/update', updateUser);
router.delete('/delete', deleteUser);


export default router;
