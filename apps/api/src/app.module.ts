import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { StoresModule } from './stores/stores.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CandidatesModule } from './candidates/candidates.module';
import { EmployeesModule } from './employees/employees.module';
import { IntermittentModule } from './intermittent/intermittent.module';
import { GamificationModule } from './gamification/gamification.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    CompaniesModule,
    StoresModule,
    UsersModule,
    JobsModule,
    CandidatesModule,
    EmployeesModule,
    IntermittentModule,
    GamificationModule,
    DashboardModule,
  ],
})
export class AppModule {}
