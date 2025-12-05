import { Body, Controller, Post, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    private readonly accountServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.accountServiceUrl = this.configService.get<string>('ACCOUNT_SERVICE_URL');
    }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() dto: RegisterDto) {
        const { data } = await firstValueFrom(
            this.httpService.post(`${this.accountServiceUrl}/auth/register`, dto).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    async login(@Body() dto: LoginDto) {
        const { data } = await firstValueFrom(
            this.httpService.post(`${this.accountServiceUrl}/auth/login`, dto).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh tokens' })
    async refresh(@Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.post(
                `${this.accountServiceUrl}/auth/refresh`,
                {},
                {
                    headers: { Authorization: req.headers.authorization },
                }
            ).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }
}
