import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fastteam_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Erro inesperado'
    if (error.response?.status === 401) {
      localStorage.removeItem('fastteam_token')
      localStorage.removeItem('fastteam_user')
      window.location.href = '/login'
    } else if (error.response?.status >= 500) {
      toast.error('Erro no servidor. Tente novamente.')
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// Dashboard
export const dashboardApi = {
  getMetrics: (companyId: string) => api.get(`/dashboard/metrics?companyId=${companyId}`),
  getJobsChart: (companyId: string) => api.get(`/dashboard/jobs-chart?companyId=${companyId}`),
  getCandidatesChart: (companyId: string) => api.get(`/dashboard/candidates-chart?companyId=${companyId}`),
  getStores: (companyId: string) => api.get(`/dashboard/stores?companyId=${companyId}`),
  getActivity: (companyId: string) => api.get(`/dashboard/activity?companyId=${companyId}`),
}

// Jobs
export const jobsApi = {
  list: (params?: any) => api.get('/jobs', { params }),
  get: (id: string) => api.get(`/jobs/${id}`),
  create: (data: any) => api.post('/jobs', data),
  update: (id: string, data: any) => api.put(`/jobs/${id}`, data),
  publish: (id: string) => api.put(`/jobs/${id}/publish`),
  close: (id: string) => api.put(`/jobs/${id}/close`),
  generateDescription: (title: string, requirements: any) =>
    api.post('/jobs/generate-description', { title, requirements }),
}

// Candidates
export const candidatesApi = {
  list: (params?: any) => api.get('/candidates', { params }),
  get: (id: string) => api.get(`/candidates/${id}`),
  create: (data: any) => api.post('/candidates', data),
  updateStatus: (id: string, status: string) => api.put(`/candidates/${id}/status`, { status }),
  getPipeline: (jobId: string) => api.get(`/candidates/pipeline/${jobId}`),
  score: (id: string) => api.post(`/candidates/${id}/score`),
}

// Employees
export const employeesApi = {
  list: (params?: any) => api.get('/employees', { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.put(`/employees/${id}`, data),
  terminate: (id: string) => api.put(`/employees/${id}/terminate`),
  clockIn: (id: string, data?: any) => api.post(`/employees/${id}/clock-in`, data || {}),
  getTimeClocks: (id: string, params?: any) => api.get(`/employees/${id}/time-clocks`, { params }),
}

// Intermittent
export const intermittentApi = {
  listWorkers: (params?: any) => api.get('/intermittent/workers', { params }),
  getWorker: (id: string) => api.get(`/intermittent/workers/${id}`),
  createWorker: (data: any) => api.post('/intermittent/workers', data),
  listGigs: (params?: any) => api.get('/intermittent/gigs', { params }),
  createGig: (data: any) => api.post('/intermittent/gigs', data),
  getMatches: (gigId: string) => api.get(`/intermittent/gigs/${gigId}/matches`),
  invite: (gigId: string, workerId: string) =>
    api.post(`/intermittent/gigs/${gigId}/invite/${workerId}`),
  respond: (matchId: string, accept: boolean) =>
    api.put(`/intermittent/matches/${matchId}/respond`, { accept }),
  checkIn: (matchId: string) => api.put(`/intermittent/matches/${matchId}/check-in`),
  checkOut: (matchId: string, workerRating?: number) =>
    api.put(`/intermittent/matches/${matchId}/check-out`, { workerRating }),
}

// Gamification
export const gamificationApi = {
  getLeaderboard: (companyId: string, limit = 10) =>
    api.get(`/gamification/leaderboard?companyId=${companyId}&limit=${limit}`),
  getUserPoints: (userId: string) => api.get(`/gamification/users/${userId}/points`),
  getUserHistory: (userId: string) => api.get(`/gamification/users/${userId}/history`),
  addPoints: (userId: string, actionType: string) =>
    api.post(`/gamification/users/${userId}/points`, { actionType }),
  getAchievements: () => api.get('/gamification/achievements'),
  getUserAchievements: (userId: string) => api.get(`/gamification/users/${userId}/achievements`),
}

// Companies
export const companiesApi = {
  list: () => api.get('/companies'),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: any) => api.post('/companies', data),
}

// Stores
export const storesApi = {
  list: (companyId?: string) => api.get('/stores', { params: { companyId } }),
  get: (id: string) => api.get(`/stores/${id}`),
  create: (data: any) => api.post('/stores', data),
}

// Users
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
}
