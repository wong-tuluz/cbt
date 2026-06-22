import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventBus } from '@nestjs/cqrs';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { 
    PengerjaanFinishedEvent, 
    PengerjaanResetEvent, 
    PengerjaanTimeResetEvent, 
    PengerjaanWarnedEvent, 
    PengerjaanUnwarnedEvent 
} from '../pengerjaan/events/pengerjaan.events';
import { AcaraSavedEvent } from '../acara/events/acara-saved.event';
import { PaketSoalSavedEvent } from '../paket-soal/events/paket-soal-saved.event';
import { SoalSavedEvent } from '../soal/events/soal-saved.event';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Injectable()
export class NotificationGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(NotificationGateway.name);

    @WebSocketServer()
    server!: Server;

    constructor(private readonly eventBus: EventBus) {}

    onModuleInit() {
        this.eventBus.subscribe(event => {
            this.handleEvent(event);
        });
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoinRoom(client: Socket, payload: { rooms: string[] }) {
        if (payload && Array.isArray(payload.rooms)) {
            for (const room of payload.rooms) {
                client.join(room);
                this.logger.log(`Client ${client.id} joined room: ${room}`);
            }
        }
    }

    private handleEvent(event: any) {
        try {
            if (event instanceof AcaraSavedEvent) {
                this.server.emit('global_notification', { type: 'acara-saved', id: event.id });
            } else if (event instanceof PaketSoalSavedEvent) {
                this.server.emit('global_notification', { type: 'paket-soal-saved', id: event.id });
            } else if (event instanceof SoalSavedEvent) {
                this.server.emit('global_notification', { type: 'soal-saved', id: event.soalId });
            } 
            
            // Pengerjaan events
            else if (event instanceof PengerjaanFinishedEvent) {
                this.server.to(event.siswaId).to(event.pengerjaanId).emit('pengerjaan_notification', {
                    type: 'finished',
                    pengerjaanId: event.pengerjaanId
                });
            } else if (event instanceof PengerjaanResetEvent) {
                this.server.to(event.siswaId).to(event.pengerjaanId).emit('pengerjaan_notification', {
                    type: 'reset',
                    pengerjaanId: event.pengerjaanId
                });
            } else if (event instanceof PengerjaanTimeResetEvent) {
                this.server.to(event.siswaId).to(event.pengerjaanId).emit('pengerjaan_notification', {
                    type: 'time-reset',
                    pengerjaanId: event.pengerjaanId
                });
            } else if (event instanceof PengerjaanWarnedEvent) {
                this.server.to(event.siswaId).to(event.pengerjaanId).emit('pengerjaan_notification', {
                    type: 'warned',
                    pengerjaanId: event.pengerjaanId,
                    strike: event.strike
                });
            } else if (event instanceof PengerjaanUnwarnedEvent) {
                this.server.to(event.siswaId).to(event.pengerjaanId).emit('pengerjaan_notification', {
                    type: 'unwarned',
                    pengerjaanId: event.pengerjaanId
                });
            }
        } catch (error) {
            this.logger.error('Error handling event in NotificationGateway', error);
        }
    }
}
