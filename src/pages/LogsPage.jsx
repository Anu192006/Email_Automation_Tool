import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Header,
  Sidebar,
  DashboardLayout,
} from '../components'
import {
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { SkeletonLoader } from '../components/Skeleton'

/**
 * Logs & Audit Page
 * Professional audit trail for all automated actions
 * Shows:
 * - Date & time
 * - Action type
 * - Recipient batch
 * - Status
 * - Blockchain reference
 *
 * DOES NOT show:
 * - Email content
 * - Personal message data
 */
export const LogsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [emailLogs, setEmailLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const fetchEmailLogs = async () => {
    try {
      setRefreshing(true)
      const response = await axios.get(`${API_BASE}/api/logs/emails`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.data.success) {
        setEmailLogs(response.data.data || [])
        setError(null)
      } else {
        setError('Failed to fetch logs')
        // Fallback to demo logs if API fails
        setEmailLogs([])
      }
    } catch (err) {
      console.error('❌ Error fetching logs:', err)
      setError('Failed to fetch logs: ' + (err.response?.data?.message || err.message))
      setEmailLogs([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchEmailLogs()
    // Auto-refresh logs every 30 seconds
    const interval = setInterval(fetchEmailLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      SENT: 'bg-green-50 border-green-200 text-green-800',
      FAILED: 'bg-red-50 border-red-200 text-red-800',
      PENDING: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    }
    return colors[status] || colors.SENT
  }

  const getStatusIcon = (status) => {
    const icons = {
      SENT: <CheckCircle size={18} />,
      FAILED: <AlertCircle size={18} />,
      PENDING: <AlertCircle size={18} />,
    }
    return icons[status] || icons.SENT
  }

  const filteredLogs = emailLogs.filter((log) => 
    filterStatus === 'all' ? true : log.status === filterStatus
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <DashboardLayout
            title="Logs & Audit"
            subtitle="Complete audit trail of all automated actions"
          >
            <div className="space-y-4">
              <SkeletonLoader rows={5} />
            </div>
          </DashboardLayout>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <DashboardLayout
          title="Logs & Audit"
          subtitle="Complete audit trail of all automated actions"
        >
          <div className="space-y-6">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                ⚠️ {error}
              </div>
            )}

            {/* Filter and refresh controls */}
            <div className="flex gap-3 items-center justify-between">
              <div className="flex gap-3 items-center">
                <Filter size={18} className="text-slate-600" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field w-48"
                >
                  <option value="all">All Logs</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
              <button
                onClick={fetchEmailLogs}
                disabled={refreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Logs table */}
            <div className="card overflow-hidden">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Mail size={32} className="mx-auto mb-4 text-slate-400" />
                  <p>No email logs found. Send an email to see logs here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Template
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">
                          Message ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-mono text-sm text-slate-900">
                            {new Date(log.sent_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-blue-600" />
                              <span className="text-slate-900">{log.recipient_email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {log.template_name}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                log.status
                              )}`}
                            >
                              {getStatusIcon(log.status)}
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-600">
                            <span className="text-xs">{log.message_id ? log.message_id.substring(0, 20) + '...' : 'N/A'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Email Logs:</span> Real-time records of automated 
                emails sent through the system. Logs are created only after successful delivery.
              </p>
            </div>
          </div>
        </DashboardLayout>
      </div>
    </div>
  )
}
