import express from 'express';
import { sendAutomatedEmail, getAutomationStatus, createAutomation } from './BACKEND_automationController.js';
import { authenticateToken } from './BACKEND_auth.js';

const router = express.Router();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/automation/send-demo-email
 * DEMO ENDPOINT: Send automated email (no auth required for demo)
 * 
 * This endpoint allows the demo to work without JWT authentication
 * In production, remove this endpoint and use /send instead
 * 
 * Features:
 * - Fetches recipient from Supabase (dynamic database query)
 * - Generates HTML email with dynamic recipient name
 * - Sends via real Gmail SMTP (Nodemailer)
 * - Returns success with recipient details and message ID
 */
router.post('/send-demo-email', asyncHandler(sendAutomatedEmail));

/**
 * POST /api/automation/send
 * Send automated email to first active recipient from database
 * 
 * Features:
 * - Fetches recipient from Supabase (dynamic, no hardcoding)
 * - Generates HTML email with recipient's name
 * - Sends via real Gmail SMTP
 * - Returns success with recipient details
 * 
 * Auth: Required (JWT token)
 * Request Body: None (fetches from DB automatically)
 * Response: { success, message, data: { recipient, email, messageId } }
 */
router.post('/send', authenticateToken, asyncHandler(sendAutomatedEmail));

/**
 * GET /api/automation/status
 * Check if email automation system is ready
 * 
 * Returns:
 * - systemReady: true/false
 * - hasActiveRecipients: true/false
 * - recipientCount: number of active recipients
 * - features: enabled features
 * 
 * Auth: Required (JWT token)
 */
router.get('/status', authenticateToken, asyncHandler(getAutomationStatus));

/**
 * POST /api/automation/create
 * Legacy: Create automation record (not needed for simple send)
 * 
 * Use /api/automation/send instead for direct email sending
 */
router.post('/create', authenticateToken, asyncHandler(createAutomation));

export default router;
