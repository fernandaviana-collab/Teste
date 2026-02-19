import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas gerais do dashboard' })
  @ApiQuery({ name: 'companyId', required: true })
  getMetrics(@Query('companyId') companyId: string) {
    return this.dashboardService.getMetrics(companyId);
  }

  @Get('jobs-chart')
  @ApiOperation({ summary: 'Dados para gráfico de vagas' })
  @ApiQuery({ name: 'companyId', required: true })
  getJobsChart(@Query('companyId') companyId: string) {
    return this.dashboardService.getJobsChart(companyId);
  }

  @Get('candidates-chart')
  @ApiOperation({ summary: 'Dados para gráfico de candidatos' })
  @ApiQuery({ name: 'companyId', required: true })
  getCandidatesChart(@Query('companyId') companyId: string) {
    return this.dashboardService.getCandidatesChart(companyId);
  }

  @Get('stores')
  @ApiOperation({ summary: 'Métricas por loja' })
  @ApiQuery({ name: 'companyId', required: true })
  getStoreMetrics(@Query('companyId') companyId: string) {
    return this.dashboardService.getStoreMetrics(companyId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Atividade recente' })
  @ApiQuery({ name: 'companyId', required: true })
  getActivity(@Query('companyId') companyId: string) {
    return this.dashboardService.getRecentActivity(companyId);
  }
}
