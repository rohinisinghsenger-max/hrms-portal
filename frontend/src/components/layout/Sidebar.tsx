import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck, X } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed lg:static z-50 lg:z-auto inset-y-0 left-0 w-72',
          'transform lg:transform-none transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'border-r bg-white dark:bg-gray-950',
        ].join(' ')}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold">
              HR
            </div>
            <div>
              <p className="font-semibold leading-tight">HRMS Portal</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">by Rohini</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-900"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 h-11 rounded-xl border transition',
                  isActive
                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-gray-900 dark:border-gray-800 dark:text-white'
                    : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900',
                ].join(' ')
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
            <p className="text-sm font-semibold">Tip</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use search & filters to quickly find records.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}