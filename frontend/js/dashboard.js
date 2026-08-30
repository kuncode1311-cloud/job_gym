/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN GIAO DIỆN TỔNG QUAN (dashboard.js)
 * ==============================================================================
 */

let revenueChartInstance = null;
let attendanceChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  renderGreetingAndStats();
  await loadRecentCheckIns();
  await loadUpcomingBookings();
  initCharts();
});

/**
 * Hiển thị câu chào và 4 thẻ thống kê KPI động theo vai trò (Admin / Staff / Trainer / Member)
 */
function renderGreetingAndStats() {
  const currentUser = GymAPI.getCurrentUser();
  const staffProfileView = document.getElementById('staffProfileView');
  const trainerDashboardView = document.getElementById('trainerDashboardView');
  const memberDashboardView = document.getElementById('memberDashboardView');
  const adminOperationsView = document.getElementById('adminOperationsView');

  if (currentUser.Role === 'Staff') {
    if (staffProfileView) staffProfileView.style.display = 'block';
    if (trainerDashboardView) trainerDashboardView.style.display = 'none';
    if (memberDashboardView) memberDashboardView.style.display = 'none';
    if (adminOperationsView) adminOperationsView.style.display = 'none';

    loadStaffPosItems('all');
    loadStaffRecentAttendees();
    return;
  }

  if (currentUser.Role === 'Trainer') {
    if (staffProfileView) staffProfileView.style.display = 'none';
    if (trainerDashboardView) trainerDashboardView.style.display = 'block';
    if (memberDashboardView) memberDashboardView.style.display = 'none';
    if (adminOperationsView) adminOperationsView.style.display = 'none';

    const trainerGreeting = document.getElementById('trainerGreetingTitle');
    if (trainerGreeting) trainerGreeting.textContent = `Chào ${currentUser.Fullname || 'Trần Quốc Bảo'}! 🏋️`;
    return;
  }


  if (currentUser.Role === 'Member') {
    if (staffProfileView) staffProfileView.style.display = 'none';
    if (trainerDashboardView) trainerDashboardView.style.display = 'none';
    if (memberDashboardView) memberDashboardView.style.display = 'block';
    if (adminOperationsView) adminOperationsView.style.display = 'none';

    const memberWelcome = document.getElementById('memberWelcomeName');
    if (memberWelcome) memberWelcome.textContent = currentUser.Fullname || 'Nguyễn Văn An';
    return;
  }

  // Admin / Manager
  if (staffProfileView) staffProfileView.style.display = 'none';
  if (trainerDashboardView) trainerDashboardView.style.display = 'none';
  if (memberDashboardView) memberDashboardView.style.display = 'none';
  if (adminOperationsView) adminOperationsView.style.display = 'block';


  const greetingTitle = document.getElementById('greetingTitle');
  const greetingSubtitle = document.getElementById('greetingSubtitle');
  const statsContainer = document.getElementById('statsGrid');

  if (greetingTitle) greetingTitle.textContent = `Chào Quản lý ${currentUser.Fullname}! 👋`;
  if (greetingSubtitle) greetingSubtitle.textContent = 'Tổng quan tình hình kinh doanh và vận hành phòng tập';

  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #FFFFFF;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Tổng hội viên</span>
        <span style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">156 người</span>
        <span style="font-size: 12px; color: #10B981; font-weight: 600;">● 142 Đang hoạt động</span>
      </div>
      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #10B981;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Check-in hôm nay</span>
        <span style="font-size: 24px; font-weight: 800; color: #10B981; letter-spacing: -0.5px;">84 lượt</span>
        <span style="font-size: 12px; color: #9CA3AF;">18 người đang tập</span>
      </div>
      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #3B82F6;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Booking hôm nay</span>
        <span style="font-size: 24px; font-weight: 800; color: #3B82F6; letter-spacing: -0.5px;">12 lịch hẹn</span>
        <span style="font-size: 12px; color: #9CA3AF;">3 ca đang chờ duyệt</span>
      </div>
      <div class="glass-card" style="padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; border-left: 3px solid #FF334B;">
        <span style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Doanh thu tháng</span>
        <span style="font-size: 24px; font-weight: 800; color: #FF334B; letter-spacing: -0.5px;">45.200.000đ</span>
        <span style="font-size: 12px; color: #10B981; font-weight: 600;">📈 +18.5% so với tháng trước</span>
      </div>
    `;
  }
}




/**
 * Tải bảng 5 hội viên check-in gần nhất
 */
async function loadRecentCheckIns() {
  const tableBody = document.getElementById('recentCheckInTable');
  if (!tableBody) return;

  const attendanceList = await GymAPI.getAttendance();
  const recent = attendanceList.slice(0, 5);

  tableBody.innerHTML = recent.map(item => `
    <tr>
      <td style="font-weight: 600;">${item.MemberName}</td>
      <td class="code-highlight">${item.MemberCode || `HV-10${item.MemberID}`}</td>
      <td class="time-highlight">${item.CheckInTime}</td>
      <td>
        <span class="badge ${item.Type === 'Yoga' ? 'badge-yellow' : item.Type === 'Cardio' ? 'badge-blue' : 'badge-green'}">
          ${item.Type || 'Gym & Fitness'}
        </span>
      </td>
    </tr>
  `).join('');
}

/**
 * Tải bảng 5 lịch hẹn PT sắp tới
 */
async function loadUpcomingBookings() {
  const tableBody = document.getElementById('upcomingBookingTable');
  if (!tableBody) return;

  const bookings = await GymAPI.getBookings();
  const upcoming = bookings.slice(0, 5);

  tableBody.innerHTML = upcoming.map(item => `
    <tr>
      <td class="time-highlight">${item.StartTime}</td>
      <td style="font-weight: 600;">${item.MemberName}</td>
      <td>${item.TrainerName || 'HLV Ca Trực'}</td>
      <td style="color: var(--text-muted); font-size: 13px;">${item.Notes || 'Tập luyện khởi động'}</td>
    </tr>
  `).join('');
}

/**
 * Khởi tạo biểu đồ Chart.js (Biểu đồ doanh thu đỏ neon & Biểu đồ điểm danh tuần)
 */
function initCharts() {
  const revenueCanvas = document.getElementById('revenueChart');
  const attendanceCanvas = document.getElementById('attendanceChart');

  if (revenueCanvas && typeof Chart !== 'undefined') {
    const ctx = revenueCanvas.getContext('2d');
    
    // Gradient màu đỏ thể thao chuẩn Figma
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, '#FF334B');
    gradient.addColorStop(1, '#990011');

    revenueChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9'],
        datasets: [{
          label: 'Doanh thu (Triệu VNĐ)',
          data: [28.5, 34.2, 38.0, 42.1, 45.2, 48.0],
          backgroundColor: gradient,
          borderRadius: 6,
          barPercentage: 0.55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.raw} Triệu VNĐ`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9CA3AF' }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#9CA3AF' }
          }
        }
      }
    });
  }

  if (attendanceCanvas && typeof Chart !== 'undefined') {
    const ctx2 = attendanceCanvas.getContext('2d');
    attendanceChartInstance = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
        datasets: [{
          label: 'Lượt Check-in',
          data: [65, 82, 78, 84, 95, 110, 88],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9CA3AF' } }
        }
      }
    });
  }
}

