import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { CreatePostDto, UpdatePostDto, PostsQueryDto } from './dto/post.dto';
import { Request } from 'express';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
    private readonly blogServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.blogServiceUrl = this.configService.get<string>('BLOG_SERVICE_URL');
    }

    @Post()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiBearerAuth()
    async create(@Body() dto: CreatePostDto, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.post(`${this.blogServiceUrl}/posts`, dto, {
                headers: { Authorization: req.headers.authorization },
            }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Get()
    @ApiOperation({ summary: 'Get all posts' })
    async findAll(@Query() query: PostsQueryDto) {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.blogServiceUrl}/posts`, { params: query }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get post by ID' })
    async findOne(@Param('id') id: string) {
        const { data } = await firstValueFrom(
            this.httpService.get(`${this.blogServiceUrl}/posts/${id}`).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update post' })
    @ApiBearerAuth()
    async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.patch(`${this.blogServiceUrl}/posts/${id}`, dto, {
                headers: { Authorization: req.headers.authorization },
            }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete post' })
    @ApiBearerAuth()
    async remove(@Param('id') id: string, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.delete(`${this.blogServiceUrl}/posts/${id}`, {
                headers: { Authorization: req.headers.authorization },
            }).pipe(
                catchError((error) => {
                    throw error.response?.data || error;
                })
            )
        );
        return data;
    }

    @Post(':id/repost')
    @ApiOperation({ summary: 'Repost a post' })
    @ApiBearerAuth()
    async repost(@Param('id') id: string, @Req() req: Request) {
        const { data } = await firstValueFrom(
            this.httpService.post(`${this.blogServiceUrl}/posts/${id}/repost`, {}, {
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
