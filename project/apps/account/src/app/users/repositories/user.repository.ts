import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
    private users: Map<string, UserEntity> = new Map();

    async findById(id: string): Promise<UserEntity | null> {
        return this.users.get(id) || null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    async create(user: UserEntity): Promise<UserEntity> {
        this.users.set(user.id, user);
        return user;
    }

    async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
        const user = this.users.get(id);
        if (!user) {
            return null;
        }
        Object.assign(user, data);
        return user;
    }

    async delete(id: string): Promise<boolean> {
        return this.users.delete(id);
    }

    async findAll(): Promise<UserEntity[]> {
        return Array.from(this.users.values());
    }

    async addSubscription(userId: string, targetUserId: string): Promise<UserEntity | null> {
        const user = this.users.get(userId);
        if (!user) {
            return null;
        }
        if (!user.subscriptions.includes(targetUserId)) {
            user.subscriptions.push(targetUserId);
        }
        return user;
    }

    async removeSubscription(userId: string, targetUserId: string): Promise<UserEntity | null> {
        const user = this.users.get(userId);
        if (!user) {
            return null;
        }
        user.subscriptions = user.subscriptions.filter(id => id !== targetUserId);
        return user;
    }

    async countPosts(userId: string): Promise<number> {
        // This would be implemented by querying the Blog service
        // For now, return 0 as placeholder
        return 0;
    }

    async countSubscribers(userId: string): Promise<number> {
        let count = 0;
        for (const user of this.users.values()) {
            if (user.subscriptions.includes(userId)) {
                count++;
            }
        }
        return count;
    }
}
