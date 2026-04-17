import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanCalculatorService } from './loan-calculator.service';

@Module({
  providers: [LoansService, LoanCalculatorService],
  controllers: [LoansController],
  exports: [LoanCalculatorService],
})
export class LoansModule {}
