-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th8 28, 2026 lúc 06:00 PM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `gym_management`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` varchar(20) NOT NULL,
  `Status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`UserID`, `Username`, `Password`, `Role`, `Status`) VALUES
(1, 'admin', '123456', 'Admin', 'Active'),
(2, 'manager', '123456', 'Manager', 'Active'),
(3, 'trainer01', '123456', 'Trainer', 'Active'),
(4, 'trainer02', '123456', 'Trainer', 'Active'),
(5, 'member01', '123456', 'Member', 'Active'),
(6, 'member02', '123456', 'Member', 'Active'),
(7, 'member03', '123456', 'Member', 'Inactive'),
(8, 'staff01', '123456', 'Staff', 'Active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `members`
--

CREATE TABLE `members` (
  `MemberID` int(11) NOT NULL,
  `Fullname` varchar(100) NOT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `JoinDate` date NOT NULL,
  `UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `members`
--

INSERT INTO `members` (`MemberID`, `Fullname`, `Gender`, `BirthDate`, `Phone`, `Email`, `Address`, `JoinDate`, `UserID`) VALUES
(1, 'Nguyễn Văn An', 'Male', '2002-05-15', '0901234567', 'an@gmail.com', 'TP. Hồ Chí Minh', '2026-01-10', 5),
(2, 'Trần Thị Bình', 'Female', '2003-08-20', '0912345678', 'binh@gmail.com', 'TP. Hồ Chí Minh', '2026-01-15', 6),
(3, 'Lê Minh Cường', 'Male', '2001-11-10', '0923456789', 'cuong@gmail.com', 'Củ Chi', '2026-02-01', 7),
(4, 'Phạm Hoàng Nam', 'Male', '2004-03-25', '0934567890', 'nam@gmail.com', 'Bình Dương', '2026-02-10', 5),
(5, 'Võ Ngọc Mai', 'Female', '2002-12-05', '0945678901', 'mai@gmail.com', 'Thủ Đức', '2026-02-20', 6),
(6, 'Đặng Quốc Huy', 'Male', '2003-06-18', '0956789012', 'huy@gmail.com', 'Quận 9', '2026-03-01', 7);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `packages`
--

CREATE TABLE `packages` (
  `PackageID` int(11) NOT NULL,
  `PackageName` varchar(100) NOT NULL,
  `Duration` int(11) NOT NULL,
  `Price` decimal(12,2) NOT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `packages`
--

INSERT INTO `packages` (`PackageID`, `PackageName`, `Duration`, `Price`, `Description`) VALUES
(1, 'Gói 1 tháng', 1, 500000.00, 'Gói tập gym cơ bản trong 1 tháng'),
(2, 'Gói 3 tháng', 3, 1300000.00, 'Gói tập gym trong 3 tháng'),
(3, 'Gói 6 tháng', 6, 2400000.00, 'Gói tập gym trong 6 tháng'),
(4, 'Gói 12 tháng', 12, 4200000.00, 'Gói tập gym trong 12 tháng'),
(5, 'Gói Premium 3 tháng', 3, 2000000.00, 'Tập gym kết hợp hỗ trợ huấn luyện viên');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `member_package`
--

CREATE TABLE `member_package` (
  `MemberPackageID` int(11) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Status` varchar(20) NOT NULL,
  `MemberID` int(11) NOT NULL,
  `PackageID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `member_package`
--

INSERT INTO `member_package` (`MemberPackageID`, `StartDate`, `EndDate`, `Status`, `MemberID`, `PackageID`) VALUES
(1, '2026-01-10', '2026-02-10', 'Active', 1, 1),
(2, '2026-01-15', '2026-04-15', 'Active', 2, 2),
(3, '2026-02-01', '2026-08-01', 'Active', 3, 3),
(4, '2026-02-10', '2027-02-10', 'Active', 4, 4),
(5, '2026-02-20', '2026-05-20', 'Active', 5, 5),
(6, '2026-03-01', '2026-04-01', 'Active', 6, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trainers`
--

CREATE TABLE `trainers` (
  `TrainerID` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Gender` varchar(10) DEFAULT NULL,
  `DateofBirth` date DEFAULT NULL,
  `Phone` varchar(15) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Specialty` varchar(100) DEFAULT NULL,
  `Experience` int(11) DEFAULT NULL,
  `Status` varchar(20) DEFAULT NULL,
  `UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `trainers`
--

INSERT INTO `trainers` (`TrainerID`, `FullName`, `Gender`, `DateofBirth`, `Phone`, `Email`, `Specialty`, `Experience`, `Status`, `UserID`) VALUES
(1, 'Nguyễn Minh Tuấn', 'Male', '1995-03-15', '0961234567', 'tuan.trainer@gmail.com', 'Tăng cơ giảm mỡ', 5, 'Active', 3),
(2, 'Trần Quốc Hùng', 'Male', '1992-07-20', '0972345678', 'hung.trainer@gmail.com', 'Bodybuilding', 8, 'Active', 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `BookingID` int(11) NOT NULL,
  `BookingDate` date NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `Status` varchar(20) NOT NULL,
  `MemberID` int(11) NOT NULL,
  `TrainerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bookings`
--

INSERT INTO `bookings` (`BookingID`, `BookingDate`, `StartTime`, `EndTime`, `Status`, `MemberID`, `TrainerID`) VALUES
(1, '2026-03-05', '08:00:00', '09:00:00', 'Confirmed', 1, 1),
(2, '2026-03-05', '09:00:00', '10:00:00', 'Confirmed', 2, 2),
(3, '2026-03-06', '17:00:00', '18:00:00', 'Completed', 3, 1),
(4, '2026-03-06', '18:00:00', '19:00:00', 'Confirmed', 4, 2),
(5, '2026-03-07', '08:00:00', '09:00:00', 'Cancelled', 5, 1),
(6, '2026-03-07', '09:00:00', '10:00:00', 'Confirmed', 6, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance`
--

CREATE TABLE `attendance` (
  `AttendanceID` int(11) NOT NULL,
  `CheckInTime` time NOT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `AttendanceDate` date NOT NULL,
  `MemberID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `attendance`
--

INSERT INTO `attendance` (`AttendanceID`, `CheckInTime`, `CheckOutTime`, `AttendanceDate`, `MemberID`) VALUES
(1, '07:30:00', '09:00:00', '2026-03-05', 1),
(2, '08:00:00', '09:30:00', '2026-03-05', 2),
(3, '17:00:00', '18:30:00', '2026-03-06', 3),
(4, '18:00:00', '19:30:00', '2026-03-06', 4),
(5, '07:00:00', '08:30:00', '2026-03-07', 5),
(6, '09:00:00', '10:30:00', '2026-03-07', 6);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `PaymentsID` int(11) NOT NULL,
  `Amount` decimal(12,2) NOT NULL,
  `PaymentMethod` varchar(30) NOT NULL,
  `PaymentDate` date NOT NULL,
  `Status` varchar(20) NOT NULL,
  `MemberPackageID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`PaymentsID`, `Amount`, `PaymentMethod`, `PaymentDate`, `Status`, `MemberPackageID`) VALUES
(1, 500000.00, 'Cash', '2026-01-10', 'Paid', 1),
(2, 1300000.00, 'Banking', '2026-01-15', 'Paid', 2),
(3, 2400000.00, 'VNPay-QR', '2026-02-01', 'Paid', 3),
(4, 4200000.00, 'Visa/Master', '2026-02-10', 'Paid', 4),
(5, 2000000.00, 'ZaloPay', '2026-02-20', 'Paid', 5),
(6, 500000.00, 'Momo', '2026-03-01', 'Paid', 6),
(7, 2400000.00, 'Banking', '2026-03-05', 'Paid', 7),
(8, 4200000.00, 'VNPay-QR', '2026-03-08', 'Paid', 8);


-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `progress`
--

CREATE TABLE `progress` (
  `ProgressID` int(11) NOT NULL,
  `RecordDate` date NOT NULL,
  `Weight` decimal(5,2) DEFAULT NULL,
  `Height` decimal(5,2) DEFAULT NULL,
  `BodyFat` decimal(5,2) DEFAULT NULL,
  `MuscleMass` decimal(5,2) DEFAULT NULL,
  `MemberID` int(11) NOT NULL,
  `TrainerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `progress`
--

INSERT INTO `progress` (`ProgressID`, `RecordDate`, `Weight`, `Height`, `BodyFat`, `MuscleMass`, `MemberID`, `TrainerID`) VALUES
(1, '2026-03-01', 68.50, 168.00, 18.50, 52.30, 1, 1),
(2, '2026-03-01', 55.20, 160.00, 24.00, 38.50, 2, 2),
(3, '2026-03-02', 72.00, 175.00, 20.50, 54.80, 3, 1),
(4, '2026-03-02', 80.50, 178.00, 22.00, 60.20, 4, 2),
(5, '2026-03-03', 58.30, 162.00, 23.50, 39.80, 5, 1),
(6, '2026-03-03', 70.10, 170.00, 19.00, 53.70, 6, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `workout_plan`
--

CREATE TABLE `workout_plan` (
  `PlanID` int(11) NOT NULL,
  `PlanName` varchar(100) NOT NULL,
  `Goal` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL,
  `CreateDate` date NOT NULL,
  `MemberID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `workout_plan`
--

INSERT INTO `workout_plan` (`PlanID`, `PlanName`, `Goal`, `Description`, `CreateDate`, `MemberID`) VALUES
(1, 'Beginner Full Body', 'Tăng cơ', 'Chương trình tập toàn thân dành cho người mới bắt đầu.', '2026-03-01', 1),
(2, 'Fat Loss Program', 'Giảm mỡ', 'Chương trình kết hợp tập tạ và cardio để giảm mỡ.', '2026-03-01', 2),
(3, 'Muscle Building', 'Tăng cơ', 'Chương trình tập trung phát triển khối lượng cơ.', '2026-03-02', 3),
(4, 'Strength Program', 'Tăng sức mạnh', 'Chương trình tập trung vào các bài compound.', '2026-03-02', 4),
(5, 'Weight Loss Beginner', 'Giảm cân', 'Giáo án dành cho người mới bắt đầu giảm cân.', '2026-03-03', 5),
(6, 'Lean Muscle', 'Tăng cơ giảm mỡ', 'Chương trình hướng tới tăng cơ và kiểm soát lượng mỡ.', '2026-03-03', 6);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `feedbacks`
--

CREATE TABLE `feedbacks` (
  `FeedbackID` int(11) NOT NULL,
  `Rating` int(11) NOT NULL,
  `Commemt` text DEFAULT NULL,
  `FeedbackDate` date NOT NULL,
  `TrainerID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `feedbacks`
--

INSERT INTO `feedbacks` (`FeedbackID`, `Rating`, `Commemt`, `FeedbackDate`, `TrainerID`) VALUES
(1, 5, 'Huấn luyện viên hướng dẫn rất nhiệt tình.', '2026-03-05', 1),
(2, 4, 'HLV có chuyên môn tốt và hỗ trợ tận tình.', '2026-03-06', 2),
(3, 5, 'Giáo án tập phù hợp với mục tiêu.', '2026-03-07', 1),
(4, 4, 'Thái độ phục vụ tốt, hướng dẫn dễ hiểu.', '2026-03-08', 2),
(5, 5, 'Rất hài lòng với quá trình tập luyện.', '2026-03-09', 1),
(6, 3, 'Cần cải thiện thời gian phản hồi.', '2026-03-10', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory` (Kho hàng & Menu theo đề bài phân công)
--

CREATE TABLE `inventory` (
  `InventoryID` int(11) NOT NULL,
  `ItemName` varchar(100) NOT NULL,
  `Category` varchar(50) NOT NULL,
  `Price` decimal(12,2) NOT NULL,
  `StockQuantity` int(11) NOT NULL DEFAULT 0,
  `Status` varchar(20) NOT NULL DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory`
--

INSERT INTO `inventory` (`InventoryID`, `ItemName`, `Category`, `Price`, `StockQuantity`, `Status`) VALUES
(1, 'Nước protein shake', 'Đồ uống', 45000.00, 85, 'Available'),
(2, 'Nước BCAA', 'Đồ uống', 35000.00, 60, 'Available'),
(3, 'Khăn tập gym', 'Phụ kiện', 50000.00, 0, 'OutOfStock'),
(4, 'Bao tay tập gym', 'Phụ kiện', 120000.00, 24, 'Available'),
(5, 'Personal Training 1 buổi', 'Dịch vụ', 200000.00, 999, 'Available'),
(6, 'Massage giãn cơ sau tập', 'Dịch vụ', 150000.00, 999, 'Available');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `staff_attendance` (Chấm công Nhân viên & HLV)
--

CREATE TABLE `staff_attendance` (
  `AttendanceStaffID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ShiftDate` date NOT NULL,
  `CheckInTime` time NOT NULL,
  `CheckOutTime` time DEFAULT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'OnTime'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `staff_attendance`
--

INSERT INTO `staff_attendance` (`AttendanceStaffID`, `UserID`, `ShiftDate`, `CheckInTime`, `CheckOutTime`, `Status`) VALUES
(1, 8, '2026-03-05', '06:00:00', '14:00:00', 'OnTime'),
(2, 3, '2026-03-05', '07:00:00', '15:00:00', 'OnTime'),
(3, 4, '2026-03-05', '14:00:00', '22:00:00', 'OnTime'),
(4, 8, '2026-03-06', '06:15:00', '14:00:00', 'Late'),
(5, 3, '2026-03-06', '07:00:00', '15:00:00', 'OnTime'),
(6, 4, '2026-03-06', '14:00:00', '22:00:00', 'OnTime');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `salaries` (Bảng lương & Thù lao HLV)
--

CREATE TABLE `salaries` (
  `SalaryID` int(11) NOT NULL,
  `Code` varchar(20) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Role` varchar(50) NOT NULL,
  `WorkDays` varchar(20) NOT NULL DEFAULT '26/26',
  `PTSessions` int(11) NOT NULL DEFAULT 0,
  `LateDays` int(11) NOT NULL DEFAULT 0,
  `BaseSalary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `Allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `TotalSalary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `MonthPeriod` varchar(20) NOT NULL DEFAULT '2026-03',
  `Status` varchar(20) NOT NULL DEFAULT 'Approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `salaries`
--

INSERT INTO `salaries` (`SalaryID`, `Code`, `Name`, `Role`, `WorkDays`, `PTSessions`, `LateDays`, `BaseSalary`, `Allowance`, `TotalSalary`, `MonthPeriod`, `Status`) VALUES
(1, 'NV102', 'Trần Quốc Bảo', 'Trainer (FT)', '26/26', 42, 0, 8000000.00, 8400000.00, 16400000.00, '2026-03', 'Approved'),
(2, 'NV105', 'Nguyễn Thị Yến', 'Trainer (PT)', '20/26', 36, 2, 4500000.00, 7200000.00, 11700000.00, '2026-03', 'Approved'),
(3, 'NV108', 'Lê Đức Mạnh', 'Trainer (FT)', '26/26', 34, 1, 8000000.00, 6800000.00, 14800000.00, '2026-03', 'Approved'),
(4, 'NV201', 'Phạm Anh Tuấn', 'Staff', '24/26', 0, 4, 6500000.00, 300000.00, 6800000.00, '2026-03', 'Approved'),
(5, 'NV110', 'Võ Minh Tâm', 'Trainer (FT)', '25/26', 27, 0, 8000000.00, 5400000.00, 13400000.00, '2026-03', 'Approved'),
(6, 'NV112', 'Lâm Thế Vinh', 'Trainer (PT)', '18/26', 12, 0, 4500000.00, 2400000.00, 6900000.00, '2026-03', 'Approved');


--
-- Chỉ mục cho các bảng đã đổ
--

ALTER TABLE `attendance`
  ADD PRIMARY KEY (`AttendanceID`),
  ADD KEY `MemberID` (`MemberID`);

ALTER TABLE `bookings`
  ADD PRIMARY KEY (`BookingID`),
  ADD KEY `MemberID` (`MemberID`),
  ADD KEY `TrainerID` (`TrainerID`);

ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`FeedbackID`),
  ADD KEY `TrainerID` (`TrainerID`);

ALTER TABLE `members`
  ADD PRIMARY KEY (`MemberID`),
  ADD KEY `UserID` (`UserID`);

ALTER TABLE `member_package`
  ADD PRIMARY KEY (`MemberPackageID`),
  ADD KEY `MemberID` (`MemberID`),
  ADD KEY `PackageID` (`PackageID`);

ALTER TABLE `packages`
  ADD PRIMARY KEY (`PackageID`);

ALTER TABLE `payments`
  ADD PRIMARY KEY (`PaymentsID`),
  ADD KEY `MemberPackageID` (`MemberPackageID`);

ALTER TABLE `progress`
  ADD PRIMARY KEY (`ProgressID`),
  ADD KEY `MemberID` (`MemberID`),
  ADD KEY `TrainerID` (`TrainerID`);

ALTER TABLE `trainers`
  ADD PRIMARY KEY (`TrainerID`),
  ADD KEY `UserID` (`UserID`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`);

ALTER TABLE `workout_plan`
  ADD PRIMARY KEY (`PlanID`),
  ADD KEY `MemberID` (`MemberID`);

ALTER TABLE `inventory`
  ADD PRIMARY KEY (`InventoryID`);

ALTER TABLE `staff_attendance`
  ADD PRIMARY KEY (`AttendanceStaffID`),
  ADD KEY `UserID` (`UserID`);

ALTER TABLE `salaries`
  ADD PRIMARY KEY (`SalaryID`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

ALTER TABLE `attendance`
  MODIFY `AttendanceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `bookings`
  MODIFY `BookingID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `feedbacks`
  MODIFY `FeedbackID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `members`
  MODIFY `MemberID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `member_package`
  MODIFY `MemberPackageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `packages`
  MODIFY `PackageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `payments`
  MODIFY `PaymentsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `progress`
  MODIFY `ProgressID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `trainers`
  MODIFY `TrainerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `workout_plan`
  MODIFY `PlanID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `inventory`
  MODIFY `InventoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `staff_attendance`
  MODIFY `AttendanceStaffID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

ALTER TABLE `salaries`
  MODIFY `SalaryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Các ràng buộc khóa ngoại (Foreign Keys)
--

ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`);

ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`);

ALTER TABLE `feedbacks`
  ADD CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`);

ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

ALTER TABLE `member_package`
  ADD CONSTRAINT `member_package_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`),
  ADD CONSTRAINT `member_package_ibfk_2` FOREIGN KEY (`PackageID`) REFERENCES `packages` (`PackageID`);

ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`MemberPackageID`) REFERENCES `member_package` (`MemberPackageID`);

ALTER TABLE `progress`
  ADD CONSTRAINT `progress_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`),
  ADD CONSTRAINT `progress_ibfk_2` FOREIGN KEY (`TrainerID`) REFERENCES `trainers` (`TrainerID`);

ALTER TABLE `trainers`
  ADD CONSTRAINT `trainers_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

ALTER TABLE `workout_plan`
  ADD CONSTRAINT `workout_plan_ibfk_1` FOREIGN KEY (`MemberID`) REFERENCES `members` (`MemberID`);

ALTER TABLE `staff_attendance`
  ADD CONSTRAINT `staff_attendance_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

COMMIT;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

