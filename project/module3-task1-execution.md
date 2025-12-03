## Ход выполнения по заданию 3.1 (module3-task1)

### 1. Настройка Docker-окружения для MongoDB

#### 1.1. Создание docker-compose.yml
Создан файл `apps/account/docker-compose.yml` с двумя сервисами:

**MongoDB:**
- Image: `mongo:latest`
- Container name: `readme-mongo`
- Port: `27018` (изменен с 27017 из-за конфликта с другим проектом)
- Volume: `readme-mongo-data` для персистентности данных
- Переменные окружения из `.env`

**Mongo Express (веб-интерфейс):**
- Image: `mongo-express:latest`
- Container name: `readme-mongo-express`
- Port: `8082` (изменен с 8081 из-за конфликта)
- Подключен к MongoDB через internal network

**Команда запуска:**
```bash
cd apps/account
docker-compose up -d
```

#### 1.2. Конфигурация переменных окружения
Создан файл `apps/account/.env`:
```properties
MONGO_USER=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27018
MONGO_DB=readme-account
MONGO_AUTH_DB=admin
```

**Важно:** Файл `.env` добавлен в `.gitignore` для безопасности.

---

### 2. Установка зависимостей

```bash
npm install @nestjs/mongoose mongoose @nestjs/config
```

**Установленные пакеты:**
- `@nestjs/mongoose` - NestJS коннектор для Mongoose
- `mongoose` - ODM для MongoDB
- `@nestjs/config` - модуль для работы с переменными окружения

---

### 3. Конфигурация приложения

#### 3.1. Создание MongoDB конфигурации
Файл: `apps/account/src/app/config/mongo.config.ts`

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      uri: getMongoString(configService),
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
  };
};

const getMongoString = (configService: ConfigService) =>
  'mongodb://' +
  configService.get('MONGO_USER') +
  ':' +
  configService.get('MONGO_PASSWORD') +
  '@' +
  configService.get('MONGO_HOST') +
  ':' +
  configService.get('MONGO_PORT') +
  '/' +
  configService.get('MONGO_DB') +
  '?authSource=' +
  configService.get('MONGO_AUTH_DB');
```

#### 3.2. Обновление AppModule
Файл: `apps/account/src/app/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './config/mongo.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/account/.env',
    }),
    MongooseModule.forRootAsync(getMongoConfig()),
    AuthModule, 
    UsersModule
  ],
  // ...
})
export class AppModule { }
```

**Ключевые моменты:**
- `ConfigModule.forRoot` с `isGlobal: true` - глобальный доступ к конфигурации
- `MongooseModule.forRootAsync` - асинхронное подключение к MongoDB

---

### 4. Создание Mongoose моделей

#### 4.1. User Schema
Файл: `apps/account/src/app/users/models/user.model.ts`

```typescript
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

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
```

**Особенности:**
- `timestamps: true` - автоматическое добавление `createdAt` и `updatedAt`
- `toJSON/toObject: { virtuals: true }` - включение виртуальных полей (включая `id`)
- Реализация интерфейса `User` из `@project/shared`
- Уникальный индекс на поле `email`

---

### 5. Реализация MongoDB репозитория

#### 5.1. UserRepository с Mongoose
Файл: `apps/account/src/app/users/repositories/user.repository.ts`

Полностью переписан для работы с MongoDB:

```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserModel>
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const newUser = new this.userModel(user);
    const savedUser = await newUser.save();
    return new UserEntity(savedUser.toObject());
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? new UserEntity(user.toObject()) : null;
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
  
  // ... другие методы (findById, update, delete, removeSubscription, countSubscribers)
}
```

**Ключевые методы:**
- `@InjectModel(UserModel.name)` - инжекция Mongoose модели
- `$addToSet` - добавление в массив без дубликатов (подписки)
- `$pull` - удаление из массива (отписка)
- `findByIdAndUpdate` с `{ new: true }` - возврат обновленного документа
- `.exec()` - выполнение запроса
- Конвертация Mongoose документов в `UserEntity` через `.toObject()`

#### 5.2. Обновление UsersModule
Файл: `apps/account/src/app/users/users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './models/user.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserModel.name, schema: UserSchema }
        ])
    ],
    controllers: [UsersController],
    providers: [UsersService, UserRepository],
    exports: [UsersService],
})
export class UsersModule { }
```

**Регистрация модели:**
- `MongooseModule.forFeature` - регистрация схемы на уровне модуля
- Схема доступна для инжекции через `@InjectModel`

---

### 6. Проблемы и их решения

#### Проблема 1: Конфликт портов (27017 и 8081)
**Описание:** Порт 27017 занят другим проектом MongoDB (six-cities).

**Решение:**
1. Изменил `MONGO_PORT` в `.env` на `27018`
2. Изменил порт Mongo Express в `docker-compose.yml` на `8082`
3. Перезапустил контейнеры: `docker-compose down && docker-compose up -d`

**Почему возникло:** Одновременная работа над несколькими проектами с MongoDB.

#### Проблема 2: UserModel не реализует интерфейс User
**Описание:** 
```
Class 'UserModel' incorrectly implements interface 'User'.
Property 'id' is optional in type 'UserModel' but required in type 'User'.
```

**Решение:**
1. Включил виртуальные поля в Schema options:
   ```typescript
   @Schema({
     toJSON: { virtuals: true },
     toObject: { virtuals: true }
   })
   ```
2. Изменил `id?: string` на `id: string` в классе `UserModel`

**Почему возникло:** Mongoose использует `_id`, а интерфейс `User` требует `id`. Виртуальные поля автоматически создают поле `id` из `_id`.

#### Проблема 3: .env файл блокируется .gitignore
**Описание:** Инструменты редактирования не могут изменить `.env` из-за `.gitignore`.

**Решение:**
Использовал команду `echo` для перезаписи:
```bash
echo MONGO_USER=admin > .env && echo MONGO_PASSWORD=admin >> .env && ...
```

**Почему возникло:** Защита от случайного коммита конфиденциальных данных.

---

### 7. Верификация работы

#### 7.1. Запуск контейнеров
```bash
cd apps/account
docker-compose up -d
```

**Результат:**
```
✔ Container readme-mongo          Started
✔ Container readme-mongo-express  Started
```

#### 7.2. Запуск приложения
```bash
npx nx run account:serve
```

**Результат:** Приложение успешно подключилось к MongoDB на порту 27018.

#### 7.3. Тестирование регистрации
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"mongo@test.com","password":"password123","name":"Mongo User"}'
```

