import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotifyModule } from './notify/notify.module';
import { MailModule } from './mail/mail.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import rabbitmqConfig from './config/rabbitmq.config';
import mailConfig from './config/mail.config';
import mongoConfig from './config/mongo.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [rabbitmqConfig, mailConfig, mongoConfig],
            envFilePath: 'apps/notify/.env',
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('mongo.uri'),
            }),
            inject: [ConfigService],
        }),
        NotifyModule,
        MailModule,
        NewsletterModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
