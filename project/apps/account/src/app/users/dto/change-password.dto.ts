import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Current password',
        example: 'oldpassword123'
    })
    @IsString()
    currentPassword: string;

    @ApiProperty({
        description: 'New password',
        minLength: 6,
        maxLength: 12,
        example: 'newpassword123'
    })
    @IsString()
    @MinLength(6)
    @MaxLength(12)
    newPassword: string;
}
