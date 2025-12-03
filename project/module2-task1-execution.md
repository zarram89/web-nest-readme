## Ход выполнения по заданию 2.1 (module2-task1)

### Аналитика и планирование

#### Разработка REST API структуры
Перед началом кода был спроектирован полный REST API для всех сервисов (кроме Notification):

**Account Service API:**
```
POST   /api/auth/register         - Регистрация пользователя
POST   /api/auth/login            - Авторизация
GET    /api/users/:id             - Информация о пользователе
POST   /api/users/password        - Смена пароля
POST   /api/users/:id/subscribe   - Подписка на пользователя
DELETE /api/users/:id/subscribe   - Отписка
```

**Blog Service API:**
```
POST   /api/posts                 - Создание публикации
GET    /api/posts                 - Список публикаций (пагинация, фильтры)
GET    /api/posts/:id             - Детальная информация о публикации  
PATCH  /api/posts/:id             - Редактирование публикации
DELETE /api/posts/:id             - Удаление публикации
POST   /api/posts/:id/repost      - Репост публикации
POST   /api/posts/:id/comments    - Добавить комментарий
GET    /api/posts/:id/comments    - Список комментариев
DELETE /api/comments/:id          - Удалить комментарий
POST   /api/posts/:id/like        - Лайк (toggle)
GET    /api/feed                  - Лента пользователя
GET    /api/search                - Поиск по заголовку
```

---

### 1. Создание общей библиотеки shared-types

#### 1.1. Генерация библиотеки
Первым шагом создана общая библиотека для интерфейсов и типов, используемых во всех микросервисах:

**Команда:**
```bash
npx nx g @nx/js:library shared-types --directory=libs/shared --unitTestRunner=jest
```

**Выбор при генерации:**
- Bundler: `swc` (быстрая компиляция TypeScript)
- Linter: `eslint`

#### 1.2. Разработка интерфейсов сущностей

В библиотеке созданы все необходимые интерфейсы:

**Enum'ы:**
- `PostType` - типы публикаций (video, text, quote, photo, link)
- `PostStatus` - статусы (published, draft)

**Интерфейсы:**
- `User` - пользователь (id, email, passwordHash, name, avatar, createdAt, subscriptions)
- `Post` (дискриминированный union):
  - `VideoPost` - видео (title, videoUrl, tags)
  - `TextPost` - текст (title, announcement, text, tags)
  - `QuotePost` - цитата (quoteText, quoteAuthor, tags)
  - `PhotoPost` - фото (photoUrl, tags)
  - `LinkPost` - ссылка (url, description, tags)
- `Comment` - комментарий (id, postId, userId, text, createdAt)
- `Like` - лайк (id, postId, userId, createdAt)
- `Tag` - тег (id, name)

**Структура файлов:**
```
libs/shared/src/
├── lib/
│   ├── enums/
│   │   ├── post-type.enum.ts
│   │   └── post-status.enum.ts
│   └── interfaces/
│       ├── user.interface.ts
│       ├── post.interface.ts
│       ├── comment.interface.ts
│       ├── like.interface.ts
│       └── tag.interface.ts
└── index.ts  # Экспорт всех типов
```

**Использование:**
Все микросервисы импортируют типы из `@project/shared`:
```typescript
import { User, PostType, VideoPost } from '@project/shared';
```

---

### 2. Реализация Account Service

#### 2.1. Архитектура модулей
Account Service разделен на два модуля:
- **AuthModule** - регистрация и авторизация
- **UsersModule** - управление пользователями и подписками

#### 2.2. AuthModule

**Структура:**
```
apps/account/src/app/auth/
├── auth.module.ts          # Модуль авторизации
├── auth.controller.ts      # Контроллер (register, login)
├── auth.service.ts         # Бизнес-логика аутентификации
└── dto/
    ├── register.dto.ts     # DTO регистрации
    └── login.dto.ts        # DTO входа
```

**Ключевые особенности:**

1. **RegisterDto с валидацией:**
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(6)
  @MaxLength(12)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
```

2. **AuthService с проверками:**
- Проверка существования email при регистрации → `ConflictException`
- Проверка пароля при login → `UnauthorizedException`
- Генерация JWT токена (упрощенная реализация)
- Возврат данных без `passwordHash`

3. **OpenAPI документация:**
```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  //...
}
```

#### 2.3. UsersModule

**Структура:**
```
apps/account/src/app/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── entities/
│   └── user.entity.ts         # Entity с методами хеширования
├── repositories/
│   └── user.repository.ts     # In-memory хранилище  
└── dto/
    └── change-password.dto.ts
