import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AiScoringService } from './ai-scoring.service';

@Module({
  providers: [JobsService, AiScoringService],
  controllers: [JobsController],
  exports: [JobsService, AiScoringService],
})
export class JobsModule {}
