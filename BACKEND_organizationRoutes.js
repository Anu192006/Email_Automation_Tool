import express from 'express';
import { setup, getInfo, updateTemplates } from './BACKEND_organizationController.js';
import { authenticateToken } from './BACKEND_auth.js';

const router = express.Router();

/**
 * POST /api/organization/setup
 * Setup organization (requires auth)
 */
router.post('/setup', authenticateToken, setup);

/**
 * GET /api/organization/info
 * Get organization info (requires auth)
 */
router.get('/info', authenticateToken, getInfo);

/**
 * PUT /api/organization/templates
 * Update email templates (requires auth)
 */
router.put('/templates', authenticateToken, updateTemplates);

export default router;
