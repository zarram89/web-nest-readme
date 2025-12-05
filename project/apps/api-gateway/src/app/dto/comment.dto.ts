import { IsNotEmpty, IsString, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCommentDto {
    @ApiProperty({ description: 'Comment text', maxLength: 500 })
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    text: string;

    @ApiProperty({ description: 'Author ID' })
    @IsNotEmpty()
    @IsString()
    authorId: string;
}

export class CommentsQueryDto {
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
}
