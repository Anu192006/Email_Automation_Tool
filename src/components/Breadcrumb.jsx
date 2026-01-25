import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
export const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.href ? (
            <Link
              to={item.href}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600 font-medium">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRight size={16} className="text-slate-400" />
          )}
        </div>
      ))}
    </nav>
  )
}
