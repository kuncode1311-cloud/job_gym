/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * XỬ LÝ ĐĂNG NHẬP & ĐĂNG KÝ (auth.js)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

/**
 * Xử lý sự kiện Submit Form Đăng nhập
 */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    showToast('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu', 'error');
    return;
  }

  const result = await GymAPI.login(username, password);
  if (result.success) {
    showToast(`Đăng nhập thành công! Chào mừng ${result.user.Fullname}`, 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } else {
    showToast(result.message || 'Tài khoản hoặc mật khẩu không chính xác', 'error');
  }
}

/**
 * Xử lý sự kiện Submit Form Đăng ký
 */
async function handleRegister(e) {
  e.preventDefault();
  const fullname = document.getElementById('regFullname').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!fullname || !username || !password) {
    showToast('Vui lòng điền các thông tin bắt buộc (*)', 'error');
    return;
  }

  // Kiểm tra tên đăng nhập đã tồn tại trong CSDL chưa
  const db = MockDB.getDB();
  const existing = db.users.find(u => u.Username.toLowerCase() === username.toLowerCase());
  if (existing) {
    showToast('Tên đăng nhập đã tồn tại trên hệ thống!', 'error');
    return;
  }

  // Thêm tài khoản mới
  const newUserId = db.users.length + 1;
  const newUser = {
    UserID: newUserId,
    Username: username,
    Fullname: fullname,
    Role: 'Member',
    RoleTitle: 'Hội viên',
    Status: 'Active'
  };
  db.users.push(newUser);

  // Thêm hồ sơ hội viên tương ứng
  const newMemberId = db.members.length + 1;
  db.members.push({
    MemberID: newMemberId,
    Code: `HV-${String(1000 + newMemberId).padStart(4, '0')}`,
    Fullname: fullname,
    Gender: 'Male',
    BirthDate: '2000-01-01',
    Phone: phone,
    Email: email,
    Address: 'TP. Hồ Chí Minh',
    JoinDate: new Date().toISOString().split('T')[0],
    UserID: newUserId,
    PackageName: 'Chưa đăng ký',
    Status: 'Active',
    EndDate: '—'
  });

  MockDB.saveDB(db);
  GymAPI.setCurrentUser(newUser);

  showToast('Đăng ký tài khoản thành công! Đang chuyển đến Dashboard...', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 700);
}

/**
 * Hàm hỗ trợ điền nhanh tài khoản mẫu để test chấm bài / demo
 * @param {string} username - Tên đăng nhập mẫu (admin, staff01, trainer01, member01)
 * @param {string} password - Mật khẩu mặc định
 */
function fillDemoAccount(username, password = '123456') {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  if (usernameInput && passwordInput) {
    usernameInput.value = username;
    passwordInput.value = password;
    showToast(`Đã chọn tài khoản mẫu: ${username}`, 'info');
  }
}

// Xuất hàm ra global
window.fillDemoAccount = fillDemoAccount;
