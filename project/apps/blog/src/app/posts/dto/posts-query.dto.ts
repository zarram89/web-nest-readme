import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum PostTypeFilter {
    VIDEO = 'video',
    TEXT = 'text',
    QUOTE = 'quote',
    PHOTO = 'photo',
    LINK = 'link',
}

export enum PostStatusFilter {
    DRAFT = 'draft',
    PUBLISHED = 'published',
}

export enum SortByOption {
    CREATED_AT = 'createdAt',
    PUBLISHED_AT = 'publishedAt',
    LIKES_COUNT = 'likesCount',
    COMMENTS_COUNT = 'commentsCount',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class PostsQueryDto {
    @ApiPropertyOptional({ description: 'Number of items to return', minimum: 1, maximum: 50, default: 25 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 25;

    @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ enum: PostTypeFilter, description: 'Filter by post type' })
    @IsOptional()
    @IsEnum(PostTypeFilter)
    type?: PostTypeFilter;

    @ApiPropertyOptional({ enum: PostStatusFilter, description: 'Filter by post status' })
    @IsOptional()
    @IsEnum(PostStatusFilter)
    status?: PostStatusFilter;

    @ApiPropertyOptional({ description: 'Filter by author ID' })
    @IsOptional()
    @IsString()
    authorId?: string;

    @ApiPropertyOptional({ description: 'Filter by tag name' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ enum: SortByOption, description: 'Sort by field', default: SortByOption.CREATED_AT })
    @IsOptional()
    @IsEnum(SortByOption)
    sortBy?: SortByOption = SortByOption.CREATED_AT;

    @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order', default: SortOrder.DESC })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
