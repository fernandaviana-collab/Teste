import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MatchesService } from './matches.service';
import { CreateWorkerDto, CreateGigOpportunityDto } from './dto/create-worker.dto';

@Injectable()
export class IntermittentService {
  constructor(private prisma: PrismaService, private matchesService: MatchesService) {}

  async createWorker(dto: CreateWorkerDto) {
    return this.prisma.intermittentWorker.create({
      data: { ...dto, skills: dto.skills || [] } as any,
      include: { user: { select: { fullName: true, email: true, phone: true } } },
    });
  }

  async findWorkers(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.intermittentWorker.findMany({
        where, skip, take: limit,
        include: { user: { select: { fullName: true, email: true, phone: true } } },
        orderBy: [{ rating: 'desc' }, { totalJobs: 'desc' }],
      }),
      this.prisma.intermittentWorker.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findWorker(id: string) {
    const worker = await this.prisma.intermittentWorker.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true, phone: true, metadata: true } },
        gigMatches: {
          take: 10, orderBy: { invitedAt: 'desc' },
          include: { opportunity: { select: { position: true, date: true, store: { select: { name: true } } } } },
        },
      },
    });
    if (!worker) throw new NotFoundException('Trabalhador não encontrado');
    return worker;
  }

  async createGig(dto: CreateGigOpportunityDto) {
    return this.prisma.gigOpportunity.create({ data: { ...dto, date: new Date(dto.date) } as any });
  }

  async findGigs(storeId?: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.gigOpportunity.findMany({
        where, skip, take: limit,
        include: { store: { select: { name: true } }, _count: { select: { matches: true } } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.gigOpportunity.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMatches(opportunityId: string) {
    return this.matchesService.findBestMatches(opportunityId);
  }

  async inviteWorker(opportunityId: string, workerId: string, matchScore?: number) {
    return this.prisma.gigMatch.create({
      data: { opportunityId, workerId, matchScore, status: 'INVITED' } as any,
    });
  }

  async respondToInvite(matchId: string, accept: boolean) {
    const status = accept ? 'ACCEPTED' : 'REJECTED';
    const match = await this.prisma.gigMatch.update({
      where: { id: matchId },
      data: { status: status as any, responseAt: new Date() },
      include: { opportunity: true },
    });
    if (accept) {
      await this.prisma.gigOpportunity.update({
        where: { id: match.opportunityId },
        data: { filledSlots: { increment: 1 } },
      });
    }
    return match;
  }

  async checkIn(matchId: string) {
    return this.prisma.gigMatch.update({ where: { id: matchId }, data: { checkInAt: new Date() } });
  }

  async checkOut(matchId: string, workerRating?: number) {
    const match = await this.prisma.gigMatch.findUnique({ where: { id: matchId } });
    if (!match || !match.checkInAt) throw new NotFoundException('Check-in não encontrado');
    const checkOut = new Date();
    const hoursWorked = parseFloat(((checkOut.getTime() - match.checkInAt.getTime()) / 3600000).toFixed(2));
    const opportunity = await this.prisma.gigOpportunity.findUnique({ where: { id: match.opportunityId } });
    const amountPaid = hoursWorked * Number(opportunity.hourlyRate);
    return this.prisma.gigMatch.update({
      where: { id: matchId },
      data: { checkOutAt: checkOut, hoursWorked, amountPaid, status: 'COMPLETED', storeRating: workerRating },
    });
  }
}
