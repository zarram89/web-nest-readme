import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterRepository } from './newsletter.repository';
import { NewsletterModel, NewsletterSchema } from './newsletter.model';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NewsletterModel.name, schema: NewsletterSchema },
    ]),
    MailModule,
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterRepository],
  exports: [NewsletterService],
})
export class NewsletterModule { }
