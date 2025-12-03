import * as bcrypt from 'bcrypt';
import { User } from '@project/shared';

export class UserEntity implements User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    avatar?: string;
    createdAt: Date;
    subscriptions: string[];

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }

    /**
     * Generate password hash using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Compare plain password with stored hash
     */
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Create user entity from input with hashed password
     */
    static async createWithHashedPassword(
        data: Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'subscriptions'> & { password: string }
    ): Promise<UserEntity> {
        const passwordHash = await this.hashPassword(data.password);
        return new UserEntity({
            id: crypto.randomUUID(),
            email: data.email,
            name: data.name,
            avatar: data.avatar,
            passwordHash,
            createdAt: new Date(),
            subscriptions: [],
        });
    }
}
