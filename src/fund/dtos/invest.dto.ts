import { ApiProperty } from '@nestjs/swagger';

export class InvestDto {
    @ApiProperty({ description: 'Address of the investor' })
    investor: string;
    
    @ApiProperty({ description: 'Investment amount in USD (6 decimals)' })
    usdAmount: number;
  }
  