import { Controller, Post, Delete, Param, Body } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    @Post('send')
    async sendNewsletter() {
        return this.newsletterService.sendScheduledNewsletter();
    }

    @Post('subscribe')
    async subscribe(@Body('email') email: string) {
        return this.newsletterService.subscribe(email);
    }

    @Delete('unsubscribe/:email')
    async unsubscribe(@Param('email') email: string) {
        return this.newsletterService.unsubscribe(email);
    }
}
