import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SiswaModule } from '../siswa/siswa.module';
import { AcaraModule } from '../acara/acara.module';
import { PengerjaanController, PengerjaanDetailController } from './pengerjaan.controller';
import { PengerjaanService } from './pengerjaan.service';
import { PengerjaanCronService } from './pengerjaan-cron.service';
import { PengerjaanStateService } from './pengerjaan-state.service';
import { PengerjaanDetailService } from './pengerjaan-detail.service';
import { PengerjaanRepository } from './repository/pengerjaan.repository';
import { CommandHandlers } from './commands/pengerjaan.handlers';

@Module({
    imports: [CqrsModule, SiswaModule, AcaraModule],
    controllers: [PengerjaanController, PengerjaanDetailController],
    providers: [
        PengerjaanService,
        PengerjaanCronService,
        PengerjaanStateService,
        PengerjaanDetailService,
        PengerjaanRepository,
        ...CommandHandlers
    ],
    exports: [PengerjaanService, PengerjaanStateService, PengerjaanDetailService],
})
export class PengerjaanModule { }
