# Multiface Backend Database Design

This document is primarily for backend, data, infra, and QA contributors who need to understand how the current database schema supports the application.

Use this document when you need table-level detail. For other viewpoints:
- API consumers should start with [`../api/api-doc.md`](../api/api-doc.md)
- New contributors should start with [`../overview/system-overview.md`](../overview/system-overview.md)
- Local environment setup is documented in [`../dev/local-setup.md`](../dev/local-setup.md)

At a high level, the currently active NestJS modules map to the schema like this:
- `auth` + `users`: users, roles, permissions, refresh tokens, departments, specializations
- `classes`: classes, members, schedules
- `files`: file metadata persisted in the `files` table
- `faces`: face registration requests and face images

Some additional schema areas described below represent broader product scope and future-facing structure, so always verify runtime exposure against `src/app.module.ts` and Swagger before assuming a table is already backed by a public API.

## 1. Scope and Source of Truth

This document describes the current relational database design used by the backend.

- ORM: TypeORM
- DB engine target: PostgreSQL (`type: 'postgres'` in TypeORM config)
- Schema source: `src/packages/infrastructure/entities/*.entity.ts`
- Enum source: `src/common/domain/enums/*.enum.ts`

The design follows a modular domain structure for:

- Organization and access control
- Classes and attendance
- Face registration and recognition
- Requests/appeals and notifications
- File metadata

## 2. Schema Conventions

- Table names use `snake_case` plural (for example `attendance_records`).
- Primary keys are mostly `int` with `@PrimaryGeneratedColumn`.
- Junction table `role_permissions` uses composite PK (`role_id`, `permission_id`).
- Timestamps are modeled with `datetime` and mapped by TypeORM decorators:
  - `@CreateDateColumn`: auto set when inserted
  - `@UpdateDateColumn`: auto updated on write
- Relationships are explicit via `@JoinColumn` and `onDelete` strategy.
- Soft delete is not implemented in this schema.

## 3. Enums

### `ApprovalStatus`

- `pending`
- `approved`
- `rejected`

### `AttendanceRecordStatus`

- `present`
- `absent`
- `late`
- `excused`
- `pending`

### `AttendanceSessionStatus`

- `active`
- `closed`

### `AttendanceType`

- `automatic`
- `manual`

## 4. Table Design

## 4.1 Organization and Access Control

### `departments`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Department identifier |
| `name` | varchar(255) | No |  |  | Department name |
| `code` | varchar(100) | No |  |  | Department code |
| `description` | text | Yes |  |  | Optional description |
| `created_at` | datetime | No |  | auto | Creation timestamp |

Relationships:

- `departments (1) -> (N) specializations`
- `departments (1) -> (N) users` through `users.department_id`

### `specializations`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Specialization identifier |
| `department_id` | int | No | FK |  | `departments.id` |
| `name` | varchar(255) | No |  |  | Specialization name |
| `code` | varchar(100) | No |  |  | Specialization code |
| `description` | text | Yes |  |  | Optional description |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `department_id -> departments.id` with `ON DELETE RESTRICT`

### `roles`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Role identifier |
| `name` | varchar(100) | No | UQ |  | Unique role name |
| `description` | text | Yes |  |  | Optional description |
| `created_at` | datetime | No |  | auto | Creation timestamp |

Constraints:

- Unique: `UQ_roles_name (name)`

### `permissions`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Permission identifier |
| `name` | varchar(120) | No | UQ |  | Unique permission name |
| `description` | text | Yes |  |  | Optional description |
| `created_at` | datetime | No |  | auto | Creation timestamp |

Constraints:

- Unique: `UQ_permissions_name (name)`

### `role_permissions`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `role_id` | int | No | PK, FK |  | `roles.id` |
| `permission_id` | int | No | PK, FK |  | `permissions.id` |
| `created_at` | datetime | No |  | auto | Assignment timestamp |

FK policy:

- `role_id -> roles.id` with `ON DELETE CASCADE`
- `permission_id -> permissions.id` with `ON DELETE CASCADE`

## 4.2 Users and Authentication

