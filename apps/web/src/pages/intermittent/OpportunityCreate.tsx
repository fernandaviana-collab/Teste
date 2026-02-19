import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { intermittentApi, storesApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function OpportunityCreate() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [form, setForm] = useState({
    storeId: '', date: '', startTime: '08:00', endTime: '16:00',
    position: '', slots: '1', hourlyRate: '', urgencyLevel: 'NORMAL'
  })

  const { data: storesData } = useQuery({
    queryKey: ['stores', user?.companyId],
    queryFn: () => storesApi.list(user?.companyId).then(r => r.data),
    enabled: !!user?.companyId,
  })
  const stores = storesData?.data || storesData || []

  const createMutation = useMutation({
    mutationFn: (data: any) => intermittentApi.createGig(data),
    onSuccess: () => { toast.success('Oportunidade criada!'); navigate('/intermittent/matching') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erro ao criar oportunidade'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ ...form, slots: Number(form.slots), hourlyRate: Number(form.hourlyRate) })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Oportunidade de Gig</h1>
          <p className="text-gray-500 text-sm">Crie uma vaga para trabalhador intermitente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Loja *</label>
            <select className="input" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} required>
              <option value="">Selecionar loja</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Data *</label>
            <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Cargo *</label>
            <input className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Ex: Atendente" required />
          </div>
          <div>
            <label className="label">Horário Início</label>
            <input type="time" className="input" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
          <div>
            <label className="label">Horário Fim</label>
            <input type="time" className="input" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </div>
          <div>
            <label className="label">Vagas Disponíveis</label>
            <input type="number" min="1" className="input" value={form.slots} onChange={e => setForm(f => ({ ...f, slots: e.target.value }))} />
          </div>
          <div>
            <label className="label">Valor por Hora (R$) *</label>
            <input type="number" step="0.01" className="input" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} placeholder="25.00" required />
          </div>
          <div className="col-span-2">
            <label className="label">Urgência</label>
            <select className="input" value={form.urgencyLevel} onChange={e => setForm(f => ({ ...f, urgencyLevel: e.target.value }))}>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="EMERGENCY">Emergência</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
            {createMutation.isPending ? 'Criando...' : 'Criar Oportunidade'}
          </button>
        </div>
      </form>
    </div>
  )
}
