import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        employee: true,
        intermittent: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Usuário inativo ou suspenso');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
      companyId: user.companyId,
      storeId: user.storeId,
    };

    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        userType: true,
        companyId: true,
        storeId: true,
        status: true,
        createdAt: true,
        company: {
          select: { id: true, name: true, planType: true },
        },
        employee: {
          select: { position: true, positionLevel: true, storeId: true },
        },
        intermittent: {
          select: { level: true, rating: true, totalJobs: true },
        },
      },
    });

    return user;
  }
}
