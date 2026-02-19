import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Wand2, Loader2 } from 'lucide-react'
import { jobsApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function JobCreate() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({ title: '', description: '', jobType: 'CLT', positionLevel: 'Junior', salaryMin: '', salaryMax: '' })
  const [isGenerating, setIsGenerating] = useState(false)

  const createMutation = useMutation({
    mutationFn: (data: any) => jobsApi.create(data),
    onSuccess: () => { toast.success('Vaga criada!'); navigate('/jobs') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao criar vaga'),
  })

  const handleGenerateDescription = async () => {
    if (!form.title) { toast.error('Informe o título primeiro'); return }
    setIsGenerating(true)
    try {
      const { data } = await jobsApi.generateDescription(form.title, { level: form.positionLevel })
      setForm(f => ({ ...f, description: data.description }))
      toast.success('Descrição gerada com IA!')
    } catch { toast.error('Erro ao gerar descrição') }
    finally { setIsGenerating(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...form, companyId: user?.companyId, createdBy: user?.id,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Vaga</h1>
          <p className="text-gray-500 text-sm">Crie uma vaga e receba candidatos</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Título da Vaga *</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Atendente de Balcão" required />
          </div>
          <div>
            <label className="label">Tipo de Contrato</label>
            <select className="input" value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}>
              <option value="CLT">CLT</option>
              <option value="INTERMITTENT">Intermitente</option>
            </select>
          </div>
          <div>
            <label className="label">Nível</label>
            <select className="input" value={form.positionLevel} onChange={e => setForm(f => ({ ...f, positionLevel: e.target.value }))}>
              <option>Junior</option><option>Pleno</option><option>Senior</option><option>Liderança</option>
            </select>
          </div>
          <div>
            <label className="label">Salário Mínimo (R$)</label>
            <input type="number" className="input" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="1600" />
          </div>
          <div>
            <label className="label">Salário Máximo (R$)</label>
            <input type="number" className="input" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="2000" />
          </div>
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Descrição *</label>
              <button type="button" onClick={handleGenerateDescription} disabled={isGenerating}
                className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium">
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Gerar com IA
              </button>
            </div>
            <textarea className="input min-h-[140px] resize-none" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descreva as responsabilidades e requisitos..." required />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
            {createMutation.isPending ? 'Salvando...' : 'Criar Vaga'}
          </button>
        </div>
      </form>
    </div>
  )
}
