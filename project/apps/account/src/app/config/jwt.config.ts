import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => {
    return {
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expiresIn: configService.get<string>('jwt.accessExpiration') as any,
        },
    };
};

export default registerAs('jwt', () => ({
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accessExpiration: (process.env.JWT_ACCESS_EXPIRATION || '15m') as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refreshExpiration: (process.env.JWT_REFRESH_EXPIRATION || '7d') as any,
}));
