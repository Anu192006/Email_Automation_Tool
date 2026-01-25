import { useState } from 'react'
import {
  Header,
  Sidebar,
  DashboardLayout,
  Alert,
  Modal,
  EmptyState,
} from '../components'
import { Upload, Users, Eye, FileUp, Check, AlertCircle } from 'lucide-react'

/**
 * Recipients Page
 * Upload and manage recipient batches
 * IMPORTANT: Admin MUST NOT manually type recipient email IDs
 * Supports: Google Forms/Sheets, CSV, Excel file uploads
 */
export const RecipientsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [batches, setBatches] = useState([
    {
      id: 1,
      name: 'Offer Letters - Jan 2026',
      source: 'Google Sheet',
      count: 125,
      status: 'validated',
      uploadedAt: '2026-01-22 14:30',
    },
    {
      id: 2,
      name: 'Salary Slips - December',
      source: 'CSV Upload',
      count: 450,
      status: 'validated',
      uploadedAt: '2026-01-21 10:15',
    },
  ])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [uploadMethod, setUploadMethod] = useState(null)

  const handleUpload = (method) => {
    setUploadMethod(method)
    // In production, this would handle actual file/sheet upload
    setTimeout(() => {
      setBatches([
        ...batches,
        {
          id: Math.max(...batches.map(b => b.id)) + 1,
          name: `New Batch - ${new Date().toLocaleDateString()}`,
          source: method === 'csv' ? 'CSV Upload' : method === 'excel' ? 'Excel Upload' : 'Google Sheet',
          count: Math.floor(Math.random() * 500) + 50,
          status: 'validated',
          uploadedAt: new Date().toLocaleString(),
        },
      ])
      setShowUploadModal(false)
    }, 1000)
  }

  const handlePreview = (batch) => {
    // Mock preview data
    setPreviewData({
      name: batch.name,
      count: batch.count,
      columns: ['Email', 'Name', 'Department', 'Designation'],
      sample: [
        {
          Email: 'john.doe@example.com',
          Name: 'John Doe',
          Department: 'Engineering',
          Designation: 'Senior Developer',
        },
        {
          Email: 'jane.smith@example.com',
          Name: 'Jane Smith',
          Department: 'HR',
          Designation: 'HR Manager',
        },
        {
          Email: 'mike.johnson@example.com',
          Name: 'Mike Johnson',
          Department: 'Sales',
          Designation: 'Sales Executive',
        },
      ],
    })
    setShowPreviewModal(true)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <DashboardLayout
          title="Recipients"
          subtitle="Manage recipient batches for email campaigns"
        >
          <div className="space-y-6">
            {/* Upload info alert */}
            <Alert
              type="info"
              title="No Manual Data Entry"
              message="Upload recipient lists via CSV, Excel, or Google Sheets. Email IDs are automatically validated. No manual typing allowed."
            />

            {/* Upload button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Upload size={18} />
                Upload New Batch
              </button>
            </div>

            {/* Batches list */}
            {batches.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No recipient batches yet"
                message="Upload your first recipient batch using CSV, Excel, or Google Sheets"
                action={{ label: 'Upload Batch' }}
              />
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Batch Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Recipients
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {batch.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {batch.source}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded">
                              <Users size={14} />
                              {batch.count.toLocaleString()} recipients
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check size={14} />
                              Validated
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {batch.uploadedAt}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handlePreview(batch)}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              <Eye size={16} />
                              Preview
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DashboardLayout>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onConfirm={() => setShowUploadModal(false)}
        title="Upload Recipient Batch"
        message={
          uploadMethod
            ? `Uploading from ${uploadMethod === 'csv' ? 'CSV' : uploadMethod === 'excel' ? 'Excel' : 'Google Sheets'}...`
            : 'Select how you want to upload your recipient list'
        }
        confirmText={uploadMethod ? 'Complete' : 'Cancel'}
      >
        {!uploadMethod && (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleUpload('csv')}
              className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
            >
              <p className="font-medium text-slate-900">📄 CSV File</p>
              <p className="text-sm text-slate-600">Upload .csv file with email addresses</p>
            </button>
            <button
              onClick={() => handleUpload('excel')}
              className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
            >
              <p className="font-medium text-slate-900">📊 Excel File</p>
              <p className="text-sm text-slate-600">Upload .xlsx file with email addresses</p>
            </button>
            <button
              onClick={() => handleUpload('sheets')}
              className="w-full p-4 border-2 border-slate-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
            >
              <p className="font-medium text-slate-900">☁️ Google Sheets</p>
              <p className="text-sm text-slate-600">Link a Google Sheet with email addresses</p>
            </button>
          </div>
        )}
      </Modal>

      {/* Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
          <div
            className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Preview: {previewData.name}</h2>
              <p className="text-sm text-slate-600 mt-1">
                Total recipients: <span className="font-medium text-slate-900">{previewData.count.toLocaleString()}</span>
              </p>
            </div>

            {/* Sample data table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {previewData.columns.map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3 text-left text-xs font-semibold text-slate-700"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewData.sample.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {previewData.columns.map((col) => (
                          <td key={col} className="px-6 py-4 text-sm text-slate-900">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Close button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button className="btn-primary">Use This Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
