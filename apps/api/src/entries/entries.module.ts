import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { EntriesController } from './entries.controller.js';
import { EntriesService } from './entries.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [EntriesController],
  providers: [EntriesService, ClerkAuthGuard],
})
export class EntriesModule {}
