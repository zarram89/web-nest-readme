import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsString,
    IsOptional,
    IsUrl,
    MinLength,
    MaxLength,
    IsArray,
    IsInt,
    Min,
    Max,
} from 'class-validator';

export enum PostType {
    VIDEO = 'VIDEO',
    TEXT = 'TEXT',
    QUOTE = 'QUOTE',
    PHOTO = 'PHOTO',
    LINK = 'LINK',
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    REPOST = 'REPOST',
}

export class CreatePostDto {
    @ApiProperty({ enum: PostType, description: 'Type of the post' })
    @IsEnum(PostType)
    type: PostType;

    @ApiPropertyOptional({
        enum: PostStatus,
        default: PostStatus.DRAFT,
        description: 'Status of the post',
    })
    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;

    @ApiProperty({ description: 'Author ID' })
    @IsString()
    authorId: string;

    // VIDEO and TEXT
    @ApiPropertyOptional({ description: 'Post title (for VIDEO and TEXT)' })
    @IsString()
    @IsOptional()
    @MinLength(20)
    @MaxLength(50)
    title?: string;

    // VIDEO
    @ApiPropertyOptional({ description: 'Video URL (for VIDEO)' })
    @IsUrl()
    @IsOptional()
    videoUrl?: string;

    // TEXT
    @ApiPropertyOptional({ description: 'Announcement (for TEXT)' })
    @IsString()
    @IsOptional()
    @MinLength(50)
    @MaxLength(255)
    announcement?: string;

    @ApiPropertyOptional({ description: 'Text content (for TEXT)' })
    @IsString()
    @IsOptional()
    @MinLength(100)
    @MaxLength(1024)
    text?: string;

    // QUOTE
    @ApiPropertyOptional({ description: 'Quote text (for QUOTE)' })
    @IsString()
    @IsOptional()
    @MinLength(20)
    @MaxLength(300)
    quoteText?: string;

    @ApiPropertyOptional({ description: 'Quote author (for QUOTE)' })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(50)
    quoteAuthor?: string;

    // PHOTO
    @ApiPropertyOptional({ description: 'Photo URL (for PHOTO)' })
    @IsUrl()
    @IsOptional()
    photoUrl?: string;

    // LINK
    @ApiPropertyOptional({ description: 'Link URL (for LINK)' })
    @IsUrl()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({ description: 'Link description (for LINK)' })
    @IsString()
    @IsOptional()
    @MaxLength(300)
    description?: string;

    // Common
    @ApiPropertyOptional({ description: 'Tag names', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tagNames?: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) { }

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
