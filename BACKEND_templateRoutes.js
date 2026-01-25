/**
 * Template Routes
 * 
 * Handles all template management API endpoints
 * Routes:
 * - POST /api/templates/save      - Save new template
 * - GET /api/templates/list       - Get all templates
 * - GET /api/templates/:id        - Get specific template
 * - DELETE /api/templates/:id     - Delete template
 */

import express from 'express';
import {
  saveTemplate,
  listTemplates,
  getTemplate,
  deleteTemplate
} from './BACKEND_templateController.js';

const router = express.Router();

/**
 * POST /api/templates/save
 * Save a new email template
 * 
 * Body: {
 *   template_name: "Offer Letter",
 *   template_type: "offer_letter",
 *   html_content: "<h1>Dear {{name}},</h1><p>We are pleased...</p>",
 *   description: "Standard offer letter template"
 * }
 */
router.post('/save', saveTemplate);

/**
 * GET /api/templates/list
 * Fetch all saved templates
 * 
 * Response: {
 *   success: true,
 *   data: [
 *     {
 *       id: "123",
 *       template_name: "Offer Letter",
 *       template_type: "offer_letter",
 *       created_at: "2024-01-15T10:30:00Z"
 *     }
 *   ]
 * }
 */
router.get('/list', listTemplates);

/**
 * GET /api/templates/:id
 * Fetch a specific template by ID
 * 
 * Response: {
 *   success: true,
 *   data: {
 *     id: "123",
 *     template_name: "Offer Letter",
 *     html_content: "<h1>Dear {{name}},</h1>...",
 *     placeholders: ["{{name}}", "{{email}}", "{{title}}"]
 *   }
 * }
 */
router.get('/:id', getTemplate);

/**
 * DELETE /api/templates/:id
 * Delete a template
 * 
 * Response: {
 *   success: true,
 *   message: "Template deleted successfully"
 * }
 */
router.delete('/:id', deleteTemplate);

export default router;
