import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel } from '../models/user.model';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>
    ) { }

    async create(user: UserEntity): Promise<UserEntity> {
        const newUser = new this.userModel(user);
        const savedUser = await newUser.save();
        return new UserEntity(savedUser.toObject());
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.userModel.findById(id).exec();
        return user ? new UserEntity(user.toObject()) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.userModel.findOne({ email }).exec();
        return user ? new UserEntity(user.toObject()) : null;
    }

    async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
        return updatedUser ? new UserEntity(updatedUser.toObject()) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    async addSubscription(userId: string, targetUserId: string): Promise<UserEntity | null> {
        const updatedUser = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $addToSet: { subscriptions: targetUserId } },
                { new: true }
            )
            .exec();
        return updatedUser ? new UserEntity(updatedUser.toObject()) : null;
    }

    async removeSubscription(userId: string, targetUserId: string): Promise<UserEntity | null> {
        const updatedUser = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $pull: { subscriptions: targetUserId } },
                { new: true }
            )
            .exec();
        return updatedUser ? new UserEntity(updatedUser.toObject()) : null;
    }

    async countPosts(userId: string): Promise<number> {
        // Placeholder - will be implemented via microservice communication later
        return 0;
    }

    async countSubscribers(userId: string): Promise<number> {
        return this.userModel.countDocuments({ subscriptions: userId }).exec();
    }
}
