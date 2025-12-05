import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { CreateCommentDto, CommentsQueryDto } from './dto/comment.dto';
import { Request } from 'express';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
    private readonly blogServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.blogServiceUrl = this.configService.get<string>('BLOG_SERVICE_URL');
    }

    @Post('posts/:postId')
    @ApiOperation({ summary: 'Create a comment' })
    @ApiBearerAuth()
    async create(@Param('postId') postId: string, @Body() dto: CreateCommentDto, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.post(`${this.blogServiceUrl}/comments/${postId}`, dto, {
                headers: { Authorization: req.headers.authorization },
            }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Get('posts/:postId')
    @ApiOperation({ summary: 'Get comments for post' })
    async findAll(@Param('postId') postId: string, @Query() query: CommentsQueryDto) {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.blogServiceUrl}/comments/${postId}`, { params: query }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete comment' })
    @ApiBearerAuth()
    async remove(@Param('id') id: string, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.delete(`${this.blogServiceUrl}/comments/${id}`, {
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
