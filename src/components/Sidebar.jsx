import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  Users,
  Zap,
  FileText,
  Mail,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Logo } from './Logo'


export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { logout } = useAuth()

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/organization-setup',
      label: 'Organization Setup',
      icon: Settings,
    },
    {
      path: '/recipients',
      label: 'Recipients',
      icon: Users,
    },
    {
      path: '/automation',
      label: 'Automation',
      icon: Zap,
    },
    {
      path: '/templates',
      label: 'Email Templates',
      icon: Mail,
    },
    {
      path: '/logs',
      label: 'Logs & Audit',
      icon: FileText,
    },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <>   
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white shadow-lg z-40 transform transition-transform lg:relative lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg lg:hidden"
          aria-label="Close menu"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Logo section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm leading-none">EmailAI</p>
              <p className="text-xs text-blue-300 font-medium mt-0.5">Automation</p>
            </div>
          </div>
        </div>

    
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
