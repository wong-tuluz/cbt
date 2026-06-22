import { Get, Query, Post, Body, Param, UnauthorizedException, Controller } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Session } from '@thallesp/nestjs-better-auth'
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { SiswaService } from '../siswa/siswa.service';
import { PengerjaanService } from './pengerjaan.service';
import { PengerjaanStateService } from './pengerjaan-state.service';
import { PengerjaanDetailService } from './pengerjaan-detail.service';
import { PengerjaanRepository } from './repository/pengerjaan.repository';
import type { SessionStatus } from './pengerjaan.service';

const CreatePengerjaanSchema = z.object({
    jadwalId: z.string(),
    token: z.string()
});
export class CreatePengerjaanDto extends createZodDto(CreatePengerjaanSchema) { }

const SessionActionSchema = z.object({
    soalId: z.string().uuid(),
    marked: z.boolean().optional(),
    jawaban: z.array(
        z.object({
            jawabanSoalId: z.string().uuid().nullable(),
            value: z.string().nullable(),
        }),
    ),
});
export class SessionActionDto extends createZodDto(SessionActionSchema) { }

@Controller('pengerjaan')
export class PengerjaanController {
    constructor(
        private readonly siswaService: SiswaService,
        private readonly pengerjaanService: PengerjaanService,
        private readonly stateService: PengerjaanStateService,
        private readonly pengerjaanRepository: PengerjaanRepository,
    ) { }

    @Get()
    @ApiQuery({ name: 'siswaId', required: false })
    @ApiQuery({ name: 'jadwalId', required: false })
    @ApiQuery({ name: 'status', required: false, enum: ['in_progress', 'finished'] })
    async listAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?: string,
        @Query('jadwalId') jadwalId?: string,
        @Query('status') status?: SessionStatus,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            siswaId = siswa.id
        }

        return await this.pengerjaanService.listAll({
            siswaId,
            jadwalId,
            status,
        });
    }

    @Get(':id')
    async findById(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        return await this.pengerjaanService.findById(sessionId);
    }

    @Get(':id/state')
    async getSessionState(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        return await this.stateService.getState(sessionId);
    }

    @Get(':id/result')
    async getSessionResult(
        @Session() session: UserSession,
        @Param('id') sessionId: string,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        return await this.stateService.getResult(sessionId);
    }

    @Get(':id/events')
    async getSessionEvents(
        @Session() session: UserSession,
        @Param('id') sessionId: string,
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.pengerjaanRepository.getEvents(sessionId);
    }

    @Post(':id/submit')
    async submitAction(
        @Session() session: UserSession,
        @Param('id') sessionId: string,
        @Body() body: SessionActionDto,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        await this.stateService.submitAction({
            pengerjaanId: sessionId,
            marked: body.marked,
            soalId: body.soalId,
            jawaban: body.jawaban,
        });

        return { success: true };
    }

    @Post(':id/finish')
    async finish(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            await this.pengerjaanService.hasAccess(sessionId, siswa.id)
        }

        return await this.pengerjaanService.finish(sessionId);
    }

    @Post(':id/reset')
    async reset(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.pengerjaanService.reset(sessionId);
    }

    @Post('reset-all')
    async resetAll(
        @Session() session: UserSession,
        @Query('jadwalId') jadwalId: string
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.pengerjaanService.resetAllByJadwal(jadwalId);
    }

    @Post(':id/reset-time')
    async resetTime(
        @Session() session: UserSession,
        @Param('id') sessionId: string
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.pengerjaanService.resetTime(sessionId);
    }

    @Post('reset-time-all')
    async resetTimeAll(
        @Session() session: UserSession,
        @Query('jadwalId') jadwalId: string
    ) {
        if (session.user.role != 'admin') {
            throw new UnauthorizedException();
        }

        return await this.pengerjaanService.resetTimeByJadwal(jadwalId);
    }

    @Post(':id/warn')
    async warn(
        @Param('id') sessionId: string
    ) {
        return await this.pengerjaanService.warn(sessionId);
    }

    @Post(':id/unwarn')
    async unwarn(
        @Param('id') sessionId: string
    ) {
        return await this.pengerjaanService.unwarn(sessionId);
    }

    @Post()
    async create(
        @Session() session: UserSession,
        @Body() body: CreatePengerjaanDto
    ) {
        if (session.user.role == 'admin') {
            throw new UnauthorizedException();
        }

        const siswa = await this.siswaService.findByAccount(session.user.id)
        return await this.pengerjaanService.create(
            siswa.id,
            body.jadwalId,
            body.token
        );
    }
}

@Controller('pengerjaan-detail')
export class PengerjaanDetailController {
    constructor(
        private readonly service: PengerjaanDetailService,
        private readonly siswaService: SiswaService
    ) { }

    @Get()
    @ApiQuery({ name: 'siswaId', required: false })
    @ApiQuery({ name: 'jadwalId', required: false })
    @ApiQuery({ name: 'status', required: false })
    async listAll(
        @Session() session: UserSession,
        @Query('siswaId') siswaId?: string,
        @Query('jadwalId') jadwalId?: string,
        @Query('status') status?: string,
    ) {
        if (session.user.role != 'admin') {
            const siswa = await this.siswaService.findByAccount(session.user.id)
            siswaId = siswa.id
        }

        return await this.service.listAll({
            siswaId,
            jadwalId,
            status,
        });
    }
}
