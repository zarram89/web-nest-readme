import { PostType } from '../enums/post-type.enum';
import { PostStatus } from '../enums/post-status.enum';

export interface BasePost {
    id: string;
    type: PostType;
    userId: string;
    status: PostStatus;
    createdAt: Date;
    publishedAt: Date;
    tags: string[];
    isRepost: boolean;
    originalPostId?: string;
    originalUserId?: string;
}

export interface VideoPost extends BasePost {
    type: PostType.Video;
    title: string;
    videoUrl: string;
}

export interface TextPost extends BasePost {
    type: PostType.Text;
    title: string;
    announcement: string;
    text: string;
}

export interface QuotePost extends BasePost {
    type: PostType.Quote;
    quoteText: string;
    quoteAuthor: string;
}

export interface PhotoPost extends BasePost {
    type: PostType.Photo;
    photoUrl: string;
}

export interface LinkPost extends BasePost {
    type: PostType.Link;
    url: string;
    description?: string;
}

export type Post = VideoPost | TextPost | QuotePost | PhotoPost | LinkPost;
