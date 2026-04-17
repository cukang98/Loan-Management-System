import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('user-groups')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @Get()
  @RequirePermission('user-groups', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.userGroupsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('user-groups', 'read')
  findOne(@Param('id') id: string) {
    return this.userGroupsService.findOne(id);
  }

  @Post()
  @RequirePermission('user-groups', 'create')
  create(@Body() dto: CreateUserGroupDto) {
    return this.userGroupsService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('user-groups', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateUserGroupDto) {
    return this.userGroupsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('user-groups', 'delete')
  remove(@Param('id') id: string) {
    return this.userGroupsService.remove(id);
  }
}
