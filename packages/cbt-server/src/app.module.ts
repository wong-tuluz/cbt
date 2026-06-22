import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { SoalModule } from './modules/soal/soal.module';
import { PaketSoalModule } from './modules/paket-soal/paket-soal.module';
import { AcaraModule } from './modules/acara/acara.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PengerjaanModule } from './modules/pengerjaan/pengerjaan.module';
import { CoreSyncModule } from './modules/core-sync/core-sync.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      renderPath: '/*path',
      exclude: ['/api/*path', '/openapi', '/openapi/*path'],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    SoalModule,
    PaketSoalModule,
    AcaraModule,
    SettingsModule,
    PengerjaanModule,
    CoreSyncModule,
    RedisModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule { }
