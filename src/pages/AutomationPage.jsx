import { useState } from 'react'
import axios from 'axios'
import {
  Header,
  Sidebar,
  DashboardLayout,
  Alert,
  Modal,
} from '../components'
import { Zap, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Automation Page
 * Core feature: Admin performs minimal steps to trigger email automation
 * Admin only:
 * - Selects email/document type
 * - Selects recipient batch
 * - Selects trigger (send now / schedule)
 * - System handles everything else
 */
export const AutomationPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: Setup, 2: Review, 3: Confirmation
  const [formData, setFormData] = useState({
    templateType: '',
    recipientBatch: '',
    triggerType: 'now',
    scheduledTime: '',
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [automationRunning, setAutomationRunning] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [sendError, setSendError] = useState(null)

  const templates = [
    { id: 'offer_letter', name: 'Offer Letter', type: 'document' },
    { id: 'welcome_email', name: 'Welcome Email', type: 'email' },
    { id: 'salary_slip', name: 'Salary Slip', type: 'document' },
    { id: 'certificate', name: 'Certificate', type: 'document' },
  ]

  const batches = [
    { id: 1, name: 'Offer Letters - Jan 2026', count: 125 },
    { id: 2, name: 'Salary Slips - December', count: 450 },
  ]

  const handleNext = () => {
    if (formData.templateType && formData.recipientBatch) {
      setStep(2)
    }
  }

  const getTemplateLabel = (id) =>
    templates.find((t) => t.id === id)?.name || ''
  const getBatchLabel = (id) =>
    batches.find((b) => b.id === parseInt(id))?.name || ''

  const handleSend = async () => {
    setAutomationRunning(true)
    setSendError(null)
    setSendResult(null)

    try {
      // Call the real API endpoint with the template name
      const templateName = getTemplateLabel(formData.templateType)
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/automation/send`,
        { templateName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setSendResult(response.data.data)
        setStep(3)
        setShowConfirmModal(false)
      } else {
        setSendError(response.data.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('❌ Automation error:', error)
      setSendError(error.response?.data?.message || error.message || 'Failed to send email')
    } finally {
      setAutomationRunning(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      templateType: '',
      recipientBatch: '',
      triggerType: 'now',
      scheduledTime: '',
    })
    setSendResult(null)
    setSendError(null)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <DashboardLayout
          title="Automation"
          subtitle="Send emails and documents to recipient batches"
        >
          {/* Step indicator */}
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s === step
                      ? 'bg-blue-600 text-white'
                      : s < step
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {s === 1 ? 'Setup' : s === 2 ? 'Review' : 'Confirmation'}
                </span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <>
              {/* Setup step */}
              <div className="card p-8 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                  Configure Automation
                </h3>

                <div className="space-y-6">
                  {/* Template selection */}
                  <div>
                    <label className="label-text">Select Email/Document Type</label>
                    <select
                      value={formData.templateType}
                      onChange={(e) =>
                        setFormData({ ...formData, templateType: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="">Choose a template...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recipient batch selection */}
                  <div>
                    <label className="label-text">Select Recipient Batch</label>
                    <select
                      value={formData.recipientBatch}
                      onChange={(e) =>
                        setFormData({ ...formData, recipientBatch: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="">Choose a batch...</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.count} recipients)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Trigger type */}
                  <div>
                    <label className="label-text">Trigger Type</label>
                    <div className="space-y-3">
                      {[
                        { id: 'now', label: 'Send Now', desc: 'Immediate delivery' },
                        { id: 'scheduled', label: 'Schedule', desc: 'Deliver at specific time' },
                      ].map((opt) => (
                        <label key={opt.id} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                          <input
                            type="radio"
                            name="trigger"
                            value={opt.id}
                            checked={formData.triggerType === opt.id}
                            onChange={(e) =>
                              setFormData({ ...formData, triggerType: e.target.value })
                            }
                            className="w-4 h-4"
                          />
                          <div>
                            <p className="font-medium text-slate-900">{opt.label}</p>
                            <p className="text-sm text-slate-600">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled time (if schedule selected) */}
                  {formData.triggerType === 'scheduled' && (
                    <div>
                      <label className="label-text">Delivery Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledTime}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduledTime: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                  )}

                  {/* Info alert */}
                  <Alert
                    type="info"
                    title="No Content Editing"
                    message="Email/document content is pre-configured. You cannot edit content, attachments, or recipient details here. The system will automatically merge template data with recipient information."
                  />

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      onClick={handleReset}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!formData.templateType || !formData.recipientBatch}
                      className="btn-primary"
                    >
                      Next: Review
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Review step */}
              <div className="card p-8 max-w-2xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                  Review Automation
                </h3>

                <div className="space-y-6">
                  {/* Review details */}
                  <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-slate-700 font-medium">Template:</span>
                      <span className="text-slate-900 font-semibold">
                        {getTemplateLabel(formData.templateType)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start border-t border-slate-200 pt-4">
                      <span className="text-slate-700 font-medium">Recipients:</span>
                      <span className="text-slate-900 font-semibold">
                        {getBatchLabel(formData.recipientBatch)} ({' '}
                        {batches.find((b) => b.id === parseInt(formData.recipientBatch))
                          ?.count || 0}{' '}
                        emails )
                      </span>
                    </div>
                    <div className="flex justify-between items-start border-t border-slate-200 pt-4">
                      <span className="text-slate-700 font-medium">Trigger:</span>
                      <span className="text-slate-900 font-semibold">
                        {formData.triggerType === 'now' ? 'Send Now' : `Scheduled for ${formData.scheduledTime}`}
                      </span>
                    </div>
                  </div>

                  {/* Confirmation message */}
                  <Alert
                    type="warning"
                    title="Final Confirmation Required"
                    message="Once you confirm, the system will immediately process and send emails/documents. This action cannot be undone."
                  />

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Zap size={18} />
                      Confirm & Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Confirmation step */}
              <div className="card p-8 max-w-2xl mx-auto">
                {sendError ? (
                  <>
                    <div className="text-center mb-6">
                      <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
                      Email Send Failed
                    </h3>
                    <p className="text-slate-600 mb-6 text-center text-red-600">
                      {sendError}
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handleReset}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="btn-secondary"
                      >
                        Go Home
                      </button>
                    </div>
                  </>
                ) : sendResult ? (
                  <>
                    <div className="text-center mb-6">
                      <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
                      Email Sent Successfully
                    </h3>
                    <p className="text-slate-600 mb-6 text-center">
                      Email sent to: <strong>{sendResult.recipient?.email}</strong>
                    </p>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left space-y-3">
                      <div>
                        <p className="text-sm font-medium text-green-900">Recipient:</p>
                        <p className="text-sm text-green-800">{sendResult.recipient?.name} ({sendResult.recipient?.email})</p>
                      </div>
                      <div className="border-t border-green-200 pt-3">
                        <p className="text-sm font-medium text-green-900">Template:</p>
                        <p className="text-sm text-green-800">{sendResult.email?.template}</p>
                      </div>
                      <div className="border-t border-green-200 pt-3">
                        <p className="text-sm font-medium text-green-900">Message ID:</p>
                        <p className="text-xs text-green-800 font-mono break-all">{sendResult.messageId}</p>
                      </div>
                      <div className="border-t border-green-200 pt-3">
                        <p className="text-sm font-medium text-green-900">Sent at:</p>
                        <p className="text-sm text-green-800">{new Date(sendResult.email?.sentAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => window.location.href = '/logs'}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Clock size={18} />
                        View Logs
                      </button>
                      <button
                        onClick={handleReset}
                        className="btn-secondary"
                      >
                        Send Another
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
                      Automation Started
                    </h3>
                    <p className="text-slate-600 mb-8 text-center">
                      Your batch of {batches.find((b) => b.id === parseInt(formData.recipientBatch))
                        ?.count || 0}{' '}
                      emails is now being processed. Monitor progress in the{' '}
                      <span className="font-semibold">Logs & Audit</span> section.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                      <p className="text-sm font-medium text-blue-900 mb-3">
                        What happens next:
                      </p>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>✓ System merges data with templates</li>
                        <li>✓ Emails/documents are queued for delivery</li>
                        <li>✓ Each delivery is verified on blockchain</li>
                        <li>✓ Audit logs are automatically updated</li>
                      </ul>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => window.location.href = '/logs'}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Clock size={18} />
                        View Logs
                      </button>
                      <button
                        onClick={handleReset}
                        className="btn-secondary"
                      >
                        Send Another
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DashboardLayout>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSend}
        title="Confirm Automation"
        message={`Send ${batches.find((b) => b.id === parseInt(formData.recipientBatch))?.count || 0} emails using "${getTemplateLabel(formData.templateType)}" template?`}
        confirmText="Yes, Send Now"
        isDangerous
        isLoading={automationRunning}
      />
    </div>
  )
}
