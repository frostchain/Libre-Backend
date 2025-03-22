import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundController } from './fund.controller';
import { FundService } from './fund.service';
import { TransactionEntity } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [FundController],
  providers: [FundService],
})
export class FundModule {}
