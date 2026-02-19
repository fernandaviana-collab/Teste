import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Users, Clock, Trophy, Award,
  Store, LogOut, ChevronRight, Zap
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    label: 'Recrutamento', icon: Briefcase, children: [
      { label: 'Vagas', href: '/jobs' },
      { label: 'Nova Vaga', href: '/jobs/create' },
    ]
  },
  {
    label: 'Funcionários', icon: Users, children: [
      { label: 'Lista', href: '/employees' },
    ]
  },
  {
    label: 'Intermitentes', icon: Zap, children: [
      { label: 'Trabalhadores', href: '/intermittent/workers' },
      { label: 'Criar Gig', href: '/intermittent/gigs/create' },
      { label: 'Matching', href: '/intermittent/matching' },
    ]
  },
  {
    label: 'Gamificação', icon: Trophy, children: [
      { label: 'Ranking', href: '/gamification/leaderboard' },
      { label: 'Conquistas', href: '/gamification/achievements' },
    ]
  },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">FastTeam</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gestão de Pessoas</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => (
          <div key={item.label} className="mb-1">
            {item.children ? (
              <div>
                <div className="flex items-center gap-3 px-3 py-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mt-3 mb-1">
                  <item.icon size={14} />
                  {item.label}
                </div>
                {item.children.map((child) => (
                  <NavLink
                    key={child.href}
                    to={child.href}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ml-2',
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      )
                    }
                  >
                    <ChevronRight size={14} />
                    {child.label}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.company?.name || user?.userType}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full px-2 py-1.5 rounded hover:bg-gray-800 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
