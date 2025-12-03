import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
