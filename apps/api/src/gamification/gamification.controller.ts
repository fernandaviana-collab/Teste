import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
  constructor(
    private pointsService: PointsService,
    private achievementsService: AchievementsService,
  ) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Ranking de pontos da empresa' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'limit', required: false })
  getLeaderboard(@Query('companyId') companyId: string, @Query('limit') limit?: number) {
    return this.pointsService.getLeaderboard(companyId, limit);
  }

  @Get('users/:userId/points')
  @ApiOperation({ summary: 'Pontos do usuário' })
  getUserPoints(@Param('userId') userId: string) {
    return this.pointsService.getUserPoints(userId).then(points => ({ userId, points }));
  }

  @Get('users/:userId/history')
  @ApiOperation({ summary: 'Histórico de pontos' })
  getHistory(@Param('userId') userId: string) {
    return this.pointsService.getUserHistory(userId);
  }

  @Post('users/:userId/points')
  @ApiOperation({ summary: 'Adicionar pontos' })
  addPoints(@Param('userId') userId: string, @Body() body: { actionType: string; metadata?: any }) {
    return this.pointsService.addPoints(userId, body.actionType, body.metadata);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Listar conquistas disponíveis' })
  getAchievements() {
    return this.achievementsService.findAll();
  }

  @Get('users/:userId/achievements')
  @ApiOperation({ summary: 'Conquistas do usuário' })
  getUserAchievements(@Param('userId') userId: string) {
    return this.achievementsService.getUserAchievements(userId);
  }

  @Post('users/:userId/award/:achievementCode')
  @ApiOperation({ summary: 'Conceder conquista ao usuário' })
  awardAchievement(@Param('userId') userId: string, @Param('achievementCode') code: string) {
    return this.achievementsService.awardAchievement(userId, code);
  }

  @Post('users/:userId/check-achievements')
  @ApiOperation({ summary: 'Verificar e conceder conquistas automaticamente' })
  checkAchievements(@Param('userId') userId: string) {
    return this.achievementsService.checkAndAwardAchievements(userId);
  }
}
