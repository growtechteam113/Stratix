import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  async parseFile(filePath: string, mimeType: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    const fileBuffer = fs.readFileSync(filePath);

    switch (mimeType) {
      case 'application/pdf':
        return this.parsePdf(fileBuffer);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseDocx(fileBuffer);
      case 'text/plain':
        return this.parseText(fileBuffer);
      case 'text/html':
        return this.parseHtml(fileBuffer);
      default:
        throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      const data = await (pdfParse as any).default(buffer);
      const text = data.text || '';

      if (!text || text.trim().length === 0) {
        throw new BadRequestException('No text content found in PDF');
      }

      return text.substring(0, 1000000); // Limit to 1MB
    } catch (error) {
      this.logger.error(`PDF parsing error: ${error}`);
      throw new BadRequestException('Failed to parse PDF file');
    }
  }

  private async parseDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';

      if (!text || text.trim().length === 0) {
        throw new BadRequestException('No text content found in DOCX');
      }

      return text.substring(0, 1000000); // Limit to 1MB
    } catch (error) {
      this.logger.error(`DOCX parsing error: ${error}`);
      throw new BadRequestException('Failed to parse DOCX file');
    }
  }

  private parseText(buffer: Buffer): string {
    const text = buffer.toString('utf-8');

    if (!text || text.trim().length === 0) {
      throw new BadRequestException('No text content found in file');
    }

    return text.substring(0, 1000000); // Limit to 1MB
  }

  private parseHtml(buffer: Buffer): string {
    const html = buffer.toString('utf-8');

    // Simple HTML text extraction (similar to crawler)
    const text = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text || text.length === 0) {
      throw new BadRequestException('No text content found in HTML');
    }

    return text.substring(0, 1000000); // Limit to 1MB
  }
}
