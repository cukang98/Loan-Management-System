import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanCalculatorService } from './loan-calculator.service';
import { ScheduleGeneratorService } from './schedule-generator.service';

@Module({
  providers: [LoansService, LoanCalculatorService, ScheduleGeneratorService],
  controllers: [LoansController],
  exports: [LoanCalculatorService, ScheduleGeneratorService],
})
export class LoansModule {}
