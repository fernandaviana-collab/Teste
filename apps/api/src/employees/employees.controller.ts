import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar funcionário' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar funcionários' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'storeId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('storeId') storeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.employeesService.findAll(companyId, storeId, status, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Perfil do funcionário' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateEmployeeDto>) {
    return this.employeesService.update(id, dto);
  }

  @Put(':id/terminate')
  @ApiOperation({ summary: 'Desligar funcionário' })
  terminate(@Param('id') id: string) {
    return this.employeesService.terminate(id);
  }

  @Post(':id/clock-in')
  @ApiOperation({ summary: 'Registrar entrada' })
  clockIn(
    @Param('id') id: string,
    @Body() body: { scheduleId?: string; location?: any },
  ) {
    return this.employeesService.clockIn(id, body.scheduleId, body.location);
  }

  @Put('time-clocks/:timeClockId/clock-out')
  @ApiOperation({ summary: 'Registrar saída' })
  clockOut(@Param('timeClockId') timeClockId: string, @Body() body: { location?: any }) {
    return this.employeesService.clockOut(timeClockId, body.location);
  }

  @Get(':id/time-clocks')
  @ApiOperation({ summary: 'Histórico de ponto do funcionário' })
  getTimeClocks(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.employeesService.getTimeClocks(id, startDate, endDate);
  }
}
