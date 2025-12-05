import { Controller, Get, Param, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
    private readonly accountServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.accountServiceUrl = this.configService.get<string>('ACCOUNT_SERVICE_URL');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiBearerAuth()
    async getUser(@Param('id') id: string, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.accountServiceUrl}/users/${id}`, {
                headers: { Authorization: req.headers.authorization },
            }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }
}
