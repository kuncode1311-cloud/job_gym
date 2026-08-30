/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN PHÂN HỆ QUẢN TRỊ, GÓI TẬP, THANH TOÁN, KHO, LƯƠNG & BÁO CÁO (admin.js)
 * ==============================================================================
 */

let currentInventoryCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  loadMySalary();
  initAdminTabsFromHash();
  window.addEventListener('hashchange', initAdminTabsFromHash);
  
  await loadPackages();
  await loadPayments();
  await loadInventory();
  await loadStaffAttendance();
  await loadSalaries();
  await loadUsers();
});


/**
 * Điều hướng Tab dựa theo URL hash (#packages, #payments, #inventory, #attendance_manage, #salaries, #users, #reports)
 */
function initAdminTabsFromHash() {
  const hash = window.location.hash.replace('#', '');
  const validTabs = ['packages', 'payments', 'inventory', 'attendance_manage', 'salaries', 'users', 'reports', 'my_salary', 'my_attendance'];
  
  if (validTabs.includes(hash)) {
    switchAdminTab(hash);
  } else {
    switchAdminTab('packages');
  }
}

/**
 * Chuyển đổi tab hiển thị
 */
function switchAdminTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.style.display = sec.id === `section_${tabId}` ? 'block' : 'none';
  });

  if (tabId === 'packages') {
    loadPackages();
  } else if (tabId === 'payments') {
    loadPayments();
  } else if (tabId === 'inventory') {
    loadInventory();
  } else if (tabId === 'attendance_manage' || tabId === 'my_attendance') {
    loadStaffAttendance();
  } else if (tabId === 'salaries') {
    loadSalaries();
  } else if (tabId === 'my_salary') {
    loadMySalary();
  } else if (tabId === 'users') {
    loadUsers();
  } else if (tabId === 'reports') {
    setTimeout(initReportChart, 100);
  }

  if (typeof initSidebarNavigation === 'function') {
    initSidebarNavigation();
  }
}

function loadMySalary() {
  const user = (typeof Auth !== 'undefined' && Auth.getCurrentUser) ? Auth.getCurrentUser() : null;
  const staffNameEl = document.getElementById('mySalaryStaffName');
  if (staffNameEl && user) {
    staffNameEl.textContent = user.FullName || user.Username || 'Văn Cường';
  }
}


let reportChartInstance = null;

