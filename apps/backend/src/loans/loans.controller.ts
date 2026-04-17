import {
  Controller, Get, Post, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { LoansService, LoanFilterDto } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('loans')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  @RequirePermission('loans', 'read')
  findAll(@Query() query: LoanFilterDto) {
    return this.loansService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('loans', 'read')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
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
