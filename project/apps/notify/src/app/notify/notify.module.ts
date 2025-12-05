import { Module } from '@nestjs/common';
import { NotifyController } from './notify.controller';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [MailModule],
    controllers: [NotifyController],
})
export class NotifyModule { }
