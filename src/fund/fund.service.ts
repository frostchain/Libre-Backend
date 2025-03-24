import { Injectable, Logger } from '@nestjs/common';
import { ethers, JsonRpcProvider, formatUnits, parseUnits } from 'ethers';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { TransactionEntity } from './entities/transaction.entity';
import * as FundABI from './FundABI.json';

@Injectable()
export class FundService {
  private readonly logger = new Logger(FundService.name);
  private provider: JsonRpcProvider;
  private contract: ethers.Contract;
  private redisClient: Redis;

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {
    // Initialize Ethereum provider and Redis client
    this.provider = new JsonRpcProvider(process.env.RPC_URL);
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined in the environment variables');
    }
    this.redisClient = new Redis(redisUrl);

    // Call async initialization
    this.initialize().catch((error) => {
      this.logger.error('Error during initialization', error);
      throw error;
    });
  }

  protected async initialize() {
    const signer = await this.provider.getSigner();
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('CONTRACT_ADDRESS is not defined in the environment variables');
    }
    this.contract = new ethers.Contract(contractAddress, FundABI, signer);

    // Listen for smart contract events to update cache
    this.contract.on('MetricsUpdated', async (totalAssetValue, sharesSupply, sharePrice) => {
      this.logger.log('Received MetricsUpdated event');
      const metricsData = {
        totalAssetValue: totalAssetValue.toString(),
        sharesSupply: sharesSupply.toString(),
        sharePrice: sharePrice.toString(),
        lastUpdateTime: Date.now(),
      };
      await this.updateMetricsCache(metricsData);
    });
  }

  async invest(investor: string, usdAmount: number) {
    try {
      const tx = await this.contract.invest(investor, parseUnits(usdAmount.toString(), 6));
      const receipt = await tx.wait();

      // Record the investment transaction
      const transaction = this.transactionRepository.create({
        investor,
        type: 'investment',
        usdAmount,
        transactionHash: receipt.transactionHash,
      });
      await this.transactionRepository.save(transaction);

      // Refresh fund metrics from the blockchain
      await this.updateMetricsCacheFromChain();
      return receipt;
    } catch (error) {
      this.logger.error('Error during invest', error);
      throw error;
    }
  }

  async redeem(investor: string, shares: number) {
    try {
      const tx = await this.contract.redeem(investor, parseUnits(shares.toString(), 6));
      const receipt = await tx.wait();

      // Record the redemption transaction
      const transaction = this.transactionRepository.create({
        investor,
        type: 'redemption',
        shares,
        transactionHash: receipt.transactionHash,
      });
      await this.transactionRepository.save(transaction);

      // Refresh fund metrics from the blockchain
      await this.updateMetricsCacheFromChain();
      return receipt;
    } catch (error) {
      this.logger.error('Error during redeem', error);
      throw error;
    }
  }

  async getBalance(investor: string) {
    try {
        const balance = await this.contract.balanceOf(investor);
        return formatUnits(balance, 6);
    } catch (error) {
      this.logger.error('Error fetching balance', error);
      throw error;
    }
  }

  async getFundMetrics() {
    try {
      // Try fetching metrics from the Redis cache
      const cached = await this.redisClient.get('fundMetrics');
      if (cached) {
        return JSON.parse(cached);
      }
      // On cache miss, update metrics from the blockchain
      return await this.updateMetricsCacheFromChain();
    } catch (error) {
      this.logger.error('Error fetching fund metrics', error);
      throw error;
    }
  }

  private async updateMetricsCacheFromChain() {
    try {
      const metrics = await this.contract.getFundMetrics();
      const sharePrice = await this.contract.getSharePrice();
      const metricsData = {
        totalAssetValue: formatUnits(metrics.totalAssetValue, 6).toString(),
        sharesSupply: formatUnits(metrics.sharesSupply, 6).toString(),
        lastUpdateTime: new Date(metrics.lastUpdateTime.toNumber() * 1000),
        sharePrice: formatUnits(sharePrice, 6).toString(),
      };
      await this.updateMetricsCache(metricsData);
      return metricsData;
    } catch (error) {
      this.logger.error('Error updating metrics cache from chain', error);
      throw error;
    }
  }

  private async updateMetricsCache(metricsData: any) {
    await this.redisClient.set('fundMetrics', JSON.stringify(metricsData), 'EX', 60); // Cache TTL: 60 seconds
  }
}
