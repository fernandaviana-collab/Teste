import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiScoringService } from '../jobs/ai-scoring.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private aiScoring: AiScoringService,
  ) {}

  async create(dto: CreateCandidateDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Vaga não encontrada');

    const candidate = await this.prisma.candidate.create({ data: dto });

    // Auto-score with AI (async, don't await in response)
    this.autoScore(candidate.id, dto, job).catch(console.error);

    return candidate;
  }

  private async autoScore(candidateId: string, candidateData: any, job: any) {
    const result = await this.aiScoring.scoreCandidate(candidateData, job);
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        aiScore: result.score,
        aiAnalysis: { reasoning: result.reasoning, scoredAt: new Date().toISOString() },
        status: 'SCREENING',
      },
    });
  }

  async findAll(jobId?: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where, skip, take: limit,
        include: { job: { select: { title: true, companyId: true } } },
        orderBy: [{ aiScore: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.candidate.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!candidate) throw new NotFoundException('Candidato não encontrado');
    return candidate;
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);
    return this.prisma.candidate.update({ where: { id }, data: { status: status as any } });
  }

  async scoreManually(id: string) {
    const candidate = await this.findOne(id);
    const result = await this.aiScoring.scoreCandidate(candidate, candidate.job);
    return this.prisma.candidate.update({
      where: { id },
      data: {
        aiScore: result.score,
        aiAnalysis: { reasoning: result.reasoning, scoredAt: new Date().toISOString() },
      },
    });
  }

  async getPipeline(jobId: string) {
    const candidates = await this.prisma.candidate.findMany({
      where: { jobId },
      orderBy: [{ aiScore: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      NEW: candidates.filter(c => c.status === 'NEW'),
      SCREENING: candidates.filter(c => c.status === 'SCREENING'),
      INTERVIEW: candidates.filter(c => c.status === 'INTERVIEW'),
      APPROVED: candidates.filter(c => c.status === 'APPROVED'),
      REJECTED: candidates.filter(c => c.status === 'REJECTED'),
    };
  }
}
