import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsletterModel } from './newsletter.model';

@Injectable()
export class NewsletterRepository {
    constructor(
        @InjectModel(NewsletterModel.name)
        private readonly newsletterModel: Model<NewsletterModel>
    ) { }

    async create(email: string, userId?: string): Promise<NewsletterModel> {
        const exists = await this.newsletterModel.findOne({ email });
        if (exists) {
            return exists;
        }
        return this.newsletterModel.create({ email, userId });
    }

    async findAllSubscribed(): Promise<NewsletterModel[]> {
        return this.newsletterModel.find({ subscribed: true }).exec();
    }

    async unsubscribe(email: string): Promise<NewsletterModel | null> {
        return this.newsletterModel.findOneAndUpdate(
            { email },
            { subscribed: false },
            { new: true }
        ).exec();
    }

    async subscribe(email: string): Promise<NewsletterModel | null> {
        return this.newsletterModel.findOneAndUpdate(
            { email },
            { subscribed: true },
            { new: true }
        ).exec();
    }
}
