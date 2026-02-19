import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(companyId: string) {
    const [
      totalEmployees,
      activeEmployees,
      openJobs,
      pendingCandidates,
      activeWorkers,
      openGigs,
      recentHires,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { companyId } }),
      this.prisma.employee.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.job.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.candidate.count({
        where: { job: { companyId }, status: { in: ['NEW', 'SCREENING', 'INTERVIEW'] } },
      }),
      this.prisma.intermittentWorker.count({ where: { status: 'ACTIVE' } }),
      this.prisma.gigOpportunity.count({
        where: { store: { companyId }, status: 'OPEN' },
      }),
      this.prisma.employee.findMany({
        where: { companyId, status: 'ACTIVE' },
        take: 5,
        orderBy: { hireDate: 'desc' },
        include: { user: { select: { fullName: true, email: true } }, store: { select: { name: true } } },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      openJobs,
      pendingCandidates,
      activeWorkers,
      openGigs,
      recentHires,
    };
  }

  async getJobsChart(companyId: string) {
    const jobs = await this.prisma.job.groupBy({
      by: ['status'],
      where: { companyId },
      _count: { id: true },
    });
    return jobs.map(j => ({ status: j.status, count: j._count.id }));
  }

  async getCandidatesChart(companyId: string) {
    const candidates = await this.prisma.candidate.groupBy({
      by: ['status'],
      where: { job: { companyId } },
      _count: { id: true },
    });
    return candidates.map(c => ({ status: c.status, count: c._count.id }));
  }

  async getStoreMetrics(companyId: string) {
    const stores = await this.prisma.store.findMany({
      where: { companyId },
      include: {
        _count: { select: { employees: true, gigs: true } },
      },
    });

    return stores.map(store => ({
      id: store.id,
      name: store.name,
      employeeCount: store._count.employees,
      gigCount: store._count.gigs,
    }));
  }

  async getRecentActivity(companyId: string, limit = 10) {
    const [recentCandidates, recentGigs] = await Promise.all([
      this.prisma.candidate.findMany({
        where: { job: { companyId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { job: { select: { title: true } } },
      }),
      this.prisma.gigOpportunity.findMany({
        where: { store: { companyId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { store: { select: { name: true } } },
      }),
    ]);

    return { recentCandidates, recentGigs };
  }
}
