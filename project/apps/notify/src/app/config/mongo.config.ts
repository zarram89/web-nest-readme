import { registerAs } from '@nestjs/config';

export default registerAs('mongo', () => ({
    uri: `mongodb://${process.env.MONGO_USER || 'admin'}:${process.env.MONGO_PASSWORD || 'admin'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27019}/${process.env.MONGO_DATABASE || 'readme-notify'}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`,
}));
