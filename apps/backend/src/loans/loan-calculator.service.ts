import { Injectable } from '@nestjs/common';
import { RepaymentFrequency, InterestModel } from '@ck-loan/shared';

export interface CalculationInput {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  repaymentFrequency: RepaymentFrequency;
  interestModel: InterestModel;
}

export interface CalculationResult {
  totalRepayment: number;
  installmentAmount: number;
  numberOfInstallments: number;
}

@Injectable()
export class LoanCalculatorService {
  calculate(input: CalculationInput): CalculationResult {
    switch (input.interestModel) {
      case InterestModel.FLAT:
        return this.calculateFlat(input);
      case InterestModel.REDUCING:
        return this.calculateReducing(input);
      default:
        throw new Error(`Unknown interest model: ${input.interestModel}`);
    }
  }

  getNumberOfInstallments(
    tenureMonths: number,
    frequency: RepaymentFrequency,
  ): number {
    switch (frequency) {
      case RepaymentFrequency.WEEKLY:
        return tenureMonths * 4;
      case RepaymentFrequency.BIWEEKLY:
        return tenureMonths * 2;
      case RepaymentFrequency.MONTHLY:
        return tenureMonths;
    }
  }

  private calculateFlat(input: CalculationInput): CalculationResult {
    const { principal, annualInterestRate, tenureMonths, repaymentFrequency } = input;

    const totalInterest = principal * (annualInterestRate / 100) * (tenureMonths / 12);
    const totalRepayment = principal + totalInterest;
    const numberOfInstallments = this.getNumberOfInstallments(tenureMonths, repaymentFrequency);
    const installmentAmount = totalRepayment / numberOfInstallments;

    return {
      totalRepayment: this.round(totalRepayment),
      installmentAmount: this.round(installmentAmount),
      numberOfInstallments,
    };
  }

  private calculateReducing(input: CalculationInput): CalculationResult {
    const { principal, annualInterestRate, tenureMonths, repaymentFrequency } = input;

    const monthlyRate = annualInterestRate / 100 / 12;
    const monthlyInstallment =
      (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -tenureMonths));

    const freqDivisor =
      repaymentFrequency === RepaymentFrequency.WEEKLY
        ? 4
        : repaymentFrequency === RepaymentFrequency.BIWEEKLY
          ? 2
          : 1;

    const installmentAmount = monthlyInstallment / freqDivisor;
    const numberOfInstallments = this.getNumberOfInstallments(tenureMonths, repaymentFrequency);
    const totalRepayment = installmentAmount * numberOfInstallments;

    return {
      totalRepayment: this.round(totalRepayment),
      installmentAmount: this.round(installmentAmount),
      numberOfInstallments,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
