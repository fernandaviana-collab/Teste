import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  fullName: string;

  @ApiProperty({ enum: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERMITTENT'] })
  @IsEnum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'INTERMITTENT'])
  userType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storeId?: string;
}
