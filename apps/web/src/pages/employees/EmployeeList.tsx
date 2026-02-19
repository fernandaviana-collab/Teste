import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Plus, Search, UserCheck } from 'lucide-react'
import { employeesApi, usersApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700', TERMINATED: 'bg-red-100 text-red-600', ON_LEAVE: 'bg-yellow-100 text-yellow-700'
}
const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Ativo', TERMINATED: 'Desligado', ON_LEAVE: 'Afastado' }

export default function EmployeeList() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')

  const { data, isLoading } = useQuery({
    queryKey: ['employees', user?.companyId, statusFilter],
    queryFn: () => employeesApi.list({ companyId: user?.companyId, status: statusFilter }).then(r => r.data),
    enabled: !!user?.companyId,
  })

  const employees = (data?.data || []).filter((e: any) =>
    !search || e.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e.position?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-500 mt-1">{data?.total || 0} funcionários</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Buscar funcionário..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['ACTIVE', 'TERMINATED', 'ON_LEAVE'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={clsx('px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : employees.length === 0 ? (
        <div className="card text-center py-12">
          <Users size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum funcionário encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp: any) => (
            <Link key={emp.id} to={`/employees/${emp.id}`}
              className="card hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg shrink-0">
                  {emp.user?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {emp.user?.fullName}
                    </h3>
                    <span className={clsx('badge shrink-0', STATUS_COLORS[emp.status])}>{STATUS_LABELS[emp.status]}</span>
                  </div>
                  <p className="text-sm text-gray-500">{emp.position} · {emp.positionLevel}</p>
                  <p className="text-xs text-gray-400 mt-1">{emp.store?.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{emp.contractType}</span>
                    <span>R$ {Number(emp.salary).toLocaleString('pt-BR')}/mês</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
