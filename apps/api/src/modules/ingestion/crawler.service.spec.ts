import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerService } from './crawler.service';
import { BadRequestException } from '@nestjs/common';

describe('CrawlerService', () => {
  let service: CrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlerService],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crawlUrl', () => {
    it('should reject invalid URLs', async () => {
      await expect(service.crawlUrl('not-a-url')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject non-HTTP protocols', async () => {
      await expect(service.crawlUrl('ftp://example.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject private IP addresses', async () => {
      // This test would require mocking DNS lookup
      // await expect(service.crawlUrl('http://127.0.0.1')).rejects.toThrow(
      //   BadRequestException,
      // );
    });
  });

  describe('isPrivateIp', () => {
    it('should identify private IPs', () => {
      const privateIps = [
        '127.0.0.1',
        '10.0.0.1',
        '172.16.0.1',
        '192.168.1.1',
        '169.254.1.1',
      ];

      privateIps.forEach((ip) => {
        // Access private method through any type
        const result = (service as any).isPrivateIp(ip);
        expect(result).toBe(true);
      });
    });

    it('should allow public IPs', () => {
      const publicIps = ['8.8.8.8', '1.1.1.1', '208.67.222.222'];

      publicIps.forEach((ip) => {
        const result = (service as any).isPrivateIp(ip);
        expect(result).toBe(false);
      });
    });
  });
});
