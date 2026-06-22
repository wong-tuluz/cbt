import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PaketSoalService } from './paket-soal.service';
import { CreatePaketSoalDto, UpdatePaketSoalDto } from './dto/paket-soal.dto';
import { SavePaketSoalCommand } from './commands/save-paket-soal.command';

@Controller('paket-soal')
export class PaketSoalController {
    constructor(
        private readonly paketSoalService: PaketSoalService,
        private readonly commandBus: CommandBus,
    ) { }

    @Post()
    async create(@Body() body: CreatePaketSoalDto) {
        return this.commandBus.execute(
            new SavePaketSoalCommand(
                undefined,
                body.title,
                body.description,
                undefined,
            ),
        );
    }

    @Put(':id')
    async updatePut(@Param('id') id: string, @Body() body: CreatePaketSoalDto) {
        return this.commandBus.execute(
            new SavePaketSoalCommand(
                id,
                body.title,
                body.description,
                undefined,
            ),
        );
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: UpdatePaketSoalDto) {
        const existing = await this.paketSoalService.findById(id);
        const merged = { ...existing, ...body };
        return this.commandBus.execute(
            new SavePaketSoalCommand(
                id,
                merged.title,
                merged.description,
                merged.remoteId,
            ),
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.paketSoalService.delete(id);
        return { success: true };
    }

    @Get()
    async getAll() {
        return this.paketSoalService.findAll();
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return this.paketSoalService.findById(id);
    }

    @Get(':id/question-count')
    async getQuestionCount(@Param('id') id: string) {
        const count = await this.paketSoalService.getQuestionCount(id);
        return { count };
    }
}