function initReportChart() {
  const ctx = document.getElementById('reportRevenueBarChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (reportChartInstance) {
    reportChartInstance.destroy();
  }

  reportChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8'],
      datasets: [{
        label: 'Doanh thu (triệu VNĐ)',
        data: [28, 35, 30, 42, 38.5, 45.2],
        backgroundColor: '#FF334B',
        borderRadius: 6,
        barThickness: 28,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1E1624',
          titleColor: '#FFF',
          bodyColor: '#FF334B',
          borderColor: 'rgba(255, 51, 75, 0.4)',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.raw} triệu VNĐ`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9CA3AF', font: { weight: '600', size: 12 } }
        },
        y: {
          display: false,
          grid: { display: false }
        }
      }
    }
  });
}



// ==============================================================================
// 1. QUẢN LÝ BẢNG GIÁ GÓI TẬP (PACKAGES)
// ==============================================================================

async function loadPackages() {
  const container = document.getElementById('packageTableBody');
  if (!container) return;

  const packages = await GymAPI.getPackages();
  container.innerHTML = packages.map(p => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF;">${p.PackageID}</td>
      <td style="font-weight: 700; color: #FFFFFF;">${p.PackageName}</td>
      <td style="color: #E5E7EB;">${p.Duration}</td>
      <td style="font-weight: 700; color: #FFFFFF;">${formatVND(p.Price)}</td>
      <td style="color: #D1D5DB;">${p.Description || 'Gói tập tiêu chuẩn'}</td>
      <td style="text-align: center;">
        <div style="display: inline-flex; gap: 14px; justify-content: center; align-items: center;">
          <button class="action-btn" title="Sửa gói tập" onclick="openEditPackageModal(${p.PackageID})" style="background: transparent; border: none; color: #FFFFFF; font-size: 18px; cursor: pointer; padding: 4px;">
            <i class="fa fa-edit"></i>
          </button>
          <button class="action-btn" title="Xóa gói tập" onclick="handleDeletePackage(${p.PackageID})" style="background: transparent; border: none; color: #FFFFFF; font-size: 18px; cursor: pointer; padding: 4px;">
            <i class="fa fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleDeletePackage(pkgId) {
  if (!confirm('Bạn có chắc chắn muốn xóa gói tập này?')) return;
  const res = await GymAPI.deletePackage(pkgId);
  if (res.success) {
    showToast(res.message || 'Đã xóa gói tập thành công!', 'success');
    loadPackages();
  } else {
    showToast(res.message || 'Không thể xóa gói tập!', 'error');
  }
}


function openAddPackageModal() {
  document.getElementById('packageModalTitle').textContent = 'Thêm Gói tập Mới';
  document.getElementById('packageForm').reset();
  document.getElementById('pkgId').value = '';
  openModal('packageModal');
}

async function openEditPackageModal(id) {
  const packages = await GymAPI.getPackages();
  const pkg = packages.find(p => p.PackageID === Number(id));
  if (!pkg) return;

  document.getElementById('packageModalTitle').textContent = 'Chỉnh sửa Gói tập';
  document.getElementById('pkgId').value = pkg.PackageID;
  document.getElementById('pkgName').value = pkg.PackageName;
  document.getElementById('pkgDuration').value = pkg.Duration;
  document.getElementById('pkgPrice').value = pkg.Price;
  document.getElementById('pkgDescription').value = pkg.Description || '';
  openModal('packageModal');
}

async function handleSavePackage(e) {
  e.preventDefault();
  const id = document.getElementById('pkgId').value;
  const name = document.getElementById('pkgName').value.trim();
  const duration = Number(document.getElementById('pkgDuration').value);
  const price = Number(document.getElementById('pkgPrice').value);
  const description = document.getElementById('pkgDescription').value.trim();

  const pkgData = { PackageName: name, Duration: duration, Price: price, Description: description };
  if (id) {
    pkgData.PackageID = Number(id);
    await GymAPI.updatePackage(pkgData);
    showToast('Cập nhật gói tập thành công!', 'success');
  } else {
    await GymAPI.addPackage(pkgData);
    showToast('Thêm gói tập mới thành công!', 'success');
  }

  closeModal('packageModal');
  loadPackages();
}

// ==============================================================================
// 2. QUẢN LÝ THANH TOÁN & HÓA ĐƠN (PAYMENTS)
// ==============================================================================

function renderPaymentMethodBadge(method) {
  const m = (method || '').toLowerCase();
  if (m.includes('momo')) {
    return `<span class="badge" style="background: rgba(236, 72, 153, 0.15); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-wallet" style="color: #F472B6;"></i> MoMo</span>`;
  }
  if (m.includes('vnpay')) {
    return `<span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-qrcode" style="color: #F87171;"></i> VNPay-QR</span>`;
  }
  if (m.includes('zalo')) {
    return `<span class="badge" style="background: rgba(14, 165, 233, 0.15); color: #38BDF8; border: 1px solid rgba(14, 165, 233, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-mobile-alt" style="color: #38BDF8;"></i> ZaloPay</span>`;
  }
  if (m.includes('visa') || m.includes('master') || m.includes('card')) {
    return `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-credit-card" style="color: #FBBF24;"></i> Visa / Master</span>`;
  }
  if (m.includes('bank') || m.includes('chuyển khoản')) {
    return `<span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-university" style="color: #60A5FA;"></i> Banking</span>`;
  }
  return `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35); padding: 5px 12px; border-radius: 20px; font-weight: 700; font-size: 12.5px; display: inline-flex; align-items: center; gap: 6px;"><i class="fa fa-money-bill-wave" style="color: #34D399;"></i> Tiền mặt (Cash)</span>`;
}

