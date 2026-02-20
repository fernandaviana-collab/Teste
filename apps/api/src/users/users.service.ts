import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashedPassword } as any,
      select: { id: true, email: true, fullName: true, userType: true, companyId: true, status: true, createdAt: true },
    });
  }

  async findAll(companyId?: string, userType?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (userType) where.userType = userType;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        select: { id: true, email: true, fullName: true, phone: true, userType: true, companyId: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, fullName: true, phone: true, userType: true,
        companyId: true, storeId: true, status: true, createdAt: true, metadata: true,
        company: { select: { name: true } },
        employee: true,
        intermittent: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, dto: Partial<CreateUserDto>) {
    await this.findOne(id);
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    const { password, ...rest } = dto;
    return this.prisma.user.update({
      where: { id },
      data: (password ? { ...rest, password } : rest) as any,
      select: { id: true, email: true, fullName: true, userType: true, status: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: { status: 'INACTIVE' } });
  }
}
