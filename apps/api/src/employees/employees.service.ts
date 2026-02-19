import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        ...dto,
        hireDate: new Date(dto.hireDate),
      },
      include: { user: { select: { fullName: true, email: true, phone: true } } },
    });
  }

  async findAll(companyId?: string, storeId?: string, status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (storeId) where.storeId = storeId;
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where, skip, take: limit,
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          store: { select: { name: true } },
        },
        orderBy: { user: { fullName: 'asc' } },
      }),
      this.prisma.employee.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true, phone: true, metadata: true } },
        store: { select: { name: true, address: true } },
        schedules: { take: 10, orderBy: { date: 'desc' } },
        timeClocks: { take: 10, orderBy: { clockIn: 'desc' } },
      },
    });
    if (!employee) throw new NotFoundException('Funcionário não encontrado');
    return employee;
  }

  async update(id: string, dto: Partial<CreateEmployeeDto>) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.hireDate) data.hireDate = new Date(dto.hireDate);
    return this.prisma.employee.update({ where: { id }, data });
  }

  async terminate(id: string) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: { status: 'TERMINATED', terminatedAt: new Date() },
    });
  }

  async clockIn(employeeId: string, scheduleId?: string, location?: any) {
    return this.prisma.timeClock.create({
      data: {
        employeeId,
        scheduleId,
        clockIn: new Date(),
        locationIn: location,
        verificationMethod: 'MANUAL',
      },
    });
  }

  async clockOut(timeClockId: string, location?: any) {
    const timeClock = await this.prisma.timeClock.findUnique({ where: { id: timeClockId } });
    if (!timeClock) throw new NotFoundException('Registro de ponto não encontrado');
    const clockOut = new Date();
    const diffMs = clockOut.getTime() - timeClock.clockIn.getTime();
    const totalHours = parseFloat((diffMs / 3600000).toFixed(2));
    return this.prisma.timeClock.update({
      where: { id: timeClockId },
      data: { clockOut, locationOut: location, totalHours },
    });
  }

  async getTimeClocks(employeeId: string, startDate?: string, endDate?: string) {
    const where: any = { employeeId };
    if (startDate || endDate) {
      where.clockIn = {};
      if (startDate) where.clockIn.gte = new Date(startDate);
      if (endDate) where.clockIn.lte = new Date(endDate);
    }
    return this.prisma.timeClock.findMany({
      where,
      orderBy: { clockIn: 'desc' },
      take: 50,
    });
  }
}
