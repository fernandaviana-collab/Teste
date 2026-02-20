import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({ where: { cnpj: dto.cnpj } });
    if (existing) throw new ConflictException('CNPJ já cadastrado');
    return this.prisma.company.create({ data: dto as any });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        skip, take: limit,
        include: { _count: { select: { stores: true, users: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { stores: true, _count: { select: { stores: true, users: true, jobs: true } } },
    });
    if (!company) throw new NotFoundException('Empresa não encontrada');
    return company;
  }

  async update(id: string, dto: Partial<CreateCompanyDto>) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