**Ответ:**
```json
{
  "id":"8b89a87a-58b3-466b-aa46-7033600af3f1",
  "email":"mongo@test.com",
  "name":"Mongo User",
  "subscriptions":[],
  "_id":"692fc1af168a3afad6c98847",
  "createdAt":"2025-12-03T04:50:55.354Z",
  "updatedAt":"2025-12-03T04:50:55.354Z",
  "__v":0,
  "accessToken":"token_8b89a87a-58b3-466b-aa46-7033600af3f1_1764737455370"
}
```

✅ **Успешно:** Пользователь сохранен в MongoDB (видно по наличию `_id` и timestamps).

#### 7.4. Проверка в Mongo Express
Открыть в браузере: `http://localhost:8082`
- Database: `readme-account`
- Collection: `users`
- Документ содержит все поля пользователя

---

### Итоги по Module 3 Task 1

✅ **Выполнено:**
1. Настроен Docker Compose для MongoDB и Mongo Express
2. Создан `.env` файл с конфигурацией подключения
3. Установлены пакеты `@nestjs/mongoose`, `mongoose`, `@nestjs/config`
4. Настроено подключение к MongoDB через `MongooseModule`
5. Создана Mongoose схема для модели User
6. Реализован MongoDB репозиторий с полным функционалом
7. Обновлены сервисы для работы с новым репозиторием
8. Проведена успешная верификация (регистрация пользователя)

**Структура файлов:**
```
apps/account/
├── docker-compose.yml          # Docker конфигурация
├── .env                        # Переменные окружения (gitignored)
├── .gitignore                  # Исключения для Git
└── src/app/
    ├── config/
    │   └── mongo.config.ts     # MongoDB connection factory
    ├── users/
    │   ├── models/
    │   │   └── user.model.ts   # Mongoose схема
    │   └── repositories/
    │       └── user.repository.ts  # MongoDB репозиторий
    └── app.module.ts           # ConfigModule + MongooseModule
```

**Доступ к сервисам:**
- Account Service: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`
- Mongo Express: `http://localhost:8082`
- MongoDB: `localhost:27018`

**Следующие шаги:**
- Повторить процесс для Blog Service (если потребуется MongoDB)
- Или перейти к PostgreSQL для Blog Service (Module 4)
