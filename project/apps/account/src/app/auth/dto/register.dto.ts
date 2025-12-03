import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        description: 'User email (used as login)',
        example: 'user@example.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User full name (first and last)',
        minLength: 3,
        maxLength: 50,
        example: 'John Doe'
    })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @ApiProperty({
        description: 'User password',
        minLength: 6,
        maxLength: 12,
        example: 'password123'
    })
    @IsString()
    @MinLength(6)
    @MaxLength(12)
    password: string;

    @ApiPropertyOptional({
        description: 'Avatar file path (max 500kb, jpg/png)',
        example: '/uploads/avatar.jpg'
    })
    @IsOptional()
    @IsString()
    avatar?: string;
}
