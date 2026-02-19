import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar empresa' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.companiesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCompanyDto>) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover empresa' })
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
