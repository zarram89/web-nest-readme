import { Injectable } from '@nestjs/common';
import { PostsRepository } from './repositories/posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PostStatus } from '.prisma/client-blog';

@Injectable()
export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly prisma: PrismaService
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

        return this.postsRepository.create({
            ...postData,
            publishedAt: postData.status === PostStatus.PUBLISHED ? new Date() : null,
            tags: tagConnections.length > 0 ? { create: tagConnections } : undefined,
        });
    }

    async findAll() {
        return this.postsRepository.findAll({
            where: { status: PostStatus.PUBLISHED },
            orderBy: { createdAt: 'desc' },
            take: 25,
        });
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
