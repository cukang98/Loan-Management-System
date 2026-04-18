import { Injectable } from '@nestjs/common';
import { InterestModel, TenureType } from '@ck-loan/shared';

export interface InterestInput {
  principal: number;
  tenure: number;
  tenureType: TenureType;
  interestModel: InterestModel;
  /** Flat rate as % of principal (FLAT), or per-period % (REDUCING). Mutually exclusive with interestAmount. */
  interestRate?: number;
  /** Fixed total interest in currency units. Mutually exclusive with interestRate. */
  interestAmount?: number;
}

export interface InterestResult {
  /** Percentage. For FLAT: interestAmount / principal × 100. For REDUCING: per-period rate provided by caller. */
  interestRate: number;
  /** Total absolute interest over the life of the loan. */
  interestAmount: number;
}

@Injectable()
export class LoanCalculatorService {
  /**
   * Derives the missing interest field so both interestRate and interestAmount
   * are always stored together.
   *
   * FLAT model:
   *   interestAmount = principal × (interestRate / 100)
   *
   * REDUCING model (equal-principal method):
   *   Each period: interest = outstandingBalance × (interestRate / 100)
   *   Total interest = Σ all period interest amounts
   *   interestRate is the per-period rate (not annual).
   */
  calculateInterest(input: InterestInput): InterestResult {
    const { principal, tenure, interestModel, interestRate, interestAmount } = input;

    if (interestAmount !== undefined && interestRate !== undefined) {
      throw new Error('Provide either interestRate or interestAmount, not both');
    }

    if (interestAmount !== undefined) {
      // User gave total interest → back-calculate the flat rate
      const rate = this.round4((interestAmount / principal) * 100);
      return { interestRate: rate, interestAmount: this.round2(interestAmount) };
    }

    if (interestRate !== undefined) {
      if (interestModel === InterestModel.REDUCING) {
        // Sum interest across the reducing-balance schedule
        const periodicRate = interestRate / 100;
        const principalPerPeriod = principal / tenure;
        let outstanding = principal;
        let totalInterest = 0;

        for (let i = 0; i < tenure; i++) {
          totalInterest += outstanding * periodicRate;
          outstanding -= principalPerPeriod;
        }

        return { interestRate, interestAmount: this.round2(totalInterest) };
      }

      // FLAT: one-shot calculation
      return {
        interestRate,
        interestAmount: this.round2(principal * (interestRate / 100)),
      };
    }

    throw new Error('Either interestRate or interestAmount must be provided');
  }

  round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  round4(value: number): number {
    return Math.round(value * 10000) / 10000;
  }
}
