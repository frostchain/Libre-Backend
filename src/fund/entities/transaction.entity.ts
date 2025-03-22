import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  investor: string;

  @Column()
  type: 'investment' | 'redemption';

  @Column({ nullable: true })
  usdAmount: number;

  @Column({ nullable: true })
  shares: number;

  @Column()
  transactionHash: string;

  @CreateDateColumn()
  timestamp: Date;
}
