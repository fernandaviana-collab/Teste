import { useQuery } from '@tanstack/react-query'
import { Award, Lock, CheckCircle } from 'lucide-react'
import { gamificationApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Achievements() {
  const user = useAuthStore((s) => s.user)

  const { data: allAchievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => gamificationApi.getAchievements().then(r => r.data),
  })

  const { data: userAchievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: () => gamificationApi.getUserAchievements(user!.id).then(r => r.data),
    enabled: !!user?.id,
  })

  const earnedIds = new Set((userAchievements || []).map((ua: any) => ua.achievementId))
  const earnedMap: Record<string, any> = {}
  ;(userAchievements || []).forEach((ua: any) => { earnedMap[ua.achievementId] = ua })

  const earned = (allAchievements || []).filter((a: any) => earnedIds.has(a.id))
  const locked = (allAchievements || []).filter((a: any) => !earnedIds.has(a.id))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conquistas</h1>
        <p className="text-gray-500 mt-1">{earned.length} de {(allAchievements || []).length} conquistadas</p>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
          <span className="text-sm font-bold text-orange-500">
            {(allAchievements || []).length > 0
              ? Math.round((earned.length / (allAchievements || []).length) * 100)
              : 0}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
            style={{ width: `${(allAchievements || []).length > 0 ? (earned.length / (allAchievements || []).length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" /> Conquistadas ({earned.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {earned.map((a: any) => {
              const ua = earnedMap[a.id]
              return (
                <div key={a.id} className="card bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                      <Award size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{a.name}</h3>
                        <span className="badge bg-orange-100 text-orange-700">+{a.points} pts</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{a.description}</p>
                      {ua?.earnedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Conquistada em {format(new Date(ua.earnedAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lock size={18} className="text-gray-400" /> Bloqueadas ({locked.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {locked.map((a: any) => (
              <div key={a.id} className="card opacity-60">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-700">{a.name}</h3>
                      <span className="badge bg-gray-100 text-gray-500">+{a.points} pts</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
