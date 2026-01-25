import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

/**
 * Alert Component
 * Displays different types of alerts (success, error, warning, info)
 * Enhanced with better spacing, shadows, and accessibility
 */
export const Alert = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200 border-l-4 border-l-green-600',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200 border-l-4 border-l-red-600',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200 border-l-4 border-l-yellow-600',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200 border-l-4 border-l-blue-600',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700',
    },
  }

  const style = styles[type]
  const Icon = style.icon

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-5 flex gap-4 shadow-sm animate-in fade-in duration-200`}>
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="flex-1">
        {title && <p className={`font-semibold text-sm ${style.titleColor}`}>{title}</p>}
        {message && <p className={`text-sm mt-1.5 ${style.messageColor}`}>{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors ${style.messageColor}`}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

