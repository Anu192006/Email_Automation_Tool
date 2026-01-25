import { v4 as uuidv4 } from 'uuid';
import mockData from './BACKEND_mockData.js';

/**
 * Upload batch of recipients
 * Expects CSV/Excel metadata, not raw email sending
 */
export const uploadBatch = (req, res) => {
  try {
    const { batchName, recipients, organizationId } = req.body;

    // Validate
    if (!batchName || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch data. Expected: { batchName, recipients[], organizationId }'
      });
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch must contain at least one recipient'
      });
    }

    // Validate recipients structure
    const invalidRecipients = recipients.filter(r => !r.email || !r.name);
    if (invalidRecipients.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${invalidRecipients.length} recipients missing email or name`
      });
    }

    const batchId = 'batch_' + uuidv4().substring(0, 8);

    // Create batch
    const newBatch = {
      id: batchId,
      organizationId: organizationId || 'org_1',
      name: batchName,
      totalCount: recipients.length,
      processedCount: 0,
      status: 'uploaded',
      createdBy: req.user.id,
      createdAt: new Date(),
      metadata: {
        source: 'api_upload',
        uploadTime: new Date()
      }
    };

    // Add recipients to mock data
    const newRecipients = recipients.map(r => ({
      id: 'rec_' + uuidv4().substring(0, 8),
      email: r.email,
      name: r.name,
      batchId,
      metadata: r.metadata || {},
      status: 'pending',
      createdAt: new Date()
    }));

    mockData.batches.push(newBatch);
    mockData.recipients.push(...newRecipients);

    // Log action
    mockData.auditLogs.push({
      id: 'log_' + uuidv4().substring(0, 8),
      userId: req.user.id,
      action: 'BATCH_UPLOAD',
      resource: 'recipients',
      resourceId: batchId,
      status: 'success',
      metadata: {
        batchName,
        recordCount: recipients.length
      },
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Batch uploaded successfully',
      data: {
        batchId,
        name: batchName,
        count: recipients.length,
        status: 'uploaded',
        createdAt: newBatch.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get list of recipients
 */
export const getRecipients = (req, res) => {
  try {
    const { batchId, status, limit = 100 } = req.query;

    let recipients = mockData.recipients;

    if (batchId) {
      recipients = recipients.filter(r => r.batchId === batchId);
    }
    if (status) {
      recipients = recipients.filter(r => r.status === status);
    }

    recipients = recipients.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recipients,
      total: recipients.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Validate batch data
 */
export const validateBatch = (req, res) => {
  try {
    const { recipients } = req.body;

    if (!Array.isArray(recipients)) {
      return res.status(400).json({
        success: false,
        message: 'Recipients must be an array'
      });
    }

    const errors = [];
    recipients.forEach((r, index) => {
      if (!r.email) errors.push(`Row ${index + 1}: Missing email`);
      if (!r.name) errors.push(`Row ${index + 1}: Missing name`);
      if (!isValidEmail(r.email)) errors.push(`Row ${index + 1}: Invalid email format`);
    });

    res.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Batch validation passed' : `Found ${errors.length} errors`,
      data: {
        valid: errors.length === 0,
        errorCount: errors.length,
        errors: errors.slice(0, 10) // Return first 10 errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Preview batch before upload
 */
export const previewBatch = (req, res) => {
  try {
    const { recipients, batchName } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipients data'
      });
    }

    const preview = {
      batchName: batchName || 'Unnamed Batch',
      totalRecipients: recipients.length,
      sampleRecipients: recipients.slice(0, 5),
      hasInvalidRecords: recipients.some(r => !r.email || !r.name),
      metadata: {
        previewedAt: new Date()
      }
    };

    res.json({
      success: true,
      data: preview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
