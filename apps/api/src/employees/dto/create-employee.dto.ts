import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty()
  @IsString()
  storeId: string;

  @ApiProperty({ example: 'Atendente' })
  @IsString()
  position: string;

  @ApiProperty({ example: 'Junior' })
  @IsString()
  positionLevel: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ example: 1800 })
  @IsNumber()
  salary: number;

  @ApiPropertyOptional({ enum: ['CLT', 'INTERMITTENT'] })
  @IsOptional()
  @IsEnum(['CLT', 'INTERMITTENT'])
  contractType?: string;
}