### `users`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | User identifier |
| `full_name` | varchar(255) | No |  |  | Display name |
| `email` | varchar(255) | No | UQ |  | Login email |
| `password_hash` | varchar(255) | No |  |  | Password hash |
| `role_id` | int | No | FK |  | `roles.id` |
| `avatar_file_id` | int | Yes | FK |  | `files.id` |
| `phone` | varchar(50) | Yes |  |  | Optional phone |
| `department_id` | int | Yes | FK |  | `departments.id` |
| `specialization_id` | int | Yes | FK |  | `specializations.id` |
| `created_at` | datetime | No |  | auto | Creation timestamp |
| `updated_at` | datetime | No |  | auto | Last update timestamp |

Constraints:

- Unique: `UQ_users_email (email)`

FK policy:

- `role_id -> roles.id` with `ON DELETE RESTRICT`
- `avatar_file_id -> files.id` with `ON DELETE SET NULL`
- `department_id -> departments.id` with `ON DELETE SET NULL`
- `specialization_id -> specializations.id` with `ON DELETE SET NULL`

### `refresh_tokens`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Token row ID |
| `user_id` | int | No | FK |  | `users.id` |
| `token` | varchar(500) | No |  |  | Refresh token value |
| `expires_at` | datetime | No |  |  | Expiry datetime |
| `revoked_at` | datetime | Yes |  |  | Revocation time |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `user_id -> users.id` with `ON DELETE CASCADE`

## 4.3 Classes and Attendance

### `classes`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Class identifier |
| `class_name` | varchar(255) | No |  |  | Class name |
| `class_code` | varchar(100) | No | UQ |  | Unique class code |
| `teacher_id` | int | No | FK |  | `users.id` |
| `description` | text | Yes |  |  | Optional class description |
| `created_at` | datetime | No |  | auto | Creation timestamp |

Constraints:

- Unique: `UQ_classes_class_code (class_code)`

FK policy:

- `teacher_id -> users.id` with `ON DELETE RESTRICT`

### `class_members`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Membership identifier |
| `class_id` | int | No | FK |  | `classes.id` |
| `student_id` | int | No | FK |  | `users.id` |
| `joined_at` | datetime | No |  | auto | Join timestamp |

FK policy:

- `class_id -> classes.id` with `ON DELETE CASCADE`
- `student_id -> users.id` with `ON DELETE CASCADE`

### `class_schedules`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Schedule identifier |
| `class_id` | int | No | FK |  | `classes.id` |
| `day_of_week` | int | No |  |  | Numeric weekday |
| `start_time` | time | No |  |  | Start time |
| `end_time` | time | No |  |  | End time |
| `room` | varchar(100) | No |  |  | Room label |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `class_id -> classes.id` with `ON DELETE CASCADE`

### `attendance_sessions`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Session identifier |
| `class_id` | int | No | FK |  | `classes.id` |
| `created_by` | int | No | FK |  | `users.id` |
| `start_time` | datetime | No |  |  | Session start |
| `end_time` | datetime | Yes |  |  | Session end |
| `attendance_type` | enum(`AttendanceType`) | No |  | `automatic` | Attendance mode |
| `confidence_threshold` | float | Yes |  |  | Face confidence cutoff |
| `status` | enum(`AttendanceSessionStatus`) | No |  | `active` | Session status |

FK policy:

- `class_id -> classes.id` with `ON DELETE CASCADE`
- `created_by -> users.id` with `ON DELETE RESTRICT`

### `attendance_records`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Attendance record ID |
| `session_id` | int | No | FK |  | `attendance_sessions.id` |
| `student_id` | int | No | FK |  | `users.id` |
| `status` | enum(`AttendanceRecordStatus`) | No |  | `pending` | Attendance status |
| `confidence_score` | float | Yes |  |  | Recognition confidence |
| `image_file_id` | int | Yes | FK |  | `files.id` |
| `recorded_at` | datetime | No |  | auto | Record timestamp |

FK policy:

- `session_id -> attendance_sessions.id` with `ON DELETE CASCADE`
- `student_id -> users.id` with `ON DELETE CASCADE`
- `image_file_id -> files.id` with `ON DELETE SET NULL`

## 4.4 Face Registration and Recognition

