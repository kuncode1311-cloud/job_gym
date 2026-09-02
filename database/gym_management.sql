-- phpMyAdmin SQL Dump
-- Phiên bản máy chủ: MySQL 8.0+ / MariaDB 10.4+
-- CSDL: `gym_management_system`
-- Dự án: Hệ Thống Quản Lý Phòng Tập Gym & Fitness (Full Schema + Seed Data)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `gym_management_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gym_management_system`;

-- --------------------------------------------------------
-- Bảng 1: `users` (Tài khoản người dùng & Phân quyền)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Fullname` varchar(100) NOT NULL,
  `Role` enum('Admin','Staff','Trainer','Member') NOT NULL DEFAULT 'Staff',
  `RoleTitle` varchar(50) DEFAULT NULL,
  `Status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `uq_username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Fullname`, `Role`, `RoleTitle`, `Status`) VALUES
(1, 'admin', '123456', 'Văn Điền', 'Admin', 'Quản lý phòng tập', 'Active'),
(2, 'manager', '123456', 'Lâm Văn Cường', 'Staff', 'Trưởng ca tiếp tân', 'Active'),
(3, 'trainer01', '123456', 'Nguyễn Minh Tuấn', 'Trainer', 'HLV Thể hình & PT', 'Active'),
(4, 'trainer02', '123456', 'Trần Quốc Hùng', 'Trainer', 'HLV Bodybuilding', 'Active'),
(5, 'staff01', '123456', 'Lê Thu Thảo', 'Staff', 'Nhân viên thu ngân', 'Active'),
(6, 'member01', '123456', 'Nguyễn Văn An', 'Member', 'Hội viên VIP', 'Active'),
(7, 'member02', '123456', 'Trần Thị Bình', 'Member', 'Hội viên', 'Active');

