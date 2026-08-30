# 📘 HƯỚNG DẪN TÍCH HỢP BACKEND PHP & XAMPP VỚI FRONTEND GYM FITNESS

Tài liệu này được viết chi tiết dành riêng cho **Lập trình viên Backend PHP (XAMPP / Laragon)** để dễ dàng kết nối cơ sở dữ liệu MySQL với toàn bộ giao diện Frontend.

---

## 🚀 1. Hướng Dẫn Kích Hoạt Kết Nối Backend Trong Frontend

Toàn bộ các hàm gọi API trong Frontend đã được tập trung 100% tại file:
📁 **`frontend/js/api.js`**

Khi Backend PHP đã sẵn sàng:
1. Mở file `frontend/js/api.js`.
2. Đổi cấu hình ở đầu file sang `true` và trỏ đúng đường dẫn thư mục PHP trong XAMPP:

```javascript
// frontend/js/api.js
const GymAPI = {
  // Đổi thành true để chuyển từ dữ liệu mẫu sang gọi API PHP thật:
  USE_REAL_BACKEND: true, 

  // Đường dẫn thư mục Backend trong htdocs của XAMPP:
  BASE_URL: 'http://localhost/GYM_BE/api', 
  ...
};
```

---

## ⚙️ 2. File Header CORS Chuẩn Cho Mọi File PHP
Khi gọi API từ Frontend sang Backend bằng `fetch()`, bắt buộc mỗi file PHP phải có đoạn cấu hình Header sau ở đầu file để không bị chặn CORS:

```php
<?php
// cors.php (hoặc đặt ở đầu mọi file API)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Xử lý Request Preflight OPTIONS của trình duyệt
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

---

## 🗄️ 3. File Kết Nối Database Chuẩn (`db.php`)

```php
<?php
// config/db.php
$host = "localhost";
$db_name = "gym_management_system";
$username = "root";
$password = ""; // Mặc định XAMPP để trống

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Lỗi kết nối CSDL: " . $e->getMessage()]);
    exit();
}
```

---

## 📡 4. Danh Sách Chi Tiết Các API Cần Viết

---

### 🟢 Phân Hệ 1: HỘI VIÊN (`members`)

#### 1. Lấy danh sách hội viên
- **Method:** `GET`
- **URL:** `/api/members` hoặc `/api/members/get_all.php`
- **Response mẫu (200 OK):**
```json
[
  {
    "MemberID": 1,
    "Code": "HV-1001",
    "Fullname": "Nguyễn Văn An",
    "Gender": "Male",
    "BirthDate": "1995-05-12",
    "Phone": "0901234567",
    "Email": "an.nguyen@gmail.com",
    "Address": "123 Lê Lợi, Q.1",
    "PackageName": "Gói 12 tháng Diamond",
    "Price": 5200000,
    "PaymentStatus": "Paid",
    "PaymentMethod": "VietQR",
    "Status": "Active",
    "JoinDate": "2026-01-15",
    "EndDate": "2027-01-15"
  }
]
```

#### 2. Thêm mới hội viên (Có chọn phương thức thanh toán)
- **Method:** `POST`
- **URL:** `/api/members` hoặc `/api/members/create.php`
- **Request Body (JSON):**
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
- **Code PHP xử lý mẫu (`create.php`):**
```php
<?php
require_once '../config/db.php';

