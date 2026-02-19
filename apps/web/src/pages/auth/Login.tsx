import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
  const { login, token, isLoading } = useAuthStore()
  const [email, setEmail] = useState('admin@fastteam.com')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)

  if (token) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success('Login realizado com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">FastTeam</h1>
          <p className="text-gray-400 mt-1">Gestão de Pessoas para Fast Food</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na plataforma</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input pr-10" placeholder="••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-2">Contas de demonstração:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Admin: admin@fastteam.com / admin123</p>
              <p>Gestor: manager@fastteam.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
