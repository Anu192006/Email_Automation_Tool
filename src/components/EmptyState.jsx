
export const EmptyState = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 p-3 bg-slate-100 rounded-lg">
          <Icon size={32} className="text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{message}</p>
      {action && (
        <button className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  )
}
