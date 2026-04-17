import { IsString, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLenderDto {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  availableCapital: number;
}
