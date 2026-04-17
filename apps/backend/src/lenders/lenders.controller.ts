import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { LendersService } from './lenders.service';
import { CreateLenderDto } from './dto/create-lender.dto';
import { UpdateLenderDto } from './dto/update-lender.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('lenders')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LendersController {
  constructor(private readonly lendersService: LendersService) {}

  @Get()
  @RequirePermission('lenders', 'read')
  findAll(@Query() query: PaginationDto) {
    return this.lendersService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('lenders', 'read')
  findOne(@Param('id') id: string) {
    return this.lendersService.findOne(id);
  }

  @Post()
  @RequirePermission('lenders', 'create')
  create(@Body() dto: CreateLenderDto) {
    return this.lendersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('lenders', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateLenderDto) {
    return this.lendersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('lenders', 'delete')
  remove(@Param('id') id: string) {
    return this.lendersService.remove(id);
  }
}
