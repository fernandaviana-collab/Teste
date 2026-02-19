import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stores')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar loja' })
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lojas' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'page', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.storesService.findAll(companyId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar loja por ID' })
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar loja' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateStoreDto>) {
    return this.storesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover loja' })
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
