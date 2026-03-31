import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaClient, SourceType, SourceStatus } from '@prisma/client';
import axios from 'axios';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { OpenAI } from 'openai';

interface IngestionJobData {
  sourceId: string;
  projectId: string;
  type: SourceType;
  url?: string;
  fileKey?: string;
  mimeType?: string;
}

interface Chunk {
  id: string;
  content: string;
  embedding?: number[];
}

@Processor('ingestion')
export class IngestionProcessor {
  private readonly logger = new Logger(IngestionProcessor.name);
  private readonly prisma = new PrismaClient();
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  @Process()
  async processIngestion(job: Job<IngestionJobData>) {
    const { sourceId, type, url, fileKey, mimeType } = job.data;

    try {
      // Update source status to PROCESSING
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { status: SourceStatus.PROCESSING },
      });

      // Update job progress
      await job.progress(10);

      let extractedText = '';

      if (type === SourceType.URL) {
        this.logger.log(`Crawling URL: ${url}`);
        extractedText = await this.crawlUrl(url!);
      } else if (type === SourceType.FILE) {
        this.logger.log(`Parsing file: ${fileKey}`);
        extractedText = await this.parseFile(fileKey!, mimeType!);
      }

      await job.progress(40);

      // Chunk the text
      const chunks = await this.chunkText(extractedText);

      await job.progress(60);

      // Generate embeddings for each chunk
      const chunksWithEmbeddings: Chunk[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await this.generateEmbedding(chunks[i].content);
        chunksWithEmbeddings.push({
          id: `chunk-${i}`,
          content: chunks[i].content,
          embedding,
        });
      }

      // Save chunks to database
      for (let i = 0; i < chunksWithEmbeddings.length; i++) {
        const chunk = chunksWithEmbeddings[i];
        const createdChunk = await this.prisma.chunk.create({
          data: {
            sourceId,
            content: chunk.content,
            order: i,
          },
        });

        // Save embedding separately
        if (chunk.embedding) {
          // Convert embedding array to Buffer
          const buffer = Buffer.from(new Float32Array(chunk.embedding).buffer);
          await this.prisma.embedding.create({
            data: {
              chunkId: createdChunk.id,
              vector: buffer,
            },
          });
        }
      }

      await job.progress(90);

      // Update source status to COMPLETED
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { status: SourceStatus.COMPLETED },
      });

      await job.progress(100);

      this.logger.log(`Ingestion completed for source ${sourceId}`);
      return { sourceId, chunksCount: chunksWithEmbeddings.length };
    } catch (error) {
      this.logger.error(`Ingestion failed for source ${sourceId}: ${error}`);

      // Update source status to FAILED
      await this.prisma.source.update({
        where: { id: sourceId },
        data: { status: SourceStatus.FAILED },
      });

      throw error;
    }
  }

  private async crawlUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      // Simple text extraction from HTML
      const text = response.data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return text.substring(0, 1000000); // Limit to 1MB
    } catch (error) {
      this.logger.error(`Failed to crawl URL: ${error}`);
      throw new Error(`Failed to crawl URL: ${error}`);
    }
  }

  private async parseFile(fileKey: string, mimeType: string): Promise<string> {
    try {
      const filePath = `${process.env.STORAGE_PATH || './storage'}/${fileKey}`;

      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const fileBuffer = fs.readFileSync(filePath);

      switch (mimeType) {
        case 'application/pdf':
          return this.parsePdf(fileBuffer);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return this.parseDocx(fileBuffer);
        case 'text/plain':
          return fileBuffer.toString('utf-8');
        case 'text/html':
          return fileBuffer.toString('utf-8');
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to parse file: ${error}`);
      throw error;
    }
  }

  private async parsePdf(buffer: Buffer): Promise<string> {
    try {
      const data = await (pdfParse as any).default(buffer);
      const text = data.text || '';

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      return text.substring(0, 1000000); // Limit to 1MB
    } catch (error) {
      this.logger.error(`PDF parsing error: ${error}`);
      throw new Error('Failed to parse PDF file');
    }
  }

  private async parseDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await (mammoth as any).extractRawText({ buffer });
      const text = result.value || '';

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in DOCX');
      }

      return text.substring(0, 1000000); // Limit to 1MB
    } catch (error) {
      this.logger.error(`DOCX parsing error: ${error}`);
      throw new Error('Failed to parse DOCX file');
    }
  }

  private async chunkText(text: string, chunkSize: number = 500, overlap: number = 100): Promise<Array<{ content: string }>> {
    const chunks: Array<{ content: string }> = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.substring(start, end).trim();

      if (chunk.length > 0) {
        chunks.push({ content: chunk });
      }

      start = end - overlap;
    }

    return chunks.length > 0 ? chunks : [{ content: text }];
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Truncate text to max 8191 tokens (approximately 32k characters)
      const truncatedText = text.substring(0, 32000);

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: truncatedText,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error}`);
      // Return a zero vector on error
      return new Array(3072).fill(0);
    }
  }
}
