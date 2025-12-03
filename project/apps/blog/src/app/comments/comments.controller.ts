import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsQueryDto } from './dto/comments-query.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('posts/:postId/comments')
    @ApiOperation({ summary: 'Create a comment for a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({ status: 201, description: 'Comment created successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    create(
        @Param('postId') postId: string,
        @Body() createCommentDto: CreateCommentDto
    ) {
        return this.commentsService.create(postId, createCommentDto);
    }

    @Get('posts/:postId/comments')
    @ApiOperation({ summary: 'Get comments for a post with pagination' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
    findByPost(
        @Param('postId') postId: string,
        @Query() query: CommentsQueryDto
    ) {
        return this.commentsService.findByPost(postId, query);
    }

    @Delete('comments/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    remove(@Param('id') id: string) {
        return this.commentsService.remove(id);
    }
}