// Nhận dữ liệu JSON từ Frontend
$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['Fullname']) && !empty($data['Phone'])) {
    $sql = "INSERT INTO members (Code, Fullname, Gender, BirthDate, Phone, Email, Address, PackageName, Price, JoinDate, EndDate, PaymentMethod, PaymentStatus, Status) 
            VALUES (:Code, :Fullname, :Gender, :BirthDate, :Phone, :Email, :Address, :PackageName, :Price, :JoinDate, :EndDate, :PaymentMethod, :PaymentStatus, :Status)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':Code' => $data['Code'],
        ':Fullname' => $data['Fullname'],
        ':Gender' => $data['Gender'],
        ':BirthDate' => $data['BirthDate'],
        ':Phone' => $data['Phone'],
        ':Email' => $data['Email'],
        ':Address' => $data['Address'],
        ':PackageName' => $data['PackageName'],
        ':Price' => $data['Price'],
        ':JoinDate' => $data['JoinDate'],
        ':EndDate' => $data['EndDate'],
        ':PaymentMethod' => $data['PaymentMethod'] ?? 'VietQR',
        ':PaymentStatus' => $data['PaymentStatus'] ?? 'Paid',
        ':Status' => $data['Status'] ?? 'Active'
    ]);

    echo json_encode(["success" => true, "message" => "Thêm hội viên thành công!"]);
} else {
    echo json_encode(["success" => false, "message" => "Thiếu thông tin bắt buộc!"]);
}
```

#### 3. Cập nhật hội viên
- **Method:** `PUT` (hoặc `POST`)
- **URL:** `/api/members/{id}` hoặc `/api/members/update.php?id=1`
- **Request Body (JSON):** Các trường thông tin cần cập nhật.

#### 4. Xóa / Khóa hội viên
- **Method:** `DELETE` (hoặc `POST`)
- **URL:** `/api/members/{id}` hoặc `/api/members/delete.php?id=1`

---

### 🟢 Phân Hệ 2: THANH TOÁN & HÓA ĐƠN (`payments`)

#### 1. Lấy danh sách hóa đơn
- **Method:** `GET`
- **URL:** `/api/payments`
- **Response mẫu:**
```json
[
  {
    "PaymentsID": 1,
    "Code": "INV-20260830-1001",
    "MemberName": "Nguyễn Văn An",
    "MemberCode": "HV-1001",
    "PackageName": "Gói 12 tháng Diamond",
    "Amount": 5200000,
    "PaymentMethod": "VietQR",
    "PaymentDate": "2026-08-30",
    "Status": "Completed"
  }
]
```

#### 2. Thêm mới giao dịch thu tiền
- **Method:** `POST`
- **URL:** `/api/payments`
- **Request Body:**
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

### 🟢 Phân Hệ 3: HUẤN LUYỆN VIÊN (`trainers`)

#### 1. Lấy danh sách Huấn luyện viên
- **Method:** `GET`
- **URL:** `/api/trainers`
- **Response mẫu:**
```json
[
  {
    "TrainerID": 1,
    "Fullname": "Nguyễn Minh Tuấn",
    "Specialty": "Tăng cơ, Giảm mỡ, Bodybuilding",
    "Phone": "0903112233",
    "Experience": "5 năm",
    "Status": "Active"
  },
  {
    "TrainerID": 2,
    "Fullname": "Trần Quốc Hùng",
    "Specialty": "Bodybuilding, Sức mạnh",
    "Phone": "0908889900",
    "Experience": "6 năm",
    "Status": "Active"
  }
]
```

#### 2. Thêm / Cập nhật HLV
- **Method:** `POST` / `PUT`
- **URL:** `/api/trainers`

---

### 🟢 Phân Hệ 4: ĐÁNH GIÁ & FEEDBACK (`feedbacks`)

#### 1. Lấy danh sách Feedback của học viên
- **Method:** `GET`
- **URL:** `/api/feedbacks`

#### 2. Học viên gửi đánh giá từ trang Đăng nhập
- **Method:** `POST`
- **URL:** `/api/feedbacks`
- **Request Body (JSON):**
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

### 🟢 Phân Hệ 5: KHO HÀNG & SẢN PHẨM (`inventory`)

#### 1. Lấy danh sách sản phẩm tồn kho
- **Method:** `GET`
- **URL:** `/api/inventory`
- **Response mẫu:**
```json
[
  {
    "InventoryID": 1,
    "ItemName": "Whey Gold Standard 5lbs",
    "Category": "Supplement",
    "Quantity": 15,
    "UnitPrice": 1800000,
    "Status": "InStock"
  },
  {
    "InventoryID": 2,
    "ItemName": "Nước tăng lực Monster Energy",
    "Category": "Beverage",
    "Quantity": 120,
    "UnitPrice": 30000,
    "Status": "InStock"
  }
]
```

---

### 🟢 Phân Hệ 6: GÓI TẬP (`packages`)

- **Lấy danh sách:** `GET /api/packages`
- **Thêm gói tập:** `POST /api/packages`
- **Sửa gói tập:** `PUT /api/packages/{id}`

---

### 🟢 Phân Hệ 7: BẢNG LƯƠNG & CHẤM CÔNG

- **Lấy bảng chấm công:** `GET /api/attendance`
- **Check-in chấm công:** `POST /api/attendance`
- **Lấy bảng lương nhân viên:** `GET /api/salaries`

---

## 🛠️ 5. Cấu Trúc Thư Mục Gợi Ý Phía Backend PHP trong XAMPP

```text
C:/xampp/htdocs/GYM_BE/
├── config/
│   ├── cors.php             # Cấu hình Header CORS
│   └── db.php               # Kết nối PDO MySQL
└── api/
    ├── auth/
    │   └── login.php        # POST /api/auth/login.php
    ├── members/
    │   ├── get_all.php      # GET  /api/members/get_all.php
    │   ├── create.php       # POST /api/members/create.php
    │   └── update.php       # POST /api/members/update.php
    ├── payments/
    │   ├── get_all.php      # GET  /api/payments/get_all.php
    │   └── create.php       # POST /api/payments/create.php
    ├── trainers/
    │   └── get_all.php      # GET  /api/trainers/get_all.php
    ├── feedbacks/
    │   ├── get_all.php      # GET  /api/feedbacks/get_all.php
    │   └── create.php       # POST /api/feedbacks/create.php
    └── inventory/
        └── get_all.php      # GET  /api/inventory/get_all.php
```

---

## ✅ Tóm Tắt Cho Bạn Backend
1. Tạo thư mục `GYM_BE` trong `C:\xampp\htdocs\`.
2. Import file database `database/gym_management.sql` vào phpMyAdmin.
3. Viết các file PHP trả về dữ liệu định dạng `json_encode($result)`.
4. Mở `frontend/js/api.js` sửa `USE_REAL_BACKEND: true` và `BASE_URL: 'http://localhost/GYM_BE/api'` là hệ thống chạy mượt 100%!
