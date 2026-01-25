import { v4 as uuidv4 } from 'uuid';

export const mockData = {
  users: [
    {
      id: 'user_1',
      email: 'admin@company.com',
      // bcrypt hash of 'demo123' with cost factor 10
      passwordHash: '$2a$10$K8L5R4.p9.DjR2N3qK9xSeXq8v4JvKqT3L0Z9mJ5bQxC2P1D0N0Ke',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date('2024-01-01')
    }
  ],

  organizations: [
    {
      id: 'org_' + uuidv4().substring(0, 8),
      name: 'ACME Corporation',
      type: 'corporate',
      email: 'hr@acme.com',
      department: 'Human Resources',
      createdBy: 'user_1',
      createdAt: new Date('2024-01-01'),
      templates: [
        {
          id: 'tpl_1',
          name: 'Internship Offer',
          subject: 'Internship Offer Letter - {{candidateName}}',
          body: 'Dear {{candidateName}},\n\nWe are pleased to offer you an internship position...',
          placeholders: ['candidateName', 'position', 'startDate', 'department']
        },
        {
          id: 'tpl_2',
          name: 'Job Offer',
          subject: 'Job Offer - {{candidateName}}',
          body: 'Dear {{candidateName}},\n\nWe are excited to offer you a position...',
          placeholders: ['candidateName', 'position', 'salary', 'startDate']
        }
      ],
      documentLayouts: [
        {
          id: 'layout_1',
          name: 'Standard Letter',
          format: 'pdf',
          paperSize: 'A4'
        }
      ]
    }
  ],

  recipients: [
    {
      id: 'rec_' + uuidv4().substring(0, 8),
      email: 'john.doe@example.com',
      name: 'John Doe',
      batchId: 'batch_1',
      metadata: { department: 'Engineering', position: 'Software Engineer' },
      status: 'pending',
      createdAt: new Date()
    },
    {
      id: 'rec_' + uuidv4().substring(0, 8),
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      batchId: 'batch_1',
      metadata: { department: 'Product', position: 'Product Manager' },
      status: 'pending',
      createdAt: new Date()
    },
    {
      id: 'rec_' + uuidv4().substring(0, 8),
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      batchId: 'batch_1',
      metadata: { department: 'Design', position: 'UX Designer' },
      status: 'pending',
      createdAt: new Date()
    }
  ],

  batches: [
    {
      id: 'batch_1',
      organizationId: 'org_1',
      name: 'Spring 2024 Interns',
      totalCount: 3,
      processedCount: 0,
      status: 'uploaded',
      createdBy: 'user_1',
      createdAt: new Date(),
      metadata: {
        source: 'csv_upload',
        fileName: 'interns_2024.csv'
      }
    }
  ],

  automations: [
    {
      id: 'auto_' + uuidv4().substring(0, 8),
      batchId: 'batch_1',
      templateId: 'tpl_1',
      status: 'sent',
      totalRecipients: 3,
      sent: 3,
      failed: 0,
      pending: 0,
      scheduledTime: null,
      sentTime: new Date(Date.now() - 86400000),
      blockchainHash: 'hash_' + uuidv4().substring(0, 16),
      blockchainTxn: 'txn_' + uuidv4().substring(0, 20),
      createdBy: 'user_1',
      createdAt: new Date(Date.now() - 86400000)
    }
  ],

  auditLogs: [
    {
      id: 'log_' + uuidv4().substring(0, 8),
      userId: 'user_1',
      action: 'LOGIN',
      resource: 'auth',
      resourceId: 'user_1',
      status: 'success',
      metadata: {
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      },
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 'log_' + uuidv4().substring(0, 8),
      userId: 'user_1',
      action: 'BATCH_UPLOAD',
      resource: 'recipients',
      resourceId: 'batch_1',
      status: 'success',
      metadata: {
        batchName: 'Spring 2024 Interns',
        recordCount: 3
      },
      timestamp: new Date(Date.now() - 86400000)
    },
    {
      id: 'log_' + uuidv4().substring(0, 8),
      userId: 'user_1',
      action: 'AUTOMATION_SENT',
      resource: 'automation',
      resourceId: 'auto_1',
      status: 'success',
      metadata: {
        totalRecipients: 3,
        successCount: 3,
        blockchainHash: 'hash_...'
      },
      timestamp: new Date(Date.now() - 86400000)
    }
  ]
};

export default mockData;
