import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './auth/clerk-auth.guard.js';
import { AuthController } from './auth/auth.controller.js';
import { EntriesModule } from './entries/entries.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env.local',
    }),
    EntriesModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, ClerkAuthGuard],
})
export class AppModule {}
