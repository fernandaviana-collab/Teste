import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ example: 'Atendente de Balcão' })
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ['CLT', 'INTERMITTENT'] })
  @IsEnum(['CLT', 'INTERMITTENT'])
  jobType: string;

  @ApiProperty({ example: 'Junior' })
  @IsString()
  positionLevel: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  requirements?: any;

  @ApiProperty()
  @IsString()
  createdBy: string;
}
