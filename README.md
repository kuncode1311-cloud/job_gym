# 🏋️ HỆ THỐNG QUẢN LÝ PHÒNG TẬP GYM & FITNESS

> **Dự án:** Ứng dụng Quản Lý Phòng Tập Gym & Fitness Hiện Đại  
> **Trải nghiệm trực tiếp (Live Demo):** [https://kuncode1311-cloud.github.io/job_gym/](https://kuncode1311-cloud.github.io/job_gym/)  
> **File Cơ sở dữ liệu:** `database/gym_management.sql` (Chuẩn MySQL / phpMyAdmin)

---

## 🌟 Giới Thiệu Dự Án

Hệ thống quản lý phòng Gym chuyên nghiệp được xây dựng theo phong cách thiết kế hiện đại (Dark Mode Glow Red), tối ưu trải nghiệm người dùng và chuẩn hóa 100% theo mô hình cơ sở dữ liệu quan hệ.

Hệ thống hỗ trợ đầy đủ các phân hệ chức năng:
- 👥 **Quản lý Hội viên:** Đăng ký gói tập, tạo mã VietQR thanh toán tự động, theo dõi hạn tập.
- 💳 **Quản lý Thanh toán & Hóa đơn:** Thu tiền qua VietQR, Tiền mặt, Thẻ POS, Ví MoMo và in phiếu thu.
- 🏋️ **Huấn luyện viên (PT):** Quản lý hồ sơ HLV, lịch dạy, học viên kèm và đánh giá sao.
- 💬 **Đánh giá & Góp ý (Feedback):** Tiếp nhận phản hồi trực tiếp từ khách hàng bên ngoài trang đăng nhập.
- 📦 **Quản lý Kho & Bán lẻ:** Theo dõi tồn kho Thực phẩm bổ sung (Whey, BCAA), Nước uống, Trang phục, Phụ kiện.
- 📊 **Báo cáo & Thống kê:** Phân tích doanh thu gói tập, doanh thu bán lẻ F&B, hiệu suất HLV và xuất file Excel (.xls) có màu sắc chuyên nghiệp.
- ⏰ **Chấm công & Bảng lương:** Điểm danh ca làm việc, tính lương tự động cho nhân viên và HLV.

---

## 🚀 Hướng Dẫn Triển Khai & Kết Nối Hệ Thống

Chỉ với **3 bước đơn giản** để kết nối toàn bộ giao diện với hệ thống Backend:

### 1️⃣ Bước 1: Cài đặt Cơ sở dữ liệu
- Mở **phpMyAdmin** (trên XAMPP, Laragon hoặc máy chủ MySQL).
- Tạo cơ sở dữ liệu tên: `gym_management_system`.
- Nhập (Import) file **`database/gym_management.sql`** có sẵn trong dự án.

### 2️⃣ Bước 2: Cấu hình kết nối API
- Mở file: **`frontend/js/api.js`**.
- Đổi cấu hình kết nối sang server Backend của bạn:
```javascript
const GymAPI = {
  USE_REAL_BACKEND: true, // Bật chế độ kết nối dữ liệu thật
  BASE_URL: 'http://localhost/GYM_BE/api', // Đường dẫn thư mục API Backend
  ...
};
```

### 3️⃣ Bước 3: Cấu hình Header cho Server Backend (Ví dụ PHP)
Để trình duyệt không bị chặn kết nối, đặt đoạn mã này ở đầu các file xử lý API:
```php
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

---

## 📡 Danh Sách Các API Kết Nối Dữ Liệu

Tất cả các API đều giao tiếp bằng định dạng **JSON**. Dưới đây là danh sách các đường dẫn chính:

### 1. Phân hệ Hội viên (`/api/members`)
- `GET /api/members` : Lấy danh sách toàn bộ hội viên.
- `POST /api/members` : Thêm mới hội viên (kèm gói tập & hình thức thanh toán).
- `PUT /api/members/{id}` : Cập nhật thông tin hội viên.
- `DELETE /api/members/{id}` : Xóa / hủy gói hội viên.

*Mẫu dữ liệu gửi khi thêm mới hội viên:*
```json
{
  "Code": "HV-1007",
  "Fullname": "Nguyễn Văn Nam",
  "Gender": "Male",
  "BirthDate": "1998-06-15",
  "Phone": "0909123456",
  "Email": "nam.nguyen@gmail.com",
  "Address": "123 Nguyễn Huệ, Q.1",
  "PackageName": "Gói 3 tháng",
  "Price": 1500000,
  "JoinDate": "2026-08-30",
  "EndDate": "2026-11-30",
  "PaymentMethod": "VietQR",
  "PaymentStatus": "Paid",
  "Status": "Active"
}
```

---

### 2. Phân hệ Thanh toán & Hóa đơn (`/api/payments`)
- `GET /api/payments` : Lấy lịch sử giao dịch thu tiền.
- `POST /api/payments` : Tạo hóa đơn thu tiền mới.

*Mẫu dữ liệu hóa đơn:*
```json
{
  "Code": "INV-20260830-1007",
  "MemberName": "Nguyễn Văn Nam",
  "MemberCode": "HV-1007",
  "PackageName": "Gói 3 tháng",
  "Amount": 1500000,
  "PaymentMethod": "VietQR",
  "PaymentDate": "2026-08-30",
  "Status": "Completed"
}
```

---

### 3. Phân hệ Huấn luyện viên (`/api/trainers`)
- `GET /api/trainers` : Lấy danh sách HLV, chuyên môn và số năm kinh nghiệm.
- `POST /api/trainers` : Thêm mới hồ sơ HLV.
- `PUT /api/trainers/{id}` : Chỉnh sửa thông tin HLV.

---

### 4. Phân hệ Đánh giá & Góp ý (`/api/feedbacks`)
- `GET /api/feedbacks` : Lấy danh sách đánh giá của học viên.
- `POST /api/feedbacks` : Gửi đánh giá sao & nhận xét mới từ khách hàng.

*Mẫu dữ liệu đánh giá:*
```json
{
  "TrainerID": 1,
  "TrainerName": "Nguyễn Minh Tuấn",
  "MemberName": "Trần Thị Lan",
  "Rating": 5,
  "Comment": "HLV hướng dẫn rất nhiệt tình và chu đáo.",
  "Date": "2026-08-30"
}
```

---

### 5. Phân hệ Kho hàng & Sản phẩm (`/api/inventory`)
- `GET /api/inventory` : Lấy danh sách sản phẩm tồn kho (Whey, BCAA, Nước uống...).
- `POST /api/inventory` : Nhập sản phẩm mới vào kho.
- `PUT /api/inventory/{id}` : Cập nhật số lượng tồn / đơn giá.

---

### 6. Phân hệ Gói tập, Chấm công & Bảng lương
- `GET /api/packages` : Danh sách các gói tập phòng Gym.
- `GET /api/attendance` : Lịch sử điểm danh / chấm công nhân viên.
- `POST /api/attendance` : Check-in ca làm việc.
- `GET /api/salaries` : Bảng lương & thù lao hàng tháng.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
GYM_FE/
├── database/
│   └── gym_management.sql       # File CSDL MySQL hoàn chỉnh
├── frontend/
│   ├── assets/images/           # Hình ảnh & logo thương hiệu
│   ├── css/                     # Toàn bộ mã nguồn giao diện Dark Theme
│   ├── js/
│   │   ├── api.js               # Điểm cấu hình & gọi API tập trung
│   │   ├── common.js            # Header, Menu phân quyền, Thông báo Toast
│   │   ├── member.js            # Xử lý Hội viên & Popup VietQR
│   │   ├── trainer.js           # Xử lý HLV & Đánh giá Feedback
│   │   ├── admin.js             # Báo cáo doanh thu & Xuất Excel
│   │   └── auth.js              # Đăng nhập & Đăng ký
│   └── pages/
│       ├── login.html           # Trang Đăng nhập & Gửi đánh giá công khai
│       ├── dashboard.html       # Bảng điều khiển tổng quan
│       ├── member.html          # Quản lý Hội viên & InBody
│       ├── trainer.html         # Quản lý HLV & Đánh giá chất lượng
│       └── admin.html           # Quản lý Lương, Kho hàng & Báo cáo
├── index.html                   # Trang điều hướng tự động
└── README.md                    # Hướng dẫn dự án & Tích hợp hệ thống
```
