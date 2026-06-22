import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AcaraController } from './acara.controller';
import { AcaraService } from './acara.service';
import { AcaraRepository } from './repository/acara.repository';
import { SaveAcaraHandler } from './commands/save-acara.handler';
import { PaketSoalModule } from '../paket-soal/paket-soal.module';
import { SettingsModule } from '../settings/settings.module';
import { SiswaModule } from '../siswa/siswa.module';

@Module({
    imports: [
        CqrsModule,
        PaketSoalModule,
        SettingsModule,
        SiswaModule,
    ],
    controllers: [AcaraController],
    providers: [
        AcaraService,
        AcaraRepository,
        SaveAcaraHandler,
    ],
    exports: [
        AcaraService,
        AcaraRepository,
    ],
})
export class AcaraModule { }
