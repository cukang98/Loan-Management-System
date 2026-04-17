import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserGroupsModule } from './user-groups/user-groups.module';
import { LendersModule } from './lenders/lenders.module';
import { CustomersModule } from './customers/customers.module';
import { LoansModule } from './loans/loans.module';
import { RepaymentsModule } from './repayments/repayments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    UserGroupsModule,
    LendersModule,
    CustomersModule,
    LoansModule,
    RepaymentsModule,
    DashboardModule,
  ],
})
export class AppModule {}
