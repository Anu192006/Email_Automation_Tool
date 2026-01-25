import mockData from './BACKEND_mockData.js';
import { supabase } from './BACKEND_supabase.js';

/**
 * Get email logs from database
 * Returns all emails that were sent with their status and details
 */
export const getEmailLogs = async (req, res) => {
  try {
    const { limit = 100, status, templateName } = req.query;

    let query = supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(parseInt(limit));

    // Optional filters
    if (status) {
      query = query.eq('status', status);
    }
    if (templateName) {
      query = query.eq('template_name', templateName);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('❌ [LOGS] Error fetching email logs:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch email logs: ' + error.message
      });
    }

    return res.json({
      success: true,
      data: logs || [],
      total: logs ? logs.length : 0,
      filters: {
        status: status || null,
        templateName: templateName || null,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('❌ [LOGS] Unexpected error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs: ' + error.message
    });
  }
};

/**
 * Get audit logs with optional filtering
 */
export const getAuditLogs = (req, res) => {
  try {
    const { action, status, userId, limit = 100 } = req.query;

    let logs = mockData.auditLogs;

    // Apply filters
    if (action) {
      logs = logs.filter(log => log.action === action);
    }
    if (status) {
      logs = logs.filter(log => log.status === status);
    }
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    // Sort by timestamp descending and limit
    logs = logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: logs,
      total: mockData.auditLogs.length,
      returned: logs.length,
      filters: {
        action: action || null,
        status: status || null,
        userId: userId || null,
        limit: parseInt(limit)
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
 * Get audit logs summary/statistics
 */
export const getAuditSummary = (req, res) => {
  try {
    const logs = mockData.auditLogs;

    // Count by action
    const byAction = {};
    logs.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
    });

    // Count by status
    const byStatus = {};
    logs.forEach(log => {
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;
    });

    // Latest activities
    const latest = logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalLogs: logs.length,
        byAction,
        byStatus,
        latestActivities: latest
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
