import { LoanCalculatorService, CalculationInput } from './loan-calculator.service';
import { RepaymentFrequency, InterestModel } from '@ck-loan/shared';

describe('LoanCalculatorService', () => {
  let service: LoanCalculatorService;

  beforeEach(() => {
    service = new LoanCalculatorService();
  });

  describe('Flat Rate calculations', () => {
    const input: CalculationInput = {
      principal: 10000,
      annualInterestRate: 8,
      tenureMonths: 12,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      interestModel: InterestModel.FLAT,
    };

    it('should calculate totalRepayment correctly', () => {
      const result = service.calculate(input);
      expect(result.totalRepayment).toBeCloseTo(10800, 2);
    });

    it('should calculate installmentAmount correctly for MONTHLY', () => {
      const result = service.calculate(input);
      expect(result.installmentAmount).toBeCloseTo(900, 2);
    });

    it('should calculate installmentAmount correctly for WEEKLY', () => {
      const result = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.WEEKLY,
      });
      expect(result.installmentAmount).toBeCloseTo(10800 / 48, 2);
    });

    it('should calculate installmentAmount correctly for BIWEEKLY', () => {
      const result = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.BIWEEKLY,
      });
      expect(result.installmentAmount).toBeCloseTo(10800 / 24, 2);
    });
  });

  describe('Reducing Balance calculations', () => {
    const input: CalculationInput = {
      principal: 10000,
      annualInterestRate: 12,
      tenureMonths: 12,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      interestModel: InterestModel.REDUCING,
    };

    it('should calculate installmentAmount within expected range', () => {
      const result = service.calculate(input);
      expect(result.installmentAmount).toBeCloseTo(888.49, 0);
    });

    it('should calculate totalRepayment as installment * numInstallments', () => {
      const result = service.calculate(input);
      expect(result.totalRepayment).toBeCloseTo(result.installmentAmount * 12, 0);
    });

    it('should divide monthly installment by 4 for WEEKLY frequency', () => {
      const monthly = service.calculate(input);
      const weekly = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.WEEKLY,
      });
      expect(weekly.installmentAmount).toBeCloseTo(monthly.installmentAmount / 4, 1);
    });

    it('should divide monthly installment by 2 for BIWEEKLY frequency', () => {
      const monthly = service.calculate(input);
      const biweekly = service.calculate({
        ...input,
        repaymentFrequency: RepaymentFrequency.BIWEEKLY,
      });
      expect(biweekly.installmentAmount).toBeCloseTo(monthly.installmentAmount / 2, 1);
    });
  });

  describe('getNumberOfInstallments', () => {
    it('returns tenure for MONTHLY', () => {
      expect(service.getNumberOfInstallments(12, RepaymentFrequency.MONTHLY)).toBe(12);
    });

    it('returns tenure * 4 for WEEKLY', () => {
      expect(service.getNumberOfInstallments(12, RepaymentFrequency.WEEKLY)).toBe(48);
    });

    it('returns tenure * 2 for BIWEEKLY', () => {
      expect(service.getNumberOfInstallments(12, RepaymentFrequency.BIWEEKLY)).toBe(24);
    });
  });
});
