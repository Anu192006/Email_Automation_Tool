import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

/**
 * MOCK SUPABASE CLIENT FOR DEVELOPMENT
 * 
 * This mock client provides a complete in-memory database
 * for local development and testing without needing real
 * Supabase credentials.
 * 
 * PRODUCTION: Replace with real Supabase client using .env credentials
 */

// In-memory mock database for development
const mockDatabase = {
  admins: [],
  recipient_batches: [
    {
      id: 'recipient-001',
      email: 'demoe6699@gmail.com',
      name: 'Demo User',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ],
  email_logs: [],
  templates: [
    {
      id: 'template-001',
      name: 'Welcome Email',
      type: 'welcome',
      html_content: '<h1>Hello {{name}}</h1><p>Welcome to our platform! Your email is {{email}}. We\'re excited to have you on board.</p>',
      description: 'Standard welcome email template',
      created_at: new Date().toISOString()
    },
    {
      id: 'template-002',
      name: 'Offer Letter',
      type: 'offer_letter',
      html_content: '<h1>Offer Letter</h1><p>Dear {{name}},</p><p>We are pleased to offer you a position as {{title}} in our organization. Your employment will commence on {{start_date}}.</p><p>Regards,<br>HR Department</p>',
      description: 'Standard offer letter template',
      created_at: new Date().toISOString()
    }
  ]
};

/**
 * MOCK SUPABASE - Query Builder Pattern
 * 
 * Simplified version that returns data synchronously where possible
 */
const supabase = {
  from: (table) => {
    const tableData = mockDatabase[table] || [];

    return {
      select: (columns) => {
        // Create a chain-friendly query builder
        const createChainBuilder = (data) => ({
          order: (column, opts) => {
            const sorted = [...data].sort((a, b) => {
              const ascending = opts?.ascending !== false;
              try {
                const aVal = new Date(a[column]);
                const bVal = new Date(b[column]);
                return ascending ? aVal - bVal : bVal - aVal;
              } catch {
                return 0;
              }
            });
            return createChainBuilder(sorted);
          },
          eq: (column, value) => {
            const filtered = data.filter(r => r[column] === value);
            return createChainBuilder(filtered);
          },
          limit: (n) => {
            const limited = data.slice(0, n);
            return createChainBuilder(limited);
          },
          gt: (column, value) => {
            const filtered = data.filter(r => r[column] > value);
            return createChainBuilder(filtered);
          },
          single: async () => {
            return { data: data[0] || null, error: null };
          }
        });

        return createChainBuilder(tableData);
      },
      eq: (column, value) => {
        const filtered = tableData.filter(r => r[column] === value);
        return {
          single: async () => {
            return { data: filtered[0] || null, error: null };
          },
          limit: (n) => ({
            single: async () => {
              return { data: filtered.slice(0, n)[0] || null, error: null };
            }
          })
        };
      },
      limit: (n) => ({
        single: async () => {
          return { data: tableData.slice(0, n)[0] || null, error: null };
        }
      }),
      gt: (column, value) => {
        const filtered = tableData.filter(r => r[column] > value);
        return {
          single: async () => {
            return { data: filtered[0] || null, error: null };
          },
          limit: (n) => ({
            single: async () => {
              return { data: filtered.slice(0, n)[0] || null, error: null };
            }
          })
        };
      },
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

        // Return object that matches Supabase API
        return {
          data: inserted,
          error: null,
          select: () => {
            // Return the insert result wrapped to match Supabase pattern
            return {
              data: inserted,
              error: null
            };
          }
        };
      },

      update: (updateData) => ({
        eq: (column, value) => ({
          select: () => ({
            single: async () => {
              const record = tableData.find(r => r[column] === value);
              if (record) {
                Object.assign(record, updateData);
              }
              return { data: record || null, error: null };
            }
          })
        })
      }),

      delete: () => ({
        eq: (column, value) => {
          const index = tableData.findIndex(r => r[column] === value);
          if (index > -1) {
            tableData.splice(index, 1);
          }
          return {
            single: async () => ({
              data: null,
              error: null
            })
          };
        }
      })
    };
  }
};

console.log('ℹ️  Using mock Supabase client with in-memory database');
console.log('   Default recipient:', mockDatabase.recipient_batches[0]?.email);

export { supabase };
export default supabase;
