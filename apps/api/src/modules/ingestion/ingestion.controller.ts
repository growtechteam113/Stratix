import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';

@Controller('sources/:sourceId/ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async startIngestion(@Param('sourceId') sourceId: string) {
    await this.ingestionService.startIngestion(sourceId);

    return {
      success: true,
      message: 'Ingestion started',
    };
  }

  @Get('progress')
  @UseGuards(JwtAuthGuard, ProjectAccessGuard)
  async getProgress(@Param('sourceId') sourceId: string) {
    const progress = await this.ingestionService.getIngestionProgress(sourceId);

    return {
      success: true,
      data: progress,
    };
  }
}
