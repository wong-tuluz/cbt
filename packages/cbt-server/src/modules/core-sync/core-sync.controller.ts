import { Controller, Get, Param, Post } from "@nestjs/common";
import { CoreSyncService } from "./core-sync.service";

@Controller('sync')
export class CoreSyncController {
    constructor(
        private readonly service: CoreSyncService,
    ) { }

    @Get('events')
    async listEvents() {
        return this.service.listEvents();
    }

    @Post('events/:eventId/sync')
    async syncEvent(@Param('eventId') eventId: string) {
        await this.service.syncEvent(eventId);
    }

    @Post('events/:id/push')
    async pushResults(@Param('id') acaraId: string) {
        return await this.service.pushResults(acaraId);
    }
}
