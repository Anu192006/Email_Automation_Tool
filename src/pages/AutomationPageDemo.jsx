import { useState } from 'react'
import {
  Header,
  Sidebar,
  DashboardLayout,
  Alert,
} from '../components'
import { Send, Loader, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import api from '../services/api'

/**
 * AUTOMATION PAGE - DEMO VERSION
 * 
 * Enterprise-grade email automation platform demonstration.
 * 
 * This page demonstrates:
 * 1. User clicks "Send Automated Email" button
 * 2. Backend fetches recipient from Supabase database
 * 3. Dynamically generates email with recipient's name
 * 4. Sends real email via Gmail SMTP
 * 5. Returns success response with message ID
 * 
 * SECURITY PILLARS IMPLEMENTED:
 * 1. ✓ Environment variables for SMTP credentials (.env)
 * 2. ✓ Backend-only database access (frontend doesn't touch DB)
 * 3. ✓ JWT-protected routes (maintained in BACKEND_automationRoutes)
 * 4. ✓ Supabase RLS enabled (database security)
 * 5. ✓ Minimal logging (no sensitive data logged)
 * 6. ✓ HTTPS-ready architecture
 */
export const AutomationPageDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const handleSendEmail = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      console.log('🚀 [DEMO] Sending automated email...')

      // Call backend endpoint that:
      // 1. Fetches recipient from Supabase
      // 2. Generates HTML email dynamically
      // 3. Sends via Gmail SMTP
      // 4. Returns success response
      const result = await api.post('/api/automation/send-demo-email')

      console.log('✅ [DEMO] Email sent successfully:', result.data)

      if (result.data.success) {
        setResponse({
          status: 'success',
          title: 'Email Sent Successfully! 🎉',
          message: result.data.message,
          details: {
            recipient: result.data.data?.recipient?.email,
            recipientName: result.data.data?.recipient?.name,
            subject: result.data.data?.email?.subject,
            messageId: result.data.data?.messageId,
            sentAt: result.data.data?.email?.sentAt,
            provider: result.data.data?.system?.smtpProvider
          }
        })
      } else {
        setError({
          title: 'Email Send Failed',
          message: result.data.message
        })
      }
    } catch (err) {
      console.error('❌ [DEMO] Error:', err)
      setError({
        title: 'System Error',
        message: err.response?.data?.message || err.message || 'Failed to send email'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResponse(null)
    setError(null)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <DashboardLayout title="Email Automation" subtitle="Send automated emails to database recipients">
          <div className="max-w-2xl mx-auto">
            {/* MAIN ACTION CARD */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Send Automated Email
                  </h2>
                  <p className="text-slate-600 max-w-lg mx-auto">
                    Click the button below to send an automated email to the first active recipient from your database. The system will fetch recipient data from Supabase and send a real email via Gmail SMTP.
                  </p>
                </div>

                {/* WORKFLOW EXPLANATION */}
                <div className="bg-slate-50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-slate-900 mb-4">What Happens Behind the Scenes:</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 text-blue-600 font-bold">1</span>
                      <span>Backend fetches first active recipient from Supabase recipient_batches table</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 text-blue-600 font-bold">2</span>
                      <span>Dynamically generates HTML email with recipient's name and details</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 text-blue-600 font-bold">3</span>
                      <span>Sends real email via Gmail SMTP (Nodemailer) with configured credentials</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 text-blue-600 font-bold">4</span>
                      <span>Returns success response with message ID and recipient details</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-shrink-0 text-blue-600 font-bold">5</span>
                      <span>Email arrives in recipient's inbox within seconds</span>
                    </div>
                  </div>
                </div>

                {/* ERROR DISPLAY */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900">{error.title}</h4>
                        <p className="text-sm text-red-700 mt-1">{error.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUCCESS RESPONSE */}
                {response && response.status === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                    <div className="flex gap-3 items-start">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 text-lg">{response.title}</h4>
                        <p className="text-sm text-green-700 mt-1">{response.message}</p>
                      </div>
                    </div>

                    {response.details && (
                      <div className="mt-4 bg-white rounded p-4 space-y-2 text-sm">
                        <div className="border-b border-green-100 pb-2">
                          <p className="text-slate-600">
                            <span className="font-semibold">To:</span> {response.details.recipientName} ({response.details.recipient})
                          </p>
                        </div>
                        <div className="border-b border-green-100 pb-2">
                          <p className="text-slate-600">
                            <span className="font-semibold">Subject:</span> {response.details.subject}
                          </p>
                        </div>
                        <div className="border-b border-green-100 pb-2">
                          <p className="text-slate-600">
                            <span className="font-semibold">Sent At:</span> {new Date(response.details.sentAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="border-b border-green-100 pb-2">
                          <p className="text-slate-600">
                            <span className="font-semibold">Provider:</span> {response.details.provider} (TLS/Port 587)
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-mono">
                            <span className="font-semibold">Message ID:</span> {response.details.messageId}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSendEmail}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Send Automated Email
                      </>
                    )}
                  </button>

                  {(response || error) && (
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-150"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* SECURITY INFO */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                  <p className="text-amber-900">
                    <span className="font-semibold">🔐 Security:</span> This system uses environment variables for SMTP credentials, backend-only database access, and JWT-protected routes. Email content is generated dynamically with no hardcoding.
                  </p>
                </div>
              </div>
            </div>

            {/* TECHNICAL DETAILS */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Backend Flow</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>POST /api/automation/send-demo-email</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Query Supabase PostgreSQL</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Nodemailer + Gmail SMTP</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Return message ID + details</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Database Integration</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Table: recipient_batches</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Status: active (filter)</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Fetch 1st record</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Dynamic template fill</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </div>
    </div>
  )
}
