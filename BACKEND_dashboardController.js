import mockData from './BACKEND_mockData.js';

/**
 * Get dashboard statistics
 */
export const getStats = (req, res) => {
  try {
    const automations = mockData.automations;
    const totalSent = automations.reduce((sum, a) => sum + a.sent, 0);
    const totalFailed = automations.reduce((sum, a) => sum + a.failed, 0);
    const totalPending = automations.reduce((sum, a) => sum + a.pending, 0);

    res.json({
      success: true,
      data: {
        totalSent: totalSent || 2847,
        failed: totalFailed || 23,
        pending: totalPending || 156,
        successRate: totalSent > 0 ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1) : 98.5,
        totalAutomations: automations.length,
        activeOrganizations: mockData.organizations.length,
        totalRecipients: mockData.recipients.length
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
 * Get activity feed
 */
export const getActivityFeed = (req, res) => {
  try {
    const recentLogs = mockData.auditLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10)
      .map(log => ({
        id: log.id,
        action: log.action,
        description: getActionDescription(log),
        timestamp: log.timestamp,
        status: log.status,
        user: log.userId
      }));

    res.json({
      success: true,
      data: recentLogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

function getActionDescription(log) {
  const actions = {
    LOGIN: 'User logged in',
    LOGOUT: 'User logged out',
    BATCH_UPLOAD: `Batch uploaded: ${log.metadata?.batchName || 'Unknown'}`,
    AUTOMATION_SENT: `Automation sent to ${log.metadata?.successCount || 0} recipients`,
    ORG_SETUP: 'Organization setup completed',
    TEMPLATE_CREATED: 'Email template created'
  };

  return actions[log.action] || log.action;
}
