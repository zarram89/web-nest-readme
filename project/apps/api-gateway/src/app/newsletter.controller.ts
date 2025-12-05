import { Body, Controller, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { SubscribeDto } from './dto/newsletter.dto';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  private readonly notifyServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.notifyServiceUrl = this.configService.get<string>('NOTIFY_SERVICE_URL');
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  async subscribe(@Body() dto: SubscribeDto) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.notifyServiceUrl}/newsletter/subscribe`, dto).pipe(
        catchError((error) => {
          throw error.response?.data || error;
        })
      )
    );
    return data;
  }
}
