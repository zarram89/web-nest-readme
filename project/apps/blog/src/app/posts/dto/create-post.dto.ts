import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsString,
    IsOptional,
    IsUrl,
    MinLength,
    MaxLength,
    IsArray,
} from 'class-validator';
import { PostType, PostStatus } from '.prisma/client-blog';

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
