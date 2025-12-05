import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
    smtp: {
        host: process.env.MAIL_SMTP_HOST || 'localhost',
        port: parseInt(process.env.MAIL_SMTP_PORT, 10) || 1025,
    },
    from: {
        address: process.env.MAIL_FROM_ADDRESS || 'notify@readme.local',
        name: process.env.MAIL_FROM_NAME || 'Readme',
    },
}));
