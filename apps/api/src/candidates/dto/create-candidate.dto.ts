import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';

export class CreateCandidateDto {
  @ApiProperty()
  @IsString()
  jobId: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'linkedin' })
  @IsString()
  source: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  avgTenure?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resumeUrl?: string;
}
