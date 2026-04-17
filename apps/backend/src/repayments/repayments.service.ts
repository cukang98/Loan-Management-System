import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateRepaymentDto } from './dto/create-repayment.dto';

export class RepaymentFilterDto extends PaginationDto {
  loanId?: string;
}

@Injectable()
export class RepaymentsService {
  private readonly logger = new Logger(RepaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: RepaymentFilterDto) {
    this.logger.log('Fetching repayments');
    const where = query.loanId ? { loanId: query.loanId } : {};

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
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { paidAt: 'desc' },
      }),
      this.prisma.repayment.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async create(dto: CreateRepaymentDto) {
    this.logger.log(`Recording repayment for loan: ${dto.loanId}`);

    const loan = await this.prisma.loan.findUnique({
      where: { id: dto.loanId },
      include: { repayments: { orderBy: { paidAt: 'desc' }, take: 1 } },
    });

    if (!loan) throw new NotFoundException('Loan not found');
    if (loan.status === 'COMPLETED') {
      throw new BadRequestException('Loan is already completed');
    }
    if (loan.status === 'DEFAULTED') {
      throw new BadRequestException('Cannot record repayment for a defaulted loan');
    }

    const lastRepayment = loan.repayments[0];
    const previousBalance = lastRepayment
      ? Number(lastRepayment.remainingBalance)
      : Number(loan.totalRepayment);

    const remainingBalance = Math.max(0, previousBalance - dto.paidAmount);

    return this.prisma.$transaction(async (tx) => {
      const repayment = await tx.repayment.create({
        data: {
          loanId: dto.loanId,
          paidAmount: dto.paidAmount,
          paidAt: new Date(dto.paidAt),
          remainingBalance,
          overdueDays: dto.overdueDays ?? 0,
          notes: dto.notes,
        },
      });

      if (remainingBalance === 0) {
        await tx.loan.update({
          where: { id: dto.loanId },
          data: { status: 'COMPLETED' },
        });
      }

      return repayment;
    });
  }
}
