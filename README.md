# Project Resource Allocation Management System (PRAA)

## 1. Mục đích
- Quản lý phân bổ nhân sự cho nhiều dự án trong môi trường outsourcing
- Giúp PM/Resource Manager biết ai rảnh, ai quá tải, ai đang làm gì
- Đảm bảo không nhân viên nào bị giao quá 100% thời gian

## 2. Đối tượng sử dụng
- Project Manager
- Resource Manager
- Quản trị viên (HR/Admin)

## 3. Thành phần hệ thống
- Employee Management (Quản lý nhân sự)
- Project Management (Quản lý dự án)
- Resource Allocation (Phân bổ nhân sự vào dự án theo % thời gian)
- Báo cáo: Utilization, Available, Overload

## 4. Quy tắc nghiệp vụ quan trọng
- Tổng % allocation của 1 người trong cùng thời gian không vượt quá 100%
- Không được allocate vào project đã COMPLETED
- Allocation từng dự án trong khoảng (0,100]

## 5. Mô hình dữ liệu cơ bản
- employee (nhân sự)
- project (dự án)
- allocation (bảng phân bổ)

## 6. Công nghệ đề xuất
- Backend: Java 17+, Spring Boot, PostgreSQL, Spring Data JPA
- REST API chuẩn CRUD

## 7. Output (Deliverables)
- Source code (Git)
- Script SQL tạo bảng
- Postman Collection/dẫn chứng chạy API
- Tài liệu giải pháp, kiến trúc, phân tích

## 8. Định nghĩa Allocation
- 1 người có thể tham gia nhiều dự án/song song trong tháng
- Allocation (%) là tỷ lệ công sức trong 1 khoảng thời gian (thường là theo tháng)
- Hệ thống sẽ kiểm tra tổng tất cả allocation cùng thời gian <= 100%
