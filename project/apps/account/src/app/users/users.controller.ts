import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersQueryDto } from './dto/users-query.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'Get users list with pagination' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    async getUsers(@Query() query: UsersQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user details' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserDetails(@Param('id') id: string) {
        return this.usersService.getUserDetails(id);
    }

    @Post('password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Current password is incorrect' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
        // In real app, get userId from JWT token
        const userId = 'current-user-id'; // Placeholder
        await this.usersService.changePassword(userId, changePasswordDto);
        return { message: 'Password changed successfully' };
    }

    @Post(':id/subscribe')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Subscribe to user' })
    @ApiParam({ name: 'id', description: 'Target user ID to subscribe to' })
    @ApiResponse({ status: 200, description: 'Successfully subscribed' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async subscribe(@Param('id') targetUserId: string) {
        // In real app, get current userId from JWT token
        const userId = 'current-user-id'; // Placeholder
        await this.usersService.subscribe(userId, targetUserId);
        return { message: 'Successfully subscribed' };
    }

    @Delete(':id/subscribe')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unsubscribe from user' })
    @ApiParam({ name: 'id', description: 'Target user ID to unsubscribe from' })
    @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async unsubscribe(@Param('id') targetUserId: string) {
        // In real app, get current userId from JWT token
        const userId = 'current-user-id'; // Placeholder
        await this.usersService.unsubscribe(userId, targetUserId);
        return { message: 'Successfully unsubscribed' };
    }
}