### `face_registration_requests`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Request identifier |
| `student_id` | int | No | FK |  | `users.id` |
| `status` | enum(`ApprovalStatus`) | No |  | `pending` | Review status |
| `reviewed_by` | int | Yes | FK |  | `users.id` reviewer |
| `reviewed_at` | datetime | Yes |  |  | Review timestamp |
| `rejection_reason` | text | Yes |  |  | Optional rejection reason |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `student_id -> users.id` with `ON DELETE CASCADE`
- `reviewed_by -> users.id` with `ON DELETE SET NULL`

### `face_images`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Face image identifier |
| `student_id` | int | No | FK |  | `users.id` |
| `request_id` | int | No | FK |  | `face_registration_requests.id` |
| `file_id` | int | No | FK |  | `files.id` |
| `status` | enum(`ApprovalStatus`) | No |  | `pending` | Review status |
| `reviewed_by` | int | Yes | FK |  | `users.id` reviewer |
| `reviewed_at` | datetime | Yes |  |  | Review timestamp |
| `rejection_reason` | text | Yes |  |  | Optional rejection reason |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `student_id -> users.id` with `ON DELETE CASCADE`
- `request_id -> face_registration_requests.id` with `ON DELETE CASCADE`
- `file_id -> files.id` with `ON DELETE CASCADE`
- `reviewed_by -> users.id` with `ON DELETE SET NULL`

### `face_embeddings`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Embedding row ID |
| `student_id` | int | No | FK |  | `users.id` |
| `face_image_id` | int | No | FK |  | `face_images.id` |
| `embedding` | simple-json | No |  |  | Numeric vector (`number[]`) |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `student_id -> users.id` with `ON DELETE CASCADE`
- `face_image_id -> face_images.id` with `ON DELETE CASCADE`

### `recognition_events`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Recognition event ID |
| `session_id` | int | No | FK |  | `attendance_sessions.id` |
| `frame_id` | varchar(120) | No |  |  | Frame identifier |
| `image_file_id` | int | Yes | FK |  | `files.id` |
| `detected_student_id` | int | Yes | FK |  | `users.id` |
| `confidence_score` | float | Yes |  |  | Recognition confidence |
| `is_real_face` | boolean | No |  | `true` | Liveness/spoofing result |
| `created_at` | datetime | No |  | auto | Event timestamp |

FK policy:

- `session_id -> attendance_sessions.id` with `ON DELETE CASCADE`
- `image_file_id -> files.id` with `ON DELETE SET NULL`
- `detected_student_id -> users.id` with `ON DELETE SET NULL`

### `unknown_faces`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Unknown face ID |
| `session_id` | int | No | FK |  | `attendance_sessions.id` |
| `frame_id` | varchar(120) | No |  |  | Frame identifier |
| `image_file_id` | int | No | FK |  | `files.id` |
| `detected_at` | datetime | No |  | auto | Detection timestamp |

FK policy:

- `session_id -> attendance_sessions.id` with `ON DELETE CASCADE`
- `image_file_id -> files.id` with `ON DELETE CASCADE`

## 4.5 Requests, Appeals, and Notifications

### `leave_requests`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Leave request ID |
| `student_id` | int | No | FK |  | `users.id` |
| `class_id` | int | No | FK |  | `classes.id` |
| `session_id` | int | Yes | FK |  | `attendance_sessions.id` |
| `reason` | text | No |  |  | Leave reason |
| `evidence_file_id` | int | Yes | FK |  | `files.id` |
| `status` | enum(`ApprovalStatus`) | No |  | `pending` | Review status |
| `reviewed_by` | int | Yes | FK |  | `users.id` reviewer |
| `reviewed_at` | datetime | Yes |  |  | Review timestamp |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `student_id -> users.id` with `ON DELETE CASCADE`
- `class_id -> classes.id` with `ON DELETE CASCADE`
- `session_id -> attendance_sessions.id` with `ON DELETE SET NULL`
- `evidence_file_id -> files.id` with `ON DELETE SET NULL`
- `reviewed_by -> users.id` with `ON DELETE SET NULL`

