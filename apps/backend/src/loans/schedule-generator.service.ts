import { Injectable } from '@nestjs/common';
import { TenureType, RepaymentType, InterestModel } from '@ck-loan/shared';

export interface SchedulePreviewItem {
  installmentNo: number;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
}

export interface ScheduleGeneratorInput {
  principal: number;
  /** Flat % of principal (FLAT) or per-period % (REDUCING / ROLLING) */
  interestRate: number;
  /** Total absolute interest over loan life (used for FLAT distribution) */
  interestAmount: number;
  tenure: number;
  tenureType: TenureType;
  repaymentType: RepaymentType;
  interestModel: InterestModel;
  startDate: Date;
}

@Injectable()
export class ScheduleGeneratorService {
  /**
   * Core entry point: generates a preview schedule array (never persisted here).
   *
   * Routing:
   *   INSTALLMENT → equal-principal per period; interest flat or reducing
   *   DAILY       → one row per calendar day for the loan duration
   *   MONTHLY     → one row per month for the loan duration
   *   ROLLING     → compound interest on outstanding balance per period
   */
  generate(input: ScheduleGeneratorInput): SchedulePreviewItem[] {
    switch (input.repaymentType) {
      case RepaymentType.INSTALLMENT:
        return this.generateInstallment(input);
      case RepaymentType.DAILY:
        return this.generateDaily(input);
      case RepaymentType.MONTHLY:
        return this.generateMonthly(input);
      case RepaymentType.ROLLING:
        return this.generateRolling(input);
      default:
        throw new Error(`Unsupported repayment type: ${input.repaymentType}`);
    }
  }

  // ─── INSTALLMENT ──────────────────────────────────────────────────────────

  /**
   * N installments, one per tenureType period.
   * FLAT:     equal principal + equal interest each period.
   * REDUCING: equal principal + interest on outstanding balance.
   */
  private generateInstallment(input: ScheduleGeneratorInput): SchedulePreviewItem[] {
    const { principal, interestAmount, interestRate, interestModel, tenure, tenureType, startDate } = input;
    const schedule: SchedulePreviewItem[] = [];

    if (interestModel === InterestModel.REDUCING) {
      const periodicRate = interestRate / 100;
      const principalPerPeriod = this.round(principal / tenure);
      let outstanding = principal;

      for (let i = 1; i <= tenure; i++) {
        const interestDue = this.round(outstanding * periodicRate);
        // Last period absorbs rounding remainder
        const principalDue = i === tenure ? this.round(outstanding) : principalPerPeriod;

        schedule.push({
          installmentNo: i,
          dueDate: this.addPeriod(startDate, i, tenureType),
          principalDue,
          interestDue,
          totalDue: this.round(principalDue + interestDue),
        });

        outstanding = this.round(outstanding - principalPerPeriod);
      }
    } else {
      // FLAT distribution
      const principalPerPeriod = this.round(principal / tenure);
      const interestPerPeriod = this.round(interestAmount / tenure);

      for (let i = 1; i <= tenure; i++) {
        const isLast = i === tenure;
        const principalDue = isLast
          ? this.round(principal - principalPerPeriod * (tenure - 1))
          : principalPerPeriod;
        const interestDue = isLast
          ? this.round(interestAmount - interestPerPeriod * (tenure - 1))
          : interestPerPeriod;

        schedule.push({
          installmentNo: i,
          dueDate: this.addPeriod(startDate, i, tenureType),
          principalDue,
          interestDue,
          totalDue: this.round(principalDue + interestDue),
        });
      }
    }

    return schedule;
  }

  // ─── DAILY ────────────────────────────────────────────────────────────────

  /**
   * One payment per calendar day.
   * Total days = tenure × days-per-unit(tenureType).
   * Interest distributed flat across all days.
   */
  private generateDaily(input: ScheduleGeneratorInput): SchedulePreviewItem[] {
    const { principal, interestAmount, tenure, tenureType, startDate } = input;
    const schedule: SchedulePreviewItem[] = [];
    const totalDays = this.toTotalDays(tenure, tenureType);
    const principalPerDay = this.round(principal / totalDays);
    const interestPerDay = this.round(interestAmount / totalDays);

    for (let i = 1; i <= totalDays; i++) {
      const isLast = i === totalDays;
      const principalDue = isLast
        ? this.round(principal - principalPerDay * (totalDays - 1))
        : principalPerDay;
      const interestDue = isLast
        ? this.round(interestAmount - interestPerDay * (totalDays - 1))
        : interestPerDay;

      schedule.push({
        installmentNo: i,
        dueDate: this.addDays(startDate, i),
        principalDue,
        interestDue,
        totalDue: this.round(principalDue + interestDue),
      });
    }

    return schedule;
  }

