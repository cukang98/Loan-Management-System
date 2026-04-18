import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateRepaymentDto } from './dto/create-repayment.dto';
import { PaymentMethod } from '@ck-loan/shared';

export class RepaymentFilterDto extends PaginationDto {
  loanId?: string;
  lenderId?: string;
}

@Injectable()
export class RepaymentsService {
  private readonly logger = new Logger(RepaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: RepaymentFilterDto) {
    this.logger.log('Fetching repayments');

    const where: any = {};
    if (query.loanId) where.loanId = query.loanId;
    if (query.lenderId) where.loan = { lenderId: query.lenderId };

    const [items, total] = await Promise.all([
      this.prisma.repayment.findMany({
        where,
        include: {
          loan: {
            select: {
              id: true,
              status: true,
              customer: { select: { fullName: true } },
            },
          },
          allocations: {
            include: {
              schedule: {
                select: { installmentNo: true, dueDate: true, totalDue: true },
              },
            },
          },
        },
        skip: query.skip,
        take: query.pageSize,
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.repayment.count({ where }),
    ]);

    return {
      items,
      pagination: {
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
        totalItem: total,
      },
    };
  }

  async create(dto: CreateRepaymentDto) {
    this.logger.log(`Recording repayment for loan: ${dto.loanId}`);
    return this.applyRepayment(
      dto.loanId,
      dto.amount,
      new Date(dto.paymentDate),
      dto.method ?? PaymentMethod.CASH,
      dto.notes,
    );
  }

  /**
   * Core payment allocation engine.
   *
   * Rules:
   *  1. Reject if loan is COMPLETED or DEFAULTED.
   *  2. Mark any PENDING schedules whose dueDate < paymentDate as OVERDUE.
   *  3. Allocate payment: OVERDUE → PARTIAL → PENDING (oldest dueDate first).
   *  4. Allow partial payment (schedule stays PARTIAL).
   *  5. Allow overpayment (excess flows into future PENDING schedules).
   *  6. If all schedules reach PAID status, mark loan COMPLETED.
   *
   * Returns the created Repayment record, allocation count, and any unallocated excess.
   */
  async applyRepayment(
    loanId: string,
    amount: number,
    paymentDate: Date,
    method: PaymentMethod,
    notes?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        select: { id: true, status: true },
      });

      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status === 'COMPLETED') {
        throw new BadRequestException('Loan is already completed');
      }
      if (loan.status === 'DEFAULTED') {
        throw new BadRequestException('Cannot record repayment for a defaulted loan');
      }

      // Fetch all open schedules ordered by due date (oldest first)
      const schedules = await tx.repaymentSchedule.findMany({
        where: { loanId, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        orderBy: { dueDate: 'asc' },
      });

      // Promote past-due PENDING → OVERDUE
      const nowOverdueIds = schedules
        .filter((s) => s.status === 'PENDING' && s.dueDate < paymentDate)
        .map((s) => s.id);

      if (nowOverdueIds.length > 0) {
        await tx.repaymentSchedule.updateMany({
          where: { id: { in: nowOverdueIds } },
          data: { status: 'OVERDUE' },
        });
        schedules.forEach((s) => {
          if (nowOverdueIds.includes(s.id)) (s as any).status = 'OVERDUE';
        });
      }

      // Priority order: OVERDUE → PARTIAL → PENDING
      const orderedSchedules = [
        ...schedules.filter((s) => s.status === 'OVERDUE'),
        ...schedules.filter((s) => s.status === 'PARTIAL'),
        ...schedules.filter((s) => s.status === 'PENDING'),
      ];

      // Create the payment record
      const repayment = await tx.repayment.create({
        data: { loanId, amount, paymentDate, method, notes },
      });

      // Walk through schedules and allocate
      let remaining = amount;
      const allocations: Array<{
        repaymentId: string;
        scheduleId: string;
        amountApplied: number;
      }> = [];

      for (const schedule of orderedSchedules) {
        if (remaining <= 0) break;

        const alreadyPaid = Number(schedule.paidAmount);
        const scheduleDue = this.round(Number(schedule.totalDue) - alreadyPaid);
        if (scheduleDue <= 0) continue;

        const applied = Math.min(remaining, scheduleDue);
        const newPaidAmount = this.round(alreadyPaid + applied);
        // Tolerance of 1 cent to absorb floating-point rounding
        const isFullyPaid = newPaidAmount >= Number(schedule.totalDue) - 0.01;

        allocations.push({
          repaymentId: repayment.id,
          scheduleId: schedule.id,
          amountApplied: applied,
        });

        await tx.repaymentSchedule.update({
          where: { id: schedule.id },
          data: {
            paidAmount: newPaidAmount,
            status: isFullyPaid ? 'PAID' : 'PARTIAL',
          },
        });

        remaining = this.round(remaining - applied);
      }

      if (allocations.length > 0) {
        await tx.repaymentAllocation.createMany({ data: allocations });
      }

      // Mark loan COMPLETED when every schedule is PAID
      const openCount = await tx.repaymentSchedule.count({
        where: { loanId, status: { not: 'PAID' } },
      });

      if (openCount === 0) {
        await tx.loan.update({ where: { id: loanId }, data: { status: 'COMPLETED' } });
      }

      return {
        repayment,
        allocatedCount: allocations.length,
        /** Amount not applied to any schedule (true overpayment beyond all open schedules). */
        excessAmount: remaining,
      };
    });
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
