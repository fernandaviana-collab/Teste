import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto) {
    return this.prisma.store.create({ data: dto });
  }

  async findAll(companyId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = companyId ? { companyId } : {};
    const [data, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { employees: true, gigs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.store.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        company: true,
        employees: { include: { user: { select: { fullName: true, email: true } } } },
        _count: { select: { employees: true, gigs: true, schedules: true } },
      },
    });
    if (!store) throw new NotFoundException('Loja não encontrada');
    return store;
  }

  async findByCompany(companyId: string) {
    return this.prisma.store.findMany({
      where: { companyId },
      include: { _count: { select: { employees: true } } },
    });
  }

  async update(id: string, dto: Partial<CreateStoreDto>) {
    await this.findOne(id);
    return this.prisma.store.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.store.delete({ where: { id } });
  }
}
