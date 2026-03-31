import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

interface Chunk {
  content: string;
  hash: string;
  order: number;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);
  private readonly CHUNK_SIZE = 800; // tokens (approximate)
  private readonly OVERLAP = 200; // tokens
  private readonly WORDS_PER_TOKEN = 0.75; // Rough estimate

  constructor(private readonly prisma: PrismaClient) {}

  async chunkText(text: string): Promise<Chunk[]> {
    // Split by sentences first for semantic coherence
    const sentences = this.splitSentences(text);

    // Group sentences into chunks
    const chunks: Chunk[] = [];
    let currentChunk = '';
    let order = 0;

    for (const sentence of sentences) {
      const potentialChunk = currentChunk + ' ' + sentence;
      const tokenCount = this.estimateTokens(potentialChunk);

      if (tokenCount > this.CHUNK_SIZE && currentChunk.length > 0) {
        // Save current chunk
        const hash = this.hashContent(currentChunk.trim());
        chunks.push({
          content: currentChunk.trim(),
          hash,
          order: order++,
        });

        // Start new chunk with overlap
        const overlapTokens = this.CHUNK_SIZE - this.OVERLAP;
        const overlapContent = this.getLastNTokens(currentChunk, overlapTokens);
        currentChunk = overlapContent + ' ' + sentence;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      const hash = this.hashContent(currentChunk.trim());
      chunks.push({
        content: currentChunk.trim(),
        hash,
        order: order,
      });
    }

    return chunks;
  }

  async deduplicateChunks(
    sourceId: string,
    chunks: Chunk[],
  ): Promise<Chunk[]> {
    // Get existing chunk hashes for this source
    const existingChunks = await this.prisma.chunk.findMany({
      where: { sourceId },
      select: { content: true },
    });

    const existingHashes = new Set(
      existingChunks.map((c) => this.hashContent(c.content)),
    );

    // Filter out duplicates
    const uniqueChunks = chunks.filter((chunk) => {
      if (existingHashes.has(chunk.hash)) {
        this.logger.debug(`Duplicate chunk detected: ${chunk.hash}`);
        return false;
      }
      return true;
    });

    return uniqueChunks;
  }

  private splitSentences(text: string): string[] {
    // Simple sentence splitter (can be improved with NLP)
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    return sentences;
  }

  private estimateTokens(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil(words * this.WORDS_PER_TOKEN);
  }

  private getLastNTokens(text: string, tokenCount: number): string {
    const charCount = Math.ceil(tokenCount / this.WORDS_PER_TOKEN * 4.7); // Rough estimate
    return text.slice(-charCount);
  }

  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
