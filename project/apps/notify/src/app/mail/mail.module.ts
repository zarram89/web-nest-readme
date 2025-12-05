import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('mail.smtp.host'),
                    port: configService.get('mail.smtp.port'),
                    secure: false,
                    ignoreTLS: true,
                },
                defaults: {
                    from: `"${configService.get('mail.from.name')}" <${configService.get('mail.from.address')}>`,
                },
                template: {
                    dir: join(__dirname, 'assets', 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
