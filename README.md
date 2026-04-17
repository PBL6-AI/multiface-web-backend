# Multiface Web Backend

NestJS backend for the Multiface attendance platform. The current codebase focuses on authentication, user management, classes, file storage, and face registration workflows, with PostgreSQL as the system of record and Swagger as the live API reference.

This README is written for cross-functional contributors:

- **Frontend / mobile** developers integrating with the API
- **Backend** developers extending modules and business logic
- **Infra / DevOps** contributors running local services and environment configuration
- **QA** contributors validating auth, role-based access, class flows, and face-registration flows

## Current Status

Implemented application modules in `src/app.module.ts`:

- `auth`
- `users`
- `classes`
- `files`
- `faces`

Supporting internal modules/packages:

- `storage` for S3-backed object storage
- shared `common`, `config`, `database`, and `packages/*` layers

Some broader domains appear in the schema and roadmap documents, but they are **not all exposed as active NestJS modules yet**. When in doubt, treat `src/app.module.ts` and Swagger at `/docs` as the source of truth for what is currently wired into the app.

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Vector-ready local DB image:** `pgvector/pgvector:pg16`
- **ORM:** TypeORM
- **API docs:** Swagger / OpenAPI
- **Validation:** `class-validator` + `class-transformer`
- **Storage:** Amazon S3 via AWS SDK v3
- **Cache / future broker:** Redis (provisioned in Docker Compose)
- **Package manager:** pnpm
- **Testing:** Jest + Supertest

## Architecture Snapshot

```text
src/
├── app.module.ts          # Root NestJS module
├── main.ts                # Bootstrap, ValidationPipe, Swagger, filters
├── common/                # Guards, decorators, filters, shared types/constants
├── config/                # Environment and runtime configuration loaders
├── database/              # TypeORM bootstrap/config
├── modules/
│   ├── auth/              # Login, register, refresh, logout, current user
│   ├── classes/           # Class management and student enrollment
│   ├── faces/             # Face registration request and review flows
│   ├── files/             # File metadata + upload entrypoints
│   ├── storage/           # S3-backed storage provider
│   └── users/             # Profile and admin user management
└── packages/
    ├── ai/                # Reserved/shared AI-related code
    ├── domain/            # Domain models and repository contracts
    ├── infrastructure/    # TypeORM entities and repository implementations
    └── messsaging/        # Reserved/shared messaging package scaffold
```

High-level request flow:

1. `src/main.ts` boots the Nest app and installs global validation + exception handling.
2. Controllers in `src/modules/*/controllers` receive HTTP requests.
3. Services in each module execute business rules.
4. Repositories and TypeORM entities under `src/packages/*` persist data.
5. File-related flows delegate object storage to the `storage` module.

For a broader walkthrough, start with [docs/overview/system-overview.md](docs/overview/system-overview.md).

## Quick Start

### 1. Prerequisites

- Node.js LTS
- pnpm
- Docker Desktop / Docker Compose

### 2. Create `.env`

Copy `.env.example` to `.env` and update the values you need.

Minimum local development variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=multiface
DB_SYNCHRONIZE=true
REDIS_PORT=6379
PORT=3000
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SEED_USER_PASSWORD=Test@123456
```

Notes:

- `PORT` defaults to `3000` in `src/main.ts` if omitted.
- JWT values have development fallbacks in code, but you should still define them explicitly.
- AWS values are required for file upload and face-image upload flows.
- Redis is provisioned locally, but the current application code does not yet expose a major Redis-backed runtime flow.

### 3. Start local infrastructure

```bash
docker compose up -d postgres redis
```

### 4. Install dependencies and run the app

```bash
pnpm install
pnpm run start:dev
```

Default local URLs:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### 5. Seed local users (optional but recommended)

```bash
pnpm run seed:users
```

The seed script creates admin, teacher, and student accounts and prints the credentials it generated/updated.

Detailed onboarding steps are in [docs/dev/local-setup.md](docs/dev/local-setup.md).

## Common Commands

```bash
# development
pnpm run start:dev
pnpm run start:debug

# quality checks
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run format:check
pnpm run check

# tests
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e

# local data
pnpm run seed:users
```

## API Surface

Swagger is enabled in `src/main.ts` and served at `/docs`.

Current route groups:

- **Authentication**: register, login, refresh token, logout, current user
- **Users**: my profile + admin user management
- **Classes**: create/update/delete classes, join by code, list members
- **Files**: authenticated test upload endpoint backed by S3 storage
- **Face registration**: student request submission and admin review flow

API details for frontend and QA contributors are in [docs/api/api-doc.md](docs/api/api-doc.md).

## Documentation Map

| Audience          | Start here                                                           | Then read                                                                                                    |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Frontend / mobile | [docs/api/api-doc.md](docs/api/api-doc.md)                           | [docs/overview/system-overview.md](docs/overview/system-overview.md)                                         |
| Backend           | [docs/overview/system-overview.md](docs/overview/system-overview.md) | [docs/db/db-design.md](docs/db/db-design.md), [docs/dev/coding-convention.md](docs/dev/coding-convention.md) |
| Infra / DevOps    | [docs/dev/local-setup.md](docs/dev/local-setup.md)                   | [docs/overview/system-overview.md](docs/overview/system-overview.md), `docker-compose.yml`, `.env.example`   |
| QA                | [docs/api/api-doc.md](docs/api/api-doc.md)                           | [docs/dev/local-setup.md](docs/dev/local-setup.md), Swagger at `/docs`                                       |

Available docs:

- [docs/overview/system-overview.md](docs/overview/system-overview.md)
- [docs/dev/local-setup.md](docs/dev/local-setup.md)
- [docs/api/api-doc.md](docs/api/api-doc.md)
- [docs/db/db-design.md](docs/db/db-design.md)
- [docs/dev/coding-convention.md](docs/dev/coding-convention.md)
- [docs/dev/git-flow.md](docs/dev/git-flow.md)

## Known Gaps and Expectations

- `test/app.e2e-spec.ts` is still the default Nest scaffold and is **not** a reliable end-to-end coverage indicator for current modules.
- Redis is available in local infrastructure, but it is currently more of a prepared dependency than a documented active runtime integration.
- The `pgvector` image is provisioned locally, but feature documentation should still be validated against the actual TypeORM entities and current modules before assuming vector search is active.
- There is no production deployment manifest in this repository yet; local setup docs focus on development environments.

## Source of Truth

When documentation and code disagree, prefer these files in this order:

1. `src/app.module.ts` for active module wiring
2. `src/main.ts` for HTTP bootstrap behavior and Swagger setup
3. Controller DTOs + Swagger decorators under `src/modules/*`
4. `src/config/*` for runtime configuration keys
5. `docker-compose.yml` for local infrastructure

## Related Files

- `src/app.module.ts`
- `src/main.ts`
- `.env.example`
- `docker-compose.yml`
- `scripts/seed-users.mjs`
