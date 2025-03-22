import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundModule } from './fund/fund.module';
import { TransactionEntity } from './fund/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite', // Use your preferred database
      database: 'database.sqlite',
      entities: [TransactionEntity],
      synchronize: true,
    }),
    FundModule,
  ],
})
export class AppModule {}