```

**Ключевые особенности:**

1. **UserEntity с bcrypt:**
```typescript
export class UserEntity implements User {
  // Хеширование пароля при создании
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Сравнение пароля с хешем
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Создание пользователя с хешированным паролем
  static async createWithHashedPassword(data): Promise<UserEntity> {
    const passwordHash = await this.hashPassword(data.password);
    return new UserEntity({ ...data, passwordHash, /*...*/ });
  }
}
```

2. **UserRepository (In-Memory):**
- Хранение в `Map<string, UserEntity>`
- CRUD операции (create, findById, findByEmail, update, delete)
- Управление подписками (addSubscription, removeSubscription)
- Подсчет подписчиков (countSubscribers)

3. **UsersService:**
- Создание пользователя через `UserEntity.createWithHashedPassword`
- Смена пароля с проверкой текущего
- Подписка/отписка на пользователей
- Получение детальной информации (без passwordHash)

4. **UsersController:**
- `GET /users/:id` - детальная информация
- `POST /users/password` - смена пароля
- `POST /users/:id/subscribe` - подписка
- `DELETE /users/:id/subscribe` - отписка

#### 2.4. Интеграция модулей

**AppModule:**
```typescript
@Module({
  imports: [AuthModule, UsersModule],
  // ...
})
export class AppModule {}
```

**Зависимости между модулями:**
- `AuthModule` импортирует `UsersModule` для доступа к `UsersService`
- `UsersModule` экспортирует `UsersService` для использования в `AuthModule`

---

### 3. Конфигурация Swagger (OpenAPI)

#### 3.1. Установка зависимостей
```bash
npm install bcrypt class-validator class-transformer @nestjs/swagger
```

#### 3.2. Настройка в main.ts
```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Удаление неизвестных свойств
      forbidNonWhitelisted: true, // Ошибка при неизвестных свойствах
      transform: true,            // Автоматическая трансформация
    })
  );
  
  // Swagger конфигурация
  const config = new DocumentBuilder()
    .setTitle('Readme Account Service API')
    .setDescription('REST API for user authentication and management')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  //...
}
```

**Результат:** 
Swagger UI доступен по адресу: `http://localhost:3000/api/docs`

---

### 4. Сборка и верификация

#### 4.1. Сборка shared библиотеки
```bash
npx nx run shared:build
```

#### 4.2. Сборка Account Service
```bash
npx nx run account:build
```

**Результат:** ✅ Успешная сборка без ошибок

#### 4.3. Запуск сервиса
```bash
npx nx run account:serve
```

**Логи запуска:**
```
🚀 Application is running on: http://localhost:3000/api
📚 Swagger documentation available at: http://localhost:3000/api/docs
```

---

### Проблемы и их решения

#### Проблема 1: NX Generators не работали
**Описание:** Команды `npx nx g @nx/nest:module` и аналогичные падали с ошибкой схемы.

**Решение:** Создание модулей, контроллеров и сервисов вручную с соблюдением структуры Nest.js.

#### Проблема 2: Shared library не импортировалась  
**Описание:** Ошибка `Cannot find module '@web-nest-readme/shared'` при сборке.

**Решение:** 
1. Проверил `tsconfig.base.json` - путь был правильный: `@project/shared`
2. Исправил импорт в `user.entity.ts`: `import { User } from '@project/shared'`
3. Собрал shared библиотеку перед сборкой account сервиса

#### Проблема 3: Lint ошибки с неиспользованными переменными
**Описание:** Деструктуризация `{ passwordHash, ...result }` помечалась как неиспользованная.

**Решение:** Это intentional - переменная используется для исключения поля из результата. Lint можно игнорировать или настроить.

---

### Итоги по Module 2 Task 1 (Account Service)

✅ **Выполнено:**
- Создана общая библиотека `@project/shared` с интерфейсами всех сущностей
- Спроектирован REST API для Account и Blog сервисов
- Реализован Account Service с модулями Auth и Users
- Реализовано хеширование паролей с помощью bcrypt
- Созданы in-memory репозитории для хранения данных
- Добавлена валидация DTO с помощью class-validator
- Настроена документация Swagger/OpenAPI
- Сервис успешно собирается и запускается

**Файловая структура Account Service:**
```
apps/account/src/
├── main.ts                    # Точка входа + Swagger setup
└── app/
    ├── app.module.ts          # Корневой модуль
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── dto/
    │       ├── register.dto.ts
    │       └── login.dto.ts
    └── users/
        ├── users.module.ts
        ├── users.controller.ts
        ├── users.service.ts
        ├── entities/
        │   └── user.entity.ts
        ├── repositories/
        │   └── user.repository.ts
        └── dto/
            └── change-password.dto.ts
```

**Следующие шаги:**
- Реализация Blog Service (аналогичным образом)
- Создание API Gateway для агрегации данных
- Замена in-memory репозиториев на MongoDB/PostgreSQL
- Реализация настоящего JWT токена с @nestjs/jwt
- Добавление guard'ов для защиты роутов
