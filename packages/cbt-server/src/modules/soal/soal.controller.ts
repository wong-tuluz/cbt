import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { SoalService } from './soal.service';
import { SaveSoalCommand } from './commands/save-soal.command';
import { CreateSoalDto, UpdateSoalDto } from './dto/soal.dto';

@Controller('soal')
export class SoalController {
    constructor(
        private readonly soalService: SoalService,
        private readonly commandBus: CommandBus,
    ) { }

    @Post()
    async create(@Body() body: CreateSoalDto) {
        return this.commandBus.execute(
            new SaveSoalCommand(
                undefined,
                body.materiSoalId,
                body.type,
                body.prompt,
                body.order,
                body.weightCorrect,
                body.weightWrong,
                undefined,
                body.jawaban,
            ),
        );
    }

    @Put(':id')
    async updatePut(@Param('id') id: string, @Body() body: CreateSoalDto) {
        return this.commandBus.execute(
            new SaveSoalCommand(
                id,
                body.materiSoalId,
                body.type,
                body.prompt,
                body.order,
                body.weightCorrect,
                body.weightWrong,
                undefined,
                body.jawaban,
            ),
        );
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdateSoalDto) {
        const existing = await this.soalService.findByIdWithJawaban(id);
        if (!existing) {
            throw new NotFoundException('Soal not found');
        }
        const merged = { ...existing, ...body };
        return this.commandBus.execute(
            new SaveSoalCommand(
                id,
                merged.materiSoalId,
                merged.type,
                merged.prompt,
                merged.order,
                merged.weightCorrect,
                merged.weightWrong,
                merged.remoteId,
                merged.jawaban,
            ),
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.soalService.delete(id);
        return { success: true };
    }

    @Get()
    @ApiQuery({ name: 'materiSoalId', required: false })
    async getAll(@Query('materiSoalId') materiSoalId: string) {
        return this.soalService.findByMateriSoalId(materiSoalId);
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        const soal = await this.soalService.findByIdWithJawaban(id);

        if (!soal) {
            throw new NotFoundException('Soal not found');
        }

        return soal;
    }
}
