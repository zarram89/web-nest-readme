# Module 4 Task 1 Execution Log

## Objective
Integrate PostgreSQL with Prisma ORM for the Blog Service.

## Steps Executed

1.  **MongoDB Healthcheck**: Added healthcheck to `apps/account/docker-compose.yml` for better reliability.
2.  **Blog Service Creation**: Created new NestJS application `blog` using NX.
3.  **PostgreSQL Setup**:
    *   Created `apps/blog/docker-compose.yml` with PostgreSQL (port 5433) and PgAdmin.
    *   Configured healthchecks and volume persistence.
4.  **Prisma Integration**:
    *   Installed Prisma 6 (`prisma`, `@prisma/client`).
    *   Initialized Prisma with PostgreSQL provider.
    *   Defined schema in `prisma/schema.prisma` with models: `Post`, `Comment`, `Like`, `Tag`.
    *   Configured custom output path for Prisma Client to avoid conflicts in monorepo.
5.  **Database Management**:
    *   Added helper commands to `apps/blog/project.json`: `db-validate`, `db-generate`, `db-migrate`, `db-reset`, `db-fill`, `db-studio`.
    *   Created seed script `prisma/seed.ts` with sample data for all post types.
    *   Used `tsx` for executing seed script to handle ESM compatibility.
6.  **Blog Service Implementation**:
    *   Created `PrismaModule` and `PrismaService` for database connection.
    *   Created `PostsModule` with Controller, Service, and Repository.
    *   Implemented DTOs (`CreatePostDto`, `UpdatePostDto`) with validation.
    *   Added Swagger documentation and global `ValidationPipe`.
7.  **Verification**:
    *   Ran migrations successfully.
    *   Seeded database with sample posts, comments, and likes.
    *   Verified API endpoint `GET /api/posts` returns correct data structure including relations.

## Key Decisions
*   **Port 5433**: Used port 5433 for PostgreSQL to avoid potential conflicts with default port 5432.
*   **Prisma 6**: Explicitly used Prisma 6 to avoid breaking changes introduced in Prisma 7 regarding datasource configuration.
*   **TSX for Seeding**: Used `tsx` instead of `ts-node` for running seed scripts to ensure better compatibility with ESM modules in the monorepo structure.
*   **Repository Pattern**: Implemented `PostsRepository` to abstract Prisma calls and keep Service clean.

## Results
*   PostgreSQL database is running and accessible.
*   Prisma Schema is defined and migrated.
*   Blog Service API is serving data correctly.
*   Swagger documentation is available at `http://localhost:3001/api/docs`.
