export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    avatar?: string;
    createdAt: Date;
    subscriptions: string[]; // User IDs
}