-- --------------------------------------------------------
-- Bảng 2: `packages` (Gói tập Gym & Quyền lợi)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `packages`;
CREATE TABLE `packages` (
  `PackageID` int(11) NOT NULL AUTO_INCREMENT,
  `PackageName` varchar(100) NOT NULL,
  `Duration` int(11) NOT NULL COMMENT 'Số tháng',
  `Price` decimal(12,2) NOT NULL,
  `Description` text DEFAULT NULL,
  `Status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`PackageID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `packages` (`PackageID`, `PackageName`, `Duration`, `Price`, `Description`, `Status`) VALUES
(1, 'Gói 1 tháng', 1, 500000.00, 'Tập luyện toàn bộ khung giờ trong 1 tháng, miễn phí tủ đồ & nước uống.', 'Active'),
(2, 'Gói 3 tháng', 3, 1300000.00, 'Tiết kiệm 200k, đo chỉ số InBody định kỳ hàng tháng miễn phí.', 'Active'),
(3, 'Gói 6 tháng', 6, 2400000.00, 'Tặng 01 buổi tập cá nhân cùng HLV (PT 1:1), miễn phí phòng xông hơi.', 'Active'),
(4, 'Gói 12 tháng Diamond', 12, 4200000.00, 'Gói VIP không giới hạn, tặng 03 buổi PT và bộ phụ kiện thể thao cao cấp.', 'Active'),
(5, 'Gói Premium 3 tháng (Kèm PT)', 3, 3500000.00, 'Tập luyện toàn diện kèm theo 12 buổi hướng dẫn trực tiếp cùng Huấn luyện viên.', 'Active');

-- --------------------------------------------------------
-- Bảng 3: `trainers` (Huấn luyện viên)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `trainers`;
CREATE TABLE `trainers` (
  `TrainerID` int(11) NOT NULL AUTO_INCREMENT,
  `Fullname` varchar(100) NOT NULL,
  `Gender` enum('Male','Female') DEFAULT 'Male',
  `DateofBirth` date DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Specialty` varchar(100) DEFAULT NULL,
  `Experience` varchar(50) DEFAULT NULL,
  `RatingAvg` decimal(3,2) DEFAULT 5.00,
  `Status` enum('Active','Inactive') DEFAULT 'Active',
  `UserID` int(11) DEFAULT NULL,
  PRIMARY KEY (`TrainerID`),
  KEY `fk_trainers_users` (`UserID`),
  CONSTRAINT `fk_trainers_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `trainers` (`TrainerID`, `Fullname`, `Gender`, `DateofBirth`, `Phone`, `Email`, `Specialty`, `Experience`, `RatingAvg`, `Status`, `UserID`) VALUES
(1, 'Nguyễn Minh Tuấn', 'Male', '1995-03-15', '0961234567', 'tuan.trainer@gmail.com', 'Tăng cơ giảm mỡ, PT Cá nhân', '5 năm', 4.90, 'Active', 3),
(2, 'Trần Quốc Hùng', 'Male', '1992-07-20', '0972345678', 'hung.trainer@gmail.com', 'Bodybuilding, Sức mạnh & Thể hình', '8 năm', 5.00, 'Active', 4),
(3, 'Lê Đức Mạnh', 'Male', '1996-10-12', '0983344556', 'manh.trainer@gmail.com', 'KickFit, Boxing & Cardio', '4 năm', 4.70, 'Active', NULL);

-- --------------------------------------------------------
-- Bảng 4: `members` (Hội viên phòng Gym)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `MemberID` int(11) NOT NULL AUTO_INCREMENT,
  `Code` varchar(20) NOT NULL,
  `Fullname` varchar(100) NOT NULL,
  `Gender` enum('Male','Female') DEFAULT 'Male',
  `BirthDate` date DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `PackageName` varchar(100) DEFAULT 'Gói 1 tháng',
  `Price` decimal(12,2) DEFAULT 500000.00,
  `PaymentStatus` enum('Paid','Pending') NOT NULL DEFAULT 'Paid',
  `PaymentMethod` varchar(50) DEFAULT 'VietQR',
  `Status` enum('Active','Pending','Expired') NOT NULL DEFAULT 'Active',
  `JoinDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  PRIMARY KEY (`MemberID`),
  UNIQUE KEY `uq_member_code` (`Code`),
  KEY `fk_members_users` (`UserID`),
  CONSTRAINT `fk_members_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `members` (`MemberID`, `Code`, `Fullname`, `Gender`, `BirthDate`, `Phone`, `Email`, `Address`, `PackageName`, `Price`, `PaymentStatus`, `PaymentMethod`, `Status`, `JoinDate`, `EndDate`, `UserID`) VALUES
(1, 'HV-1001', 'Nguyễn Văn An', 'Male', '2002-05-15', '0901234567', 'an@gmail.com', '123 Lê Lợi, Q.1, TP.HCM', 'Gói 12 tháng Diamond', 4200000.00, 'Paid', 'VietQR', 'Active', '2026-01-10', '2027-01-10', 6),
(2, 'HV-1002', 'Trần Thị Bình', 'Female', '2003-08-20', '0912345678', 'binh@gmail.com', '45 Hai Bà Trưng, Q.3, TP.HCM', 'Gói 3 tháng', 1300000.00, 'Paid', 'Tiền mặt', 'Active', '2026-01-15', '2026-04-15', 7),
(3, 'HV-1003', 'Lê Minh Cường', 'Male', '2001-11-10', '0923456789', 'cuong@gmail.com', '78 Củ Chi, TP.HCM', 'Gói 6 tháng', 2400000.00, 'Paid', 'Thẻ POS', 'Active', '2026-02-01', '2026-08-01', NULL),
(4, 'HV-1004', 'Phạm Hoàng Nam', 'Male', '2004-03-25', '0934567890', 'nam@gmail.com', 'Bình Dương', 'Gói 12 tháng Diamond', 4200000.00, 'Paid', 'VietQR', 'Active', '2026-02-10', '2027-02-10', NULL),
(5, 'HV-1005', 'Võ Ngọc Mai', 'Female', '2002-12-05', '0945678901', 'mai@gmail.com', 'Thủ Đức, TP.HCM', 'Gói 3 tháng', 1300000.00, 'Pending', 'VietQR', 'Pending', '2026-08-01', '2026-11-01', NULL),
(6, 'HV-1006', 'Đặng Quốc Huy', 'Male', '2003-06-18', '0956789012', 'huy@gmail.com', 'Quận 9, TP.HCM', 'Gói 1 tháng', 500000.00, 'Paid', 'Ví MoMo', 'Active', '2026-08-10', '2026-09-10', NULL);

-- --------------------------------------------------------
-- Bảng 5: `payments` (Lịch sử Thu tiền & Hóa đơn)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `PaymentsID` int(11) NOT NULL AUTO_INCREMENT,
  `Code` varchar(30) NOT NULL,
  `MemberID` int(11) DEFAULT NULL,
  `MemberName` varchar(100) NOT NULL,
  `MemberCode` varchar(20) DEFAULT NULL,
  `PackageName` varchar(100) NOT NULL,
  `Amount` decimal(12,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL DEFAULT 'VietQR',
  `PaymentDate` date NOT NULL,
  `Status` enum('Completed','Pending','Failed') NOT NULL DEFAULT 'Completed',
  PRIMARY KEY (`PaymentsID`),
  UNIQUE KEY `uq_payment_code` (`Code`),
  KEY `fk_payments_members` (`MemberID`),
  CONSTRAINT `fk_payments_members` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payments` (`PaymentsID`, `Code`, `MemberID`, `MemberName`, `MemberCode`, `PackageName`, `Amount`, `PaymentMethod`, `PaymentDate`, `Status`) VALUES
(1, 'INV-20260110-1001', 1, 'Nguyễn Văn An', 'HV-1001', 'Gói 12 tháng Diamond', 4200000.00, 'VietQR', '2026-01-10', 'Completed'),
(2, 'INV-20260115-1002', 2, 'Trần Thị Bình', 'HV-1002', 'Gói 3 tháng', 1300000.00, 'Tiền mặt', '2026-01-15', 'Completed'),
(3, 'INV-20260201-1003', 3, 'Lê Minh Cường', 'HV-1003', 'Gói 6 tháng', 2400000.00, 'Thẻ POS', '2026-02-01', 'Completed'),
(4, 'INV-20260210-1004', 4, 'Phạm Hoàng Nam', 'HV-1004', 'Gói 12 tháng Diamond', 4200000.00, 'VietQR', '2026-02-10', 'Completed'),
(5, 'INV-20260810-1006', 6, 'Đặng Quốc Huy', 'HV-1006', 'Gói 1 tháng', 500000.00, 'Ví MoMo', '2026-08-10', 'Completed');

-- --------------------------------------------------------
-- Bảng 6: `feedbacks` (Đánh giá chất lượng từ Học viên)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `FeedbackID` int(11) NOT NULL AUTO_INCREMENT,
  `TrainerID` int(11) NOT NULL,
  `TrainerName` varchar(100) NOT NULL,
  `MemberName` varchar(100) NOT NULL,
  `Rating` int(11) NOT NULL DEFAULT 5,
  `Comment` text DEFAULT NULL,
  `FeedbackDate` date NOT NULL,
  PRIMARY KEY (`FeedbackID`),
  KEY `fk_feedbacks_trainers` (`TrainerID`),
  CONSTRAINT `fk_feedbacks_trainers` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `feedbacks` (`FeedbackID`, `TrainerID`, `TrainerName`, `MemberName`, `Rating`, `Comment`, `FeedbackDate`) VALUES
(1, 1, 'Nguyễn Minh Tuấn', 'Nguyễn Văn An', 5, 'Huấn luyện viên hướng dẫn rất nhiệt tình và chu đáo.', '2026-03-05'),
(2, 2, 'Trần Quốc Hùng', 'Trần Thị Bình', 4, 'HLV có chuyên môn tốt và hỗ trợ tận tình trong suốt buổi tập.', '2026-03-06'),
(3, 1, 'Nguyễn Minh Tuấn', 'Lê Minh Cường', 5, 'Giáo án tập rất phù hợp với mục tiêu tăng cơ giảm mỡ của mình.', '2026-03-07'),
(4, 2, 'Trần Quốc Hùng', 'Phạm Hoàng Nam', 4, 'Thái độ phục vụ tốt, giải thích kỹ thuật động tác rất dễ hiểu.', '2026-03-08'),
(5, 1, 'Nguyễn Minh Tuấn', 'Võ Ngọc Mai', 5, 'Rất hài lòng với quá trình tập luyện và thay đổi thể hình.', '2026-03-09'),
(6, 2, 'Trần Quốc Hùng', 'Đặng Quốc Huy', 3, 'Cần cải thiện thêm thời gian phản hồi tin nhắn đặt lịch.', '2026-03-10');

-- --------------------------------------------------------
-- Bảng 7: `inventory` (Kho hàng & Sản phẩm F&B / Whey)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inventory`;
CREATE TABLE `inventory` (
  `InventoryID` int(11) NOT NULL AUTO_INCREMENT,
  `ItemCode` varchar(20) DEFAULT NULL,
  `ItemName` varchar(100) NOT NULL,
  `Category` varchar(50) NOT NULL,
  `UnitPrice` decimal(12,2) NOT NULL,
  `StockQuantity` int(11) NOT NULL DEFAULT 0,
  `Status` enum('InStock','LowStock','OutOfStock') NOT NULL DEFAULT 'InStock',
  PRIMARY KEY (`InventoryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `inventory` (`InventoryID`, `ItemCode`, `ItemName`, `Category`, `UnitPrice`, `StockQuantity`, `Status`) VALUES
(1, 'SP-101', 'Whey Gold Standard 5lbs', 'Supplement', 1800000.00, 15, 'InStock'),
(2, 'SP-102', 'BCAA 6000 Phục hồi cơ', 'Supplement', 850000.00, 20, 'InStock'),
(3, 'SP-103', 'Nước tăng lực Monster Energy', 'Beverage', 30000.00, 80, 'InStock'),
(4, 'SP-104', 'Áo thun tập gym Gymshark', 'Clothing', 250000.00, 25, 'InStock'),
(5, 'SP-105', 'Bình nước Shaker Gym 700ml', 'Accessory', 120000.00, 30, 'InStock'),
(6, 'SP-106', 'Nước suối khoáng Aquafina 500ml', 'Beverage', 10000.00, 150, 'InStock'),
(7, 'SP-107', 'Khăn tập Gym chuyên dụng', 'Accessory', 50000.00, 0, 'OutOfStock');

-- --------------------------------------------------------
-- Bảng 8: `attendance` (Chấm công & Điểm danh Hội viên)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL AUTO_INCREMENT,
  `AttendanceDate` date NOT NULL,
  `CheckInTime` time NOT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `MemberID` int(11) NOT NULL,
  PRIMARY KEY (`AttendanceID`),
  KEY `fk_attendance_members` (`MemberID`),
  CONSTRAINT `fk_attendance_members` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `attendance` (`AttendanceID`, `AttendanceDate`, `CheckInTime`, `CheckOutTime`, `MemberID`) VALUES
(1, '2026-08-25', '07:30:00', '09:00:00', 1),
(2, '2026-08-25', '08:00:00', '09:30:00', 2),
(3, '2026-08-26', '17:00:00', '18:30:00', 3),
(4, '2026-08-26', '18:00:00', '19:30:00', 4),
(5, '2026-08-27', '07:00:00', '08:30:00', 5),
(6, '2026-08-27', '09:00:00', '10:30:00', 6);

-- --------------------------------------------------------
-- Bảng 9: `salaries` (Bảng lương nhân sự & Thù lao HLV)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `salaries`;
CREATE TABLE `salaries` (
  `SalaryID` int(11) NOT NULL AUTO_INCREMENT,
  `Code` varchar(20) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Role` varchar(50) NOT NULL,
  `WorkDays` varchar(20) NOT NULL DEFAULT '26/26',
  `PTSessions` int(11) NOT NULL DEFAULT 0,
  `LateDays` int(11) NOT NULL DEFAULT 0,
  `BaseSalary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `TotalSalary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `MonthPeriod` varchar(20) NOT NULL DEFAULT '2026-08',
  `Status` enum('Approved','Pending') NOT NULL DEFAULT 'Approved',
  PRIMARY KEY (`SalaryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `salaries` (`SalaryID`, `Code`, `Name`, `Role`, `WorkDays`, `PTSessions`, `LateDays`, `BaseSalary`, `Allowance`, `TotalSalary`, `MonthPeriod`, `Status`) VALUES
(1, 'NV101', 'Nguyễn Minh Tuấn', 'Trainer (FT)', '26/26', 42, 0, 8000000.00, 10500000.00, 18500000.00, '2026-08', 'Approved'),
(2, 'NV102', 'Trần Quốc Hùng', 'Trainer (FT)', '26/26', 48, 0, 8000000.00, 13200000.00, 21200000.00, '2026-08', 'Approved'),
(3, 'NV103', 'Lê Đức Mạnh', 'Trainer (FT)', '24/26', 22, 1, 8000000.00, 1800000.00, 9800000.00, '2026-08', 'Approved'),
(4, 'NV201', 'Lâm Văn Cường', 'Staff (Tiếp tân)', '26/26', 0, 0, 7000000.00, 800000.00, 7800000.00, '2026-08', 'Approved');

-- --------------------------------------------------------
-- Bảng 10: `staff_attendance` (Chấm công & Ca trực Nhân viên / HLV)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `staff_attendance`;
CREATE TABLE `staff_attendance` (
  `AttendanceStaffID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `StaffCode` varchar(20) NOT NULL DEFAULT 'NV201',
  `StaffName` varchar(100) NOT NULL,
  `ShiftDate` date NOT NULL,
  `ShiftName` varchar(50) DEFAULT 'Ca Sáng (06:00 - 14:00)',
  `CheckInTime` time NOT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `WorkHours` decimal(4,2) DEFAULT 8.00,
  `Status` enum('OnTime','Late','EarlyLeave') NOT NULL DEFAULT 'OnTime',
  `Note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`AttendanceStaffID`),
  KEY `fk_staff_attendance_users` (`UserID`),
  CONSTRAINT `fk_staff_attendance_users` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `staff_attendance` (`AttendanceStaffID`, `UserID`, `StaffCode`, `StaffName`, `ShiftDate`, `ShiftName`, `CheckInTime`, `CheckOutTime`, `WorkHours`, `Status`, `Note`) VALUES
(1, 8, 'NV201', 'Lâm Văn Cường', '2026-08-31', 'Ca Sáng (06:00 - 14:00)', '05:55:00', '14:05:00', 8.15, 'OnTime', 'Đúng giờ'),
(2, 8, 'NV201', 'Lâm Văn Cường', '2026-08-30', 'Ca Sáng (06:00 - 14:00)', '06:12:00', '14:00:00', 7.80, 'Late', 'Đi trễ 12p do kẹt xe'),
(3, 8, 'NV201', 'Lâm Văn Cường', '2026-08-29', 'Ca Sáng (06:00 - 14:00)', '05:58:00', '14:00:00', 8.00, 'OnTime', 'Đúng giờ'),
(4, 8, 'NV201', 'Lâm Văn Cường', '2026-08-28', 'Ca Chiều (14:00 - 22:00)', '13:50:00', '22:05:00', 8.25, 'OnTime', 'Tăng ca kiểm kho'),
(5, 8, 'NV201', 'Lâm Văn Cường', '2026-08-27', 'Ca Sáng (06:00 - 14:00)', '05:52:00', '14:00:00', 8.10, 'OnTime', 'Đúng giờ'),
(6, 3, 'NV101', 'Nguyễn Minh Tuấn', '2026-08-31', 'Ca Sáng (07:00 - 15:00)', '06:50:00', '15:10:00', 8.30, 'OnTime', 'Dạy kèm PT 3 ca');

-- --------------------------------------------------------
-- Bảng 11: `progress` (Theo dõi chỉ số InBody)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `progress`;
CREATE TABLE `progress` (
  `ProgressID` int(11) NOT NULL AUTO_INCREMENT,
  `RecordDate` date NOT NULL,
  `Weight` decimal(5,2) DEFAULT NULL,
  `Height` decimal(5,2) DEFAULT NULL,
  `BodyFat` decimal(5,2) DEFAULT NULL,
  `MuscleMass` decimal(5,2) DEFAULT NULL,
  `MemberID` int(11) NOT NULL,
  `TrainerID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ProgressID`),
  KEY `fk_progress_members` (`MemberID`),
  CONSTRAINT `fk_progress_members` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `progress` (`ProgressID`, `RecordDate`, `Weight`, `Height`, `BodyFat`, `MuscleMass`, `MemberID`, `TrainerID`) VALUES
(1, '2026-03-01', 68.50, 168.00, 18.50, 52.30, 1, 1),
(2, '2026-03-01', 55.20, 160.00, 24.00, 38.50, 2, 2),
(3, '2026-03-02', 72.00, 175.00, 20.50, 54.80, 3, 1),
(4, '2026-03-02', 80.50, 178.00, 22.00, 60.20, 4, 2);

-- --------------------------------------------------------
-- Bảng 11: `bookings` (Lịch đặt chỗ & PT)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `BookingID` int(11) NOT NULL AUTO_INCREMENT,
  `BookingDate` date NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `Status` enum('Confirmed','Completed','Cancelled') NOT NULL DEFAULT 'Confirmed',
  `MemberID` int(11) NOT NULL,
  `TrainerID` int(11) NOT NULL,
  PRIMARY KEY (`BookingID`),
  KEY `fk_bookings_members` (`MemberID`),
  KEY `fk_bookings_trainers` (`TrainerID`),
  CONSTRAINT `fk_bookings_members` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_trainers` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `bookings` (`BookingID`, `BookingDate`, `StartTime`, `EndTime`, `Status`, `MemberID`, `TrainerID`) VALUES
(1, '2026-08-31', '08:00:00', '09:00:00', 'Confirmed', 1, 1),
(2, '2026-08-31', '09:00:00', '10:00:00', 'Confirmed', 2, 2),
(3, '2026-09-01', '17:00:00', '18:00:00', 'Confirmed', 3, 1),
(4, '2026-09-01', '18:00:00', '19:00:00', 'Confirmed', 4, 2);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
