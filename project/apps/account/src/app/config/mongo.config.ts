import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleAsyncOptions => {
    return {
        useFactory: (configService: ConfigService) => ({
            uri: getMongoString(configService),
        }),
        inject: [ConfigService],
        imports: [ConfigModule],
    };
};

const getMongoString = (configService: ConfigService) =>
    'mongodb://' +
    configService.get('MONGO_USER') +
    ':' +
    configService.get('MONGO_PASSWORD') +
    '@' +
    configService.get('MONGO_HOST') +
    ':' +
    configService.get('MONGO_PORT') +
    '/' +
    configService.get('MONGO_DB') +
    '?authSource=' +
    configService.get('MONGO_AUTH_DB');
