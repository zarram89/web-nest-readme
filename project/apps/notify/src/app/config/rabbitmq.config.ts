import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    user: process.env.RABBITMQ_USER || 'admin',
    password: process.env.RABBITMQ_PASSWORD || 'admin',
    queue: process.env.RABBITMQ_QUEUE_NOTIFY || 'notify_queue',
}));
