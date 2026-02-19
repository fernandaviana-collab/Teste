import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export const POINT_ACTIONS = {
  CLOCK_IN_ON_TIME: { points: 10, description: 'Check-in no horário' },
  COMPLETE_GIG: { points: 50, description: 'Gig concluído' },
  FIVE_STAR_RATING: { points: 30, description: 'Avaliação 5 estrelas' },
  REFERRAL_HIRED: { points: 200, description: 'Indicação contratada' },
  COMPLETE_TRAINING: { points: 100, description: 'Treinamento concluído' },
  FIRST_DAY: { points: 100, description: 'Primeiro dia de trabalho' },
  ATTENDANCE_STREAK_7: { points: 70, description: '7 dias sem falta' },
  ATTENDANCE_STREAK_30: { points: 300, description: '30 dias sem falta' },
};

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async addPoints(userId: string, actionType: string, metadata?: any) {
    const action = POINT_ACTIONS[actionType] || { points: 10, description: actionType };
    await this.prisma.pointsLedger.create({
      data: {
        userId,
        points: action.points,
        actionType,
        description: action.description,
        metadata,
      },
    });
    return this.getUserPoints(userId);
  }

  async getUserPoints(userId: string) {
    const result = await this.prisma.pointsLedger.aggregate({
      where: { userId },
      _sum: { points: true },
    });
    return result._sum.points || 0;
  }

  async getUserHistory(userId: string, limit = 20) {
    return this.prisma.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLeaderboard(companyId: string, limit = 10) {
    const leaderboard = await this.prisma.pointsLedger.groupBy({
      by: ['userId'],
      where: { user: { companyId } },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
    });

    const userIds = leaderboard.map((e) => e.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, email: true, employee: { select: { position: true } } },
    });

    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: users.find((u) => u.id === entry.userId),
      points: entry._sum.points || 0,
    }));
  }
}
