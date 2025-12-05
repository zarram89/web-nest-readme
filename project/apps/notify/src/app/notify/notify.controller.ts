import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { MailService } from '../mail/mail.service';

@Controller()
export class NotifyController {
  constructor(private readonly mailService: MailService) { }

  @EventPattern({ cmd: 'user.registered' })
  async handleUserRegistered(data: { email: string; name: string }) {
    console.log('Received user.registered event:', data);
    await this.mailService.sendWelcomeEmail(data.email, data.name);
  }

  @EventPattern({ cmd: 'post.created' })
  async handlePostCreated(data: { authorId: string; post: unknown }) {
    console.log('Received post.created event:', data);
    // In a real app, we would fetch subscribers here
    // For now, just log it or send to a test email if needed
    // await this.mailService.sendNewPostNotification('test@example.com', data.post);
  }
}
