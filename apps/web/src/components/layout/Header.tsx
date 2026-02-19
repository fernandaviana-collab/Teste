import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Buscar funcionários, vagas..."
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
        </div>
      </div>
    </header>
  )
}
