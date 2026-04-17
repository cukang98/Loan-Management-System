import {
  IsString, IsNumber, IsPositive, IsEnum, IsDateString, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RepaymentFrequency, InterestModel } from '@ck-loan/shared';

export class CreateLoanDto {
  @IsString()
  customerId: string;

  @IsString()
  lenderId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  principal: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  interestRate: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(360)
  tenureMonths: number;

  @IsEnum(RepaymentFrequency)
  repaymentFrequency: RepaymentFrequency;

  @IsEnum(InterestModel)
  interestModel: InterestModel;

  @IsDateString()
  startDate: string;
}
