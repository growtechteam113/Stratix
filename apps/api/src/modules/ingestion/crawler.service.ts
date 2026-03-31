import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly PRIVATE_IP_RANGES = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];

  async crawlUrl(url: string): Promise<string> {
    // Validate URL format
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new BadRequestException('Only HTTP and HTTPS URLs are supported');
      }
    } catch (error) {
      throw new BadRequestException('Invalid URL format');
    }

    // SSRF Protection: Resolve hostname and check if it's a private IP
    await this.validateUrl(url);

    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'STRATIX-AI/1.0 (+https://stratix.ai)',
        },
        maxRedirects: 5,
      });

      // Extract main content using cheerio
      const html = response.data;
      const text = this.extractText(html);

      if (!text || text.trim().length === 0) {
        throw new BadRequestException('No readable content found in the URL');
      }

      return text;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`Crawl error for ${url}: ${error.message}`);
        throw new BadRequestException(`Failed to crawl URL: ${error.message}`);
      }
      throw error;
    }
  }

  private async validateUrl(url: string): Promise<void> {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    try {
      const result = await dnsLookup(hostname);
      const ipAddress = result.address;

      // Check if IP is private or reserved
      if (this.isPrivateIp(ipAddress)) {
        throw new BadRequestException(
          'SSRF Protection: Private or reserved IP addresses are not allowed',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`DNS resolution failed for ${hostname}`);
    }
  }

  private isPrivateIp(ip: string): boolean {
    return this.PRIVATE_IP_RANGES.some((range) => range.test(ip));
  }

  private extractText(html: string): string {
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script').remove();
    $('style').remove();
    $('noscript').remove();

    // Extract text from body or entire document
    const text = $('body').text() || $.text();

    // Clean up whitespace
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1000000); // Limit to 1MB of text
  }
}
