// Shared TypeScript types for FastTeam

export type UserType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'INTERMITTENT'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'FILLED' | 'CLOSED'
export type CandidateStatus = 'NEW' | 'SCREENING' | 'INTERVIEW' | 'APPROVED' | 'REJECTED'
export type EmployeeStatus = 'ACTIVE' | 'TERMINATED' | 'ON_LEAVE'
export type WorkerLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
export type GigStatus = 'OPEN' | 'FILLED' | 'CANCELLED'
export type MatchStatus = 'INVITED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'NO_SHOW'

export interface ApiPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
