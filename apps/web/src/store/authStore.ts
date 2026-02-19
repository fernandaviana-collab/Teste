import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../services/api'

interface User {
  id: string
  email: string
  fullName: string
  userType: string
  companyId?: string
  storeId?: string
  company?: { id: string; name: string; planType: string }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await authApi.login(email, password)
          localStorage.setItem('fastteam_token', data.token)
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      logout: () => {
        localStorage.removeItem('fastteam_token')
        set({ user: null, token: null })
        window.location.href = '/login'
      },
      setUser: (user) => set({ user }),
    }),
    { name: 'fastteam_auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
)
