import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import * as pgvector from 'pgvector/utils';

interface ChunkWithEmbedding {
  chunkId: string;
  embedding: number[];
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly openai: OpenAI;
  private readonly BATCH_SIZE = 20; // OpenAI batch processing

  constructor(private readonly prisma: PrismaClient) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateEmbeddings(
    chunks: Array<{ id: string; content: string }>,
  ): Promise<ChunkWithEmbedding[]> {
    if (chunks.length === 0) {
      return [];
    }

    const results: ChunkWithEmbedding[] = [];

    // Process in batches to avoid rate limits
    for (let i = 0; i < chunks.length; i += this.BATCH_SIZE) {
      const batch = chunks.slice(i, i + this.BATCH_SIZE);

      try {
        const embeddings = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch.map((c) => c.content),
        });

        for (let j = 0; j < batch.length; j++) {
          const embedding = embeddings.data[j];
          results.push({
            chunkId: batch[j].id,
            embedding: embedding.embedding,
          });
        }

        this.logger.debug(
          `Generated embeddings for batch ${Math.floor(i / this.BATCH_SIZE) + 1}`,
        );
      } catch (error) {
        this.logger.error(`Failed to generate embeddings: ${error}`);
        throw error;
      }
    }

    return results;
  }

  async persistEmbeddings(
    embeddings: ChunkWithEmbedding[],
  ): Promise<void> {
    for (const { chunkId, embedding } of embeddings) {
      // Convert embedding array to pgvector format
      const vectorString = pgvector.toSql(embedding);

      // Use raw query since Prisma doesn't have native pgvector support
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO embeddings ("chunkId", vector) VALUES ($1, $2::vector)`,
        chunkId,
        vectorString,
      );
    }

    this.logger.debug(`Persisted ${embeddings.length} embeddings to database`);
  }

  async searchSimilar(
    query: string,
    projectId: string,
    limit: number = 10,
  ): Promise<Array<{ chunkId: string; content: string; similarity: number }>> {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });

      const queryVector = queryEmbedding.data[0].embedding;
      const vectorString = pgvector.toSql(queryVector);

      // Search using cosine similarity
      const results = await this.prisma.$queryRawUnsafe(
        `
        SELECT 
          c.id as "chunkId",
          c.content,
          1 - (e.vector <=> $1::vector) as similarity
        FROM chunks c
        JOIN embeddings e ON c.id = e."chunkId"
        JOIN sources s ON c."sourceId" = s.id
        WHERE s."projectId" = $2
        ORDER BY similarity DESC
        LIMIT $3
        `,
        vectorString,
        projectId,
        limit,
      );

      return results as any;
    } catch (error) {
      this.logger.error(`Failed to search similar chunks: ${error}`);
      throw error;
    }
  }
}