/**
 * Xử lý sự kiện điểm danh nhanh từ Modal
 */
async function handleQuickCheckIn() {
  const memberSelect = document.getElementById('quickCheckInMember');
  const typeSelect = document.getElementById('quickCheckInType');
  if (!memberSelect || !memberSelect.value) {
    showToast('Vui lòng chọn hội viên để check-in', 'error');
    return;
  }

  const result = await GymAPI.checkIn(memberSelect.value, typeSelect ? typeSelect.value : 'Gym & Fitness');
  if (result.success) {
    showToast(`Check-in thành công: ${result.data.MemberName} (${result.data.CheckInTime})`, 'success');
    closeModal('quickCheckInModal');
    loadRecentCheckIns();
  } else {
    showToast(result.message || 'Lỗi khi điểm danh', 'error');
  }
}

/**
 * Mở Modal điểm danh nhanh và nạp danh sách hội viên vào dropdown
 */
async function openQuickCheckInModal() {
  const select = document.getElementById('quickCheckInMember');
  if (select) {
    const members = await GymAPI.getMembers();
    select.innerHTML = members.map(m => `
      <option value="${m.MemberID}">${m.Code} - ${m.Fullname} (${m.PackageName})</option>
    `).join('');
  }
  openModal('quickCheckInModal');
}

window.openQuickCheckInModal = openQuickCheckInModal;
window.handleQuickCheckIn = handleQuickCheckIn;

// ==============================================================================
// STAFF DASHBOARD / QUẦY BÁN HÀNG & LỄ TÂN (POS)
// ==============================================================================

let currentStaffPosCategory = 'all';

