import express from 'express';
import { uploadBatch, getRecipients, validateBatch, previewBatch } from './BACKEND_recipientsController.js';
import { authenticateToken } from './BACKEND_auth.js';

const router = express.Router();

/**
 * POST /api/recipients/upload
 * Upload batch of recipients (requires auth)
 */
router.post('/upload', authenticateToken, uploadBatch);

/**
 * GET /api/recipients/list
 * Get list of recipients (requires auth)
 */
router.get('/list', authenticateToken, getRecipients);

/**
 * POST /api/recipients/validate
 * Validate batch data (requires auth)
 */
router.post('/validate', authenticateToken, validateBatch);

/**
 * POST /api/recipients/preview
 * Preview batch before upload (requires auth)
 */
router.post('/preview', authenticateToken, previewBatch);

export default router;
