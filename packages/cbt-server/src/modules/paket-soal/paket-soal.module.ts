import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaketSoalController } from './paket-soal.controller';
import { PaketSoalService } from './paket-soal.service';
import { PaketSoalRepository } from './repository/paket-soal.repository';
import { SavePaketSoalHandler } from './commands/save-paket-soal.handler';

@Module({
    imports: [CqrsModule],
    controllers: [PaketSoalController],
    providers: [
        PaketSoalService,
        PaketSoalRepository,
        SavePaketSoalHandler,
    ],
    exports: [
        PaketSoalService,
        PaketSoalRepository,
    ],
})
export class PaketSoalModule { }
