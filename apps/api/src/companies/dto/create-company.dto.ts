import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'FastBurger Franquias Ltda' })
  @IsString()
  name: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsString()
  cnpj: string;

  @ApiPropertyOptional({ enum: ['BASIC', 'PRO', 'ENTERPRISE'] })
  @IsOptional()
  @IsEnum(['BASIC', 'PRO', 'ENTERPRISE'])
  planType?: string;
}
