import api from './api'

// Authentication endpoints
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.removeItem('authToken')
  },
}

// Dashboard endpoints
export const dashboardService = {
  getStats: () =>
    api.get('/dashboard/stats'),
}

// Organization setup endpoints
export const organizationService = {
  getSetup: () =>
    api.get('/organization/setup'),
  updateSetup: (data) =>
    api.post('/organization/setup', data),
  uploadTemplate: (formData) =>
    api.post('/organization/template', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Recipients endpoints
export const recipientsService = {
  listBatches: () =>
    api.get('/recipients/batches'),
  uploadBatch: (formData) =>
    api.post('/recipients/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  validateBatch: (batchId) =>
    api.post(`/recipients/validate/${batchId}`),
  getBatchPreview: (batchId) =>
    api.get(`/recipients/batch/${batchId}/preview`),
}

// Automation endpoints
export const automationService = {
  sendBatch: (data) =>
    api.post('/automation/send', data),
  scheduleBatch: (data) =>
    api.post('/automation/schedule', data),
  getStatus: (automationId) =>
    api.get(`/automation/${automationId}/status`),
}

// Logs & Audit endpoints
export const logsService = {
  getAuditLog: (filters = {}) =>
    api.get('/logs/audit', { params: filters }),
  getDocumentStatus: (documentId) =>
    api.get(`/logs/document/${documentId}`),
}
