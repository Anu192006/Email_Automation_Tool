
export const DashboardLayout = ({ children, title, subtitle, breadcrumbs }) => {
  return (
    <main className="flex-1 overflow-auto">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-7xl mx-auto">
          {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
        </div>
      </div>

      {/* Page content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </main>
  )
}
