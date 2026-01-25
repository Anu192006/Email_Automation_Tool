import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/**
 * AUTOMATION PAGE - Send emails with ONE click
 * 
 * Features:
 * - One button to send automated email
 * - Shows loading state while sending
 * - Displays success message with recipient details
 * - Shows error messages if something fails
 * - No input fields needed (fetches from database)
 * 
 * FLOW:
 * 1. User clicks "Send Automated Email"
 * 2. Frontend calls POST /api/automation/send
 * 3. Backend fetches recipient from Supabase
 * 4. Backend generates email HTML
 * 5. Backend sends via Gmail SMTP
 * 6. Frontend shows success message
 */
export default function AutomationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [recipientData, setRecipientData] = useState(null);

  // Reset messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  /**
   * Handle send email button click
   * Calls backend automation endpoint
   */
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setRecipientData(null);

      console.log('📧 [FRONTEND] Sending automated email...');

      // Call backend API
      const response = await api.post('/automation/send');

      console.log('✅ [FRONTEND] Email sent successfully:', response.data);

      // Show success
      setSuccess(true);
      setRecipientData(response.data.data);

    } catch (err) {
      console.error('❌ [FRONTEND] Error sending email:', err);
      
      // Extract error message
      const errorMessage = 
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to send email. Please try again.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📧 Email Automation
          </h1>
          <p className="text-gray-600">
            Send automated emails to recipients in your database
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* TOP SECTION - Welcome */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <h2 className="text-2xl font-bold mb-2">
              ✨ One-Click Email Sending
            </h2>
            <p className="text-blue-100 mb-4">
              Click the button below to send an automated email to the next recipient in your database.
            </p>
            <div className="bg-blue-500 bg-opacity-30 border-l-4 border-white p-4 rounded">
              <p className="text-sm">
                <strong>How it works:</strong> The system automatically fetches a recipient from your Supabase database, generates a personalized email, and sends it via Gmail SMTP.
              </p>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {success && recipientData && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 m-8">
              <div className="flex items-start">
                <CheckCircle className="text-green-500 mr-4 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✅ Email Sent Successfully!
                  </h3>
                  <div className="text-green-700 space-y-1 text-sm">
                    <p>
                      <strong>Recipient:</strong> {recipientData.recipient.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {recipientData.recipient.email}
                    </p>
                    <p>
                      <strong>Subject:</strong> {recipientData.email.subject}
                    </p>
                    <p>
                      <strong>Sent at:</strong> {new Date(recipientData.email.sentAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Message ID:</strong> <code className="bg-green-100 px-2 py-1 rounded">{recipientData.messageId}</code>
                    </p>
                    <p className="mt-2 text-xs text-green-600">
                      <strong>System:</strong> {recipientData.system.smtpProvider} ({recipientData.system.transport})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 m-8">
              <div className="flex items-start">
                <AlertCircle className="text-red-500 mr-4 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    ❌ Error Sending Email
                  </h3>
                  <p className="text-red-700">{error}</p>
                  <p className="text-red-600 text-sm mt-2">
                    Please check that recipients exist in your database and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BUTTON SECTION */}
          <div className="p-8 text-center">
            <button
              onClick={handleSendEmail}
              disabled={loading}
              className={`
                flex items-center justify-center gap-2
                px-8 py-4 rounded-lg font-semibold text-white
                text-lg transition-all duration-200
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }
              `}
            >
              {loading ? (
                <>
                  <Loader size={24} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={24} />
                  Send Automated Email
                </>
              )}
            </button>

            {loading && (
              <p className="text-gray-500 mt-4 text-sm">
                Processing your request...
              </p>
            )}
          </div>

          {/* INFO SECTION */}
          <div className="bg-gray-50 p-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 System Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Info */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">👤 Logged In As</h4>
                {user ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Name:</strong> {user.name || 'Admin'}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role || 'admin'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Not logged in</p>
                )}
              </div>

              {/* System Status */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">⚙️ System Status</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <strong>Backend:</strong> Connected
                  </p>
                  <p>
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <strong>Supabase:</strong> Connected
                  </p>
                  <p>
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <strong>Gmail SMTP:</strong> Ready
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">🔄 How It Works</h4>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Click "Send Automated Email" button above</li>
                <li>Backend fetches the first active recipient from your database</li>
                <li>System generates a personalized HTML email</li>
                <li>Email is sent via Gmail SMTP (real email, not mock)</li>
                <li>Success message shows recipient details and message ID</li>
                <li>Check your email inbox for the actual email</li>
              </ol>
            </div>

            {/* Database Info */}
            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Database Tables</h4>
              <p className="text-sm text-gray-700 mb-2">
                The system uses these Supabase tables:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-200 px-1">admins</code> - Stores admin users (you)</li>
                <li><code className="bg-gray-200 px-1">recipient_batches</code> - Stores email recipients</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Each time you click send, the system picks the next recipient with status='active'.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚡ Note:</strong> This system sends REAL emails via Gmail SMTP. Emails are actually delivered to recipients. Make sure your Supabase database has recipients with status='active' before sending.
          </p>
        </div>
      </div>
    </div>
  );
}
