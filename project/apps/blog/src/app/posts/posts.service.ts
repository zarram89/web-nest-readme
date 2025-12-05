import { Injectable, Inject } from '@nestjs/common';
import { PostsRepository } from './repositories/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus } from '.prisma/client-blog';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly prisma: PrismaService,
        @Inject('NOTIFY_SERVICE') private readonly notifyClient: ClientProxy,
    ) { }

    async create(createPostDto: CreatePostDto) {
        const { tagNames, ...postData } = createPostDto;

        // Handle tags
        const tagConnections = tagNames
            ? await Promise.all(
                tagNames.map(async (name) => {
                    // Find or create tag
                    const tag = await this.prisma.tag.upsert({
                        where: { name },
                        update: {},
                        create: { name },
                    });
                    return { tagId: tag.id };
                })
            )
            : [];

        const newPost = await this.postsRepository.create({
            ...postData,
            publishedAt: postData.status === PostStatus.PUBLISHED ? new Date() : null,
            tags: tagConnections.length > 0 ? { create: tagConnections } : undefined,
        });

        this.notifyClient.emit({ cmd: 'post.created' }, {
            authorId: newPost.authorId,
            post: newPost
        }).subscribe();

        return newPost;
    }

    async findAll(query?: {
        limit?: number;
        page?: number;
        type?: string;
        status?: string;
        authorId?: string;
        tag?: string;
        sortBy?: string;
        sortOrder?: string;
    }) {
        const {
            limit = 25,
            page = 1,
            type,
            status,
            authorId,
            tag,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query || {};

        const skip = (page - 1) * limit;
        const where: any = {};

        if (type) where.type = type.toUpperCase();
        if (status) where.status = status.toUpperCase();
        if (authorId) where.authorId = authorId;
        if (tag) {
            where.tags = {
                some: {
                    tag: {
                        name: {
                            equals: tag,
                            mode: 'insensitive',
                        },
                    },
                },
            };
        }

        const orderBy: any = {};
        if (sortBy === 'likesCount' || sortBy === 'commentsCount') {
            orderBy[sortBy.replace('Count', '')] = { _count: sortOrder };
        } else {
            orderBy[sortBy] = sortOrder;
        }

        const [posts, total] = await Promise.all([
            this.postsRepository.findAll({ where, skip, take: limit, orderBy }),
            this.postsRepository.count(where),
        ]);

        return {
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        return this.postsRepository.findOne(id);
    }

    async update(id: string, updatePostDto: UpdatePostDto) {
        const { tagNames, ...postData } = updatePostDto;

        // Handle status change
        if (postData.status === PostStatus.PUBLISHED) {
            postData['publishedAt'] = new Date();
        }

        // Handle tags update if provided
        if (tagNames) {
            const tagConnections = await Promise.all(
                tagNames.map(async (name) => {
                    const tag = await this.prisma.tag.upsert({
                        where: { name },
                        update: {},
                        create: { name },
                    });
                    return { tagId: tag.id };
                })
            );

            return this.postsRepository.update(id, {
                ...postData,
                tags: {
                    deleteMany: {}, // Remove existing tags
                    create: tagConnections, // Add new tags
                },
            });
        }

        return this.postsRepository.update(id, postData);
    }

    async remove(id: string) {
        return this.postsRepository.remove(id);
    }
}
