import { Module } from '@nestjs/common';
import { LendersService } from './lenders.service';
import { LendersController } from './lenders.controller';

@Module({
  providers: [LendersService],
  controllers: [LendersController],
})
export class LendersModule {}
