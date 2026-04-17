import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { RepaymentsService, RepaymentFilterDto } from './repayments.service';
import { CreateRepaymentDto } from './dto/create-repayment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('repayments')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RepaymentsController {
  constructor(private readonly repaymentsService: RepaymentsService) {}

  @Get()
  @RequirePermission('repayments', 'read')
  findAll(@Query() query: RepaymentFilterDto) {
    return this.repaymentsService.findAll(query);
  }

  @Post()
  @RequirePermission('repayments', 'create')
  create(@Body() dto: CreateRepaymentDto) {
    return this.repaymentsService.create(dto);
  }
}
