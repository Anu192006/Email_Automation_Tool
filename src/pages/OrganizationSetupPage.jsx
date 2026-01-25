import { useState } from 'react'
import {
  Header,
  Sidebar,
  DashboardLayout,
  Alert,
  Modal,
} from '../components'
import { Building2, Plus, Upload } from 'lucide-react'

/**
 * Organization Setup Page
 * One-time configuration for the organization
 * Admin can:
 * - Select organization type
 * - Define email types used by organization
 * - Upload HTML email templates
 * - Upload HTML/PDF document layouts
 */
export const OrganizationSetupPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orgType, setOrgType] = useState('corporate')
  const [showModal, setShowModal] = useState(false)
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Offer Letter',
      type: 'document',
      status: 'configured',
      placeholders: ['name', 'date', 'designation', 'department'],
    },
    {
      id: 2,
      name: 'Welcome Email',
      type: 'email',
      status: 'configured',
      placeholders: ['name', 'login_link'],
    },
    {
      id: 3,
      name: 'Salary Slip',
      type: 'document',
      status: 'configured',
      placeholders: ['name', 'date', 'salary', 'designation'],
    },
  ])

  const orgTypes = [
    { id: 'internship', label: 'Internship Company', desc: 'Focus: intern onboarding & offers' },
    { id: 'corporate', label: 'Corporate Organization', desc: 'Focus: employee management & HR' },
    { id: 'institution', label: 'Educational Institution', desc: 'Focus: student communication' },
  ]

  const handleAddTemplate = () => {
    // This would open a form to add new template
    setShowModal(true)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <DashboardLayout
          title="Organization Setup"
          subtitle="Configure your organization settings and email templates"
        >
          <div className="space-y-8">
            {/* Organization Type Selection */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Organization Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {orgTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setOrgType(type.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      orgType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Building2
                        size={24}
                        className={orgType === type.id ? 'text-blue-600' : 'text-slate-400'}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">{type.label}</p>
                        <p className="text-sm text-slate-600 mt-1">{type.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Alert: Configuration Note */}
            <Alert
              type="info"
              title="Configuration Details"
              message="Templates and document layouts support placeholders like {{name}}, {{date}}, {{salary}}, {{designation}}, {{department}}. These will be automatically replaced when sending emails."
            />

            {/* Configured Templates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Email & Document Templates
                </h2>
                <button
                  onClick={handleAddTemplate}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus size={18} />
                  Add Template
                </button>
              </div>

              {/* Templates Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Placeholders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {templates.map((template) => (
                        <tr key={template.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {template.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {template.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Configured
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {template.placeholders.join(', ')}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-700 font-medium">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Save Changes */}
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary">Cancel</button>
              <button className="btn-primary flex items-center gap-2">
                <Upload size={18} />
                Save Configuration
              </button>
            </div>
          </div>
        </DashboardLayout>
      </div>

      {/* Add Template Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => setShowModal(false)}
        title="Add New Template"
        message="Create a new email or document template for your organization"
        confirmText="Create Template"
      />
    </div>
  )
}
