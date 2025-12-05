import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'newsletters', timestamps: true })
export class NewsletterModel extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop()
    userId?: string;

    @Prop({ default: true })
    subscribed: boolean;

    @Prop()
    lastSentAt?: Date;
}

export const NewsletterSchema = SchemaFactory.createForClass(NewsletterModel);
