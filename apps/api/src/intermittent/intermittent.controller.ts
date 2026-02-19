import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IntermittentService } from './intermittent.service';
import { CreateWorkerDto, CreateGigOpportunityDto } from './dto/create-worker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('intermittent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('intermittent')
export class IntermittentController {
  constructor(private service: IntermittentService) {}

  @Post('workers')
  @ApiOperation({ summary: 'Cadastrar trabalhador intermitente' })
  createWorker(@Body() dto: CreateWorkerDto) {
    return this.service.createWorker(dto);
  }

  @Get('workers')
  @ApiOperation({ summary: 'Listar trabalhadores' })
  @ApiQuery({ name: 'status', required: false })
  findWorkers(@Query('status') status?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findWorkers(status, page, limit);
  }

  @Get('workers/:id')
  @ApiOperation({ summary: 'Perfil do trabalhador' })
  findWorker(@Param('id') id: string) {
    return this.service.findWorker(id);
  }

  @Post('gigs')
  @ApiOperation({ summary: 'Criar oportunidade de gig' })
  createGig(@Body() dto: CreateGigOpportunityDto) {
    return this.service.createGig(dto);
  }

  @Get('gigs')
  @ApiOperation({ summary: 'Listar oportunidades' })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findGigs(
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findGigs(storeId, status, page, limit);
  }

  @Get('gigs/:id/matches')
  @ApiOperation({ summary: 'Matches para uma oportunidade' })
  getMatches(@Param('id') id: string) {
    return this.service.getMatches(id);
  }

  @Post('gigs/:id/invite/:workerId')
  @ApiOperation({ summary: 'Convidar trabalhador' })
  invite(@Param('id') id: string, @Param('workerId') workerId: string) {
    return this.service.inviteWorker(id, workerId);
  }

  @Put('matches/:id/respond')
  @ApiOperation({ summary: 'Aceitar/rejeitar convite' })
  respond(@Param('id') id: string, @Body('accept') accept: boolean) {
    return this.service.respondToInvite(id, accept);
  }

  @Put('matches/:id/check-in')
  @ApiOperation({ summary: 'Check-in do gig' })
  checkIn(@Param('id') id: string) {
    return this.service.checkIn(id);
  }

  @Put('matches/:id/check-out')
  @ApiOperation({ summary: 'Check-out do gig' })
  checkOut(@Param('id') id: string, @Body('workerRating') workerRating?: number) {
    return this.service.checkOut(id, workerRating);
  }
}
