import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { AcaraService } from './acara.service';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth';
import { SiswaService } from '../siswa/siswa.service';
import { SaveAcaraDto, SaveJadwalDto } from './dto/acara.dto';

@Controller('acara')
export class AcaraController {
    constructor(
        private readonly service: AcaraService,
        private readonly siswaService: SiswaService
    ) { }

    @Get()
    @ApiQuery({ name: 'siswaId', required: false })
    async get(
        @Session() session: UserSession,
        @Query("siswaId") siswaId?: string
    ) {
        if (session.user.role !== 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id);
            return await this.service.listAll({ siswaId: siswa.id });
        } else {
            return await this.service.listAll({ siswaId });
        }
    }

    @Get('jadwal')
    @ApiQuery({ name: 'siswaId', required: false })
    @ApiQuery({ name: 'acaraId', required: false })
    async getJadwal(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?: string,
        @Query('acaraId') acaraId?: string,
    ) {
        const isPrivileged = session.user.role === 'admin' || session.user.role === 'proktor';
        const filterSiswa = isPrivileged ?
            siswaId :
            (await this.siswaService.findByAccount(session.user.id)).id;

        return this.service.listAllJadwal({
            siswaId: filterSiswa,
            acaraId: acaraId,
        });
    }

    @Get('jadwal/:id')
    async getJadwalById(@Param('id') id: string) {
        return await this.service.findJadwalById(id);
    }

    @Get(':id')
    async findById(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return await this.service.findById(id);
    }

    @Get(':id/peserta')
    async listPeserta(
        @Session() session: UserSession,
        @Param('id') id: string,
    ) {
        return await this.service.listSiswa(id);
    }

    @Post()
    async saveAcara(
        @Session() session: UserSession,
        @Body() dto: SaveAcaraDto,
    ) {
        if (session.user.role !== 'admin') throw new UnauthorizedException();
        return await this.service.save(dto);
    }

    @Post(':id/jadwal')
    async saveJadwal(
        @Session() session: UserSession,
        @Param('id') acaraId: string,
        @Body() dto: SaveJadwalDto,
    ) {
        if (session.user.role !== 'admin') throw new UnauthorizedException();
        return await this.service.saveJadwal(acaraId, dto);
    }

    @Delete(':id/jadwal/:jadwalId')
    async deleteJadwal(
        @Session() session: UserSession,
        @Param('id') acaraId: string,
        @Param('jadwalId') jadwalId: string,
    ) {
        if (session.user.role !== 'admin') throw new UnauthorizedException();
        await this.service.deleteJadwal(acaraId, jadwalId);
        return { success: true };
    }
}
