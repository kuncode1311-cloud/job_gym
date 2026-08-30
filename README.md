# 🏋️ HỆ THỐNG QUẢN LÝ PHÒNG TẬP GYM & FITNESS (GYM MANAGEMENT SYSTEM)

Hệ thống giao diện quản lý phòng tập Gym cao cấp theo phong cách Dark Cyberpunk / Glow Red hiện đại. Hỗ trợ đầy đủ phân quyền và trải nghiệm riêng biệt cho **4 vai trò (Role-Based Access Control)**: **Admin (Quản lý)**, **Staff (Nhân viên)**, **Trainer (Huấn luyện viên)**, và **Member (Hội viên)**.

---

## 🚀 Trực tiếp trên GitHub Pages
- **Live Demo**: [https://kuncode1311-cloud.github.io/job_gym/](https://kuncode1311-cloud.github.io/job_gym/)
- Tự động điều hướng từ trang chủ vào hệ thống quản lý.
- Tích hợp bộ chọn nhanh vai trò (Role Quick Switcher) trên thanh Header ở mọi màn hình để tiện cho khách hàng kiểm tra & trải nghiệm.

---

## 👥 Danh Sách Tài Khoản & Vai Trò Demo

Hệ thống tích hợp dữ liệu mẫu chuẩn hóa 100% khớp với cấu trúc Database MySQL (`database/gym_management.sql`):

| Vai trò (Role) | Họ và tên | Tên đăng nhập | Mật khẩu | Các màn hình chức năng chính |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Admin (Quản trị viên)** | **Lâm Văn Cường** | `admin` | `123456` | Dashboard Doanh thu & KPIs, Quản lý Hội viên, Điểm danh toàn phòng tập, Chỉ số InBody, Giáo án Workout Plan, Danh sách HLV, Lịch hẹn Booking, Báo cáo & Lương nhân sự, Quản lý Kho thiết bị, Lịch sử Thanh toán, Đánh giá CSAT. |
| **💼 Staff (Nhân viên lễ tân)** | **Lâm Văn Cường** | `vancuong_staff` | `123456` | Hồ sơ nhân viên, Điểm danh Check-in/Check-out nhanh, Quản lý Kho vật tư & Thiết bị, Lập phiếu & Tra cứu Thanh toán, Bảng lương & Ca làm việc. |
| **🏋️ Trainer (Huấn luyện viên)** | **Trần Quốc Bảo** | `quocbao_pt` | `123456` | Dashboard HLV cá nhân, Lịch dạy & Ca PT trong tuần, Danh sách Hội viên phụ trách, Bảng theo dõi InBody, Giáo án luyện tập (Workout Plan), Báo cáo thu nhập & hoa hồng PT, Lịch sử chấm công. |
| **💪 Member (Hội viên)** | **Nguyễn Văn An** | `vanan_vip` | `123456` | Dashboard Hội viên (VIP Card & Thời hạn), Thông tin Gói tập & Quyền lợi VIP, Đặt lịch tập với PT 1:1, Giáo án tập luyện cá nhân (Split 4 buổi), Tiến độ chỉ số InBody cá nhân, Lịch sử ra vào phòng tập. |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
GYM_FE/
├── database/
│   └── gym_management.sql       # File SQL khởi tạo CSDL hoàn chỉnh 14 bảng quan hệ
├── frontend/
│   ├── assets/
│   │   └── images/              # Logo SVG/PNG và hình nền chính thức của giao diện
│   ├── css/
│   │   ├── variables.css        # Hệ màu, biến giao diện Dark Glow
│   │   ├── global.css           # Global typography & normalize
│   │   ├── components.css       # Buttons, Glass-cards, KPI badges, Modals
│   │   ├── layout.css           # Sidebar, Navbar, Grid layouts
│   │   ├── pages.css            # Style đặc thù cho từng trang
│   │   └── custom_dark_theme.css
│   ├── js/
│   │   ├── api.js               # Mock API engine & LocalStorage persistence
│   │   ├── common.js            # Header, Sidebar động theo vai trò, Role Switcher, Toast
│   │   ├── dashboard.js         # Logic & Chart cho 4 màn hình Dashboard
│   │   ├── member.js            # Logic Hội viên, InBody, Gói tập & Điểm danh
│   │   ├── trainer.js           # Logic HLV, Lịch dạy, Đặt lịch PT, Học viên phụ trách
│   │   ├── admin.js             # Logic Lương, Báo cáo Thu nhập, Chấm công cá nhân
│   │   └── auth.js              # Đăng nhập, Đăng ký, Quên mật khẩu
│   └── pages/
│       ├── login.html           # Trang Đăng nhập hệ thống
│       ├── register.html        # Trang Đăng ký tài khoản
│       ├── dashboard.html       # Tổng quan phân quyền theo 4 Role
│       ├── member.html          # Quản lý Hội viên / Điểm danh / InBody / Gói tập
│       ├── trainer.html         # Huấn luyện viên / Đặt lịch PT / Lịch dạy / Học viên
│       └── admin.html           # Bảng lương / Thu nhập HLV / Chấm công / Báo cáo
├── .gitignore                   # Loại trừ file rác hệ thống
├── index.html                   # Entry point tự động điều hướng cho GitHub Pages
└── README.md                    # Hướng dẫn dự án & Demo
```

---

## 🛠️ Công Nghệ Sử Dụng
- **HTML5 & Vanilla CSS3**: Giao diện thiết kế theo Design System hiện đại (Glassmorphism, Dark Neon Glow, Red Accents).
- **JavaScript (ES6+)**: Xử lý dữ liệu động, điều hướng tab theo URL hash, bộ lọc tìm kiếm tức thì.
- **Chart.js**: Vẽ biểu đồ đường và biểu đồ cột thống kê InBody & Doanh thu.
- **Font Awesome 6**: Hệ thống icon sắc nét.
- **Mock API & LocalStorage**: Đảm bảo khách hàng test mượt mà ngay trên trình duyệt mà không cần cài đặt Web Server phức tạp.
