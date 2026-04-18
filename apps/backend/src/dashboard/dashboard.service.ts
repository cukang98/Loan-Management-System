import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getKpis() {
    this.logger.log('Fetching dashboard KPIs');

    const [totalLoans, activeLoans, completedLoans, defaultedLoans, overdueCount, activeLoanTotals] =
      await Promise.all([
        this.prisma.loan.count(),
        this.prisma.loan.count({ where: { status: 'ACTIVE' } }),
        this.prisma.loan.count({ where: { status: 'COMPLETED' } }),
        this.prisma.loan.count({ where: { status: 'DEFAULTED' } }),
        // Overdue = schedules with OVERDUE status
        this.prisma.repaymentSchedule.count({ where: { status: 'OVERDUE' } }),
        // Outstanding = sum of (totalDue - paidAmount) for non-PAID schedules on ACTIVE loans
        this.prisma.repaymentSchedule.aggregate({
          where: { loan: { status: 'ACTIVE' }, status: { not: 'PAID' } },
          _sum: { totalDue: true, paidAmount: true },
        }),
      ]);

    const totalDue = Number(activeLoanTotals._sum.totalDue ?? 0);
    const paidSoFar = Number(activeLoanTotals._sum.paidAmount ?? 0);
    const totalOutstanding = Math.max(0, totalDue - paidSoFar);

    return {
      totalLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalOutstanding: totalOutstanding.toFixed(2),
      overdueCount,
    };
  }

  async getCharts() {
    this.logger.log('Fetching dashboard chart data');

    const loans = await this.prisma.loan.findMany({
      select: { principal: true, status: true, startDate: true },
    });

    const repayments = await this.prisma.repayment.findMany({
      select: { amount: true, paymentDate: true },
    });

    const overdueSchedules = await this.prisma.repaymentSchedule.findMany({
      where: { status: 'OVERDUE' },
      select: { dueDate: true },
    });

    // Build last-12-months map
    const monthlyMap = new Map<string, { disbursed: number; repaid: number }>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { disbursed: 0, repaid: 0 });
    }

    loans.forEach((loan) => {
      const key = `${loan.startDate.getFullYear()}-${String(loan.startDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.disbursed += Number(loan.principal);
      }
    });

    repayments.forEach((r) => {
      const key = `${r.paymentDate.getFullYear()}-${String(r.paymentDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.repaid += Number(r.amount);
      }
    });

    const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      disbursed: Math.round(data.disbursed),
      repaid: Math.round(data.repaid),
    }));

    const statusCounts = await this.prisma.loan.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusBreakdown = statusCounts.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));

    // Overdue trend: count OVERDUE schedules by dueDate month
    const overdueTrend = Array.from(monthlyMap.keys()).map((month) => {
      const [year, mo] = month.split('-').map(Number);
      const start = new Date(year, mo - 1, 1);
      const end = new Date(year, mo, 1);
      const count = overdueSchedules.filter(
        (s) => s.dueDate >= start && s.dueDate < end,
      ).length;
      return { month, overdue: count };
    });

    return { monthly, statusBreakdown, overdueTrend };
  }
}