  // ─── MONTHLY ──────────────────────────────────────────────────────────────

  /**
   * One payment per calendar month.
   * Total months = tenure × months-per-unit(tenureType).
   * Handles month-end overflow (e.g. Jan 31 + 1 month → Feb 28/29).
   */
  private generateMonthly(input: ScheduleGeneratorInput): SchedulePreviewItem[] {
    const { principal, interestAmount, tenure, tenureType, startDate } = input;
    const schedule: SchedulePreviewItem[] = [];
    const totalMonths = this.toTotalMonths(tenure, tenureType);
    const principalPerMonth = this.round(principal / totalMonths);
    const interestPerMonth = this.round(interestAmount / totalMonths);

    for (let i = 1; i <= totalMonths; i++) {
      const isLast = i === totalMonths;
      const principalDue = isLast
        ? this.round(principal - principalPerMonth * (totalMonths - 1))
        : principalPerMonth;
      const interestDue = isLast
        ? this.round(interestAmount - interestPerMonth * (totalMonths - 1))
        : interestPerMonth;

      schedule.push({
        installmentNo: i,
        dueDate: this.addMonths(startDate, i),
        principalDue,
        interestDue,
        totalDue: this.round(principalDue + interestDue),
      });
    }

    return schedule;
  }

  // ─── ROLLING ──────────────────────────────────────────────────────────────

  /**
   * Compound/rolling interest on the outstanding balance each period.
   * interestRate is applied per period to the declining outstanding balance.
   * Equal principal payment each period.
   */
  private generateRolling(input: ScheduleGeneratorInput): SchedulePreviewItem[] {
    const { principal, interestRate, tenure, tenureType, startDate } = input;
    const schedule: SchedulePreviewItem[] = [];
    const periodicRate = interestRate / 100;
    const principalPerPeriod = this.round(principal / tenure);
    let outstanding = principal;

    for (let i = 1; i <= tenure; i++) {
      const interestDue = this.round(outstanding * periodicRate);
      // Last period absorbs any rounding difference in principal
      const principalDue = i === tenure ? this.round(outstanding) : principalPerPeriod;

      schedule.push({
        installmentNo: i,
        dueDate: this.addPeriod(startDate, i, tenureType),
        principalDue,
        interestDue,
        totalDue: this.round(principalDue + interestDue),
      });

      outstanding = this.round(outstanding - principalPerPeriod);
    }

    return schedule;
  }

  // ─── Date helpers ─────────────────────────────────────────────────────────

  private addPeriod(date: Date, n: number, tenureType: TenureType): Date {
    switch (tenureType) {
      case TenureType.DAY:
        return this.addDays(date, n);
      case TenureType.WEEK:
        return this.addDays(date, n * 7);
      case TenureType.MONTH:
        return this.addMonths(date, n);
    }
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * Adds months while clamping to the last valid day of the target month.
   * Example: addMonths(Jan 31, 1) → Feb 28/29 (not Mar 2/3).
   */
  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    const targetDay = d.getDate();
    d.setMonth(d.getMonth() + months);
    // Overflow detected: JS rolled to next month
    if (d.getDate() < targetDay) {
      d.setDate(0); // last day of the intended month
    }
    return d;
  }

  // ─── Unit converters ──────────────────────────────────────────────────────

  /** Total calendar days covered by tenure × tenureType. */
  private toTotalDays(tenure: number, tenureType: TenureType): number {
    switch (tenureType) {
      case TenureType.DAY:
        return tenure;
      case TenureType.WEEK:
        return tenure * 7;
      case TenureType.MONTH:
        return tenure * 30; // approximate; use DAILY repaymentType for exact days
    }
  }

  /** Total calendar months covered by tenure × tenureType. */
  private toTotalMonths(tenure: number, tenureType: TenureType): number {
    switch (tenureType) {
      case TenureType.DAY:
        return Math.max(1, Math.round(tenure / 30));
      case TenureType.WEEK:
        return Math.max(1, Math.round(tenure / 4));
      case TenureType.MONTH:
        return tenure;
    }
  }

  // ─── Rounding ─────────────────────────────────────────────────────────────

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
