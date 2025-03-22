// src/fund/fund.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FundController } from './fund.controller';
import { FundService } from './fund.service';

describe('FundController', () => {
  let controller: FundController;
  let fundService: FundService;

  // Create a mock for the FundService methods
  const mockFundService = {
    invest: jest.fn(),
    redeem: jest.fn(),
    getBalance: jest.fn(),
    getFundMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FundController],
      providers: [{ provide: FundService, useValue: mockFundService }],
    }).compile();

    controller = module.get<FundController>(FundController);
    fundService = module.get<FundService>(FundService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invest', () => {
    it('should call fundService.invest and return its result', async () => {
      const investDto = { investor: '0xInvestor', usdAmount: 1000 };
      const expectedResult = { transactionHash: '0x123' };

      mockFundService.invest.mockResolvedValue(expectedResult);

      const result = await controller.invest(investDto);

      expect(fundService.invest).toHaveBeenCalledWith(investDto.investor, investDto.usdAmount);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('redeem', () => {
    it('should call fundService.redeem and return its result', async () => {
      const redeemDto = { investor: '0xInvestor', shares: 10 };
      const expectedResult = { transactionHash: '0xabc' };

      mockFundService.redeem.mockResolvedValue(expectedResult);

      const result = await controller.redeem(redeemDto);

      expect(fundService.redeem).toHaveBeenCalledWith(redeemDto.investor, redeemDto.shares);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getBalance', () => {
    it('should call fundService.getBalance and return its result', async () => {
      const investor = '0xInvestor';
      const expectedBalance = 100;

      mockFundService.getBalance.mockResolvedValue(expectedBalance);

      const result = await controller.getBalance(investor);

      expect(fundService.getBalance).toHaveBeenCalledWith(investor);
      expect(result).toEqual(expectedBalance);
    });
  });

  describe('getMetrics', () => {
    it('should call fundService.getFundMetrics and return its result', async () => {
      const expectedMetrics = { totalAssetValue: '1000', sharesSupply: '10', sharePrice: '100', lastUpdateTime: 1234567890 };

      mockFundService.getFundMetrics.mockResolvedValue(expectedMetrics);

      const result = await controller.getMetrics();

      expect(fundService.getFundMetrics).toHaveBeenCalled();
      expect(result).toEqual(expectedMetrics);
    });
  });
});
