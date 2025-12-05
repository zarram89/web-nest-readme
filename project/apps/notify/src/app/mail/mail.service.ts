import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) { }

    async sendWelcomeEmail(email: string, name: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Welcome to Readme!',
            template: './welcome',
            context: {
                name,
            },
        });
    }

    async sendNewPostNotification(email: string, post: any) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'New Post Notification',
            template: './new-post',
            context: {
                title: post.title,
                author: post.authorId, // In real app, we'd fetch author name
                link: `http://localhost:3000/posts/${post.id}`,
            },
        });
    }
}
