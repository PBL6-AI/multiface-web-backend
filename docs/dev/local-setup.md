# Local Setup Guide

Use this guide when you want to run the backend locally for development, integration, or QA.

## 1. Prerequisites

Install:
- Node.js LTS
- pnpm
- Docker Desktop / Docker Compose

Recommended checks:

```bash
node --version
pnpm --version
docker --version
docker compose version
```

## 2. Create your environment file

Copy `.env.example` to `.env`.

Suggested local `.env` values:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=multiface
DB_SYNCHRONIZE=true
REDIS_PORT=6379
PORT=3000
JWT_ACCESS_SECRET=local-access-secret
JWT_REFRESH_SECRET=local-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SEED_USER_PASSWORD=Test@123456
```

### What each variable is used for

| Variable | Required for local start? | Notes |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Yes | Used by TypeORM database config |
| `DB_SYNCHRONIZE` | Yes | Convenient for local dev; do not blindly reuse in shared/staging/prod environments |
| `PORT` | Optional | Defaults to `3000` in `src/main.ts` |
| `REDIS_PORT` | Needed if using local Docker Compose | Exposes Redis locally; current app usage is limited |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Strongly recommended | Code has development fallbacks, but set explicit values in `.env` |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Optional | Default values are provided in config |
| `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Required for upload features | Needed for `/files/test-upload` and face-image upload flows |
| `SEED_USER_PASSWORD` | Optional | Used by `pnpm run seed:users` |

## 3. Start local infrastructure

From the repository root:

```bash
docker compose up -d postgres redis
```

What this starts:
- **Postgres** on `${DB_PORT}:5432`
- **Redis** on `${REDIS_PORT}:6379`

Notes:
- The Postgres image is `pgvector/pgvector:pg16`.
- The repo mounts `docker/postgres/init/01-enable-vector.sql` during container initialization.
- Redis is available locally even though current app-level documentation shows limited active Redis usage.

## 4. Install dependencies

```bash
pnpm install
```

## 5. Start the backend

```bash
pnpm run start:dev
```

Useful alternatives:

```bash
pnpm run start
pnpm run start:debug
pnpm run start:prod
```

Default local endpoints:
- API base URL: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`

## 6. Seed demo users

Optional but helpful for frontend and QA work:

```bash
pnpm run seed:users
```

The seed script:
- connects to the same database defined by your `.env`
- ensures the roles `admin`, `teacher`, and `student` exist
- upserts demo users for each role
- prints the default password and user list in the terminal

If `SEED_USER_PASSWORD` is omitted, the script falls back to `Test@123456`.

## 7. Verify the environment

Recommended first checks:
1. Open Swagger at `/docs`
2. Try `POST /auth/login`
3. Try `GET /auth/me` with the returned bearer token
4. If AWS credentials are configured, test `POST /files/test-upload`

## 8. Useful development commands

```bash
# formatting and linting
pnpm run format
pnpm run format:check
pnpm run lint
pnpm run lint:fix
pnpm run check

# testing
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e
```

## 9. Troubleshooting

### App starts but upload endpoints fail
Check your AWS values:
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Swagger is not available
Check that the Nest app started successfully and that `PORT` is not already in use.

### Database connection fails
Make sure:
- Docker containers are healthy
- `DB_*` values in `.env` match `docker-compose.yml`
- your local firewall or another Postgres instance is not already using the same port

### Tests do not reflect the full current API
`test/app.e2e-spec.ts` is still scaffold-level coverage. Use Swagger and role-based manual checks for broader validation.

## 10. Related docs

- [../overview/system-overview.md](../overview/system-overview.md)
- [../api/api-doc.md](../api/api-doc.md)
- [../db/db-design.md](../db/db-design.md)
