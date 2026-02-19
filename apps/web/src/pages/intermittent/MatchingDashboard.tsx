import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Plus, Zap, Users, Star, MapPin, ChevronRight } from 'lucide-react'
import { intermittentApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import clsx from 'clsx'

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700', FILLED: 'bg-blue-100 text-blue-700', CANCELLED: 'bg-red-100 text-red-600'
}
const URGENCY_COLORS: Record<string, string> = {
  NORMAL: 'bg-gray-50', HIGH: 'bg-yellow-50', EMERGENCY: 'bg-red-50'
}

export default function MatchingDashboard() {
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [selectedGig, setSelectedGig] = useState<string | null>(null)

  const { data: gigsData } = useQuery({
    queryKey: ['gigs'],
    queryFn: () => intermittentApi.listGigs({ status: 'OPEN', limit: 20 }).then(r => r.data),
  })

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ['matches', selectedGig],
    queryFn: () => intermittentApi.getMatches(selectedGig!).then(r => r.data),
    enabled: !!selectedGig,
  })

  const inviteMutation = useMutation({
    mutationFn: ({ gigId, workerId }: { gigId: string; workerId: string }) =>
      intermittentApi.invite(gigId, workerId),
    onSuccess: () => toast.success('Trabalhador convidado!'),
    onError: () => toast.error('Erro ao convidar'),
  })

  const gigs = gigsData?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matching de Gigs</h1>
          <p className="text-gray-500 mt-1">Conecte trabalhadores às oportunidades abertas</p>
        </div>
        <Link to="/intermittent/gigs/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nova Oportunidade
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gigs List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Oportunidades Abertas ({gigs.length})</h2>
          {gigs.length === 0 ? (
            <div className="card text-center py-8">
              <Zap size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Nenhuma oportunidade aberta</p>
              <Link to="/intermittent/gigs/create" className="btn-primary inline-flex items-center gap-2 mt-3 text-sm">
                <Plus size={14} /> Criar Oportunidade
              </Link>
            </div>
          ) : (
            gigs.map((gig: any) => (
              <button key={gig.id} onClick={() => setSelectedGig(gig.id === selectedGig ? null : gig.id)}
                className={clsx('w-full text-left card hover:shadow-md transition-all border-2',
                  selectedGig === gig.id ? 'border-orange-400' : 'border-transparent',
                  URGENCY_COLORS[gig.urgencyLevel])}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{gig.position}</h3>
                      <span className={clsx('badge', STATUS_COLORS[gig.status])}>{gig.status}</span>
                      {gig.urgencyLevel !== 'NORMAL' && (
                        <span className="badge bg-red-100 text-red-700">{gig.urgencyLevel}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{gig.store?.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{format(new Date(gig.date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      <span>{gig.startTime} – {gig.endTime}</span>
                      <span>R$ {Number(gig.hourlyRate).toLocaleString('pt-BR')}/h</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-orange-600">{gig.filledSlots}/{gig.slots}</p>
                    <p className="text-xs text-gray-400">vagas</p>
                  </div>
                </div>
                {selectedGig === gig.id && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs text-orange-600 font-medium">
                    <Users size={12} /> Ver matches abaixo
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Matches Panel */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">
            {selectedGig ? 'Trabalhadores Recomendados' : 'Selecione uma oportunidade'}
          </h2>
          {!selectedGig ? (
            <div className="card text-center py-12 text-gray-400">
              <ChevronRight size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Clique em uma oportunidade para ver os matches</p>
            </div>
          ) : loadingMatches ? (
            <div className="text-center py-8 text-gray-400">Calculando matches...</div>
          ) : (
            <div className="space-y-3">
              {(matches || []).length === 0 ? (
                <div className="card text-center py-8 text-gray-400">
                  <p className="text-sm">Nenhum trabalhador disponível</p>
                </div>
              ) : (matches || []).map((match: any) => (
                <div key={match.workerId} className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold shrink-0">
                      {match.worker?.user?.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{match.worker?.user?.fullName}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Star size={11} className="text-orange-400 fill-orange-400" />{Number(match.worker?.rating).toFixed(1)}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{match.distance} km</span>
                        <span>{match.worker?.totalJobs} gigs</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-orange-500">{match.matchScore}</p>
                      <p className="text-xs text-gray-400">score</p>
                    </div>
                    <button
                      onClick={() => inviteMutation.mutate({ gigId: selectedGig, workerId: match.workerId })}
                      disabled={inviteMutation.isPending}
                      className="btn-primary text-sm px-3 py-1.5 shrink-0">
                      Convidar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
