import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

const GROUP_SELECT = {
  id: true,
  name: true,
  isSuperAdmin: true,
  permissions: true,
  createdAt: true,
  _count: { select: { users: true } },
} as const;

@Injectable()
export class UserGroupsService {
  private readonly logger = new Logger(UserGroupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    this.logger.log('Fetching user groups');

    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.userGroup.findMany({
        where,
        select: GROUP_SELECT,
        skip: query.skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userGroup.count({ where }),
    ]);

    return { items, pagination: { pageIndex: query.pageIndex, pageSize: query.pageSize, totalItem: total } };
  }

  async findOne(id: string) {
    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      select: GROUP_SELECT,
    });
    if (!group) throw new NotFoundException(`User group ${id} not found`);
    return group;
  }

  async create(dto: CreateUserGroupDto) {
    this.logger.log(`Creating user group: ${dto.name}`);

    const exists = await this.prisma.userGroup.findUnique({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('Group name already exists');

    return this.prisma.userGroup.create({
      data: {
        name: dto.name,
        isSuperAdmin: dto.isSuperAdmin ?? false,
        permissions: dto.permissions
          ? { create: dto.permissions }
          : undefined,
      },
      select: GROUP_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserGroupDto) {
    this.logger.log(`Updating user group: ${id}`);
    await this.findOne(id);

    if (dto.name) {
      const exists = await this.prisma.userGroup.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (exists) throw new ConflictException('Group name already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.permissions !== undefined) {
        await tx.permission.deleteMany({ where: { userGroupId: id } });
      }

      return tx.userGroup.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.isSuperAdmin !== undefined && { isSuperAdmin: dto.isSuperAdmin }),
          ...(dto.permissions !== undefined && {
            permissions: { create: dto.permissions },
          }),
        },
        select: GROUP_SELECT,
      });
    });
  }

  async remove(id: string) {
    this.logger.log(`Deleting user group: ${id}`);
    await this.findOne(id);

    const usersInGroup = await this.prisma.user.count({ where: { userGroupId: id } });
    if (usersInGroup > 0) {
      throw new ConflictException('Cannot delete group with assigned users');
    }

    await this.prisma.userGroup.delete({ where: { id } });
    return { message: 'User group deleted' };
  }
}
