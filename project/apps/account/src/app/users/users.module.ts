import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { UserModel, UserSchema } from './models/user.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserModel.name, schema: UserSchema }
        ])
    ],
    controllers: [UsersController],
    providers: [UsersService, UserRepository],
    exports: [UsersService], // Export for use in AuthModule
})
export class UsersModule { }
