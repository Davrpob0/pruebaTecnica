import { Router } from 'express';
import { register, login, verifyToken, logout } from './controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-token', verifyToken);
router.post("/logout", logout);

export default router;
