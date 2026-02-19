import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar vaga' })
  create(@Body() dto: CreateJobDto) {
    return this.jobsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar vagas' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.jobsService.findAll(companyId, status, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar vaga por ID' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar vaga' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateJobDto>) {
    return this.jobsService.update(id, dto);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publicar vaga' })
  publish(@Param('id') id: string) {
    return this.jobsService.publish(id);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Fechar vaga' })
  close(@Param('id') id: string) {
    return this.jobsService.close(id);
  }

  @Post('generate-description')
  @ApiOperation({ summary: 'Gerar descrição de vaga com IA' })
  generateDescription(@Body() body: { title: string; requirements: any }) {
    return this.jobsService.generateDescription(body.title, body.requirements);
  }
}
