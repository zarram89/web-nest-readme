import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment, Prisma } from '.prisma/client-blog';

@Injectable()
export class CommentsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.CommentCreateInput): Promise<Comment> {
        return this.prisma.comment.create({ data });
    }

    async findByPost(
        postId: string,
        params?: { skip?: number; take?: number }
    ): Promise<{ comments: Comment[]; total: number }> {
        const { skip, take } = params || {};

        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: { postId },
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.comment.count({ where: { postId } }),
        ]);

        return { comments, total };
    }

    async findOne(id: string): Promise<Comment | null> {
        return this.prisma.comment.findUnique({ where: { id } });
    }

    async remove(id: string): Promise<Comment> {
        return this.prisma.comment.delete({ where: { id } });
    }
}
