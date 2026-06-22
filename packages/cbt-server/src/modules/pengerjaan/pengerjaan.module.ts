import { Module } from '@nestjs/common';
import { SiswaModule } from '../siswa/siswa.module';
import { AcaraModule } from '../acara/acara.module';
import { PengerjaanController } from './pengerjaan.controller';
import { PengerjaanService } from './pengerjaan.service';
import { PengerjaanCronService } from './pengerjaan-cron.service';

@Module({
    imports: [SiswaModule, AcaraModule],
    controllers: [PengerjaanController],
    providers: [PengerjaanService, PengerjaanCronService],
    exports: [PengerjaanService],
})
export class PengerjaanModule { }
