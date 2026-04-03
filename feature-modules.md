# Feature Modules - Multiface Web Backend

## 1. Tổng quan dự án

Multiface Web Backend là hệ thống điểm danh bằng nhận diện khuôn mặt, xây dựng trên NestJS và TypeORM, hướng đến mô hình mở rộng theo feature modules và tích hợp AI service.

Mục tiêu chính:

- Tự động hóa điểm danh, giảm gian lận và tiết kiệm thời gian cho giảng viên.
- Quản lý xuyên suốt từ đăng ký khuôn mặt đến thống kê chuyên cần.
- Hỗ trợ phân quyền theo vai trò Admin, Teacher, Student.
- Theo dõi và xử lý ngoại lệ theo thời gian thực.

Trạng thái codebase hiện tại:

- Đã scaffold các module gốc trong `src/modules`: `auth`, `users`, `faces`.
- Đã có bộ entity TypeORM đầy đủ cho các nghiệp vụ lớn (lớp học, điểm danh, face registration, appeal/leave, notification).
- Logic controller/service cho phần lớn module đang trong giai đoạn triển khai tiếp theo.

## 2. Bản đồ module chức năng

| STT | Module                           | Mục tiêu nghiệp vụ                                   | Entity liên quan (hiện có)                                                                              | Trạng thái                    |
| --- | -------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | Authentication & User Management | Xác thực, phân quyền, quản lý profile                | `users`, `roles`, `permissions`, `role_permissions`, `refresh_tokens`, `departments`, `specializations` | Đã có schema, module scaffold |
| 2   | Class Management                 | Quản lý lớp, mã lớp, danh sách sinh viên             | `classes`, `class_members`, `class_schedules`                                                           | Đã có schema                  |
| 3   | Face Registration                | Đăng ký và phê duyệt dữ liệu khuôn mặt               | `face_registration_requests`, `face_images`, `face_embeddings`, `files`                                 | Đã có schema                  |
| 4   | Automatic Attendance             | Nhận diện đa khuôn mặt và điểm danh tự động          | `attendance_sessions`, `recognition_events`, `attendance_records`, `unknown_faces`                      | Đã có schema                  |
| 5   | Real-time Monitoring             | Giám sát kết quả điểm danh trực tiếp                 | `recognition_events`, `attendance_records` (dữ liệu nguồn), messaging/socket layer (dự kiến)            | Đang định hướng               |
| 6   | Attendance Management            | Lưu trữ, thống kê, báo cáo điểm danh                 | `attendance_records`, `attendance_sessions`, `classes`, `class_members`                                 | Đã có schema                  |
| 7   | Exception Handling               | Xử lý kết quả nhận diện không chắc chắn/không hợp lệ | `recognition_events`, `unknown_faces`, `attendance_records`                                             | Đã có schema                  |
| 8   | Appeal & Leave Request           | Xin nghỉ, khiếu nại điểm danh, duyệt yêu cầu         | `leave_requests`, `appeals`, `files`                                                                    | Đã có schema                  |
| 9   | Notification System              | Gửi thông báo sự kiện quan trọng cho người dùng      | `notifications`                                                                                         | Đã có schema                  |

## 3. Chi tiết module

## 3.1 Module Xác thực và Quản lý người dùng (Authentication & User Management)

Mục tiêu:

- Đảm bảo chỉ người dùng hợp lệ mới truy cập được hệ thống.
- Kiểm soát quyền theo RBAC cho Admin, Teacher, Student.

Chức năng chính:

- Đăng nhập, đăng xuất.
- Xác thực bằng JWT và refresh token.
- Phân quyền theo vai trò.
- Cập nhật thông tin cá nhân.

Dữ liệu chính:

- `users`, `roles`, `permissions`, `role_permissions`, `refresh_tokens`.
- Hỗ trợ hồ sơ học thuật qua `departments`, `specializations`.

Trạng thái thực tế:

- Đã có module `auth`, `users` và DTO có validate.
- Guard/logic xác thực đang trong quá trình hoàn thiện.

## 3.2 Module Quản lý lớp học (Class Management)

Mục tiêu:

- Tổ chức sinh viên theo lớp học để phục vụ điểm danh và thống kê.

Chức năng chính:

- Tạo, cập nhật, xóa lớp học.
- Sinh và quản lý `class_code`.
- Sinh viên tham gia lớp bằng `class_code`.
- Quản lý danh sách thành viên lớp.

Dữ liệu chính:

- `classes`: thông tin lớp, giáo viên phụ trách, mã lớp duy nhất.
- `class_members`: quan hệ lớp - sinh viên.
- `class_schedules`: lịch học theo thứ, giờ, phòng.

## 3.3 Module Đăng ký khuôn mặt (Face Registration)

Mục tiêu:

- Thu thập và chuẩn hóa dữ liệu mẫu khuôn mặt của sinh viên để nhận diện.

Quy trình nghiệp vụ:

1. Sinh viên upload ảnh khuôn mặt.
2. Hệ thống kiểm tra chất lượng ảnh (có mặt, độ rõ, góc mặt, ánh sáng).
3. Đưa vào hàng chờ duyệt bởi Teacher/Admin.
4. Gửi ảnh đã duyệt sang AI service để trích xuất embedding vector.
5. Lưu vector vào CSDL để sử dụng cho nhận diện.

Dữ liệu chính:

