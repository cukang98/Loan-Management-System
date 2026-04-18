import { IsString, IsNumber, IsPositive, IsOptional, IsEmail, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLenderDto {
  @IsString()
  userId: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  availableCapital: number;
}
