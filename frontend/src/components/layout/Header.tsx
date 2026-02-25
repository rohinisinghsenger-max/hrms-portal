import { Menu, Search, Moon, Sun, UserCircle2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of HR activity' },
  '/employees': { title: 'Employees', subtitle: 'Manage employee records' },
  '/attendance': { title: 'Attendance', subtitle: 'Track daily attendance' },
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved === 'dark' || saved === 'light') ? saved : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const meta = pageTitles[location.pathname] ?? { title: 'HRMS', subtitle: 'Workspace' }

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur dark:bg-gray-950/70">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-4 flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight truncate">{meta.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{meta.subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl border bg-white dark:bg-gray-950">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              className="bg-transparent outline-none text-sm w-56 placeholder:text-gray-400"
              placeholder="Search…"
            />
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 h-10 rounded-xl border bg-white dark:bg-gray-950">
            <UserCircle2 className="w-5 h-5 text-primary-600" />
            <div className="leading-tight">
              <p className="text-sm font-medium">Rohini</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">HR Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}