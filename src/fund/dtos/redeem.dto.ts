import { ApiProperty } from '@nestjs/swagger';

export class RedeemDto {
    @ApiProperty({ description: 'Address of the investor' })
    investor: string;

    @ApiProperty({ description: 'Number of shares to redeem' })
    shares: number;
}
