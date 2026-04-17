import { IsEnum, IsOptional } from 'class-validator';
import { LoanStatus } from '@ck-loan/shared';

export class UpdateLoanDto {
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}
