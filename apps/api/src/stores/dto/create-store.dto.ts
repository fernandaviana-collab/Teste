import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty()
  @IsString()
  companyId: string;

  @ApiProperty({ example: 'FastBurger - Centro' })
  @IsString()
  name: string;

  @ApiProperty({ example: { street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP' } })
  address: any;

  @ApiProperty({ example: -23.5614 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -46.6558 })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managerId?: string;
}
