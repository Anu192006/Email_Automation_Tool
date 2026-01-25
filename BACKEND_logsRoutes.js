import express from 'express';
import { getAuditLogs, getAuditSummary, getEmailLogs } from './BACKEND_logsController.js';
import { authenticateToken } from './BACKEND_auth.js';

const router = express.Router();

/**
 * GET /api/logs/emails
 * Get real email logs from database (sent emails)
 * @query status - Filter by status (SENT, FAILED)
 * @query templateName - Filter by template name
 * @query limit - Max results (default: 100)
 * @auth required
 */
router.get('/emails', authenticateToken, getEmailLogs);

/**
 * GET /api/logs/audit
 * Get audit logs with optional filtering
 * @query action - Filter by action type (LOGIN, BATCH_UPLOAD, AUTOMATION_SENT, etc.)
 * @query status - Filter by status (success, failure)
 * @query userId - Filter by user ID
 * @query limit - Max results (default: 100)
 * @auth required
 */
router.get('/audit', authenticateToken, getAuditLogs);

/**
 * GET /api/logs/summary
 * Get audit logs summary and statistics
 * @auth required
 */
router.get('/summary', authenticateToken, getAuditSummary);

export default router;
