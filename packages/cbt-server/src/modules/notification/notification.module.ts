import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationGateway } from './notification.gateway';

@Module({
    imports: [CqrsModule],
    providers: [NotificationGateway],
    exports: [NotificationGateway],
})
export class NotificationModule {}
