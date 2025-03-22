// src/fund/fund.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FundService } from './fund.service';
import { Repository } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('FundService', () => {
  let service: FundService;
  let repository: Repository<TransactionEntity>;

  // Create mocks for the repository, smart contract, and Redis client.
  const mockTransactionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockContract = {
    invest: jest.fn(),
    redeem: jest.fn(),
    balanceOf: jest.fn(),
    getFundMetrics: jest.fn(),
    getSharePrice: jest.fn(),
    on: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundService,
        {
          provide: getRepositoryToken(TransactionEntity),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<FundService>(FundService);
    repository = module.get<Repository<TransactionEntity>>(getRepositoryToken(TransactionEntity));

    // Override provider, contract, and redisClient with our mocks.
    // Since onModuleInit is automatically called by Nest when the module initializes,
    // we override it manually for testing.
    service['provider'] = { getSigner: jest.fn().mockResolvedValue({}) } as any;
    service['contract'] = mockContract as any;
    service['redisClient'] = mockRedis as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invest', () => {
    it('should call contract.invest and record a transaction', async () => {
      // Arrange
      const fakeReceipt = { transactionHash: '0x123' };
      const fakeTx = { wait: jest.fn().mockResolvedValue(fakeReceipt) };
      mockContract.invest.mockResolvedValue(fakeTx);
      mockTransactionRepository.create.mockReturnValue({});
      mockTransactionRepository.save.mockResolvedValue(true);

      // For updateMetricsCacheFromChain simulation
      mockContract.getFundMetrics.mockResolvedValue({
        totalAssetValue: { toString: () => '1000' },
        sharesSupply: { toString: () => '10' },
        lastUpdateTime: { toNumber: () => 1234567890 },
      });
      mockContract.getSharePrice.mockResolvedValue({ toString: () => '100' });

      // Act
      const result = await service.invest('0xInvestor', 1000);

      // Assert
      expect(mockContract.invest).toHaveBeenCalledWith('0xInvestor', 1000);
      expect(fakeTx.wait).toHaveBeenCalled();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        investor: '0xInvestor',
        type: 'investment',
        usdAmount: 1000,
        transactionHash: '0x123',
      });
      expect(result).toEqual(fakeReceipt);
    });
  });

  describe('redeem', () => {
    it('should call contract.redeem and record a transaction', async () => {
      // Arrange
      const fakeReceipt = { transactionHash: '0xabc' };
      const fakeTx = { wait: jest.fn().mockResolvedValue(fakeReceipt) };
      mockContract.redeem.mockResolvedValue(fakeTx);
      mockTransactionRepository.create.mockReturnValue({});
      mockTransactionRepository.save.mockResolvedValue(true);

      // For updateMetricsCacheFromChain simulation
      mockContract.getFundMetrics.mockResolvedValue({
        totalAssetValue: { toString: () => '900' },
        sharesSupply: { toString: () => '9' },
        lastUpdateTime: { toNumber: () => 1234567891 },
      });
      mockContract.getSharePrice.mockResolvedValue({ toString: () => '110' });

      // Act
      const result = await service.redeem('0xInvestor', 5);

      // Assert
      expect(mockContract.redeem).toHaveBeenCalledWith('0xInvestor', 5);
      expect(fakeTx.wait).toHaveBeenCalled();
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        investor: '0xInvestor',
        type: 'redemption',
        shares: 5,
        transactionHash: '0xabc',
      });
      expect(result).toEqual(fakeReceipt);
    });
  });

  describe('getBalance', () => {
    it('should return the investor balance', async () => {
      // Arrange
      mockContract.balanceOf.mockResolvedValue(50);

      // Act
      const balance = await service.getBalance('0xInvestor');

      // Assert
      expect(mockContract.balanceOf).toHaveBeenCalledWith('0xInvestor');
      expect(balance).toEqual(50);
    });
  });

  describe('getFundMetrics', () => {
    it('should return cached metrics if available', async () => {
      // Arrange
      const cachedMetrics = JSON.stringify({ totalAssetValue: '1000' });
      mockRedis.get.mockResolvedValue(cachedMetrics);

      // Act
      const metrics = await service.getFundMetrics();

      // Assert
      expect(mockRedis.get).toHaveBeenCalledWith('fundMetrics');
      expect(metrics).toEqual(JSON.parse(cachedMetrics));
    });

    it('should update cache and return metrics on cache miss', async () => {
      // Arrange
      mockRedis.get.mockResolvedValue(null);
      const fakeMetrics = {
        totalAssetValue: { toString: () => '2000' },
        sharesSupply: { toString: () => '20' },
        lastUpdateTime: { toNumber: () => 987654321 },
      };
      const fakeSharePrice = { toString: () => '200' };
      mockContract.getFundMetrics.mockResolvedValue(fakeMetrics);
      mockContract.getSharePrice.mockResolvedValue(fakeSharePrice);

      // Act
      const metrics = await service.getFundMetrics();

      // Assert
      expect(mockContract.getFundMetrics).toHaveBeenCalled();
      expect(mockContract.getSharePrice).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith(
        'fundMetrics',
        JSON.stringify({
          totalAssetValue: '2000',
          sharesSupply: '20',
          lastUpdateTime: 987654321,
          sharePrice: '200',
        }),
        'EX',
        60,
      );
      expect(metrics).toEqual({
        totalAssetValue: '2000',
        sharesSupply: '20',
        lastUpdateTime: 987654321,
        sharePrice: '200',
      });
    });
  });


});
