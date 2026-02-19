import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, Briefcase, Users, Eye, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { jobsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600', ACTIVE: 'bg-green-100 text-green-700',
  FILLED: 'bg-blue-100 text-blue-700', CLOSED: 'bg-red-100 text-red-600',
}
const STATUS_LABELS: Record<string, string> = { DRAFT: 'Rascunho', ACTIVE: 'Ativa', FILLED: 'Preenchida', CLOSED: 'Fechada' }

export default function JobList() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', user?.companyId, statusFilter],
    queryFn: () => jobsApi.list({ companyId: user?.companyId, status: statusFilter || undefined }).then(r => r.data),
    enabled: !!user?.companyId,
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => jobsApi.publish(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Vaga publicada!') },
  })
  const closeMutation = useMutation({
    mutationFn: (id: string) => jobsApi.close(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); toast.success('Vaga fechada') },
  })

  const jobs = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
          <p className="text-gray-500 mt-1">{data?.total || 0} vagas cadastradas</p>
        </div>
        <Link to="/jobs/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nova Vaga
        </Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['', 'DRAFT', 'ACTIVE', 'FILLED', 'CLOSED'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={clsx('px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
            {s === '' ? 'Todas' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Nenhuma vaga encontrada</p>
          <Link to="/jobs/create" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Criar primeira vaga
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={clsx('badge', STATUS_COLORS[job.status])}>{STATUS_LABELS[job.status]}</span>
                    <span className="badge bg-orange-50 text-orange-700">{job.jobType}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{job.positionLevel}</span>
                    {job.salaryMin && <span>R$ {Number(job.salaryMin).toLocaleString('pt-BR')} – {Number(job.salaryMax).toLocaleString('pt-BR')}</span>}
                    <span className="flex items-center gap-1"><Users size={12} /> {job._count?.candidates || 0} candidatos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {job.status === 'DRAFT' && (
                    <button onClick={() => publishMutation.mutate(job.id)} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={14} /> Publicar
                    </button>
                  )}
                  {job.status === 'ACTIVE' && (
                    <button onClick={() => closeMutation.mutate(job.id)} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg">
                      <XCircle size={14} /> Fechar
                    </button>
                  )}
                  <Link to={`/jobs/${job.id}/candidates`} className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Eye size={14} /> Pipeline
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
