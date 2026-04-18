import { IsNumber, IsPositive, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { TenureType, RepaymentType, InterestModel } from '@ck-loan/shared';

/**
 * Input for generating a repayment schedule preview without persisting anything.
 * Exactly one of interestRate or interestAmount must be provided.
 */
export class PreviewLoanDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  principal: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  tenure: number;

  @IsEnum(TenureType)
  tenureType: TenureType;

  @IsEnum(RepaymentType)
  repaymentType: RepaymentType;

  @IsOptional()
  @IsEnum(InterestModel)
  interestModel?: InterestModel;

  /** Flat % of principal (FLAT model), or per-period % (REDUCING model). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  interestRate?: number;

  /** Fixed total interest amount. System will back-calculate interestRate. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  interestAmount?: number;

  @IsDateString()
  startDate: string;
}
