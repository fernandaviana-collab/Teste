import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  providers: [CandidatesService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
