import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { SoalModule } from './modules/soal/soal.module';
import { PaketSoalModule } from './modules/paket-soal/paket-soal.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { JadwalModule } from './modules/jadwal/jadwal.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PengerjaanModule } from './modules/pengerjaan/pengerjaan.module';
import { PengerjaanStateModule } from './modules/pengerjaan-state/pengerjaan-state.module';
import { PengerjaanDetailModule } from './modules/pengerjaan-detail/pengerjaan-detail.module';
import { CoreSyncModule } from './modules/core-sync/core-sync.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
    AgendaModule,
    JadwalModule,
    SettingsModule,
    PengerjaanModule,
    PengerjaanStateModule,
    PengerjaanDetailModule,
    CoreSyncModule,
    RedisModule,
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
