import express from 'express';
import { getStats, getActivityFeed } from './BACKEND_dashboardController.js';
import { authenticateToken } from './BACKEND_auth.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics (requires auth)
 */
router.get('/stats', authenticateToken, getStats);

/**
 * GET /api/dashboard/activity
 * Get activity feed (requires auth)
 */
router.get('/activity', authenticateToken, getActivityFeed);

export default router;
