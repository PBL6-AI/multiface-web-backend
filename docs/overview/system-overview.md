# System Overview

This document explains how the current backend is organized so contributors from frontend, backend, infra, and QA can navigate the repository quickly.

## 1. What this service does today

The current NestJS application provides:
- authentication and token refresh flows
- user profile and admin user management
- class creation, enrollment, and membership management
- file upload plumbing backed by S3
- face-registration request submission and review workflows
- generated Swagger documentation at `/docs`

The wider product roadmap mentions more domains, but the current runtime scope is defined by the modules imported in `src/app.module.ts`.

## 2. Runtime building blocks

### Application bootstrap

The app starts in `src/main.ts`:
- creates the Nest application
- installs the global `HttpExceptionFilter`
- enables a global `ValidationPipe` with `whitelist`, `transform`, and `forbidNonWhitelisted`
- generates Swagger and serves it at `/docs`
- listens on `PORT` or falls back to `3000`

### Root module

`src/app.module.ts` wires together:
- `ConfigModule` with config loaders from `src/config/*`
- TypeORM via `src/database/typeorm.config.ts`
- feature modules:
  - `AuthModule`
  - `ClassesModule`
  - `UsersModule`
  - `FilesModule`
  - `FacesModule`

## 3. Source tree guide

| Path | Purpose |
|---|---|
| `src/common` | Reusable guards, decorators, filters, constants, utilities, and shared response types |
| `src/config` | Environment-backed config loaders for auth, database, and storage |
| `src/database` | TypeORM setup and bootstrap helpers |
| `src/modules` | Feature-oriented NestJS modules and internal integration modules |
| `src/packages/domain` | Domain-level contracts and raw business models |
| `src/packages/infrastructure` | TypeORM entities, mappers, and repository implementations |
| `src/packages/ai` | Shared AI-related package scaffold |
| `src/packages/messsaging` | Shared messaging package scaffold |
| `scripts` | Development scripts such as user seeding and Husky setup |
| `test` | Jest e2e scaffolding |

## 4. Implemented modules

| Module | Route prefix | Main responsibility | Primary consumers |
|---|---|---|---|
| `auth` | `/auth` | registration, login, refresh, logout, current-user lookup | frontend, mobile, QA |
| `users` | `/users` | self-profile APIs and admin user management | backend, admin UI, QA |
| `classes` | `/classes` | class CRUD, join-by-code, member management | teacher/admin/student flows |
| `files` | `/files` | authenticated upload test endpoint + file metadata | backend, QA |
| `faces` | `/face-registration/requests` | student face-registration requests and admin reviews | frontend, QA, backend |
| `storage` | internal | S3-backed object storage provider used by upload flows | backend, infra |

## 5. Request flow in practice

A typical request follows this path:

1. **Controller** receives the HTTP request and applies guards/decorators.
2. **DTO validation** runs through the global `ValidationPipe`.
3. **Service** applies business rules.
4. **Repository** interfaces are resolved to TypeORM-backed implementations.
5. **Database / storage** persists the result.
6. **Response** is returned in the common success envelope or the global exception format.

Example flows:
- `POST /auth/login` -> auth controller -> auth service -> users lookup + token generation
- `POST /classes/join` -> classes controller -> classes service -> class membership persistence
- `POST /face-registration/requests/:id/images` -> faces controller -> files/storage integration -> DB metadata persistence + S3 upload

## 6. External dependencies

### PostgreSQL
- Configured via TypeORM in `src/database/typeorm.config.ts`
- Local container runs from `pgvector/pgvector:pg16`
- Schema-oriented details live in `docs/db/db-design.md`

### Redis
- Available in `docker-compose.yml`
- Useful for future cache/broker integration
- At the moment, Redis is provisioned locally but not heavily documented as an active application runtime dependency

### S3
- Storage config is loaded from `src/config/storage.config.ts`
- Upload flows use `src/modules/storage/services/s3-storage.service.ts`
- File and face-image upload scenarios depend on valid AWS configuration

## 7. Contributor entry points

### Frontend / mobile
Start with:
1. `docs/api/api-doc.md`
2. Swagger at `/docs`
3. relevant DTOs and controllers under `src/modules/*`

Focus on:
- auth token flow
- role-specific endpoint access
- multipart upload endpoints
- response and error envelope shapes

### Backend
Start with:
1. `src/app.module.ts`
2. `src/modules/*`
3. `src/packages/domain` and `src/packages/infrastructure`
4. `docs/db/db-design.md`

Focus on:
- module boundaries
- service and repository patterns
- DTO validation and Swagger decorators
- keeping docs aligned with actual runtime wiring

### Infra / DevOps
Start with:
1. `docs/dev/local-setup.md`
2. `.env.example`
3. `docker-compose.yml`
4. `src/config/*`

Focus on:
- environment variables
- local Postgres/Redis bootstrapping
- S3 credential requirements for upload flows
- the difference between provisioned dependencies and actively used ones

### QA
Start with:
1. `docs/api/api-doc.md`
2. Swagger at `/docs`
3. `docs/dev/local-setup.md`

Focus on:
- happy-path auth flows
- role-based access checks for admin / teacher / student
- file upload and face-registration review scenarios
- the fact that current automated e2e coverage is limited

## 8. Current limitations

- `test/app.e2e-spec.ts` is still the default Nest example and does not represent the real API surface.
- Some package folders are scaffolds for future expansion rather than mature feature areas.
- Broader business domains referenced in schema/roadmap docs may not yet have active controllers/modules.
- There is no repo-local production deployment guide yet.

## 9. Related docs

- [../dev/local-setup.md](../dev/local-setup.md)
- [../api/api-doc.md](../api/api-doc.md)
- [../db/db-design.md](../db/db-design.md)
- [../dev/coding-convention.md](../dev/coding-convention.md)
- [../dev/git-flow.md](../dev/git-flow.md)
