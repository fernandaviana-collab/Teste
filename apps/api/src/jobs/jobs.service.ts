import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiScoringService } from './ai-scoring.service';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService, private aiScoring: AiScoringService) {}

  async create(dto: CreateJobDto) {
    return this.prisma.job.create({ data: { ...dto, status: 'DRAFT' } as any });
  }

  async findAll(companyId?: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where, skip, take: limit,
        include: { _count: { select: { candidates: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        candidates: { orderBy: [{ aiScore: 'desc' }, { createdAt: 'desc' }] },
        _count: { select: { candidates: true } },
      },
    });
    if (!job) throw new NotFoundException('Vaga não encontrada');
    return job;
  }

  async update(id: string, dto: Partial<CreateJobDto>) {
    await this.findOne(id);
    return this.prisma.job.update({ where: { id }, data: dto as any });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.job.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async close(id: string) {
    await this.findOne(id);
    return this.prisma.job.update({ where: { id }, data: { status: 'CLOSED' } });
  }

  async generateDescription(title: string, requirements: any) {
    const description = await this.aiScoring.generateJobDescription(title, requirements);
    return { description };
  }
}