### `appeals`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Appeal ID |
| `student_id` | int | No | FK |  | `users.id` |
| `session_id` | int | No | FK |  | `attendance_sessions.id` |
| `reason` | text | No |  |  | Appeal reason |
| `evidence_file_id` | int | Yes | FK |  | `files.id` |
| `status` | enum(`ApprovalStatus`) | No |  | `pending` | Review status |
| `reviewed_by` | int | Yes | FK |  | `users.id` reviewer |
| `reviewed_at` | datetime | Yes |  |  | Review timestamp |

FK policy:

- `student_id -> users.id` with `ON DELETE CASCADE`
- `session_id -> attendance_sessions.id` with `ON DELETE CASCADE`
- `evidence_file_id -> files.id` with `ON DELETE SET NULL`
- `reviewed_by -> users.id` with `ON DELETE SET NULL`

### `notifications`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | Notification ID |
| `user_id` | int | No | FK |  | `users.id` |
| `title` | varchar(255) | No |  |  | Notification title |
| `content` | text | No |  |  | Notification body |
| `is_read` | boolean | No |  | `false` | Read flag |
| `created_at` | datetime | No |  | auto | Creation timestamp |

FK policy:

- `user_id -> users.id` with `ON DELETE CASCADE`

## 4.6 File Metadata

### `files`

| Column | Type | Null | Key | Default | Notes |
|---|---|---|---|---|---|
| `id` | int | No | PK | auto | File identifier |
| `uploader_id` | int | No | FK |  | `users.id` |
| `file_key` | varchar(500) | No |  |  | Storage key/path |
| `filename` | varchar(255) | No |  |  | Original filename |
| `mime_type` | varchar(150) | No |  |  | MIME type |
| `size` | int | No |  |  | File size (bytes) |
| `category` | varchar(100) | No |  |  | File category |
| `created_at` | datetime | No |  | auto | Upload timestamp |

FK policy:

- `uploader_id -> users.id` with `ON DELETE RESTRICT`

Referenced by:

- `users.avatar_file_id` (`SET NULL`)
- `face_images.file_id` (`CASCADE`)
- `attendance_records.image_file_id` (`SET NULL`)
- `recognition_events.image_file_id` (`SET NULL`)
- `unknown_faces.image_file_id` (`CASCADE`)
- `leave_requests.evidence_file_id` (`SET NULL`)
- `appeals.evidence_file_id` (`SET NULL`)

## 5. High-Level Relationship Graph

Core graph:

- Access control: `roles <-> role_permissions <-> permissions`
- User profile: `users -> roles`, optional to `departments`, `specializations`, `files (avatar)`
- Academic structure: `classes -> class_members`, `classes -> class_schedules`, `classes -> attendance_sessions`
- Attendance flow: `attendance_sessions -> attendance_records`, `recognition_events`, `unknown_faces`
- Face onboarding: `face_registration_requests -> face_images -> face_embeddings`
- Review workflows: `leave_requests`, `appeals`, `face_registration_requests`, `face_images` all support reviewer linkage (`reviewed_by`)
- Media hub: `files` is reused by avatar/evidence/face/recognition/attendance artifacts

## 6. Current Constraints and Integrity Notes

- Explicit unique constraints exist for:
  - `users.email`
  - `classes.class_code`
  - `roles.name`
  - `permissions.name`
- Many FK columns do not define extra indexes in entity metadata.
  - PostgreSQL does not auto-create indexes on FK columns.
  - If query volume grows, add indexes on frequent filters/joins (`student_id`, `session_id`, `class_id`, `user_id`, `created_at`, `status`).
- No soft delete columns exist; deletes are hard deletes controlled by FK `ON DELETE`.

## 7. Suggested Future Enhancements

- Add explicit indexes for high-frequency lookups:
  - `attendance_records(session_id, student_id)`
  - `recognition_events(session_id, created_at)`
  - `unknown_faces(session_id, detected_at)`
  - `face_images(request_id, student_id, status)`
  - `leave_requests(student_id, status, created_at)`
  - `appeals(student_id, status, session_id)`
  - `notifications(user_id, is_read, created_at)`
  - `refresh_tokens(user_id, expires_at, revoked_at)`
- Consider uniqueness constraints where business rules require it:
  - Potentially `departments.code`, `specializations.code`
  - Potentially class membership uniqueness (`class_id`, `student_id`)
- Consider moving vector storage from `simple-json` to native `pgvector` if similarity search is required at scale.

