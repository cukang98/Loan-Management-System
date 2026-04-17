import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanCalculatorService } from './loan-calculator.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanStatus } from '@ck-loan/shared';

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
  ) {}

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
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const loan = await this.prisma.loan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, fullName: true, phone: true, email: true } },
        lender: { select: { id: true, name: true } },
        repayments: { orderBy: { paidAt: 'asc' } },
      },
    });
    if (!loan) throw new NotFoundException(`Loan ${id} not found`);
    return loan;
  }

  async create(dto: CreateLoanDto) {
    this.logger.log(`Creating loan for customer: ${dto.customerId}`);

    const [customer, lender] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: dto.customerId } }),
      this.prisma.lender.findUnique({ where: { id: dto.lenderId } }),
    ]);

    if (!customer) throw new NotFoundException('Customer not found');
    if (!lender) throw new NotFoundException('Lender not found');

    if (Number(lender.availableCapital) < dto.principal) {
      throw new BadRequestException('Lender has insufficient available capital');
    }

    const calc = this.calculator.calculate({
      principal: dto.principal,
      annualInterestRate: dto.interestRate,
      tenureMonths: dto.tenureMonths,
      repaymentFrequency: dto.repaymentFrequency,
      interestModel: dto.interestModel,
    });

    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          ...dto,
          startDate: new Date(dto.startDate),
          totalRepayment: calc.totalRepayment,
          installmentAmount: calc.installmentAmount,
        },
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          lender: { select: { id: true, name: true } },
        },
      });

      await tx.lender.update({
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
}
