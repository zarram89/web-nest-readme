import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { PostsController } from './posts.controller';
import { CommentsController } from './comments.controller';
import { NewsletterController } from './newsletter.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
    }),
    HttpModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    PostsController,
    CommentsController,
    NewsletterController,
  ],
  providers: [AppService],
})
export class AppModule { }
