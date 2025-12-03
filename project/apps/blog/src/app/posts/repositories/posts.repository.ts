import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Post, Prisma } from '.prisma/client-blog';

@Injectable()
export class PostsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return this.prisma.post.create({
            data,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                comments: true,
                likes: true,
            },
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        where?: Prisma.PostWhereInput;
        orderBy?: Prisma.PostOrderByWithRelationInput;
    }): Promise<Post[]> {
        const { skip, take, where, orderBy } = params || {};
        return this.prisma.post.findMany({
            skip,
            take,
            where,
            orderBy,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    },
                },
            },
        });
    }

    async findOne(id: string): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { id },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                comments: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                likes: true,
            },
        });
    }

    async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
        return this.prisma.post.update({
            where: { id },
            data,
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                comments: true,
                likes: true,
            },
        });
    }

    async remove(id: string): Promise<Post> {
        return this.prisma.post.delete({
            where: { id },
        });
    }
}
