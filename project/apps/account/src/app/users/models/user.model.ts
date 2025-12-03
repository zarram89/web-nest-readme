import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '@project/shared';

@Schema({
    collection: 'users',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class UserModel extends Document implements User {
    @Prop()
    id: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    avatar?: string;

    @Prop({ type: [String], default: [] })
    subscriptions: string[];

    // createdAt and updatedAt are automatically added by timestamps: true
    createdAt: Date;
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
