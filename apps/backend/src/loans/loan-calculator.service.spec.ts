import { LoanCalculatorService } from './loan-calculator.service';
import { InterestModel, TenureType } from '@ck-loan/shared';

describe('LoanCalculatorService', () => {
  let service: LoanCalculatorService;

  beforeEach(() => {
    service = new LoanCalculatorService();
  });

  describe('calculateInterest — FLAT model', () => {
    it('derives interestAmount from interestRate', () => {
      const result = service.calculateInterest({
        principal: 10000,
        tenure: 12,
        tenureType: TenureType.MONTH,
        interestModel: InterestModel.FLAT,
        interestRate: 10,
      });
      expect(result.interestRate).toBe(10);
      expect(result.interestAmount).toBe(1000);
    });

    it('derives interestRate from interestAmount', () => {
      const result = service.calculateInterest({
        principal: 10000,
        tenure: 12,
        tenureType: TenureType.MONTH,
        interestModel: InterestModel.FLAT,
        interestAmount: 800,
      });
      expect(result.interestAmount).toBe(800);
      expect(result.interestRate).toBe(8);
    });

    it('rounds interestRate to 4 decimal places', () => {
      const result = service.calculateInterest({
        principal: 10000,
        tenure: 6,
        tenureType: TenureType.MONTH,
        interestModel: InterestModel.FLAT,
        interestAmount: 333,
      });
      expect(result.interestRate).toBe(3.33);
    });
  });

  describe('calculateInterest — REDUCING model', () => {
    it('derives total interestAmount by summing reducing-balance interest', () => {
      // 3-period loan, 10% per period rate, equal principal = 1000/period
      // Period 1: interest = 3000 × 0.10 = 300
      // Period 2: interest = 2000 × 0.10 = 200
      // Period 3: interest = 1000 × 0.10 = 100
      // Total interest = 600
      const result = service.calculateInterest({
        principal: 3000,
        tenure: 3,
        tenureType: TenureType.MONTH,
        interestModel: InterestModel.REDUCING,
        interestRate: 10,
      });
      expect(result.interestAmount).toBeCloseTo(600, 2);
      expect(result.interestRate).toBe(10);
    });

    it('gives less total interest than flat for same rate', () => {
      const flat = service.calculateInterest({
        principal: 10000, tenure: 12, tenureType: TenureType.MONTH,
        interestModel: InterestModel.FLAT, interestRate: 5,
      });
      const reducing = service.calculateInterest({
        principal: 10000, tenure: 12, tenureType: TenureType.MONTH,
        interestModel: InterestModel.REDUCING, interestRate: 5,
      });
      expect(reducing.interestAmount).toBeLessThan(flat.interestAmount);
    });
  });

  describe('input validation', () => {
    it('throws when neither interestRate nor interestAmount provided', () => {
      expect(() =>
        service.calculateInterest({
          principal: 5000,
          tenure: 6,
          tenureType: TenureType.MONTH,
          interestModel: InterestModel.FLAT,
        }),
      ).toThrow();
    });

    it('throws when both interestRate and interestAmount provided', () => {
      expect(() =>
        service.calculateInterest({
          principal: 5000,
          tenure: 6,
          tenureType: TenureType.MONTH,
          interestModel: InterestModel.FLAT,
          interestRate: 5,
          interestAmount: 250,
        }),
      ).toThrow();
    });
  });
});