async function loadPayments() {
  const tableBody = document.getElementById('paymentTableBody');
  if (!tableBody) return;

  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  const isStaff = currentUser.Role === 'Staff';

  // Update Header Title & Button Text
  const titleEl = document.getElementById('paymentHeaderTitle');
  const btnEl = document.getElementById('paymentHeaderBtn');
  const cardTitleEl = document.getElementById('paymentTableCardTitle');
  const kpiContainer = document.getElementById('paymentKpiContainer');

  if (titleEl) titleEl.textContent = isStaff ? 'Quản lý Thanh toán' : 'Quản lý thanh toán & Giao dịch';
  if (btnEl) btnEl.innerHTML = `<i class="fa fa-plus"></i> ${isStaff ? '+ Tạo giao dịch' : '+ Tạo hóa đơn'}`;
  if (cardTitleEl) cardTitleEl.textContent = isStaff ? 'Danh sách giao dịch gần đây' : 'Lịch sử giao dịch toàn hệ thống';

  // Update KPI Cards
  if (kpiContainer) {
    if (isStaff) {
      kpiContainer.innerHTML = `
        <div class="glass-card" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase;">DOANH THU HÔM NAY</div>
          <div>
            <span style="font-size: 26px; font-weight: 800; color: #10B981; letter-spacing: -0.5px;">19.200.000đ</span>
          </div>
        </div>
        <div class="glass-card" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase;">GIAO DỊCH HÔM NAY</div>
          <div>
            <span style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">8 Giao dịch</span>
          </div>
        </div>
        <div class="glass-card" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 12px; color: #9CA3AF; font-weight: 700; text-transform: uppercase;">CHỜ XỬ LÝ (PENDING)</div>
          <div>
            <span style="font-size: 26px; font-weight: 800; color: #F59E0B; letter-spacing: -0.5px;">1 Yêu cầu</span>
          </div>
        </div>
      `;
    } else {
      kpiContainer.innerHTML = `
        <div class="glass-card" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 13px; color: #9CA3AF; font-weight: 500;">Tổng doanh thu tháng</div>
          <div style="display: flex; align-items: baseline; gap: 10px;">
            <span style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">148.250.000đ</span>
            <span style="font-size: 13px; font-weight: 700; color: #10B981;">+18.5%</span>
          </div>
        </div>
        <div class="glass-card" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 13px; color: #9CA3AF; font-weight: 500;">Số giao dịch thành công</div>
          <div style="display: flex; align-items: baseline; gap: 10px;">
            <span style="font-size: 26px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">112 giao dịch</span>
            <span style="font-size: 13px; font-weight: 700; color: #10B981;">+12%</span>
          </div>
        </div>
        <div class="glass-card" style="padding: 20px 24px; display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 13px; color: #9CA3AF; font-weight: 500;">Giao dịch chờ xác nhận</div>
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-size: 26px; font-weight: 800; color: #F59E0B; letter-spacing: -0.5px;">8 yêu cầu</span>
            <span style="font-size: 13px; font-weight: 600; color: #F59E0B;">Cần xử lý</span>
          </div>
        </div>
      `;
    }
  }

  const payments = await GymAPI.getPayments();

  if (isStaff) {
    const staffPayments = [
      { id: 1, amount: 12000000, method: 'Chuyển khoản', date: '2026-01-10', status: 'Đã thanh toán', pkgId: 1 },
      { id: 2, amount: 3600000, method: 'Chuyển khoản', date: '2026-01-15', status: 'Đã thanh toán', pkgId: 2 },
      { id: 3, amount: 2400000, method: 'Tiền mặt', date: '2026-02-01', status: 'Đã thanh toán', pkgId: 3 },
      { id: 4, amount: 1200000, method: 'Tiền mặt', date: '2026-02-10', status: 'Chờ xử lý', pkgId: 4 },
      { id: 5, amount: 9600000, method: 'Chuyển khoản', date: '2026-02-20', status: 'Đã thanh toán', pkgId: 5 },
      { id: 6, amount: 500000, method: 'Tiền mặt', date: '2026-03-01', status: 'Thất bại', pkgId: 6 }
    ];

    tableBody.innerHTML = staffPayments.map(p => {
      let statusBadge = `<span class="badge badge-green" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Đã thanh toán</span>`;
      if (p.status === 'Chờ xử lý') {
        statusBadge = `<span class="badge badge-yellow" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Chờ xử lý</span>`;
      } else if (p.status === 'Thất bại') {
        statusBadge = `<span class="badge badge-red" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Thất bại</span>`;
      }

      return `
        <tr>
          <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${p.id}</td>
          <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${formatVND(p.amount)}</td>
          <td style="color: #9CA3AF; padding: 14px 18px;">${p.method}</td>
          <td style="color: #9CA3AF; padding: 14px 18px;">${p.date}</td>
          <td style="padding: 14px 18px;">${statusBadge}</td>
          <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 14px 18px;">${p.pkgId}</td>
        </tr>
      `;
    }).join('');
    return;
  }

  // Admin view
  tableBody.innerHTML = payments.map(p => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${p.PaymentsID}</td>
      <td style="color: #FF334B; font-weight: 700; padding: 14px 18px;">${formatVND(p.Amount)}</td>
      <td style="padding: 14px 18px;">${renderPaymentMethodBadge(p.PaymentMethod)}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${p.PaymentDate}</td>
      <td style="padding: 14px 18px;">
        <span class="badge badge-green" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">
          Paid
        </span>
      </td>
      <td style="font-weight: 700; color: #FFFFFF; text-align: center; padding: 14px 18px;">${p.MemberPackageID || p.PaymentsID}</td>
    </tr>
  `).join('');
}




function printInvoice(code, member, amount) {
  showToast(`Đã xuất hóa đơn ${code} cho hội viên ${member} (${formatVND(amount)})`, 'success');
}

async function openCreateInvoiceForPackage(packageName, price) {
  switchAdminTab('payments');
  const members = await GymAPI.getMembers();
  const select = document.getElementById('payMemberSelect');
  if (select) {
    select.innerHTML = members.map(m => `<option value="${m.Fullname}">${m.Code} - ${m.Fullname}</option>`).join('');
  }
  document.getElementById('payPackageName').value = packageName;
  document.getElementById('payAmount').value = price;
  openModal('paymentModal');
}

function openAddPaymentModal() {
  openCreateInvoiceForPackage('Gói 1 tháng', 500000);
}

async function handleSavePayment(e) {
  e.preventDefault();
  const memberName = document.getElementById('payMemberSelect').value;
  const packageName = document.getElementById('payPackageName').value;
  const amount = Number(document.getElementById('payAmount').value);
  const method = document.getElementById('payMethod').value;

  await GymAPI.addPayment({
    MemberName: memberName,
    PackageName: packageName,
    Amount: amount,
    PaymentMethod: method
  });

  showToast('Tạo phiếu thu tiền thành công!', 'success');
  closeModal('paymentModal');
  loadPayments();
}

// ==============================================================================
// 3. MENU DỊCH VỤ & KHO HÀNG (INVENTORY)
// ==============================================================================

async function loadInventory(category = 'all') {
  const tableBody = document.getElementById('inventoryTableBody');
  if (!tableBody) return;

  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
  const isAdmin = currentUser.Role === 'Admin';

  const addBtn = document.getElementById('addInventoryBtn');
  const actionTh = document.getElementById('inventoryActionTh');
  if (addBtn) addBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  if (actionTh) actionTh.style.display = isAdmin ? 'table-cell' : 'none';

  currentInventoryCategory = category;
  let items = await GymAPI.getInventory();
  if (category !== 'all') {
    items = items.filter(i => i.Category === category);
  }

  tableBody.innerHTML = items.map(i => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF;">${i.Name}</td>
      <td><span class="badge badge-blue">${i.Category}</span></td>
      <td class="price-highlight">${formatVND(i.Price)}</td>
      <td>${i.Stock !== undefined ? i.Stock : 100}</td>
      <td>
        <span class="badge ${i.Status === 'Còn hàng' ? 'badge-green' : 'badge-red'}">
          ${i.Status}
        </span>
      </td>
      ${isAdmin ? `
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openEditInventoryModal(${i.ID})">
          <i class="fa fa-edit"></i> Sửa
        </button>
      </td>
      ` : ''}
    </tr>
  `).join('');
}


