import { Injectable } from "@nestjs/common";
import { PengerjaanService } from "../pengerjaan/pengerjaan.service";
import { SiswaService } from "../siswa/siswa.service";
import { JadwalService } from "../jadwal/jadwal.service";
import { PengerjaanStateService } from "../pengerjaan-state/pengerjaan-state.service";
import { AgendaService } from "../agenda/agenda.service";

@Injectable()
export class PengerjaanDetailService {
    constructor(
        private readonly stateService: PengerjaanStateService,
        private readonly pengerjaanService: PengerjaanService,
        private readonly siswaService: SiswaService,
        private readonly jadwalService: JadwalService,
        private readonly agendaService: AgendaService,
    ) { }

    async listAll(filter?: {
        siswaId?: string,
        jadwalId?: string,
        status?: any
    }) {
        const data = await this.pengerjaanService.listAll(filter)

        const res = Promise.all(data.map(async x => {
            const state = await this.stateService.getState(x.id);
            const jadwal = await this.jadwalService.findById(x.jadwalId);
            const agenda = await this.agendaService.findById(jadwal.agendaId);
            const siswa = await this.siswaService.findById(x.siswaId);

            return {
                id: x.id,
                status: x.status,
                timeLimit: x.timeLimit,
                finishedAt: x.finishedAt,
                questionCount: state.questions.length,
                questionAnswered: state.questions.filter((q: any) => q.isAnswered).length,
                strike: state.strike,
                jadwal: { ...jadwal, agenda },
                siswa
            }
        }))

        return res
    }
}
