# Kế hoạch triển khai Kiến trúc (Architecture Implementation Plan) cho Multiface

Dự án Hệ thống Điểm danh Khuôn mặt (Multiface) yêu cầu một kiến trúc mạnh mẽ, có khả năng mở rộng, độ trễ thấp và dễ bảo trì. Dựa trên 10 phân hệ (modules) yêu cầu và tài liệu guideline `nestjs-best-practices`, hệ thống sẽ được thiết kế theo mô hình **Clean Architecture cơ bản** kết hợp với **NestJS Feature Modules** và **Event-Driven Architecture**.

## Technology Stack (Công nghệ sử dụng)
Dựa trên phản hồi, dự án sẽ sử dụng các công nghệ sau định hướng cho môi trường phát triển:
- **Backend Framework**: NestJS.
- **Database**: PostgreSQL tích hợp `pgvector` (để lưu trữ và query các Vector/Face Embeddings, thuận tiện cho AI service sau này).
- **ORM**: TypeORM.
- **Cache & Message Broker (Event)**: Redis.
- **Môi trường Phát triển (Development Environment)**: 
  - Chạy `PostgreSQL` và `Redis` qua **Docker Compose** để dễ dàng khởi tạo.
  - Chạy backend source code bằng Node.js ở **Local (Host machine)** với chức năng Hot-Reloading của NestJS.

### 1. Kiến trúc tổng thể (Architecture Overview)

Theo Clean Architecture và NestJS Architecture Principles, hệ thống chia thành các layer:

- **Domain Layer (Entities/Types):** Chứa định nghĩa thực thể CSDL (User, Class, AttendanceRecord, Vector).
- **Application Layer (Services/Events):** Chứa business logic. Các thao tác phức tạp (cập nhật DB + gọi AI Model) có thể được tách biệt bằng Event (`arch-use-events`).
- **Infrastructure Layer (Repositories/Providers):** Cài đặt Database Repository sử dụng TypeORM (`arch-use-repository-pattern`), giao tiếp với PostgreSQL, Redis và AI Services.
- **Presentation/Interface Layer (Controllers/Gateways):** Tiếp nhận HTTP Request từ Web/App hoặc kết nối WebSocket (`Real-time Monitoring`).

### 2. Cấu trúc thư mục tương lai của dự án (src/)

```text
src/
├── common/               # Core layer: Các thành phần dùng chung toàn cục
│   ├── decorators/       # @CurrentUser(), @Roles()...
│   ├── filters/          # Global Exception Filter (error-use-exception-filters)
│   ├── guards/           # JwtAuthGuard, RolesGuard (security-use-guards)
│   ├── interceptors/     # Format response, Transform response
│   └── pipes/            # Validation pipes toàn cục
├── config/               # devops-use-config-module: Cấu hình DB, JWT, AI Service
├── database/             # Migrations, Setup TypeORM (với hệ quản trị PostgreSQL & pgvector)
├── infrastructure/       # Tầng kết nối bên ngoài
│   ├── ai/               # HTTP(s) / gRPC client gọi qua Python/AI Service
│   ├── redis/            # Caching/Queue cho Event logic
│   └── messaging/        # Xử lý Email, Socket.io
└── modules/              # TẤT CẢ 10 TÍNH NĂNG ĐƯỢC CHIA TẠI ĐÂY (arch-feature-modules)
    ├── auth/             # 1. (Một phần) Login, JWT, Refresh Token
    ├── users/            # 1. (Một phần) Quản lý User, Thông tin cá nhân
    ├── classes/          # 2. Lớp học, Class Code, Enrollments
    ├── faces/            # 3. Đăng ký khuôn mặt, Validate, Vector ID
    ├── attendance/       # 4. Phiên điểm danh, Detect Multiple Faces (API -> AI), Anti-spoof
    ├── real-time/        # 5. Gateway Websocket gửi kết quả realtime cho giảng viên
    ├── records/          # 6. Lịch sử điểm danh, Thống kê, Báo cáo
    ├── exceptions/       # 7. Xử lý Unknown faces, Confirm thủ công
    ├── requests/         # 8. Xin nghỉ học (Leaves) & Khiếu nại (Appeals)
    ├── notifications/    # 9. Gửi Alert (Cảnh báo giả mạo, Vắng học)
    └── admin/            # 10. Quản lý chung, AI Config (Threshold), Logs hệ thống
```

