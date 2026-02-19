import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { AchievementsService } from './achievements.service';
import { GamificationController } from './gamification.controller';

@Module({
  providers: [PointsService, AchievementsService],
  controllers: [GamificationController],
  exports: [PointsService, AchievementsService],
})
export class GamificationModule {}
