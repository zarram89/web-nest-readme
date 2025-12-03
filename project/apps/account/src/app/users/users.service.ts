import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserEntity } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UserRepository) { }

    async create(registerDto: RegisterDto): Promise<UserEntity> {
        const user = await UserEntity.createWithHashedPassword({
            email: registerDto.email,
            name: registerDto.name,
            password: registerDto.password,
            avatar: registerDto.avatar,
        });
        return this.userRepository.create(user);
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.userRepository.findById(id);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findByEmail(email);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return UserEntity.comparePassword(password, hash);
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isCurrentPasswordValid = await this.comparePassword(
            changePasswordDto.currentPassword,
            user.passwordHash
        );

        if (!isCurrentPasswordValid) {
            throw new NotFoundException('Current password is incorrect');
        }

        const newPasswordHash = await UserEntity.hashPassword(changePasswordDto.newPassword);
        await this.userRepository.update(userId, { passwordHash: newPasswordHash });
    }

    async subscribe(userId: string, targetUserId: string): Promise<UserEntity> {
        const user = await this.userRepository.addSubscription(userId, targetUserId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async unsubscribe(userId: string, targetUserId: string): Promise<UserEntity> {
        const user = await this.userRepository.removeSubscription(userId, targetUserId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async getUserDetails(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const postsCount = await this.userRepository.countPosts(userId);
        const subscribersCount = await this.userRepository.countSubscribers(userId);

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            createdAt: user.createdAt,
            postsCount,
            subscribersCount,
        };
    }

    async findAll(filters: { limit?: number; page?: number; email?: string }) {
        const { users, total } = await this.userRepository.findAll(filters);
        const { limit = 25, page = 1 } = filters;

        return {
            users: users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                createdAt: user.createdAt,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
