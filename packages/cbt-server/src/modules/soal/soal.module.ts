import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SoalController } from './soal.controller';
import { SoalService } from './soal.service';
import { SoalRepository } from './repository/soal.repository';
import { SaveSoalHandler } from './commands/save-soal.handler';

@Module({
    imports: [CqrsModule],
    controllers: [SoalController],
    providers: [
        SoalService,
        SoalRepository,
        SaveSoalHandler,
    ],
    exports: [
        SoalService,
        SoalRepository,
    ],
})
export class SoalModule { }

