import { IsString, IsNumber, IsPositive, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLenderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  availableCapital?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
