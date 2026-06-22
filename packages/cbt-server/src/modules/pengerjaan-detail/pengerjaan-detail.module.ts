import { Module } from '@nestjs/common';
import { SiswaModule } from '../siswa/siswa.module';
import { AcaraModule } from '../acara/acara.module';
import { PengerjaanModule } from '../pengerjaan/pengerjaan.module';
import { PengerjaanStateModule } from '../pengerjaan-state/pengerjaan-state.module';
import { PengerjaanDetailController } from './pengerjaan-detail.controller';
import { PengerjaanDetailService } from './pengerjaan-detail.service';

@Module({
    imports: [SiswaModule, AcaraModule, PengerjaanModule, PengerjaanStateModule],
    controllers: [PengerjaanDetailController],
    providers: [PengerjaanDetailService],
    exports: [PengerjaanDetailService],
})
export class PengerjaanDetailModule { }
