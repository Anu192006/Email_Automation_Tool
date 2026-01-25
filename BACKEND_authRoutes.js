import express from 'express';
import { register, login, logout, validate, changePassword } from './BACKEND_authController.js';
import { authenticateToken } from './BACKEND_auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new admin account
 * Public endpoint - no auth required
 * Body: { email, password, name }
 * Returns: { success, message, data: { id, email, name, role } }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with email and password
 * Public endpoint - no auth required
 * Body: { email, password }
 * Returns: { success, message, data: { token, user } }
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Logout - invalidate token on frontend
 * Protected endpoint - requires JWT token
 * Returns: { success, message }
 */
router.post('/logout', authenticateToken, logout);

/**
 * GET /api/auth/validate
 * Validate JWT token and return current user
 * Protected endpoint - requires JWT token
 * Returns: { success, data: { id, email, role, exp } }
 */
router.get('/validate', authenticateToken, validate);

/**
 * POST /api/auth/change-password
 * Change admin password
 * Protected endpoint - requires JWT token
 * Body: { currentPassword, newPassword }
 * Returns: { success, message }
 */
router.post('/change-password', authenticateToken, changePassword);

export default router;
