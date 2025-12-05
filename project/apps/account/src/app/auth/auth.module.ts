import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getJwtConfig } from '../config/jwt.config';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFY_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [`amqp://${configService.get<string>('RABBITMQ_USER') || 'admin'}:${configService.get<string>('RABBITMQ_PASSWORD') || 'admin'}@${configService.get<string>('RABBITMQ_HOST') || 'localhost'}:${configService.get<string>('RABBITMQ_PORT') || 5672}`],
            queue: configService.get<string>('RABBITMQ_QUEUE_NOTIFY') || 'notify_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule { }
