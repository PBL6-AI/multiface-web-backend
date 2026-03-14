## Git Flow

##### `main` branch

- Description: The main branch stores the official release history
- Purpose: Deploy to `production` environment
- Parent branch: `main`
- Member permissions: read only (pull, fetch)
- Team Leader permissions: Merge pull request from `staging`, `hotfix/*` branches
- _Important: Direct pushes to the `main` branch are prohibited. Only the Team Leader has permission to merge changes through pull requests_

##### `staging` branch

- Description: The staging branch stores the pre-release history
- Purpose: Deploy to `staging` environment
- Parent branch: `main`
- Member permissions: read only (pull, fetch)
- Team Leader permissions: Merge pull request from `develop`, `hotfix/*`, `main` branches
- _Important: Direct pushes to the `staging` branch are prohibited. Only the Team Leader has permission to merge changes through pull requests_

##### `develop` branch

- Description: The develop branch serves as an integration branch for features
- Parent branch: `staging`
- Member permissions: read only (pull, fetch)
- Team Leader permissions: Merge pull request from `feature/*`, `staging` branches

##### `hotfix/*` branches

- Description: The hotfix branches are used to quickly patch production releases
- Parent branch: `main`
- Member permissions: create, push, pull, fetch, merge

### Commit rules

#### Quy tắc đặt tên Commit Message

**Format tổng quát**

```text
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

- **type** (bắt buộc)
  - **build**: Thay đổi ảnh hưởng đến hệ thống hoặc các phụ thuộc bên ngoài (ví dụ: pnpm, docker...).
  - **ci**: Thay đổi cấu hình CI/CD.
  - **docs**: Thay đổi tài liệu (README, docs nội bộ...).
  - **feat**: Thêm một tính năng mới.
  - **fix**: Sửa lỗi.
  - **perf**: Thay đổi code để cải thiện hiệu năng.
  - **refactor**: Thay đổi code không sửa bug và cũng không thêm tính năng mới (tái cấu trúc, dọn dẹp code).
  - **style**: Thay đổi không ảnh hưởng đến logic (ví dụ: white-space, formatting, missing semicolons...).
  - **test**: Thêm hoặc sửa code test.

- **scope** (tùy chọn): là phạm vi ảnh hưởng của phần code đã thay đổi. Một số scope khuyến nghị:
  - **core**: thay đổi ảnh hưởng đến core của dự án.
  - **forms**: thay đổi liên quan đến các form.
  - **common**: thay đổi trong các module/tệp dùng chung.
  - **router**: thêm hoặc thay đổi router.
  - **compiler**: thay đổi liên quan đến quá trình build/compile.
  - **language-service**: thay đổi liên quan đến ngôn ngữ/dịch vụ ngôn ngữ.
  - **elements**: thay đổi liên quan đến UI elements (HTML, CSS).
  - **upgrade**: thay đổi liên quan đến việc nâng cấp hệ thống, dependency.
  - **http**: thay đổi liên quan đến các method/http client.
  - **platform-browser**: thay đổi để tương thích với trình duyệt.
  - **platform-server**: thay đổi để tương thích với nền tảng server.
  - **service-worker**: thay đổi liên quan đến service worker hoặc các service nền.

- **description** (bắt buộc): mô tả ngắn gọn về phần code đã thay đổi bằng **TIẾNG ANH**.
  - Không viết hoa chữ cái đầu tiên.
  - Không có dấu chấm ở cuối câu.
  - Sử dụng câu mệnh lệnh, ví dụ: `change` (không dùng `changed` hoặc `changes`).

- **header** (`<type>[optional scope]: <description>`):
  - Không quá **100 ký tự**.

- **body** (tùy chọn):
  - Giải thích chi tiết hơn cho sự thay đổi.
  - Có thể so sánh code hiện tại với code cũ, nêu rõ lý do và bối cảnh thay đổi.

- **footer** (tùy chọn):
  - Ghi chú về **Breaking Changes** (nếu có).

**Ví dụ**

```text
ci: config CI/CD check commitlint

refactor(core): fix bug sonar of betting
```
