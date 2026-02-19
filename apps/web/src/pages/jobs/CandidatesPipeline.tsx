import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Star, Loader2, Brain } from 'lucide-react'
import { candidatesApi, jobsApi } from '../../services/api'
import clsx from 'clsx'

const STAGES = ['NEW', 'SCREENING', 'INTERVIEW', 'APPROVED', 'REJECTED'] as const
const STAGE_LABELS: Record<string, string> = { NEW: 'Novos', SCREENING: 'Triagem', INTERVIEW: 'Entrevista', APPROVED: 'Aprovados', REJECTED: 'Rejeitados' }
const STAGE_COLORS: Record<string, string> = {
  NEW: 'bg-gray-50 border-gray-200', SCREENING: 'bg-blue-50 border-blue-200',
  INTERVIEW: 'bg-yellow-50 border-yellow-200', APPROVED: 'bg-green-50 border-green-200', REJECTED: 'bg-red-50 border-red-200',
}

export default function CandidatesPipeline() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [newC, setNewC] = useState({ name: '', email: '', phone: '', source: 'manual', experience: '', distanceKm: '' })

  const { data: pipeline, isLoading } = useQuery({
    queryKey: ['pipeline', jobId],
    queryFn: () => candidatesApi.getPipeline(jobId!).then(r => r.data),
    enabled: !!jobId,
  })
  const { data: job } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.get(jobId!).then(r => r.data),
    enabled: !!jobId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => candidatesApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipeline', jobId] }); toast.success('Atualizado!') },
  })
  const scoreMutation = useMutation({
    mutationFn: (id: string) => candidatesApi.score(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipeline', jobId] }); toast.success('Score calculado!') },
  })
  const addMutation = useMutation({
    mutationFn: (data: any) => candidatesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pipeline', jobId] })
      toast.success('Candidato adicionado!')
      setShowAdd(false)
      setNewC({ name: '', email: '', phone: '', source: 'manual', experience: '', distanceKm: '' })
    },
    onError: () => toast.error('Erro ao adicionar'),
  })

  if (isLoading) return <div className="text-center py-12 text-gray-400">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{job?.title || 'Pipeline'}</h1>
          <p className="text-gray-500 text-sm">Gerenciar candidatos</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Candidato
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <h3 className="font-semibold mb-4">Novo Candidato</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Nome *</label><input className="input" value={newC.name} onChange={e => setNewC(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">E-mail *</label><input type="email" className="input" value={newC.email} onChange={e => setNewC(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">Telefone</label><input className="input" value={newC.phone} onChange={e => setNewC(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="label">Distância (km)</label><input type="number" className="input" value={newC.distanceKm} onChange={e => setNewC(f => ({ ...f, distanceKm: e.target.value }))} /></div>
            <div className="col-span-2"><label className="label">Experiência</label><textarea className="input resize-none" rows={2} value={newC.experience} onChange={e => setNewC(f => ({ ...f, experience: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancelar</button>
            <button onClick={() => addMutation.mutate({ ...newC, jobId, distanceKm: newC.distanceKm ? Number(newC.distanceKm) : undefined })}
              disabled={addMutation.isPending || !newC.name || !newC.email} className="btn-primary flex-1">
              {addMutation.isPending ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const candidates = pipeline?.[stage] || []
          return (
            <div key={stage} className={clsx('rounded-xl border p-3 min-w-[180px]', STAGE_COLORS[stage])}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">{STAGE_LABELS[stage]}</span>
                <span className="w-5 h-5 bg-white rounded-full text-xs font-bold flex items-center justify-center text-gray-600 shadow-sm">{candidates.length}</span>
              </div>
              <div className="space-y-2">
                {candidates.map((c: any) => (
                  <div key={c.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                    {c.aiScore != null && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={11} className="text-orange-400 fill-orange-400" />
                        <span className="text-xs font-semibold text-orange-600">{Number(c.aiScore).toFixed(0)}</span>
                        <span className="text-xs text-gray-400">/100</span>
                      </div>
                    )}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {stage !== 'APPROVED' && stage !== 'REJECTED' && (
                        <>
                          <button onClick={() => statusMutation.mutate({ id: c.id, status: 'APPROVED' })} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded hover:bg-green-100">Aprovar</button>
                          <button onClick={() => statusMutation.mutate({ id: c.id, status: 'REJECTED' })} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded hover:bg-red-100">Rejeitar</button>
                        </>
                      )}
                      {c.aiScore == null && (
                        <button onClick={() => scoreMutation.mutate(c.id)} disabled={scoreMutation.isPending}
                          className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded hover:bg-orange-100 flex items-center gap-1">
                          {scoreMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />} IA
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {candidates.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Vazio</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
