import { Router } from 'express';
import { changePassword, currentUser, login, register } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, currentUser);
router.patch('/password', requireAuth, changePassword);

export default router;