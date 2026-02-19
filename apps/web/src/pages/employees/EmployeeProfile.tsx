import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Clock, MapPin, Phone, Mail, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import { employeesApi } from '../../services/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import clsx from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700', TERMINATED: 'bg-red-100 text-red-600', ON_LEAVE: 'bg-yellow-100 text-yellow-700'
}

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.get(id!).then(r => r.data),
    enabled: !!id,
  })

  const terminateMutation = useMutation({
    mutationFn: () => employeesApi.terminate(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employee', id] }); toast.success('Funcionário desligado') },
    onError: () => toast.error('Erro ao desligar funcionário'),
  })

  const clockInMutation = useMutation({
    mutationFn: () => employeesApi.clockIn(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employee', id] }); toast.success('Check-in registrado!') },
  })

  if (isLoading) return <div className="text-center py-12 text-gray-400">Carregando...</div>
  if (!employee) return <div className="text-center py-12 text-gray-400">Funcionário não encontrado</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">Perfil do Funcionário</h1>
      </div>

      {/* Header Card */}
      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-3xl">
              {employee.user?.fullName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{employee.user?.fullName}</h2>
              <p className="text-gray-500">{employee.position} · {employee.positionLevel}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={clsx('badge', STATUS_COLORS[employee.status])}>
                  {employee.status === 'ACTIVE' ? 'Ativo' : employee.status === 'TERMINATED' ? 'Desligado' : 'Afastado'}
                </span>
                <span className="badge bg-blue-50 text-blue-700">{employee.contractType}</span>
              </div>
            </div>
          </div>
          {employee.status === 'ACTIVE' && (
            <div className="flex gap-2">
              <button onClick={() => clockInMutation.mutate()} disabled={clockInMutation.isPending}
                className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Clock size={16} /> Check-in
              </button>
              <button onClick={() => {
                if (confirm('Confirmar desligamento?')) terminateMutation.mutate()
              }} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <AlertTriangle size={16} /> Desligar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Informações de Contato</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-600">{employee.user?.email}</span>
            </div>
            {employee.user?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-600">{employee.user.phone}</span>
              </div>
            )}
            {employee.store?.address && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-600">{employee.store.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Informações Contratuais</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-600">Contratado em {format(new Date(employee.hireDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <DollarSign size={16} className="text-gray-400" />
              <span className="text-gray-600">Salário: R$ {Number(employee.salary).toLocaleString('pt-BR')}/mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Clocks */}
      {employee.timeClocks?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Registros de Ponto Recentes</h3>
          <div className="space-y-2">
            {employee.timeClocks.slice(0, 5).map((tc: any) => (
              <div key={tc.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                <span className="text-gray-600">{format(new Date(tc.clockIn), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                {tc.clockOut ? (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400">→ {format(new Date(tc.clockOut), 'HH:mm', { locale: ptBR })}</span>
                    <span className="font-medium text-green-600">{tc.totalHours}h</span>
                  </div>
                ) : (
                  <span className="badge bg-green-100 text-green-700">Em andamento</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
