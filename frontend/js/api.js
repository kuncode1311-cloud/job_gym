/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * TẦNG SERVICE API & GIAO TIẾP DỮ LIỆU (api.js)
 * ==============================================================================
 * Mô tả: File này đóng vai trò là tầng trung gian giao tiếp dữ liệu giữa Frontend và Backend.
 * - Hiện tại: Sử dụng MockDB (lưu trữ tại LocalStorage) để demo đầy đủ tính năng CRUD.
 * - Tương lai: Khi nhóm Backend (TV3, TV4) hoàn thành API PHP, chỉ cần đổi `USE_BACKEND_API: true`
 *   là toàn bộ hệ thống sẽ tự động gọi API PHP thật từ MySQL mà KHÔNG CẦN sửa lại giao diện.
 */

const API_CONFIG = {
  // Cờ cấu hình: false = Dùng Mock LocalStorage, true = Dùng Backend PHP REST API
  USE_BACKEND_API: false,
  
  // Đường dẫn gốc tới API Backend PHP của TV3 & TV4
  BASE_URL: '../../backend/routes/api.php'
};

const GymAPI = {
  // ============================================================================
  // 1. NHÓM CHỨC NĂNG XÁC THỰC & TÀI KHOẢN (USERS & AUTHENTICATION)
  // ============================================================================

  /**
   * Đăng nhập hệ thống
   * @param {string} username - Tên đăng nhập
   * @param {string} password - Mật khẩu
   * @returns {Promise<{success: boolean, user?: object, message?: string}>}
   */
  async login(username, password) {
    const db = MockDB.getDB();
    const user = db.users.find(u => u.Username.toLowerCase() === username.toLowerCase() && u.Status === 'Active');
    if (user) {
      localStorage.setItem('GYM_CURRENT_USER', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc tài khoản bị khóa!' };
  },

  /**
   * Lấy thông tin tài khoản đang đăng nhập hiện tại
   * @returns {object} Thông tin người dùng
   */
  getCurrentUser() {
    const data = localStorage.getItem('GYM_CURRENT_USER');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    // Mặc định ban đầu: Quản lý Văn Điền (Role: Admin)
    const defaultUser = { UserID: 1, Username: 'admin', Fullname: 'Văn Điền', Role: 'Admin', RoleTitle: 'Quản lý phòng tập' };
    localStorage.setItem('GYM_CURRENT_USER', JSON.stringify(defaultUser));
    return defaultUser;
  },

  /**
   * Thiết lập người dùng hiện tại (Hỗ trợ chuyển đổi nhanh Role để kiểm thử giao diện)
   * @param {object} user 
   */
  setCurrentUser(user) {
    localStorage.setItem('GYM_CURRENT_USER', JSON.stringify(user));
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  logout() {
    localStorage.removeItem('GYM_CURRENT_USER');
    window.location.href = 'login.html';
  },

  /**
   * Lấy toàn bộ danh sách tài khoản hệ thống
   * @returns {Promise<Array>} Danh sách users
   */
  async getUsers() {
    const db = MockDB.getDB();
    return db.users;
  },

  /**
   * Cập nhật thông tin / trạng thái tài khoản
   * @param {object} user - Dữ liệu user cần cập nhật
   */
  async updateUser(user) {
    const db = MockDB.getDB();
    const index = db.users.findIndex(u => u.UserID === user.UserID);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...user };
      MockDB.saveDB(db);
      return { success: true, data: db.users[index] };
    }
    return { success: false, message: 'Không tìm thấy tài khoản' };
  },

  // ============================================================================
  // 2. NHÓM CHỨC NĂNG QUẢN LÝ HỘI VIÊN (MEMBERS)
  // ============================================================================

  /**
   * Lấy danh sách hội viên (kèm tìm kiếm theo từ khóa)
   * @param {string} query - Từ khóa tìm kiếm (Tên, Mã HV, SĐT)
   * @returns {Promise<Array>} Danh sách hội viên
   */
  async getMembers(query = '') {
    const db = MockDB.getDB();
    if (!query) return db.members;
    const q = query.toLowerCase();
    return db.members.filter(m => 
      m.Fullname.toLowerCase().includes(q) || 
      (m.Code && m.Code.toLowerCase().includes(q)) || 
      (m.Phone && m.Phone.includes(q))
    );
  },

  /**
   * Lấy thông tin chi tiết của 1 hội viên theo ID
   * @param {number} id - MemberID
   */
  async getMemberById(id) {
    const db = MockDB.getDB();
    return db.members.find(m => m.MemberID === Number(id));
  },

  /**
   * Thêm hội viên mới vào hệ thống (Tự động sinh mã HV-xxxx)
   * @param {object} memberData - Dữ liệu hội viên
   */
  async addMember(memberData) {
    const db = MockDB.getDB();
    const newId = db.members.length > 0 ? Math.max(...db.members.map(m => m.MemberID)) + 1 : 1;
    const newCode = `HV-${String(1000 + newId).padStart(4, '0')}`;
    const newMember = {
      MemberID: newId,
      Code: newCode,
      JoinDate: new Date().toISOString().split('T')[0],
      Status: 'Active',
      ...memberData
    };
    db.members.unshift(newMember);
    MockDB.saveDB(db);
    return { success: true, data: newMember };
  },

  /**
   * Cập nhật thông tin hội viên
   * @param {object} member - Dữ liệu hội viên cần cập nhật
   */
  async updateMember(member) {
    const db = MockDB.getDB();
    const index = db.members.findIndex(m => m.MemberID === Number(member.MemberID));
    if (index !== -1) {
      db.members[index] = { ...db.members[index], ...member };
      MockDB.saveDB(db);
      return { success: true, data: db.members[index] };
    }
    return { success: false, message: 'Không tìm thấy hội viên' };
  },

  /**
   * Xóa hội viên khỏi hệ thống
   * @param {number} id - MemberID
   */
  async deleteMember(id) {
    const db = MockDB.getDB();
    db.members = db.members.filter(m => m.MemberID !== Number(id));
    MockDB.saveDB(db);
    return { success: true };
  },

  // ============================================================================
  // 3. NHÓM CHỨC NĂNG GÓI TẬP (PACKAGES)
  // ============================================================================

  /**
   * Lấy danh sách các gói tập Gym hiện có
   */
  async getPackages() {
    const db = MockDB.getDB();
    return db.packages;
  },

  /**
   * Thêm gói tập mới
   */
  async addPackage(pkg) {
    const db = MockDB.getDB();
    const newId = db.packages.length > 0 ? Math.max(...db.packages.map(p => p.PackageID)) + 1 : 1;
    const newPkg = { PackageID: newId, ...pkg };
    db.packages.push(newPkg);
    MockDB.saveDB(db);
    return { success: true, data: newPkg };
  },

  /**
   * Cập nhật gói tập
   */
  async updatePackage(pkg) {
    const db = MockDB.getDB();
    const index = db.packages.findIndex(p => p.PackageID === Number(pkg.PackageID));
    if (index !== -1) {
      db.packages[index] = { ...db.packages[index], ...pkg };
      MockDB.saveDB(db);
      return { success: true, data: db.packages[index] };
    }
    return { success: false, message: 'Không tìm thấy gói tập' };
  },

  // ============================================================================
  // 4. NHÓM CHỨC NĂNG ĐIỂM DANH (ATTENDANCE)
  // ============================================================================

  /**
   * Lấy lịch sử điểm danh ra/vào phòng tập
   */
  async getAttendance() {
    const db = MockDB.getDB();
    return db.attendance;
  },

  /**
   * Check-in cho hội viên vào tập
   * @param {number} memberId - Mã hội viên
   * @param {string} type - Hình thức tập (Gym & Fitness, Yoga, Cardio, Boxing)
   */
  async checkIn(memberId, type = 'Gym & Fitness') {
    const db = MockDB.getDB();
    const member = db.members.find(m => m.MemberID === Number(memberId));
    if (!member) return { success: false, message: 'Hội viên không tồn tại' };

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
    const dateStr = now.toISOString().split('T')[0];

    const newAttendance = {
      AttendanceID: db.attendance.length + 1,
      MemberID: member.MemberID,
      MemberName: member.Fullname,
      MemberCode: member.Code || `HV-${member.MemberID}`,
      CheckInTime: timeStr,
      CheckOutTime: null,
      AttendanceDate: dateStr,
      Type: type
    };

    db.attendance.unshift(newAttendance);
    MockDB.saveDB(db);
    return { success: true, data: newAttendance };
  },

  /**
   * Check-out cho hội viên khi ra về
   * @param {number} attendanceId - Mã bản ghi điểm danh
   */
  async checkOut(attendanceId) {
    const db = MockDB.getDB();
    const record = db.attendance.find(a => a.AttendanceID === Number(attendanceId));
    if (record) {
      const now = new Date();
      record.CheckOutTime = now.toTimeString().split(' ')[0].substring(0, 5);
      MockDB.saveDB(db);
      return { success: true, data: record };
    }
    return { success: false, message: 'Không tìm thấy bản ghi điểm danh' };
  },

  /**
   * Cập nhật thông tin bản ghi chấm công (giờ vào, giờ ra, ngày)
   */
  async updateAttendance(attendanceId, updatedData) {
    const db = MockDB.getDB();
    const record = db.attendance.find(a => a.AttendanceID === Number(attendanceId));
    if (record) {
      Object.assign(record, updatedData);
      MockDB.saveDB(db);
      return { success: true, data: record };
    }
    return { success: false, message: 'Không tìm thấy bản ghi điểm danh' };
  },


  // ============================================================================
  // 5. NHÓM CHỨC NĂNG ĐẶT LỊCH HẸN & BUỔI KÈM (BOOKINGS)
  // ============================================================================

  /**
   * Lấy toàn bộ danh sách lịch hẹn PT
   */
  async getBookings() {
    const db = MockDB.getDB();
    return db.bookings;
  },

  /**
   * Tạo lịch hẹn mới giữa hội viên và huấn luyện viên
   */
  async addBooking(bookingData) {
    const db = MockDB.getDB();
    const newBooking = {
      BookingID: db.bookings.length + 1,
      Status: 'Confirmed',
      AttendanceStatus: 'Chờ tập',
      ...bookingData
    };
    db.bookings.unshift(newBooking);
    MockDB.saveDB(db);
    return { success: true, data: newBooking };
  },

  /**
   * Cập nhật trạng thái lịch hẹn (Confirmed, Completed, Cancelled)
   */
  async updateBookingStatus(id, status, attendanceStatus) {
    const db = MockDB.getDB();
    const booking = db.bookings.find(b => b.BookingID === Number(id));
    if (booking) {
      if (status) booking.Status = status;
      if (attendanceStatus) booking.AttendanceStatus = attendanceStatus;
      MockDB.saveDB(db);
      return { success: true, data: booking };
    }
    return { success: false, message: 'Không tìm thấy lịch hẹn' };
  },

  // ============================================================================
  // 6. NHÓM CHỨC NĂNG HUẤN LUYỆN VIÊN (TRAINERS)
  // ============================================================================

  /**
   * Lấy danh sách Huấn luyện viên
   */
  async getTrainers() {
    const db = MockDB.getDB();
    return db.trainers;
  },

  // ============================================================================
  // 7. NHÓM CHỨC NĂNG HÓA ĐƠN & THANH TOÁN (PAYMENTS)
  // ============================================================================

  /**
   * Lấy lịch sử giao dịch và hóa đơn thanh toán
   */
  async getPayments() {
    const db = MockDB.getDB();
    return db.payments;
  },

  /**
   * Tạo phiếu thu tiền / hóa đơn mới
   */
  async addPayment(paymentData) {
    const db = MockDB.getDB();
    const newPayment = {
      PaymentsID: db.payments.length + 1,
      Code: `HD-${800 + db.payments.length + 1}`,
      PaymentDate: new Date().toISOString().split('T')[0],
      Status: 'Paid',
      ...paymentData
    };
    db.payments.unshift(newPayment);
    MockDB.saveDB(db);
    return { success: true, data: newPayment };
  },

  // ============================================================================
  // 8. NHÓM CHỨC NĂNG MENU DỊCH VỤ & KHO SẢN PHẨM (INVENTORY)
  // ============================================================================

  /**
   * Lấy danh sách sản phẩm / dịch vụ trong kho
   */
  async getInventory() {
    const db = MockDB.getDB();
    return db.inventory;
  },

  /**
   * Thêm sản phẩm mới vào kho
   */
  async addInventoryItem(item) {
    const db = MockDB.getDB();
    const newId = db.inventory.length > 0 ? Math.max(...db.inventory.map(i => i.ID)) + 1 : 1;
    const newItem = { ID: newId, Status: item.Stock > 0 ? 'Còn hàng' : 'Hết hàng', ...item };
    db.inventory.unshift(newItem);
    MockDB.saveDB(db);
    return { success: true, data: newItem };
  },

  /**
   * Cập nhật thông tin sản phẩm / dịch vụ
   */
  async updateInventoryItem(item) {
    const db = MockDB.getDB();
    const index = db.inventory.findIndex(i => i.ID === Number(item.ID));
    if (index !== -1) {
      db.inventory[index] = { ...db.inventory[index], ...item };
      db.inventory[index].Status = db.inventory[index].Stock > 0 ? 'Còn hàng' : 'Hết hàng';
      MockDB.saveDB(db);
      return { success: true, data: db.inventory[index] };
    }
    return { success: false, message: 'Không tìm thấy sản phẩm' };
  },

  /**
   * Xóa sản phẩm khỏi kho (Dành cho Admin)
   */
  async deleteInventoryItem(id) {
    const db = MockDB.getDB();
    db.inventory = db.inventory.filter(i => i.ID !== Number(id));
    MockDB.saveDB(db);
    return { success: true };
  },

  /**
   * Nhập thêm số lượng tồn kho (Dành cho Staff & Admin)
   */
  async incrementInventoryStock(id, addQuantity) {
    const db = MockDB.getDB();
    const item = db.inventory.find(i => i.ID === Number(id));
    if (item) {
      item.Stock = (item.Stock || 0) + Number(addQuantity);
      item.Status = item.Stock > 0 ? 'Còn hàng' : 'Hết hàng';
      MockDB.saveDB(db);
      return { success: true, data: item };
    }
    return { success: false, message: 'Không tìm thấy sản phẩm' };
  },


  // ============================================================================
  // 9. NHÓM CHỨC NĂNG BẢNG LƯƠNG & CHẤM CÔNG (SALARIES)
  // ============================================================================

  /**
   * Lấy dữ liệu bảng lương và ngày công của nhân sự
   */
  async getSalaries() {
    const db = MockDB.getDB();
    return db.salaries;
  },

  /**
   * Cập nhật thông tin phiếu lương nhân sự
   */
  async updateSalary(salaryId, updatedData) {
    const db = MockDB.getDB();
    const record = db.salaries.find(s => s.ID === Number(salaryId));
    if (record) {
      Object.assign(record, updatedData);
      MockDB.saveDB(db);
      return { success: true, data: record };
    }
    return { success: false, message: 'Không tìm thấy bản ghi lương' };
  },

  /**
   * Thêm bản ghi phiếu lương nhân sự mới
   */
  async addSalary(salaryData) {
    const db = MockDB.getDB();
    const newId = db.salaries.length > 0 ? Math.max(...db.salaries.map(s => s.ID)) + 1 : 1;
    const newSalary = {
      ID: newId,
      Code: salaryData.Code || `NV${newId}`,
      Name: salaryData.Name || 'Nhân sự mới',
      Role: salaryData.Role || 'Staff',
      WorkDays: salaryData.WorkDays || '26/26',
      Sessions: salaryData.Sessions || 0,
      LateDays: salaryData.LateDays || 0,
      BaseSalary: salaryData.BaseSalary || 8000000,
      Allowance: salaryData.Allowance || 0,
      TotalSalary: salaryData.TotalSalary || (salaryData.BaseSalary || 8000000) + (salaryData.Allowance || 0),
      Status: 'Đã duyệt'
    };
    db.salaries.push(newSalary);
    MockDB.saveDB(db);
    return { success: true, data: newSalary };
  },



  // ============================================================================
  // 10. NHÓM CHỨC NĂNG CHỈ SỐ INBODY & GIÁO ÁN (PROGRESS & WORKOUT PLANS)
  // ============================================================================

  /**
   * Lấy dữ liệu theo dõi chỉ số InBody
   */
  async getProgress(memberId = null) {
    const db = MockDB.getDB();
    if (memberId) {
      return db.progress.filter(p => p.MemberID === Number(memberId));
    }
    return db.progress;
  },

  /**
   * Ghi nhận chỉ số InBody mới
   */
  async addProgress(progressData) {
    const db = MockDB.getDB();
    const newProg = {
      ProgressID: db.progress.length + 1,
      RecordDate: new Date().toISOString().split('T')[0],
      ...progressData
    };
    db.progress.push(newProg);
    MockDB.saveDB(db);
    return { success: true, data: newProg };
  },

  /**
   * Lấy danh sách giáo án tập luyện
   */
  async getWorkoutPlans(memberId = null) {
    const db = MockDB.getDB();
    const plans = (db && db.workout_plan && db.workout_plan.length > 0) ? db.workout_plan : DEFAULT_DATABASE.workout_plan;
    if (memberId) {
      return plans.filter(w => w.MemberID === Number(memberId));
    }
    return plans;
  },

  /**
   * Lấy danh sách nhận xét và đánh giá sao của HLV
   */
  async getFeedbacks(trainerId = null) {
    const db = MockDB.getDB();
    const feedbacks = (db && db.feedbacks && db.feedbacks.length > 0) ? db.feedbacks : DEFAULT_DATABASE.feedbacks;
    if (trainerId) {
      return feedbacks.filter(f => f.TrainerID === Number(trainerId));
    }
    return feedbacks;
  }
};


// Đưa đối tượng GymAPI ra phạm vi toàn cục (Global window)
window.GymAPI = GymAPI;
