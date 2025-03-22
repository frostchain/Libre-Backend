import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FundService } from './fund.service';
import { InvestDto } from './dtos/invest.dto';
import { RedeemDto } from './dtos/redeem.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('fund')
@Controller('fund')
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Post('invest')
  @ApiOperation({ summary: 'Process an investment transaction' })
  async invest(@Body() investDto: InvestDto) {
    return this.fundService.invest(investDto.investor, investDto.usdAmount);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Process a redemption transaction' })
  async redeem(@Body() redeemDto: RedeemDto) {
    return this.fundService.redeem(redeemDto.investor, redeemDto.shares);
  }

  @Get('balance/:investor')
  @ApiOperation({ summary: 'Retrieve investor balance' })
  async getBalance(@Param('investor') investor: string) {
    return this.fundService.getBalance(investor);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Retrieve current fund metrics' })
  async getMetrics() {
    return this.fundService.getFundMetrics();
  }
}
