import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 25.00 })
  @IsNumber()
  hourlyRate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  availabilityRadius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  skills?: string[];
}

export class CreateGigOpportunityDto {
  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty({ example: '2024-12-25' })
  @IsString()
  date: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: 'Atendente' })
  @IsString()
  position: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  slots: number;

  @ApiProperty({ example: 25.00 })
  @IsNumber()
  hourlyRate: number;

  @ApiPropertyOptional({ enum: ['NORMAL', 'HIGH', 'EMERGENCY'] })
  @IsOptional()
  urgencyLevel?: string;
}
