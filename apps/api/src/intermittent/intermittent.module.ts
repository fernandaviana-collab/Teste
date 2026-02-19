import { Module } from '@nestjs/common';
import { IntermittentService } from './intermittent.service';
import { IntermittentController } from './intermittent.controller';
import { MatchesService } from './matches.service';

@Module({
  providers: [IntermittentService, MatchesService],
  controllers: [IntermittentController],
  exports: [IntermittentService],
})
export class IntermittentModule {}
