# Multiface Web Backend

Backend cho hệ thống điểm danh khuôn mặt (Multiface), xây dựng bằng NestJS theo định hướng Clean Architecture + Feature Modules + Event-Driven.

## Mục tiêu

- Kiến trúc dễ mở rộng, dễ bảo trì và phù hợp cho tích hợp AI (face embedding/recognition).
- Tách rõ layer Domain, Application, Infrastructure, Presentation.
- Từng bước triển khai 10 phân hệ nghiệp vụ theo roadmap.

## Nội dung Đã Verify Từ `setup-plan.md`

Đối chiếu giữa kế hoạch trong `setup-plan.md` và code hiện tại:

- Backend framework `NestJS`: đã có (`package.json`, `src/app.module.ts`).
- ORM `TypeORM`: đã có (`src/database/typeorm.config.ts`).
- Database `PostgreSQL + pgvector`: đã có trong `docker-compose.yml` (`pgvector/pgvector:pg16`).
- Redis cho cache/message broker: đã có service trong `docker-compose.yml`.
- Global HTTP exception filter: đã cấu hình trong `src/main.ts`.
- Module hiện có trong app: `auth`, `users`, `faces`.
- Roadmap 10 modules và strict clean architecture theo từng feature: đang là định hướng triển khai tiếp.

## Technology Stack

- Backend: NestJS
- ORM: TypeORM
- Database: PostgreSQL (`pgvector`)
- Cache / Broker: Redis
- Runtime: Node.js + pnpm
- Dev infrastructure: Docker Compose (Postgres + Redis)

## Kiến Trúc Tổng Thể

- Domain Layer: entities/types nghiệp vụ.
- Application Layer: use cases/services/events chứa business logic.
- Infrastructure Layer: repository/provider tích hợp DB, Redis, AI service.
- Presentation Layer: controllers/gateways nhận request từ client.

## Cấu Trúc Hiện Tại (Đã Verify)

```text
src/
├── common/
├── config/
├── database/
├── modules/
│   ├── auth/
│   ├── faces/
│   └── users/
└── packages/
    ├── ai/
    ├── domain/
    ├── infrastructure/
    ├── messsaging/
    └── persistence/
```

## Cấu Trúc Mục Tiêu Cho Mỗi Feature Module (Theo Setup Plan)

```text
src/modules/<feature>/
├── core/             # Domain entities, interfaces, domain exceptions
├── application/      # Use cases, events
├── infrastructure/   # Persistence + external integrations
├── presentation/     # Controllers + DTOs
└── <feature>.module.ts
```

## Roadmap 10 Feature Modules

1. `auth` + `users`
2. `classes`
3. `faces`
4. `attendance`
5. `real-time`
6. `records`
7. `exceptions`
8. `requests`
9. `notifications`
10. `admin`

## Local Setup

### 1) Chuẩn bị

- Node.js LTS
- pnpm
- Docker + Docker Compose

### 2) Tạo file môi trường

Tạo `.env` từ `.env.example`, sau đó cập nhật giá trị phù hợp:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=multiface
DB_SYNCHRONIZE=true
PORT=3000
REDIS_PORT=6379
```

### 3) Chạy hạ tầng local (Postgres + Redis)

```bash
docker compose up -d postgres redis
```

### 4) Cài dependencies và chạy backend

```bash
pnpm install
pnpm run start:dev
```

API mặc định chạy ở `http://localhost:3000` (hoặc theo `PORT`).

## Scripts

```bash
# build
pnpm run build

# start
pnpm run start
pnpm run start:dev
pnpm run start:debug
pnpm run start:prod

# lint & format
pnpm run lint
pnpm run format

# tests
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:e2e
```

## NestJS Best Practices (Áp Dụng Theo Kế Hoạch)

- Tránh circular dependency, ưu tiên event cho luồng nghiệp vụ liên module.
- Dùng repository pattern để dễ test/mock.
- Bảo mật theo RBAC (`Admin`, `Teacher`, `Student`) + validate input bằng `class-validator`.
- Dùng Redis cache/queue cho các tác vụ nặng hoặc bất đồng bộ.
- Chuẩn hóa lỗi với global exception filter.

## Verification Plan (Gộp Từ Setup Plan)

1. Duyệt kiến trúc và xác nhận thiết kế.
2. Scaffold các module/controller/service theo cấu trúc chuẩn.
3. Viết mock integration/e2e để kiểm tra wiring giữa các layer.

## Tài Liệu Liên Quan

- `setup-plan.md`
- `docs/db/db-design.md`
- `docs/api/api-doc.md`
- `docs/dev/coding-convention.md`
- `docs/dev/git-flow.md`
