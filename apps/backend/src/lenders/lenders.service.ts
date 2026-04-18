import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateLenderDto } from './dto/create-lender.dto';
import { UpdateLenderDto } from './dto/update-lender.dto';

const LENDER_SELECT = {
  id: true,
  userId: true,
  email: true,
  name: true,
  isActive: true,
  actorType: true,
  availableCapital: true,
  totalLent: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class LendersService {
  private readonly logger = new Logger(LendersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching lenders');

    const where: any = { actorType: 'LENDER' };
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: LENDER_SELECT,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, pagination: { pageIndex: query.pageIndex, pageSize: query.pageSize, totalItem: total } };
  }

  async findOne(id: string) {
    const lender = await this.prisma.user.findFirst({
      where: { id, actorType: 'LENDER' },
      select: LENDER_SELECT,
    });
    if (!lender) throw new NotFoundException(`Lender ${id} not found`);
    return lender;
  }

  async create(dto: CreateLenderDto) {
    this.logger.log(`Creating lender: ${dto.name}`);

    const exists = await this.prisma.user.findUnique({ where: { userId: dto.userId } });
    if (exists) throw new ConflictException('User ID already in use');

    if (dto.email) {
      const emailExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailExists) throw new ConflictException('Email already in use');
    }

    const password = await bcrypt.hash(dto.password, 12);

    return this.prisma.user.create({
      data: {
        userId: dto.userId,
        password,
        name: dto.name,
        email: dto.email,
        actorType: 'LENDER',
        availableCapital: dto.availableCapital,
        totalLent: 0,
      },
      select: LENDER_SELECT,
    });
  }

  async update(id: string, dto: UpdateLenderDto) {
    this.logger.log(`Updating lender: ${id}`);
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: LENDER_SELECT,
    });
  }

  async remove(id: string) {
    this.logger.log(`Deleting lender: ${id}`);
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Lender deleted' };
  }
}
