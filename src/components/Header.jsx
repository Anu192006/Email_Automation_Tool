import { useState } from 'react'
import { Menu, LogOut, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Logo } from './Logo'

/**
 * Top Header Component
 * Shows organization name, user info, and logout button
 */
export const Header = ({ onMenuToggle, organizationName = 'Email Automation' }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      {/* Left: Menu toggle, logo, and org name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        <Logo size="sm" />
        <h1 className="text-lg font-semibold text-slate-900">{organizationName}</h1>
      </div>

      {/* Right: User dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'admin@company.com'}</p>
          </div>
          <ChevronDown size={18} className="text-slate-400" />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            <Link
              to="/organization-setup"
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 first:rounded-t-lg"
              onClick={() => setDropdownOpen(false)}
            >
              Organization Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg flex items-center gap-2 border-t border-slate-200"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
