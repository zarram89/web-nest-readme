# Диаграмма архитектуры - Readme Project

## Визуальная схема архитектуры

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATION                          │
│                    (Web Browser / Mobile App)                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • JWT Authentication                                     │   │
│  │  • Request Routing                                        │   │
│  │  • Response Aggregation                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────┬──────────────────┬──────────────────┬───────────────┬─────┘
      │                  │                  │               │
      │                  │                  │               │
      ▼                  ▼                  ▼               ▼
┌──────────┐      ┌──────────┐      ┌──────────┐    ┌──────────┐
│ ACCOUNT  │◄────►│   BLOG   │─────►│  NOTIFY  │    │   FILE   │
│ SERVICE  │      │ SERVICE  │      │ SERVICE  │    │ SERVICE  │
├──────────┤      ├──────────┤      ├──────────┤    ├──────────┤
│          │      │          │      │          │    │          │
│ • Auth   │      │ • Posts  │      │ • Email  │    │ • Upload │
│ • Users  │      │ • Likes  │      │ • Queue  │    │ • Store  │
│ • Subscr │      │ • Tags   │      │          │    │ • Resize │
│          │      │ • Search │      │          │    │          │
└────┬─────┘      └────┬─────┘      └──────────┘    └────┬─────┘
     │                 │                                  │
     ▼                 ▼                                  ▼
┌──────────┐      ┌──────────┐                      ┌──────────┐
│ MongoDB  │      │PostgreSQL│                      │ File     │
│          │      │          │                      │ System   │
│ • Users  │      │ • Posts  │                      │ or S3    │
│ • Subscr │      │ • Comment│                      │          │
│ • Avatars│      │ • Likes  │                      │          │
│          │      │ • Tags   │                      │          │
└──────────┘      └──────────┘                      └──────────┘

Легенда:
━━━  Синхронные HTTP вызовы
┈┈┈  Асинхронные события
◄──► Двусторонний обмен данными
```

## Описание взаимодействий

### 1. Client → API Gateway
- Все запросы от клиентов идут через единую точку входа
- HTTPS протокол для безопасности
- API Gateway валидирует JWT токены

### 2. API Gateway → Микросервисы
- **Account Service**: `/api/auth/*`, `/api/users/*`
- **Blog Service**: `/api/posts/*`, `/api/comments/*`, `/api/likes/*`
- **Notification Service**: `/api/notifications/*`
- **File Service**: `/api/upload/*`

### 3. Межсервисная коммуникация

#### Account ↔ Blog (Синхронная)
- Blog запрашивает информацию о пользователе для отображения автора поста
- Проверка прав доступа перед редактированием/удалением

#### Blog → Notify (Асинхронная)
- При создании нового поста отправляется событие "NewPost"
- Notify собирает информацию и рассылает email подписчикам
- Использование очереди (RabbitMQ/Kafka) для надежности

### 4. Базы данных

#### MongoDB (Account Service)
```json
Users Collection:
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "passwordHash": "...",
  "name": "John Doe",
  "avatar": "path/to/avatar.jpg",
  "createdAt": "Date",
  "subscriptions": ["userId1", "userId2"]
}
```

#### PostgreSQL (Blog Service)
```sql
Tables:
- posts (id, user_id, type, content, status, created_at, published_at)
- comments (id, post_id, user_id, text, created_at)
- likes (id, post_id, user_id, created_at)
- tags (id, name)
- post_tags (post_id, tag_id)
```

## Протоколы коммуникации

### Текущая реализация (Phase 1)
- **Внешний API**: REST (HTTP/JSON)
- **Межсервисное**: HTTP/REST (прямые вызовы)
- **Аутентификация**: JWT Bearer tokens

### Будущие улучшения (Phase 2)
- **Асинхронные события**: RabbitMQ или Kafka
- **Service Discovery**: Consul или Kubernetes DNS
- **API Gateway**: Kong или Nginx
- **Кеширование**: Redis для часто запрашиваемых данных

## Создание визуальной диаграммы

Для создания красивой визуальной схемы можно использовать:

### Вариант 1: Онлайн редактор Excalidraw
1. Откройте https://excalidraw.com
2. Создайте диаграмму на основе текстового описания выше
3. Сохраните как `architecture.excalidraw` и экспортируйте в PNG

### Вариант 2: Draw.io
1. Откройте https://app.diagrams.net
2. Используйте шаблон "Cloud Architecture"
3. Создайте схему с компонентами выше
4. Сохраните как `architecture.drawio` и экспортируйте в PNG/SVG

### Вариант 3: Mermaid Live Editor
1. Откройте https://mermaid.live
2. Вставьте код из `specification.md` (строки 45-62)
3. Экспортируйте готовую диаграмму в PNG/SVG

## Рекомендуемая структура файлов

```
d:/web/web-nest-readme/
├── specification.md              # Текущий файл с Mermaid
├── architecture-diagram.md       # Этот файл (детальное описание)
├── architecture.excalidraw       # Editable версия диаграммы
└── architecture.png              # Визуальная версия для документации
```
