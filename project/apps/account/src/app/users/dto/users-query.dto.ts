import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UsersQueryDto {
    @ApiPropertyOptional({ description: 'Number of items to return', minimum: 1, maximum: 100, default: 25 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 25;

    @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Filter by email' })
    @IsOptional()
    @IsEmail()
    email?: string;
}
