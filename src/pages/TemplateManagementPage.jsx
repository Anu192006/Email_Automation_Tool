import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * TemplateManagementPage
 * 
 * Features:
 * - Upload new email templates with HTML content
 * - List all saved templates
 * - Preview templates
 * - Delete templates
 * - Support dynamic placeholders like {{name}}, {{email}}, etc.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TemplateManagementPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    html_content: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Load templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/templates/list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.data.success) {
        setTemplates(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Template type is required';
    }

    if (!formData.html_content.trim()) {
      newErrors.html_content = 'Email content is required';
    } else if (formData.html_content.length < 50) {
      newErrors.html_content = 'Content must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Save template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/templates/save`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccessMessage(`✓ Template "${formData.name}" saved successfully!`);
        setFormData({
          name: '',
          type: 'general',
          html_content: '',
          description: ''
        });
        setShowForm(false);
        
        // Reload templates
        await fetchTemplates();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setErrors({
          submit: error.response?.data?.message || 'Failed to save template'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/api/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      setSuccessMessage('Template deleted successfully!');
      await fetchTemplates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting template:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get template details for preview
  const handlePreviewTemplate = async (templateId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.data.success) {
        setSelectedTemplate(response.data.data);
        setPreviewMode(true);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  // Template type options
  const templateTypes = [
    { value: 'general', label: 'General' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'confirmation', label: 'Confirmation' },
    { value: 'notification', label: 'Notification' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Email Templates</h1>
            <p className="text-gray-600">Manage and organize your email templates</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            {showForm ? '✕ Cancel' : '+ New Template'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Template Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Template</h2>

            <form onSubmit={handleSaveTemplate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Welcome Email, Offer Letter"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Template Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this template"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* HTML Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content (HTML) *
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  💡 Use placeholders like <code className="bg-gray-100 px-2 py-1 rounded">{'{{name}}'}</code>, <code className="bg-gray-100 px-2 py-1 rounded">{'{{email}}'}</code>, <code className="bg-gray-100 px-2 py-1 rounded">{'{{title}}'}</code>
                </p>
                <textarea
                  name="html_content"
                  value={formData.html_content}
                  onChange={handleInputChange}
                  placeholder="<h1>Hello {{name}}</h1><p>Your email is {{email}}...</p>"
                  rows="12"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm ${
                    errors.html_content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.html_content && (
                  <p className="text-red-500 text-sm mt-1">{errors.html_content}</p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-semibold"
                >
                  {loading ? '💾 Saving...' : '💾 Save Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Modal */}
        {previewMode && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-auto w-full">
              <div className="sticky top-0 bg-gray-100 p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.name}</h2>
                <button
                  onClick={() => {
                    setPreviewMode(false);
                    setSelectedTemplate(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Type:
                  </p>
                  <p className="font-semibold text-gray-800">{selectedTemplate.type}</p>
                </div>

                {selectedTemplate.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description:</p>
                    <p className="text-gray-700">{selectedTemplate.description}</p>
                  </div>
                )}

                {selectedTemplate.placeholders && selectedTemplate.placeholders.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Available Placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.placeholders.map((ph, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {ph}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Email Preview:</p>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-64 overflow-auto">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.html_content.replace(
                          /\{\{[a-z_]+\}\}/gi,
                          match => `<span class="bg-yellow-200">${match}</span>`
                        )
                      }}
                      className="text-gray-700 space-y-4"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-6 flex gap-4 border-t">
                <button
                  onClick={() => {
                    setPreviewMode(false);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        {loading && !showForm ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No templates yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Create your first template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.type}</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>

                {template.description && (
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewTemplate(template.id)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    👁️ Preview
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManagementPage;