function filterInventory(category, event) {
  document.querySelectorAll('#inventoryTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  loadInventory(category);
}

function openAddInventoryModal() {
  document.getElementById('invModalTitle').textContent = 'Thêm Sản phẩm / Dịch vụ';
  document.getElementById('inventoryForm').reset();
  document.getElementById('invId').value = '';
  openModal('inventoryModal');
}

async function openEditInventoryModal(id) {
  const items = await GymAPI.getInventory();
  const item = items.find(i => i.ID === Number(id));
  if (!item) return;

  document.getElementById('invModalTitle').textContent = 'Chỉnh sửa Sản phẩm / Dịch vụ';
  document.getElementById('invId').value = item.ID;
  document.getElementById('invName').value = item.Name;
  document.getElementById('invCategory').value = item.Category;
  document.getElementById('invPrice').value = item.Price;
  document.getElementById('invStock').value = item.Stock !== undefined ? item.Stock : 10;
  openModal('inventoryModal');
}

async function handleSaveInventory(e) {
  e.preventDefault();
  const id = document.getElementById('invId').value;
  const name = document.getElementById('invName').value.trim();
  const category = document.getElementById('invCategory').value;
  const price = Number(document.getElementById('invPrice').value);
  const stock = Number(document.getElementById('invStock').value);

  const itemData = { Name: name, Category: category, Price: price, Stock: stock };
  if (id) {
    itemData.ID = Number(id);
    await GymAPI.updateInventoryItem(itemData);
    showToast('Cập nhật sản phẩm thành công!', 'success');
  } else {
    await GymAPI.addInventoryItem(itemData);
    showToast('Thêm sản phẩm mới thành công!', 'success');
  }

  closeModal('inventoryModal');
  loadInventory(currentInventoryCategory);
}

// ==============================================================================
// 4. CHẤM CÔNG NHÂN SỰ (ATTENDANCE MANAGE)
// ==============================================================================

async function loadStaffAttendance() {
  const tableBody = document.getElementById('staffAttendanceTableBody');
  if (!tableBody) return;

  const attendance = await GymAPI.getAttendance();
  tableBody.innerHTML = attendance.map(a => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${a.AttendanceID}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${a.CheckInTime}:00</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${a.CheckOutTime}:00</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${a.AttendanceDate}</td>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${a.MemberID}</td>
      <td style="text-align: center; padding: 14px 18px;">
        <button class="btn btn-secondary btn-sm" style="border-radius: 14px; padding: 5px 18px; font-size: 13px;" onclick="openEditAttendanceModal(${a.AttendanceID})">
          Cập nhật
        </button>
      </td>
    </tr>
  `).join('');
}

async function openEditAttendanceModal(id) {
  const attendance = await GymAPI.getAttendance();
  const item = attendance.find(a => a.AttendanceID === Number(id));
  if (!item) return;

  document.getElementById('attId').value = item.AttendanceID;
  document.getElementById('attDisplayId').value = `#ATT-${item.AttendanceID} (Member ID: ${item.MemberID})`;
  document.getElementById('attDate').value = item.AttendanceDate;
  document.getElementById('attCheckIn').value = item.CheckInTime.substring(0, 5);
  document.getElementById('attCheckOut').value = item.CheckOutTime.substring(0, 5);
  openModal('attendanceModal');
}

async function handleSaveAttendance(e) {
  e.preventDefault();
  const id = document.getElementById('attId').value;
  const date = document.getElementById('attDate').value;
  const checkIn = document.getElementById('attCheckIn').value;
  const checkOut = document.getElementById('attCheckOut').value;

  await GymAPI.updateAttendance(id, {
    AttendanceDate: date,
    CheckInTime: checkIn,
    CheckOutTime: checkOut
  });

  showToast('Cập nhật giờ chấm công thành công!', 'success');
  closeModal('attendanceModal');
  loadStaffAttendance();
}

function openStaffCheckInModal() {
  showToast('Đã điểm danh ca làm việc thành công!', 'success');
}


// ==============================================================================
// 5. BẢNG CHẤM CÔNG & QUẢN LÝ LƯƠNG (SALARIES)
// ==============================================================================

async function loadSalaries() {
  const tableBody = document.getElementById('salaryTableBody');
  if (!tableBody) return;

  const salaries = await GymAPI.getSalaries();
  tableBody.innerHTML = salaries.map(s => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${s.Code || `NV${s.ID}`}</td>
      <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${s.Name}</td>
      <td style="color: #E5E7EB; padding: 14px 18px;">${s.Role}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${s.WorkDays || '26/26'}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${s.Sessions !== undefined && s.Sessions > 0 ? `${s.Sessions} buổi` : '—'}</td>
      <td style="padding: 14px 18px;">
        <span style="font-weight: 700; color: ${s.LateDays === 0 ? '#10B981' : s.LateDays <= 2 ? '#F59E0B' : '#EF4444'};">
          ${s.LateDays || 0}
        </span>
      </td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${formatVND(s.BaseSalary || 8000000)}</td>
      <td style="color: #FFFFFF; padding: 14px 18px;">${formatVND(s.Allowance || 0)}</td>
      <td style="text-align: center; padding: 14px 18px;">
        <button class="btn btn-secondary btn-sm" style="border-radius: 12px; padding: 4px 16px; font-size: 13px;" onclick="openSalaryDetailModal(${s.ID})">
          <i class="fa fa-file-invoice-dollar" style="color: #F59E0B; margin-right: 4px;"></i> Chi tiết
        </button>
      </td>
    </tr>
  `).join('');
}

function openAddSalaryModal() {
  document.getElementById('salaryModalTitle').innerHTML = '<i class="fa fa-plus-circle text-yellow"></i> Thêm Phiếu Lương Nhân Sự Mới';
  document.getElementById('salaryForm').reset();
  document.getElementById('salId').value = '';
  document.getElementById('salCode').value = `NV${Math.floor(Math.random() * 800 + 100)}`;
  document.getElementById('salCode').removeAttribute('readonly');
  document.getElementById('salName').removeAttribute('readonly');
  document.getElementById('salRole').removeAttribute('readonly');
  document.getElementById('salWorkDays').value = '26/26';
  document.getElementById('salSessions').value = 0;
  document.getElementById('salLateDays').value = 0;
  document.getElementById('salBaseSalary').value = 8000000;
  document.getElementById('salAllowance').value = 0;
  calculateTotalSalary();
  openModal('salaryModal');
}

async function openSalaryDetailModal(id) {
  const salaries = await GymAPI.getSalaries();
  const item = salaries.find(s => s.ID === Number(id));
  if (!item) return;

  document.getElementById('salaryModalTitle').innerHTML = '<i class="fa fa-file-invoice-dollar text-yellow"></i> Phiếu Lương Chi Tiết';
  document.getElementById('salId').value = item.ID;
  document.getElementById('salCode').value = item.Code || `NV${item.ID}`;
  document.getElementById('salName').value = item.Name;
  document.getElementById('salRole').value = item.Role;
  document.getElementById('salWorkDays').value = item.WorkDays || '26/26';
  document.getElementById('salSessions').value = item.Sessions || 0;
  document.getElementById('salLateDays').value = item.LateDays || 0;
  document.getElementById('salBaseSalary').value = item.BaseSalary || 8000000;
  document.getElementById('salAllowance').value = item.Allowance || 0;
  
  calculateTotalSalary();
  openModal('salaryModal');
}

function calculateTotalSalary() {
  const base = Number(document.getElementById('salBaseSalary').value) || 0;
  const allow = Number(document.getElementById('salAllowance').value) || 0;
  const total = base + allow;
  const totalDisplay = document.getElementById('salTotalDisplay');
  if (totalDisplay) {
    totalDisplay.textContent = formatVND(total);
  }
}

async function handleSaveSalary(e) {
  e.preventDefault();
  const id = document.getElementById('salId').value;
  const code = document.getElementById('salCode').value;
  const name = document.getElementById('salName').value;
  const role = document.getElementById('salRole').value;
  const workDays = document.getElementById('salWorkDays').value;
  const sessions = Number(document.getElementById('salSessions').value);
  const lateDays = Number(document.getElementById('salLateDays').value);
  const baseSalary = Number(document.getElementById('salBaseSalary').value);
  const allowance = Number(document.getElementById('salAllowance').value);
  const totalSalary = baseSalary + allowance;

  const salaryData = {
    Code: code,
    Name: name,
    Role: role,
    WorkDays: workDays,
    Sessions: sessions,
    LateDays: lateDays,
    BaseSalary: baseSalary,
    Allowance: allowance,
    TotalSalary: totalSalary
  };

  if (id) {
    await GymAPI.updateSalary(id, salaryData);
    showToast('Cập nhật thông tin bảng lương thành công!', 'success');
  } else {
    await GymAPI.addSalary(salaryData);
    showToast('Thêm phiếu lương nhân sự mới thành công!', 'success');
  }

  closeModal('salaryModal');
  loadSalaries();
}


function printSalarySlip() {
  const name = document.getElementById('salName').value;
  const code = document.getElementById('salCode').value;
  const total = document.getElementById('salTotalDisplay').textContent;
  showToast(`Đang in phiếu lương ${code} của nhân sự ${name} (${total})...`, 'success');
}



// ==============================================================================
// 6. QUẢN LÝ TÀI KHOẢN HỆ THỐNG (USERS CRUD)
// ==============================================================================

let selectedUserRoleFilter = 'all';

async function loadUsers() {
  const tableBody = document.getElementById('userTableBody');
  if (!tableBody) return;

  const users = await GymAPI.getUsers();
  const searchInput = document.getElementById('userSearchInput');
  const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let filtered = users;
  if (selectedUserRoleFilter !== 'all') {
    filtered = filtered.filter(u => u.Role.toLowerCase() === selectedUserRoleFilter.toLowerCase());
  }
  if (term) {
    filtered = filtered.filter(u => 
      u.Username.toLowerCase().includes(term) || 
      (u.Fullname && u.Fullname.toLowerCase().includes(term)) ||
      u.Role.toLowerCase().includes(term)
    );
  }

  tableBody.innerHTML = filtered.map(u => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF;">${u.UserID}</td>
      <td style="font-weight: 700; color: #FFFFFF;">${u.Username}</td>
      <td style="color: #E5E7EB;">${u.Role}</td>
      <td>
        <span class="badge ${u.Status === 'Active' ? 'badge-green' : 'badge-red'}" style="padding: 4px 12px; border-radius: 12px; font-weight: 600; font-size: 12px;">
          ${u.Status}
        </span>
      </td>
      <td style="text-align: center;">
        <button class="btn btn-secondary btn-sm" style="border-radius: 12px; padding: 4px 18px; font-size: 13px;" onclick="openEditUserModal(${u.UserID})">
          Sửa
        </button>
      </td>
    </tr>
  `).join('');
}

function filterUserRole(role, event) {
  selectedUserRoleFilter = role;
  const tabs = document.querySelectorAll('#userRoleFilterTabs .tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  if (event && event.target) {
    event.target.classList.add('active');
  }
  loadUsers();
}

function handleUserSearch() {
  loadUsers();
}


function openAddUserModal() {
  document.getElementById('userModalTitle').textContent = 'Thêm Tài khoản Hệ thống';
  document.getElementById('userForm').reset();
  document.getElementById('usrId').value = '';
  openModal('userModal');
}

async function openEditUserModal(id) {
  const users = await GymAPI.getUsers();
  const u = users.find(user => user.UserID === Number(id));
  if (!u) return;

  document.getElementById('userModalTitle').textContent = 'Chỉnh sửa Tài khoản';
  document.getElementById('usrId').value = u.UserID;
  document.getElementById('usrUsername').value = u.Username;
  document.getElementById('usrFullname').value = u.Fullname || '';
  document.getElementById('usrRole').value = u.Role;
  document.getElementById('usrStatus').value = u.Status;
  openModal('userModal');
}

async function handleSaveUser(e) {
  e.preventDefault();
  const id = document.getElementById('usrId').value;
  const username = document.getElementById('usrUsername').value.trim();
  const fullname = document.getElementById('usrFullname').value.trim();
  const role = document.getElementById('usrRole').value;
  const status = document.getElementById('usrStatus').value;

  const roleTitleMap = {
    Admin: 'Quản lý phòng tập',
    Staff: 'Nhân viên hỗ trợ',
    Trainer: 'Huấn luyện viên',
    Member: 'Hội viên'
  };

  const db = MockDB.getDB();
  if (id) {
    const userIndex = db.users.findIndex(u => u.UserID === Number(id));
    if (userIndex !== -1) {
      db.users[userIndex].Username = username;
      db.users[userIndex].Fullname = fullname;
      db.users[userIndex].Role = role;
      db.users[userIndex].RoleTitle = roleTitleMap[role];
      db.users[userIndex].Status = status;
      MockDB.saveDB(db);
      showToast('Cập nhật tài khoản thành công!', 'success');
    }
  } else {
    const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.UserID)) + 1 : 1;
    db.users.push({
      UserID: newId,
      Username: username,
      Fullname: fullname,
      Role: role,
      RoleTitle: roleTitleMap[role],
      Status: status
    });
    MockDB.saveDB(db);
    showToast('Thêm tài khoản mới thành công!', 'success');
  }

  closeModal('userModal');
  loadUsers();
}

