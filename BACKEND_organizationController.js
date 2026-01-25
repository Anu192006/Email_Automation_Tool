import { v4 as uuidv4 } from 'uuid';
import mockData from './BACKEND_mockData.js';

/**
 * Setup organization
 */
export const setup = (req, res) => {
  try {
    const { type, name, email, department } = req.body;

    // Validate input
    if (!type || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, name, email'
      });
    }

    const validTypes = ['hr', 'educational', 'corporate'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization type'
      });
    }

    const newOrg = {
      id: 'org_' + uuidv4().substring(0, 8),
      name,
      type: type.toLowerCase(),
      email,
      department: department || '',
      createdBy: req.user.id,
      createdAt: new Date(),
      templates: [],
      documentLayouts: []
    };

    mockData.organizations.push(newOrg);

    // Log action
    mockData.auditLogs.push({
      id: 'log_' + uuidv4().substring(0, 8),
      userId: req.user.id,
      action: 'ORG_SETUP',
      resource: 'organization',
      resourceId: newOrg.id,
      status: 'success',
      metadata: { orgName: name, orgType: type },
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Organization setup completed',
      data: newOrg
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get organization info
 */
export const getInfo = (req, res) => {
  try {
    const org = mockData.organizations[0];

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      data: org
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update email templates
 */
export const updateTemplates = (req, res) => {
  try {
    const { orgId, templates } = req.body;

    if (!orgId || !Array.isArray(templates)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template data'
      });
    }

    const org = mockData.organizations.find(o => o.id === orgId);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    org.templates = templates.map(t => ({
      id: t.id || 'tpl_' + uuidv4().substring(0, 8),
      name: t.name,
      subject: t.subject,
      body: t.body,
      placeholders: t.placeholders || []
    }));

    // Log action
    mockData.auditLogs.push({
      id: 'log_' + uuidv4().substring(0, 8),
      userId: req.user.id,
      action: 'TEMPLATE_UPDATED',
      resource: 'organization',
      resourceId: orgId,
      status: 'success',
      metadata: { templateCount: templates.length },
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Templates updated',
      data: org.templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
