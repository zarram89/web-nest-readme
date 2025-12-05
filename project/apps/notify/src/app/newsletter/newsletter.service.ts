import { Injectable } from '@nestjs/common';
import { NewsletterRepository } from './newsletter.repository';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsletterService {
    constructor(
        private readonly newsletterRepository: NewsletterRepository,
        private readonly mailService: MailService
    ) { }

    async subscribe(email: string) {
        return this.newsletterRepository.create(email);
    }

    async unsubscribe(email: string) {
        return this.newsletterRepository.unsubscribe(email);
    }

    async sendScheduledNewsletter() {
        const subscribers = await this.newsletterRepository.findAllSubscribed();

        // In a real app, we would fetch the latest posts from Blog Service here
        // For now, we'll just send a generic update
        const mockPost = {
            title: 'Weekly Digest',
            authorId: 'Readme Team',
            id: 'digest'
        };

        const results = {
            total: subscribers.length,
            sent: 0,
            failed: 0,
        };

        for (const sub of subscribers) {
            try {
                await this.mailService.sendNewPostNotification(sub.email, mockPost);
                results.sent++;
            } catch (error) {
                console.error(`Failed to send newsletter to ${sub.email}`, error);
                results.failed++;
            }
        }

        return results;
    }
}
