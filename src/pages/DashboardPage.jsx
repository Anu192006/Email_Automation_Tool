import { useState, useEffect } from 'react'
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Send,
} from 'lucide-react'
import {
  Header,
  Sidebar,
  DashboardLayout,
  CardSkeleton,
} from '../components'

/**
 * Dashboard Page
 * Shows key metrics and system overview
 * Admin can see at a glance:
 * - Total emails sent
 * - Failed emails
 * - Pending scheduled emails
 * - Configured document types
 * - Blockchain verification count
 */
export const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null) // 'success', 'error', null
  const [emailMessage, setEmailMessage] = useState('')
  const [stats, setStats] = useState({
    totalEmailsSent: 0,
    failedEmails: 0,
    pendingScheduled: 0,
    documentTypesConfigured: 0,
    blockchainVerifications: 0,
  })

  useEffect(() => {
    // Simulate fetching dashboard stats
    setTimeout(() => {
      setStats({
        totalEmailsSent: 2847,
        failedEmails: 23,
        pendingScheduled: 156,
        documentTypesConfigured: 8,
        blockchainVerifications: 2847,
      })
      setLoading(false)
    }, 1200)
  }, [])

  // ==================== SEND AUTOMATED EMAIL ====================
  const handleSendAutomatedEmail = async () => {
    setSendingEmail(true)
    setEmailStatus(null)
    setEmailMessage('')

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      // Call the automation API endpoint
      const response = await fetch(`${API_BASE}/api/automation/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          recipientEmail: 'demoe6699@gmail.com',
          subject: 'Test Email - Automail Demo',
          template: 'Welcome Email',
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setEmailStatus('success')
        setEmailMessage(`✅ Email sent successfully to ${data.data?.recipientEmail || 'recipient'}`)
        // Update the stats
        setStats(prev => ({
          ...prev,
          totalEmailsSent: prev.totalEmailsSent + 1
        }))
      } else {
        throw new Error(data.message || 'Failed to send email')
      }
    } catch (error) {
      setEmailStatus('error')
      setEmailMessage(`❌ Error: ${error.message}. Email system may not be configured.`)
      console.error('Email send error:', error)
    } finally {
      setSendingEmail(false)
      // Auto-clear message after 5 seconds
      setTimeout(() => {
        setEmailStatus(null)
        setEmailMessage('')
      }, 5000)
    }
  }

  const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      green: 'bg-green-50 text-green-700 border-green-100',
      red: 'bg-red-50 text-red-700 border-red-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-100',
    }

    return (
      <div className="card p-6 space-y-4 border-l-4 border-l-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-green-700 font-medium">{trend}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <DashboardLayout
          title="Dashboard"
          subtitle="System overview and key metrics"
        >
          {loading ? (
            <CardSkeleton count={5} />
          ) : (
            <>
              {/* Email Status Message */}
              {emailStatus && (
                <div className={`rounded-lg p-4 mb-6 ${
                  emailStatus === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {emailMessage}
                </div>
              )}

              {/* Send Automated Email Section */}
              <div className="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Send Automated Email</h3>
                    <p className="text-sm text-slate-600 mt-1">Send a test email using the automation system</p>
                  </div>
                  <button
                    onClick={handleSendAutomatedEmail}
                    disabled={sendingEmail}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                    {sendingEmail ? 'Sending...' : 'Send Test Email'}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                  icon={Mail}
                  label="Total Emails Sent"
                  value={stats.totalEmailsSent.toLocaleString()}
                  trend="+12% from last month"
                  color="blue"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Failed Emails"
                  value={stats.failedEmails}
                  trend="0.8% failure rate"
                  color="red"
                />
                <StatCard
                  icon={Clock}
                  label="Pending Scheduled"
                  value={stats.pendingScheduled}
                  trend="Due within 48h"
                  color="purple"
                />
                <StatCard
                  icon={FileText}
                  label="Document Types"
                  value={stats.documentTypesConfigured}
                  trend="Fully configured"
                  color="green"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Blockchain Verified"
                  value={stats.blockchainVerifications.toLocaleString()}
                  trend="100% coverage"
                  color="green"
                />
              </div>

              {/* Activity section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        action: 'Batch email sent',
                        batch: 'Offer Letters - Jan 2026',
                        time: '2 hours ago',
                      },
                      {
                        action: 'Document processed',
                        batch: 'Salary Slips - December',
                        time: '5 hours ago',
                      },
                      {
                        action: 'System scheduled',
                        batch: 'Certificate issuance',
                        time: '1 day ago',
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{item.action}</p>
                          <p className="text-sm text-slate-600">{item.batch}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    System Health
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'API Service', status: 'Operational', color: 'bg-green-500' },
                      { name: 'Email Queue', status: 'Operational', color: 'bg-green-500' },
                      { name: 'Blockchain Sync', status: 'Operational', color: 'bg-green-500' },
                      { name: 'Database', status: 'Operational', color: 'bg-green-500' },
                    ].map((service, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${service.color}`} />
                          <span className="text-xs text-slate-600">{service.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DashboardLayout>
      </div>
    </div>
  )
}
