import {
  Controller, Get, Post, Patch,
  Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { LoansService, LoanFilterDto } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { PreviewLoanDto } from './dto/preview-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('loans')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  /**
   * POST /loans/preview
   * Returns a schedule preview without persisting anything.
   * Must come before /:id to avoid route collision.
   */
  @Post('preview')
  @RequirePermission('loans', 'read')
  preview(@Body() dto: PreviewLoanDto) {
    return this.loansService.preview(dto);
  }

  @Get()
  @RequirePermission('loans', 'read')
  findAll(@Query() query: LoanFilterDto, @Req() req: Request & { user: any }) {
    if (req.user.actorType === 'LENDER') {
      query.lenderId = req.user.id;
    }
    return this.loansService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('loans', 'read')
  findOne(@Param('id') id: string, @Req() req: Request & { user: any }) {
    const lenderId = req.user.actorType === 'LENDER' ? req.user.id : undefined;
    return this.loansService.findOne(id, lenderId);
  }

  @Post()
  @RequirePermission('loans', 'create')
  create(@Body() dto: CreateLoanDto) {
    return this.loansService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('loans', 'update')
  update(@Param('id') id: string, @Body() dto: UpdateLoanDto) {
    return this.loansService.update(id, dto);
  }
}