- `face_registration_requests`: yêu cầu đăng ký và trạng thái duyệt.
- `face_images`: ảnh khuôn mặt + kết quả duyệt.
- `face_embeddings`: vector đặc trưng khuôn mặt.
- `files`: metadata file ảnh.

## 3.4 Module Điểm danh tự động (Automatic Attendance)

Mục tiêu:

- Tự động nhận diện nhiều khuôn mặt trong lớp và cập nhật điểm danh theo phiên.

Quy trình nghiệp vụ:

1. Giảng viên khởi tạo `attendance_session` (lớp, thời gian bắt đầu/kết thúc, ngưỡng confidence).
2. Camera gửi frame về hệ thống.
3. Phát hiện nhiều khuôn mặt trong mỗi frame.
4. Anti-spoofing để lọc khuôn mặt giả.
5. Trích xuất embedding frame và so khớp với embedding đã lưu.
6. Không điểm danh lặp cho sinh viên đã nhận diện trong cùng phiên.
7. Cập nhật `attendance_records` theo kết quả nhận diện.

Dữ liệu chính:

- `attendance_sessions`, `attendance_records`.
- `recognition_events` để log sự kiện nhận diện.
- `unknown_faces` để ghi nhận mặt không xác định.

## 3.5 Module Giám sát điểm danh thời gian thực (Real-time Monitoring)

Mục tiêu:

- Cung cấp màn hình theo dõi trực tiếp quá trình điểm danh cho giảng viên.

Chức năng chính:

- Hiển thị danh sách sinh viên đã được nhận diện.
- Cập nhật trạng thái điểm danh theo thời gian thực.
- Phát thông báo khi điểm danh thành công.

Định hướng kỹ thuật:

- Sử dụng WebSocket/Socket.IO cho kênh real-time.
- Có thể kết hợp Redis pub/sub để scale theo nhiều instance.
- Nguồn dữ liệu đến từ `recognition_events` và `attendance_records`.

## 3.6 Module Quản lý kết quả điểm danh (Attendance Management)

Mục tiêu:

- Quản trị dữ liệu điểm danh sau khi kết thúc phiên.

Chức năng chính:

- Lưu trữ lịch sử điểm danh theo buổi/lớp/sinh viên.
- Thống kê có mặt, vắng, đi muộn, có phép.
- Tính tỷ lệ chuyên cần.
- Xuất báo cáo (Excel/PDF) cho học kỳ/buổi học.

Dữ liệu chính:

- `attendance_records`, `attendance_sessions`, `classes`, `class_members`.

## 3.7 Module Xử lý ngoại lệ (Exception Handling)

Mục tiêu:

- Xử lý các trường hợp nhận diện không đủ độ tin cậy hoặc bất thường.

Chức năng chính:

- Đánh giá confidence score để quyết định chấp nhận/chờ duyệt/từ chối.
- Đưa kết quả trung gian vào hàng chờ xác nhận thủ công.
- Phát hiện và cảnh báo khuôn mặt lạ.

Dữ liệu chính:

- `recognition_events`: confidence, kết quả anti-spoofing (`is_real_face`).
- `attendance_records`: các trạng thái như `pending`, `present`, `absent`, `excused`.
- `unknown_faces`: lưu vết mặt lạ theo phiên và frame.

## 3.8 Module Khiếu nại và xin nghỉ học (Appeal & Leave Request)

Mục tiêu:

- Tạo kênh tương tác hai chiều giữa sinh viên và giảng viên cho sai sót điểm danh.

Chức năng chính:

- Sinh viên gửi đơn xin nghỉ học.
- Sinh viên gửi khiếu nại khi bị điểm danh sai.
- Giảng viên/quản trị viên phê duyệt hoặc từ chối.
- Cập nhật lại kết quả điểm danh nếu yêu cầu hợp lệ.

Dữ liệu chính:

- `leave_requests`, `appeals`, `files` (minh chứng).

## 3.9 Module Thông báo (Notification System)

Mục tiêu:

- Đẩy thông tin sự kiện quan trọng đến đúng người dùng, đúng thời điểm.

Chức năng chính:

- Thông báo khi điểm danh thành công.
- Cảnh báo vắng quá ngưỡng.
- Thông báo kết quả duyệt đơn/khiếu nại.
- Cảnh báo nghi ngờ spoofing hoặc phát hiện khuôn mặt lạ.

Dữ liệu chính:

- `notifications`.

## 4. Luồng liên module tổng thể

1. Người dùng đăng nhập qua module Auth/User.
2. Teacher quản lý lớp trong module Class Management.
3. Student đăng ký khuôn mặt qua Face Registration.
4. Teacher mở phiên điểm danh trong Automatic Attendance.
5. Hệ thống stream kết quả sang Real-time Monitoring.
6. Kết quả cuối được tổng hợp trong Attendance Management.
7. Trường hợp bất thường được đưa qua Exception Handling.
8. Student gửi Leave/Appeal nếu cần, Teacher xử lý.
9. Notification module đẩy kết quả và cảnh báo cho người liên quan.

## 5. Ghi chú triển khai

- Tại thời điểm hiện tại, lớp data model đã sẵn sàng cho toàn bộ 9 module nghiệp vụ.
- Ưu tiên tiếp theo nên tập trung vào:
  - Hoàn thiện Auth (JWT, refresh token, guard, RBAC).
  - Triển khai luồng Face Registration và Attendance session end-to-end.
  - Bổ sung real-time gateway và cơ chế event/messaging.
