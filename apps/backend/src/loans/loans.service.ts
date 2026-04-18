import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanCalculatorService } from './loan-calculator.service';
import { ScheduleGeneratorService } from './schedule-generator.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PreviewLoanDto } from './dto/preview-loan.dto';
import { LoanStatus, InterestModel } from '@ck-loan/shared';

export class LoanFilterDto extends PaginationDto {
  status?: LoanStatus;
  lenderId?: string;
  customerId?: string;
}

@Injectable()
export class LoansService {
  private readonly logger = new Logger(LoansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: LoanCalculatorService,
    private readonly scheduleGenerator: ScheduleGeneratorService,
  ) {}

  /**
   * Generates a repayment schedule preview without touching the database.
   * Used by the frontend to show the borrower what the schedule will look like
   * before they confirm the loan.
   */
  async preview(dto: PreviewLoanDto) {
    this.validateInterestInput(dto.interestRate, dto.interestAmount);

    const interestModel = dto.interestModel ?? InterestModel.FLAT;
    const { interestRate, interestAmount } = this.calculator.calculateInterest({
      principal: dto.principal,
      tenure: dto.tenure,
      tenureType: dto.tenureType,
      interestModel,
      interestRate: dto.interestRate,
      interestAmount: dto.interestAmount,
    });

    const schedule = this.scheduleGenerator.generate({
      principal: dto.principal,
      interestRate,
      interestAmount,
      tenure: dto.tenure,
      tenureType: dto.tenureType,
      repaymentType: dto.repaymentType,
      interestModel,
      startDate: new Date(dto.startDate),
    });

    return {
      principal: dto.principal,
      interestRate,
      interestAmount,
      tenure: dto.tenure,
      tenureType: dto.tenureType,
      repaymentType: dto.repaymentType,
      interestModel,
      totalRepayment: this.calculator.round2(dto.principal + interestAmount),
      installmentCount: schedule.length,
      schedule,
    };
  }

  async findAll(query: LoanFilterDto) {
    this.logger.log('Fetching loans');

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.lenderId) where.lenderId = query.lenderId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.search) {
      where.customer = {
        fullName: { contains: query.search, mode: 'insensitive' },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.loan.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          lender: { select: { id: true, name: true } },
          _count: { select: { schedules: true, repayments: true } },
        },
        skip: query.skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loan.count({ where }),
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

  async findOne(id: string, lenderId?: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, email: true } },
        lender: { select: { id: true, name: true } },
        schedules: { orderBy: { installmentNo: 'asc' } },
        repayments: {
          orderBy: { paymentDate: 'asc' },
          include: {
            allocations: {
              include: {
                schedule: {
                  select: { installmentNo: true, dueDate: true, totalDue: true },
                },
              },
            },
          },
        },
      },
    });

    if (!loan) throw new NotFoundException(`Loan ${id} not found`);
    if (lenderId && loan.lenderId !== lenderId) {
      throw new NotFoundException(`Loan ${id} not found`);
    }
    return loan;
  }

  /**
   * Creates the loan and its full repayment schedule atomically.
   *
   * Flow:
   *  1. Validate customer and lender
   *  2. Check lender has sufficient capital
   *  3. Calculate interest (rate ↔ amount)
   *  4. Generate schedule preview
   *  5. Persist Loan + RepaymentSchedule rows in one transaction
   *  6. Deduct principal from lender's availableCapital
   */
  async create(dto: CreateLoanDto) {
    this.logger.log(`Creating loan for customer: ${dto.customerId}`);
    this.validateInterestInput(dto.interestRate, dto.interestAmount);

    const [customer, lender] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
      this.prisma.user.findFirst({ where: { id: dto.lenderId, actorType: 'LENDER' } }),
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!lender) throw new NotFoundException('Lender not found');

    if (Number(lender.availableCapital) < dto.principal) {
      throw new BadRequestException('Lender has insufficient available capital');
    }

    const interestModel = dto.interestModel ?? InterestModel.FLAT;
    const { interestRate, interestAmount } = this.calculator.calculateInterest({
      principal: dto.principal,
      tenure: dto.tenure,
      tenureType: dto.tenureType,
      interestModel,
      interestRate: dto.interestRate,
      interestAmount: dto.interestAmount,
    });

    const schedule = this.scheduleGenerator.generate({
      principal: dto.principal,
      interestRate,
      interestAmount,
      tenure: dto.tenure,
      tenureType: dto.tenureType,
      repaymentType: dto.repaymentType,
      interestModel,
      startDate: new Date(dto.startDate),
    });

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          customerId: dto.customerId,
          lenderId: dto.lenderId,
          principal: dto.principal,
          interestRate,
          interestAmount,
          tenure: dto.tenure,
          tenureType: dto.tenureType,
          repaymentType: dto.repaymentType,
          interestModel,
          startDate: new Date(dto.startDate),
          schedules: {
            create: schedule.map((item) => ({
              installmentNo: item.installmentNo,
              dueDate: item.dueDate,
              principalDue: item.principalDue,
              interestDue: item.interestDue,
              totalDue: item.totalDue,
            })),
          },
        },
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          lender: { select: { id: true, name: true } },
          schedules: { orderBy: { installmentNo: 'asc' } },
        },
      });

      await tx.user.update({
        where: { id: dto.lenderId },
        data: {
          availableCapital: { decrement: dto.principal },
          totalLent: { increment: dto.principal },
        },
      });

      return loan;
    });
  }

  async update(id: string, dto: UpdateLoanDto) {
    this.logger.log(`Updating loan ${id}`);
    await this.findOne(id);
    return this.prisma.loan.update({ where: { id }, data: dto });
  }

  private validateInterestInput(interestRate?: number, interestAmount?: number) {
    if (interestRate === undefined && interestAmount === undefined) {
      throw new BadRequestException('Either interestRate or interestAmount must be provided');
    }
    if (interestRate !== undefined && interestAmount !== undefined) {
      throw new BadRequestException('Provide either interestRate or interestAmount, not both');
    }
  }
}
