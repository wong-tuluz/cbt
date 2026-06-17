import { Module } from '@nestjs/common';
import { SiswaModule } from '../siswa/siswa.module';
import { JadwalModule } from '../jadwal/jadwal.module';
import { PengerjaanModule } from '../pengerjaan/pengerjaan.module';
import { PengerjaanStateModule } from '../pengerjaan-state/pengerjaan-state.module';
import { AgendaModule } from '../agenda/agenda.module';
import { PengerjaanDetailController } from './pengerjaan-detail.controller';
import { PengerjaanDetailService } from './pengerjaan-detail.service';

@Module({
    imports: [SiswaModule, JadwalModule, PengerjaanModule, PengerjaanStateModule, AgendaModule],
    controllers: [PengerjaanDetailController],
    providers: [PengerjaanDetailService],
    exports: [PengerjaanDetailService],
})
export class PengerjaanDetailModule { }
