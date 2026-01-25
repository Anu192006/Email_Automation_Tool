/**
 * CORRECTED BACKEND ROUTE CODE - Template Saving
 * 
 * This file shows the corrected implementation for the /api/templates/save endpoint
 * 
 * CRITICAL CHANGES:
 * 1. Field names: template_name → name, template_type → type
 * 2. Table name: email_templates → templates
 * 3. Proper async/await for database operations
 * 4. Correct Supabase client usage
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTED BACKEND_templateController.js - saveTemplate Function
// ═══════════════════════════════════════════════════════════════════════════

export const saveTemplate = async (req, res) => {
  try {
    // ✅ CORRECT: Expecting 'name', 'type', 'html_content'
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
    console.log(`✓ [TEMPLATE] Found ${placeholders.length} placeholders`);

    // ✅ CORRECT: Use 'templates' table, not 'email_templates'
    // ✅ CORRECT: Await the full query chain
    const { data, error } = await supabase
      .from('templates')  // Correct table name
      .insert([{
        name: name.trim(),           // ✅ Correct field name
        type: type.trim(),           // ✅ Correct field name
        html_content: html_content.trim(),
        description: description ? description.trim() : null,
        created_at: new Date().toISOString()
      }])
      .select();                    // ✅ Properly awaited

    if (error) {
      console.error('❌ [TEMPLATE] Save error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save template',
        error: error.message
      });
    }

    console.log('✓ [TEMPLATE] Template saved:', data?.[0]?.id);
    return res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: {
        id: data?.[0]?.id,
        name: data?.[0]?.name,        // ✅ Response uses correct field names
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

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTED BACKEND_templateController.js - listTemplates Function
// ═══════════════════════════════════════════════════════════════════════════

export const listTemplates = async (req, res) => {
  try {
    console.log('📋 [TEMPLATE] Fetching all templates...');
    
    // ✅ CRITICAL FIX: Use await with proper async query chain
    // ❌ WRONG: const result = supabase.from('email_templates').select(...).order(...)
    // ✅ RIGHT: const { data, error } = await supabase.from('templates').select(...).order(...)
    
    const { data, error } = await supabase
      .from('templates')               // ✅ Correct table name
      .select('id, name, type, description, created_at')  // ✅ Correct field names
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

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTED FRONTEND - TemplateManagementPage.jsx
// ═══════════════════════════════════════════════════════════════════════════

// ✅ CORRECT: Form state with correct field names
const [formData, setFormData] = useState({
  name: '',                  // ✅ NOT template_name
  type: 'general',           // ✅ NOT template_type
  html_content: '',
  description: ''
});

// ✅ CORRECT: Handle form input changes
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

// ✅ CORRECT: Save template with correct JSON keys
const handleSaveTemplate = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  try {
    setLoading(true);
    // ✅ CORRECT: Sending correct field names to backend
    const response = await axios.post(`${API_BASE}/api/templates/save`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      setSuccessMessage(`✓ Template "${formData.name}" saved successfully!`);
      
      // Reset form with correct field names
      setFormData({
        name: '',
        type: 'general',
        html_content: '',
        description: ''
      });
      setShowForm(false);
      
      // Reload templates
      await fetchTemplates();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  } catch (error) {
    console.error('Error saving template:', error);
    setErrors({
      submit: error.response?.data?.message || 'Failed to save template'
    });
  } finally {
    setLoading(false);
  }
};

// ✅ CORRECT: Form validation with correct field names
const validateForm = () => {
  const newErrors = {};

  if (!formData.name.trim()) {  // ✅ Check 'name' not 'template_name'
    newErrors.name = 'Template name is required';
  }

  if (!formData.type) {  // ✅ Check 'type' not 'template_type'
    newErrors.type = 'Template type is required';
  }

  if (!formData.html_content.trim()) {
    newErrors.html_content = 'Email content is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTED DATABASE SCHEMA - SQL
// ═══════════════════════════════════════════════════════════════════════════

/*
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- Template name (e.g., "Welcome Email")
  type TEXT NOT NULL,                    -- Template type (e.g., "welcome")
  description TEXT,                      -- Optional description
  html_content TEXT NOT NULL,            -- HTML with placeholders like {{name}}
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_created ON templates(created_at DESC);

// ✅ KEY POINTS:
// 1. Column names: id, name, type, description, html_content, created_at
// 2. NOT 'template_name' or 'template_type'
// 3. NOT 'email_templates' table (use 'templates')
// 4. UUID auto-generated, NOT NULL constraints on required fields
*/

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTED MOCK SUPABASE - BACKEND_supabase.js
// ═══════════════════════════════════════════════════════════════════════════

// ✅ CORRECT: Template table name and field names in mock data
const mockDatabase = {
  templates: [
    {
      id: 'template-001',
      name: 'Welcome Email',           // ✅ NOT template_name
      type: 'welcome',                 // ✅ NOT template_type
      html_content: '<h1>Hello {{name}}</h1>...',
      description: 'Standard welcome template',
      created_at: new Date().toISOString()
    }
  ]
};

// ✅ CORRECT: Insert method with proper select() chain
insert: (records) => {
  if (!Array.isArray(records)) {
    return { data: null, error: new Error('Insert expects array') };
  }

  const inserted = records.map(r => ({
    id: r.id || uuidv4(),
    ...r,
    created_at: r.created_at || new Date().toISOString()
  }));

  tableData.push(...inserted);

  return {
    data: inserted,
    error: null,
    select: () => {
      // ✅ Properly return data compatible with Supabase pattern
      return {
        data: inserted,
        error: null
      };
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBUGGING CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

// When debugging template save failures, check:

// 1. Check browser network tab
//    POST /api/templates/save
//    Request body should have: { name, type, html_content, description }
//    Response should have: { success: true, data: { id, name, type, ... } }

// 2. Check backend logs
//    Should see: "✓ [TEMPLATE] Found X placeholders"
//    Should see: "💾 [TEMPLATE] Saving template: [name]"
//    Should see: "✓ [TEMPLATE] Template saved successfully: [id]"

// 3. Check database
//    SELECT * FROM templates;  -- Should return saved records
//    SELECT * FROM templates WHERE name = 'Test';

// 4. Common errors to check:
//    ❌ "Invalid column name 'template_name'" → Use 'name' instead
//    ❌ "Relation 'email_templates' does not exist" → Table is 'templates'
//    ❌ "Cannot read property 'data' of undefined" → Missing await on query

// ═══════════════════════════════════════════════════════════════════════════
// KEY TAKEAWAY
// ═══════════════════════════════════════════════════════════════════════════

// THE CRITICAL MISMATCH WAS:
// Frontend sends:    { template_name, template_type, html_content, ... }
// Backend expected:  { template_name, template_type, html_content, ... }
// Database has:      NO COLUMNS for template_name or template_type
// Correct fields:    { name, type, html_content, ... }

// THIS IS NOW FIXED AND ALIGNED ACROSS THE ENTIRE STACK!