async function toggleUserStatus(id) {
  const db = MockDB.getDB();
  const user = db.users.find(u => u.UserID === Number(id));
  if (user) {
    user.Status = user.Status === 'Active' ? 'Inactive' : 'Active';
    MockDB.saveDB(db);
    showToast(`Đã đổi trạng thái tài khoản ${user.Username} thành: ${user.Status}`, 'info');
    loadUsers();
  }
}

function loadMySalary() {
  const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Staff' };
  const trainerIncomeView = document.getElementById('trainerIncomeView');
  const staffSalaryView = document.getElementById('staffSalaryView');

  if (currentUser.Role === 'Trainer') {
    if (trainerIncomeView) trainerIncomeView.style.display = 'block';
    if (staffSalaryView) staffSalaryView.style.display = 'none';
  } else {
    if (trainerIncomeView) trainerIncomeView.style.display = 'none';
    if (staffSalaryView) staffSalaryView.style.display = 'block';

    const staffNameEl = document.getElementById('mySalaryStaffName');
    if (staffNameEl) {
      staffNameEl.textContent = currentUser.Fullname || 'Lâm Văn Cường';
    }
  }
}

window.switchAdminTab = switchAdminTab;
window.openAddPackageModal = openAddPackageModal;
window.openEditPackageModal = openEditPackageModal;
window.handleSavePackage = handleSavePackage;
window.printInvoice = printInvoice;
window.openAddPaymentModal = openAddPaymentModal;
window.handleSavePayment = handleSavePayment;
window.filterInventory = filterInventory;
window.openAddInventoryModal = openAddInventoryModal;
window.openEditInventoryModal = openEditInventoryModal;
window.handleSaveInventory = handleSaveInventory;
window.openStaffCheckInModal = openStaffCheckInModal;
window.openAddUserModal = openAddUserModal;
window.openEditUserModal = openEditUserModal;
window.handleSaveUser = handleSaveUser;
window.toggleUserStatus = toggleUserStatus;
window.loadMySalary = loadMySalary;

