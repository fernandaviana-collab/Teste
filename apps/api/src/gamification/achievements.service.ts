import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PointsService } from './points.service';

@Injectable()
export class AchievementsService {
  constructor(
    private prisma: PrismaService,
    private pointsService: PointsService,
  ) {}

  async findAll() {
    return this.prisma.achievement.findMany({ orderBy: { points: 'desc' } });
  }

  async getUserAchievements(userId: string) {
    return this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  async awardAchievement(userId: string, achievementCode: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { code: achievementCode },
    });
    if (!achievement) return null;

    const existing = await this.prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (existing) return existing;

    const userAchievement = await this.prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
      include: { achievement: true },
    });

    // Award points for the achievement
    await this.pointsService.addPoints(userId, `ACHIEVEMENT_${achievementCode}`, {
      achievementId: achievement.id,
      achievementName: achievement.name,
    });

    return userAchievement;
  }

  async checkAndAwardAchievements(userId: string) {
    const awarded: string[] = [];

    // Check FIRST_DAY
    const pointsHistory = await this.prisma.pointsLedger.findFirst({
      where: { userId, actionType: 'FIRST_DAY' },
    });
    if (pointsHistory) {
      const result = await this.awardAchievement(userId, 'FIRST_DAY');
      if (result) awarded.push('FIRST_DAY');
    }

    // Check GIG_MASTER (10 gigs completed)
    const worker = await this.prisma.intermittentWorker.findUnique({ where: { userId } });
    if (worker && worker.totalJobs >= 10) {
      const result = await this.awardAchievement(userId, 'GIG_MASTER');
      if (result) awarded.push('GIG_MASTER');
    }

    return awarded;
  }
}
