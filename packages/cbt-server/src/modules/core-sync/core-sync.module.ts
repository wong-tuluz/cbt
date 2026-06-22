import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CoreSyncController } from './core-sync.controller';
import { CoreSyncService } from './core-sync.service';
import { SettingsModule } from '../settings/settings.module';
import { AcaraModule } from '../acara/acara.module';
import { PaketSoalModule } from '../paket-soal/paket-soal.module';
import { SoalModule } from '../soal/soal.module';
import { SiswaModule } from '../siswa/siswa.module';

@Module({
    imports: [
        HttpModule,
        SettingsModule,
        AcaraModule,
        PaketSoalModule,
        SoalModule,
        SiswaModule
    ],
    controllers: [CoreSyncController],
    providers: [CoreSyncService],
})
export class CoreSyncModule { }