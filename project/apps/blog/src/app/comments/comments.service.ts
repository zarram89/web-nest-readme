import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './repositories/comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(private readonly commentsRepository: CommentsRepository) { }

    async create(postId: string, createCommentDto: CreateCommentDto) {
        return this.commentsRepository.create({
            text: createCommentDto.text,
            userId: createCommentDto.authorId,
            post: { connect: { id: postId } },
        });
    }

    async findByPost(postId: string, query: { limit?: number; page?: number }) {
        const { limit = 25, page = 1 } = query;
        const skip = (page - 1) * limit;

        const { comments, total } = await this.commentsRepository.findByPost(postId, {
            skip,
            take: limit,
        });

        return {
            comments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async remove(id: string) {
        const comment = await this.commentsRepository.findOne(id);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return this.commentsRepository.remove(id);
    }
}
