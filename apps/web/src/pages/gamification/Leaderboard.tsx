import { useQuery } from '@tanstack/react-query'
import { Trophy, Crown, Star, Medal } from 'lucide-react'
import { gamificationApi } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={20} className="text-yellow-500" />
  if (rank === 2) return <Medal size={20} className="text-gray-400" />
  if (rank === 3) return <Medal size={20} className="text-amber-600" />
  return <span className="text-sm font-bold text-gray-400 w-5 text-center">#{rank}</span>
}

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user)
  const companyId = user?.companyId || ''

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', companyId],
    queryFn: () => gamificationApi.getLeaderboard(companyId, 20).then(r => r.data),
    enabled: !!companyId,
  })

  const podium = (leaderboard || []).slice(0, 3)
  const rest = (leaderboard || []).slice(3)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <Trophy size={40} className="text-orange-500 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-gray-900">Ranking de Pontos</h1>
        <p className="text-gray-500 mt-1">Os colaboradores mais engajados da empresa</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando ranking...</div>
      ) : !leaderboard?.length ? (
        <div className="card text-center py-12">
          <Trophy size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum ponto registrado ainda</p>
          <p className="text-xs text-gray-400 mt-1">Os pontos são ganhos por ações como pontualidade, gigs completados e indicações</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {podium.length > 0 && (
            <div className="flex items-end justify-center gap-4 mb-2">
              {podium.length > 1 && (
                <div className="text-center flex-1">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xl mx-auto mb-2">
                    {podium[1]?.user?.fullName?.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 truncate">{podium[1]?.user?.fullName}</p>
                  <div className="mt-1 bg-gray-200 rounded-t-lg h-20 flex items-end justify-center pb-2">
                    <div className="text-center">
                      <Medal size={16} className="text-gray-400 mx-auto" />
                      <p className="text-xs font-bold text-gray-600">{(podium[1]?.points || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              {podium.length > 0 && (
                <div className="text-center flex-1">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl mx-auto mb-2 ring-4 ring-orange-400">
                    {podium[0]?.user?.fullName?.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 truncate">{podium[0]?.user?.fullName}</p>
                  <div className="mt-1 bg-orange-400 rounded-t-lg h-28 flex items-end justify-center pb-2">
                    <div className="text-center">
                      <Crown size={16} className="text-white mx-auto" />
                      <p className="text-xs font-bold text-white">{(podium[0]?.points || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              {podium.length > 2 && (
                <div className="text-center flex-1">
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 font-bold text-xl mx-auto mb-2">
                    {podium[2]?.user?.fullName?.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 truncate">{podium[2]?.user?.fullName}</p>
                  <div className="mt-1 bg-amber-200 rounded-t-lg h-14 flex items-end justify-center pb-2">
                    <div className="text-center">
                      <Medal size={16} className="text-amber-600 mx-auto" />
                      <p className="text-xs font-bold text-amber-700">{(podium[2]?.points || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rest of ranking */}
          {rest.length > 0 && (
            <div className="card divide-y divide-gray-50">
              {rest.map((entry: any) => (
                <div key={entry.user?.id} className={clsx('flex items-center gap-4 py-3', entry.user?.id === user?.id && 'bg-orange-50 -mx-6 px-6 rounded-lg')}>
                  <RankIcon rank={entry.rank} />
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {entry.user?.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.user?.fullName}</p>
                    <p className="text-xs text-gray-400">{entry.user?.employee?.position || 'Intermitente'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-orange-400 fill-orange-400" />
                    <span className="font-bold text-gray-900">{(entry.points || 0).toLocaleString()}</span>
                    <span className="text-xs text-gray-400">pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
