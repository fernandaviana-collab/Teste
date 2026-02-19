import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import JobList from './pages/jobs/JobList'
import JobCreate from './pages/jobs/JobCreate'
import CandidatesPipeline from './pages/jobs/CandidatesPipeline'
import EmployeeList from './pages/employees/EmployeeList'
import EmployeeProfile from './pages/employees/EmployeeProfile'
import WorkerList from './pages/intermittent/WorkerList'
import OpportunityCreate from './pages/intermittent/OpportunityCreate'
import MatchingDashboard from './pages/intermittent/MatchingDashboard'
import Leaderboard from './pages/gamification/Leaderboard'
import Achievements from './pages/gamification/Achievements'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<JobList />} />
          <Route path="jobs/create" element={<JobCreate />} />
          <Route path="jobs/:jobId/candidates" element={<CandidatesPipeline />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="intermittent/workers" element={<WorkerList />} />
          <Route path="intermittent/gigs/create" element={<OpportunityCreate />} />
          <Route path="intermittent/matching" element={<MatchingDashboard />} />
          <Route path="gamification/leaderboard" element={<Leaderboard />} />
          <Route path="gamification/achievements" element={<Achievements />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
