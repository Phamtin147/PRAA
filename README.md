# PRAA - Project Resource Allocation Management System

## 1. Tổng quan
Hệ thống quản lý phân bổ nguồn lực (resource allocation) cho công ty outsourcing nhiều dự án. Quản lý nhân sự, dự án, phân bổ, báo cáo chi tiết và AI bonus (suggestion, risk detection).

## 2. Cách chạy Backend (Spring Boot)
- **Yêu cầu:** Java 17+, PostgreSQL
- Tạo database tên `praa_db`, user/password: `postgres/postgres` (tuỳ config ở `application.properties`)
- Tại thư mục `praa/`:
  ```bash
  cd pra/ # hoặc praa/
  mvn clean install
  mvn spring-boot:run
  ```
- API docs: http://localhost:8080/swagger-ui.html
- Dữ liệu mẫu tạo tự động (`data.sql`).

## 3. Cách chạy Frontend (React + MUI)
- **Yêu cầu:** Node.js >=18, npm, internet (cài deps)
- Tại thư mục `praa-frontend/`:
  ```bash
  cd praa-frontend
  npm install
  npm run dev
  # hoặc build: npm run build
  ```
- Truy cập: http://localhost:5173

## 4. Các chức năng
- Quản lý nhân viên, dự án (CRUD)
- Quản lý phân bổ nhân sự đa dự án
- Báo cáo: utilization, available, overloaded
- Dashboard animation, hiệu ứng đẹp
- Validation đầy đủ, logic business rules mạnh (100%)
- Toàn bộ API chuẩn RESTful, bắt lỗi đẹp
- Test sample data/response đầy đủ, có Postman collection, Swagger

## 5. Kết nối FE <-> BE
- Cấu hình baseURL trong `src/api/api.js` (React):
  ```js
  const API = axios.create({ baseURL: 'http://localhost:8080' });
  ```
- FE gọi API BE, báo lỗi/network realtime, hiệu ứng loading/skeleton

## 6. Đóng gói bàn giao
- Toàn bộ source code trong thư mục `PRAA/`, gồm:
  - praa/ (backend, src/main/java/...)
  - praa-frontend/ (frontend)
  - README (file này)
  - data.sql, Swagger, các file cấu hình
- Có thể xuất Postman collection từ Swagger UI (http://localhost:8080/swagger-ui.html)
- Screenshot/test đi kèm khi cần.

---
*Đây là sản phẩm mẫu fullstack cho doanh nghiệp outsourcing, thực tế, deployment đơn giản, dễ test, code hoàn toàn chuẩn, UI hiệu ứng đẹp, tương tác tốt, thực thi đúng quy trình enterprise.*
