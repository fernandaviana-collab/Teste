import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, Star, Search } from 'lucide-react'
import { intermittentApi } from '../../services/api'
import clsx from 'clsx'

const LEVEL_COLORS: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-700', SILVER: 'bg-gray-100 text-gray-600',
  GOLD: 'bg-yellow-100 text-yellow-700', PLATINUM: 'bg-cyan-100 text-cyan-700', DIAMOND: 'bg-blue-100 text-blue-700'
}

export default function WorkerList() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => intermittentApi.listWorkers({ status: 'ACTIVE', limit: 50 }).then(r => r.data),
  })

  const workers = (data?.data || []).filter((w: any) =>
    !search || w.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trabalhadores Intermitentes</h1>
        <p className="text-gray-500 mt-1">{data?.total || 0} trabalhadores ativos</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input className="input pl-9" placeholder="Buscar trabalhador..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : workers.length === 0 ? (
        <div className="card text-center py-12">
          <Zap size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum trabalhador cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((w: any) => (
            <div key={w.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                  {w.user?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{w.user?.fullName}</h3>
                    <span className={clsx('badge shrink-0', LEVEL_COLORS[w.level])}>{w.level}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="text-orange-400 fill-orange-400" />
                    <span className="text-sm font-medium text-gray-700">{Number(w.rating).toFixed(1)}</span>
                    <span className="text-xs text-gray-400">· {w.totalJobs} gigs</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>R$ {Number(w.hourlyRate).toLocaleString('pt-BR')}/h</span>
                    <span>{Number(w.attendanceRate).toFixed(0)}% presença</span>
                  </div>
                  {w.skills && w.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {w.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="badge bg-orange-50 text-orange-600 text-xs">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
