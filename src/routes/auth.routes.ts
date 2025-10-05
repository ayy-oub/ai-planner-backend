// src/routes/auth.routes.ts
import { Router } from 'express';
import {
    register,
    login,
    googleAuth,
    appleAuth,
    refreshToken,
    getCurrentUser,
    logout,
    updateProfile,
    changePassword,
    deleteAccount
} from '../controllers/auth.controller';
import {authenticate as authMiddleware } from '../middleware/auth';
import {validate as validateRequest } from '../middleware/validate';
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema
} from '../models/validators';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/google', googleAuth);
router.post('/apple', appleAuth);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authMiddleware);
router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.put('/profile', validateRequest(updateProfileSchema), updateProfile);
router.put('/password', validateRequest(changePasswordSchema), changePassword);
router.delete('/account', deleteAccount);

export default router;