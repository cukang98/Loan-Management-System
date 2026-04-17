import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateLenderDto } from './dto/create-lender.dto';
import { UpdateLenderDto } from './dto/update-lender.dto';

@Injectable()
export class LendersService {
  private readonly logger = new Logger(LendersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching lenders');
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.lender.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lender.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const lender = await this.prisma.lender.findUnique({ where: { id } });
    if (!lender) throw new NotFoundException(`Lender ${id} not found`);
    return lender;
  }

  async create(dto: CreateLenderDto) {
    this.logger.log(`Creating lender: ${dto.name}`);
    return this.prisma.lender.create({ data: dto });
  }

  async update(id: string, dto: UpdateLenderDto) {
    this.logger.log(`Updating lender: ${id}`);
    await this.findOne(id);
    return this.prisma.lender.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    this.logger.log(`Deleting lender: ${id}`);
    await this.findOne(id);
    await this.prisma.lender.delete({ where: { id } });
    return { message: 'Lender deleted' };
  }
}
