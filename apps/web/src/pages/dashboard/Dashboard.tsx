import { useQuery } from '@tanstack/react-query'
import { Users, Briefcase, UserCheck, Zap, TrendingUp, Store } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { dashboardApi } from '../../services/api'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const companyId = user?.companyId || ''

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics', companyId],
    queryFn: () => dashboardApi.getMetrics(companyId).then(r => r.data),
    enabled: !!companyId,
  })
  const { data: jobsChart } = useQuery({
    queryKey: ['jobs-chart', companyId],
    queryFn: () => dashboardApi.getJobsChart(companyId).then(r => r.data),
    enabled: !!companyId,
  })
  const { data: candidatesChart } = useQuery({
    queryKey: ['candidates-chart', companyId],
    queryFn: () => dashboardApi.getCandidatesChart(companyId).then(r => r.data),
    enabled: !!companyId,
  })
  const { data: storeMetrics } = useQuery({
    queryKey: ['store-metrics', companyId],
    queryFn: () => dashboardApi.getStores(companyId).then(r => r.data),
    enabled: !!companyId,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral da sua operação</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Funcionários Ativos" value={metrics?.activeEmployees} color="bg-blue-500" />
        <StatCard icon={Briefcase} label="Vagas Abertas" value={metrics?.openJobs} color="bg-orange-500" />
        <StatCard icon={UserCheck} label="Candidatos Pendentes" value={metrics?.pendingCandidates} color="bg-green-500" />
        <StatCard icon={Zap} label="Gigs Abertos" value={metrics?.openGigs} color="bg-purple-500" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Vagas por Status</h3>
          {jobsChart && jobsChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={jobsChart}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Nenhuma vaga cadastrada</div>
          )}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Candidatos por Status</h3>
          {candidatesChart && candidatesChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={candidatesChart} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }: any) => `${status}(${count})`}>
                  {candidatesChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Nenhum candidato</div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-orange-500" /> Contratações Recentes
          </h3>
          {metrics?.recentHires?.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentHires.map((emp: any) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {emp.user?.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{emp.user?.fullName}</p>
                    <p className="text-xs text-gray-500">{emp.position} · {emp.store?.name}</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(emp.hireDate).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">Nenhuma contratação recente</p>}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store size={18} className="text-orange-500" /> Métricas por Loja
          </h3>
          {storeMetrics?.length > 0 ? (
            <div className="space-y-3">
              {storeMetrics.map((store: any) => (
                <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{store.name}</p>
                    <p className="text-xs text-gray-500">{store.employeeCount} funcionários</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-500">{store.gigCount}</p>
                    <p className="text-xs text-gray-400">gigs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">Nenhuma loja cadastrada</p>}
        </div>
      </div>
    </div>
  )
}