async function loadStaffPosItems(category = 'all') {
  const tableBody = document.getElementById('staffPosTableBody');
  if (!tableBody) return;

  currentStaffPosCategory = category;

  // Lấy danh sách sản phẩm từ kho và gói tập từ database
  const inventoryItems = await GymAPI.getInventory();
  const packages = await GymAPI.getPackages();

  // Chuyển packages thành định dạng sản phẩm bán hàng
  const packageItems = packages.map(p => ({
    ID: `PKG-${p.PackageID}`,
    Name: p.PackageName,
    Category: 'Gói tập',
    Price: p.Price,
    Stock: 'Không giới hạn',
    Status: 'Còn hàng'
  }));

  let allProducts = [...packageItems, ...inventoryItems];

  if (category !== 'all') {
    allProducts = allProducts.filter(p => p.Category === category);
  }

  tableBody.innerHTML = allProducts.map(item => {
    let catBadgeClass = 'badge-blue';
    if (item.Category === 'Gói tập') catBadgeClass = 'badge-green';
    else if (item.Category === 'Phụ kiện') catBadgeClass = 'badge-yellow';
    else if (item.Category === 'Dịch vụ') catBadgeClass = 'badge-red';

    const stockDisplay = typeof item.Stock === 'number' ? `${item.Stock} cái/chai` : item.Stock;

    return `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
        <td style="font-weight: 700; color: #FFFFFF; padding: 12px 14px;">${item.Name}</td>
        <td style="padding: 12px 14px;"><span class="badge ${catBadgeClass}">${item.Category}</span></td>
        <td style="color: #FF334B; font-weight: 700; padding: 12px 14px;">${formatVND(item.Price)}</td>
        <td style="color: #9CA3AF; padding: 12px 14px; font-size: 13px;">${stockDisplay}</td>
        <td style="text-align: center; padding: 12px 14px;">
          <button class="btn btn-primary btn-sm" style="font-weight: 700; padding: 6px 14px;" onclick="handleStaffQuickSell('${item.Name}', ${item.Price})">
            <i class="fa fa-shopping-cart"></i> Bán ngay
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterStaffPos(category, event) {
  document.querySelectorAll('#staffPosTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  loadStaffPosItems(category);
}

let currentShiftRevenue = 2850000;
let currentShiftOrders = 8;

async function handleStaffQuickSell(itemName, price) {
  await GymAPI.addPayment({
    MemberName: 'Khách mua tại quầy (Khách vãng lai)',
    PackageName: itemName,
    Amount: price,
    PaymentMethod: 'Tiền mặt'
  });

  currentShiftRevenue += Number(price);
  currentShiftOrders += 1;

  const revEl = document.getElementById('staffShiftRevenue');
  if (revEl) revEl.textContent = formatVND(currentShiftRevenue);

  showToast(`Đã thanh toán thành công: ${itemName} (${formatVND(price)})!`, 'success');
}


async function loadStaffRecentAttendees() {
  const container = document.getElementById('staffRecentCheckInList');
  if (!container) return;

  const attendanceList = await GymAPI.getAttendance();
  const recent = attendanceList.slice(0, 5);

  container.innerHTML = recent.map(item => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);"></div>
        <div>
          <div style="font-weight: 700; color: #FFFFFF; font-size: 13.5px;">${item.MemberName}</div>
          <div style="font-size: 12px; color: #9CA3AF; margin-top: 1px;">${item.MemberCode || `HV-10${item.MemberID}`} • ${item.CheckInTime}</div>
        </div>
      </div>
      <span class="badge badge-green" style="font-size: 11.5px; padding: 4px 10px;">Đang tập</span>
    </div>
  `).join('');
}

async function handleStaffQuickCheckIn() {
  const inp = document.getElementById('staffQuickCheckInInp');
  if (!inp || !inp.value.trim()) {
    showToast('Vui lòng nhập mã hội viên hoặc tên', 'error');
    return;
  }

  const term = inp.value.trim();
  const members = await GymAPI.getMembers();
  const found = members.find(m => 
    m.Code.toLowerCase() === term.toLowerCase() || 
    m.Fullname.toLowerCase().includes(term.toLowerCase())
  );

  if (found) {
    const res = await GymAPI.checkIn(found.MemberID, found.PackageName || 'Gym & Fitness');
    if (res.success) {
      showToast(`Check-in thành công: ${found.Fullname} (${found.Code})`, 'success');
      inp.value = '';
      loadStaffRecentAttendees();
    }
  } else {
    showToast('Không tìm thấy mã hội viên này trong hệ thống', 'error');
  }
}

window.filterStaffPos = filterStaffPos;
window.handleStaffQuickSell = handleStaffQuickSell;
window.handleStaffQuickCheckIn = handleStaffQuickCheckIn;
window.loadStaffPosItems = loadStaffPosItems;
window.loadStaffRecentAttendees = loadStaffRecentAttendees;

