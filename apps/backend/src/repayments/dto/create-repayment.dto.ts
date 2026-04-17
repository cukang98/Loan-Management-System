import { IsString, IsNumber, IsPositive, IsDateString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRepaymentDto {
  @IsString()
  loanId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  paidAmount: number;

  @IsDateString()
  paidAt: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  overdueDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
