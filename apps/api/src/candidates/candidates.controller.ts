import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('candidates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar candidato' })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar candidatos' })
  @ApiQuery({ name: 'jobId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('jobId') jobId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.candidatesService.findAll(jobId, status, page, limit);
  }

  @Get('pipeline/:jobId')
  @ApiOperation({ summary: 'Pipeline de candidatos por vaga' })
  getPipeline(@Param('jobId') jobId: string) {
    return this.candidatesService.getPipeline(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar candidato por ID' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar status do candidato' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.candidatesService.updateStatus(id, status);
  }

  @Post(':id/score')
  @ApiOperation({ summary: 'Pontuar candidato com IA' })
  score(@Param('id') id: string) {
    return this.candidatesService.scoreManually(id);
  }
}
