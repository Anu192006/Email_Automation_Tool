/**
 * Template Controller
 * 
 * Manages email template CRUD operations
 * - Save templates to Supabase
 * - Retrieve templates
 * - List all templates
 * - Delete templates
 * - Support dynamic placeholders: {{name}}, {{email}}, {{status}}, {{date}}
 */

import { supabase } from './BACKEND_supabase.js';

/**
 * POST /api/templates/save
 * Save a new email template to Supabase
 * 
 * Body: {
 *   name: string (required)
 *   type: string (welcome, offer_letter, certificate, reminder, etc.)
 *   html_content: string (HTML with placeholders like {{name}})
 *   description: string (optional)
 * }
 * 
 * Returns: { success, message, data: { id, name, created_at } }
 */
export const saveTemplate = async (req, res) => {
  try {
    const { name, type, html_content, description } = req.body;

    // Validation
    if (!name || !type || !html_content) {
      return res.status(400).json({
        success: false,
        message: 'Template name, type, and HTML content are required'
      });
    }

    if (html_content.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Template content is too short (minimum 50 characters)'
      });
    }

    // Validate placeholder syntax
    const placeholderRegex = /\{\{[a-z_]+\}\}/gi;
    const placeholders = html_content.match(placeholderRegex) || [];
    console.log(`✓ [TEMPLATE] Found ${placeholders.length} placeholders: ${[...new Set(placeholders)].join(', ')}`);

    // Save to Supabase
    console.log(`💾 [TEMPLATE] Saving template: ${name}`);
    const { data, error } = await supabase
      .from('templates')
      .insert([{
        name: name.trim(),
        type: type.trim(),
        html_content: html_content.trim(),
        description: description ? description.trim() : null,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('❌ [TEMPLATE] Save error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save template',
        error: error.message
      });
    }

    console.log('✓ [TEMPLATE] Template saved successfully:', data?.[0]?.id);
    return res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: {
        id: data?.[0]?.id,
        name: data?.[0]?.name,
        type: data?.[0]?.type,
        created_at: data?.[0]?.created_at,
        placeholders: [...new Set(placeholders)]
      }
    });
  } catch (error) {
    console.error('❌ [TEMPLATE] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * GET /api/templates/list
 * Get all templates (paginated if needed)
 * 
 * Query: ?limit=10&offset=0
 * 
 * Returns: { success, message, data: [{ id, name, type, created_at }] }
 */
export const listTemplates = async (req, res) => {
  try {
    console.log('📋 [TEMPLATE] Fetching all templates...');
    
    // Get the result from select().order()
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, type, description, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [TEMPLATE] List error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch templates',
        error: error.message
      });
    }

    console.log(`✓ [TEMPLATE] Found ${data?.length || 0} templates`);
    return res.status(200).json({
      success: true,
      message: `Found ${data?.length || 0} templates`,
      data: data || []
    });
  } catch (error) {
    console.error('❌ [TEMPLATE] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 * 
 * Returns: { success, message, data: { id, name, html_content, placeholders } }
 */
export const getTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    console.log(`🔍 [TEMPLATE] Fetching template: ${id}`);
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('❌ [TEMPLATE] Not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Extract placeholders from template
    const placeholderRegex = /\{\{[a-z_]+\}\}/gi;
    const placeholders = [...new Set(data.html_content.match(placeholderRegex) || [])];

    console.log('✓ [TEMPLATE] Template retrieved');
    return res.status(200).json({
      success: true,
      message: 'Template retrieved successfully',
      data: {
        id: data.id,
        name: data.name,
        type: data.type,
        html_content: data.html_content,
        description: data.description,
        created_at: data.created_at,
        placeholders: placeholders
      }
    });
  } catch (error) {
    console.error('❌ [TEMPLATE] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * DELETE /api/templates/:id
 * Delete a template
 * 
 * Returns: { success, message }
 */
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    console.log(`🗑️  [TEMPLATE] Deleting template: ${id}`);
    
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [TEMPLATE] Delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete template'
      });
    }

    console.log('✓ [TEMPLATE] Template deleted');
    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('❌ [TEMPLATE] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Helper Function: Replace placeholders in template
 * Used by automation controller to generate final email content
 * 
 * Example:
 *   const content = replacePlaceholders(template, {
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   });
 */
export const replacePlaceholders = (htmlContent, data) => {
  let content = htmlContent;
  
  // Replace all {{key}} with corresponding data value
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    content = content.replace(placeholder, String(value || ''));
  });

  return content;
};

export default {
  saveTemplate,
  listTemplates,
  getTemplate,
  deleteTemplate,
  replacePlaceholders
};