### 3. Thiết kế bên trong một Feature Module (Strict Clean Architecture)

Mỗi tính năng sẽ tuân thủ `arch-single-responsibility` và Clean Architecture một cách chặt chẽ, tách biệt hoàn toàn Core, Application, Infrastructure và Presentation. Ví dụ Module `faces`:

```text
src/modules/faces/
├── core/                       # DOMAIN/ENTERPRISE LAYER (Không phụ thuộc Framework, Database)
│   ├── entities/               # Domain Entities thuần túy (VD: face.entity.ts)
│   ├── exceptions/             # Custom Exceptions của Domain (VD: face-not-found.exception.ts)
│   └── interfaces/             # Interfaces để Dependency Inversion (VD: i-faces.repository.ts)
│
├── application/                # APPLICATION LAYER (Business Logic Use Cases)
│   ├── use-cases/              # Các Use Case cụ thể hoặc Services (VD: register-face.use-case.ts)
│   └── events/                 # Định nghĩa Events (VD: face-registered.event.ts)
│
├── infrastructure/             # INFRASTRUCTURE LAYER (External, Database)
│   ├── persistence/            # Thao tác Database (TypeORM)
│   │   ├── faces.repository.ts # Implement i-faces.repository.ts (ứng dụng Data Mapper)
│   │   ├── face.orm-entity.ts  # TypeORM Entity (@Entity, @Column...)
│   │   └── face.mapper.ts      # Chuyển đổi giữa Domain Entity <-> ORM Entity
│   └── external/               # Gọi API / HTTP Client ngoài (VD AI Service)
│
├── presentation/               # PRESENTATION LAYER (Giao tiếp với Client)
│   ├── controllers/            # HTTP Controllers (VD: faces.controller.ts)
│   └── dtos/                   # Data Transfer Objects (VD: register-face.dto.ts)
│
└── faces.module.ts             # Cấu hình providers, inject dependencies (Wire mọi thứ lại)
```

**Lưu ý khi áp dụng Strict Clean Architecture:**
- **Tầng Core** định nghĩa `IFacesRepository` (Interface thuần TypeScript).
- **Tầng Application** inject và tương tác với DB thông qua `IFacesRepository`, không biết đến TypeORM.
- **Tầng Infrastructure** thiết kế class implements `IFacesRepository`, thao tác DB bằng TypeORM và sử dụng `Mapper` để ánh xạ ORM Entity thành Domain Entity trước khi trả về cho Application Layer.
- NestJS Module (`faces.module.ts`) sử dụng Custom Provider: `{ provide: 'IFacesRepository', useClass: FacesTypeOrmRepository }`.

### 4. Application of NestJS Best Practices

- **Architecture (`arch-*`)**:
  - Không có Circular Dependency (Sử dụng Event thay vì inject chéo `FaceService` và `VectorService`).
  - Sử dụng Repository Design Pattern custom hoặc theo Pattern của ORM (để dễ unit test/mock).
- **Security (`security-*`)**:
  - RBAC (Role-based Access Control): `Admin`, `Teacher`, `Student`.
  - Validate 100% input bằng `class-validator` (ngăn XSS, Injection).
- **Performance (`perf-*`)**:
  - Sử dụng Caching / Redis cho việc tra cứu thông tin Lớp học hoặc Session điểm danh hiện tại.
  - Sử dụng Async Queues (ví dụ BullMQ) để gửi yêu cầu trích xuất Vector sang AI Service, vì việc này tốn thời gian.
- **Error Handling (`error-*`)**:
  - Global Filter bắt `HttpException` trả về chuẩn: `{ statusCode, message, timestamp, path }`.

## Verification Plan
1. **Duyệt kiến trúc**: Người dùng xem lại sơ đồ và phản hồi để xác thực ý kiến.
2. **Setup Dự án**: Sinh mã khởi tạo khung NestJS và các module, controller, service cơ bản theo cấu trúc trên.
3. **Mock Integration Tests**: Viết E2E Config kiểm tra xem các layers có gọi nhau đúng hay bị lỗi Dependency.
