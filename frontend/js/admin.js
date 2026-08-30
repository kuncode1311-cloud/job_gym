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
  if (actionTh) {
    actionTh.style.display = 'table-cell';
    actionTh.textContent = isAdmin ? 'Thao tác' : 'Nhập hàng';
  }

  currentInventoryCategory = category;
  let items = await GymAPI.getInventory();
  if (category !== 'all') {
    items = items.filter(i => i.Category === category);
  }

  tableBody.innerHTML = items.map(i => {
    const itemName = i.ProductName || i.Name;
    const itemId = i.ProductID || i.ID;
    const description = i.Description || 'Chưa có mô tả';

    let catBadgeClass = 'badge-blue';
    if (i.Category === 'Clothing') catBadgeClass = 'badge-yellow';
    else if (i.Category === 'Accessory') catBadgeClass = 'badge-red';
    else if (i.Category === 'Beverage') catBadgeClass = 'badge-green';

    return `
      <tr>
        <td style="font-weight: 700; color: #9CA3AF; width: 60px;">#${itemId}</td>
        <td>
          <div style="font-weight: 700; color: #FFFFFF; font-size: 14.5px;">${itemName}</div>
          <div style="font-size: 12px; color: #9CA3AF; margin-top: 2px; line-height: 1.35;">${description}</div>
        </td>
        <td style="text-align: center; width: 120px;"><span class="badge ${catBadgeClass}">${i.Category}</span></td>
        <td class="price-highlight" style="width: 110px;">${formatVND(i.Price)}</td>
        <td style="font-weight: 700; color: #E5E7EB; text-align: center; width: 80px;">${i.Stock !== undefined ? i.Stock : 0}</td>
        <td style="text-align: center; width: 100px;">
          <span class="badge ${i.Stock > 0 ? 'badge-green' : 'badge-red'}">
            ${i.Stock > 0 ? 'Còn hàng' : 'Hết hàng'}
          </span>
        </td>
        <td style="text-align: center; width: 140px;">
          ${isAdmin ? `
            <button class="btn btn-secondary btn-sm" onclick="openEditInventoryModal(${itemId})" title="Sửa sản phẩm">
              <i class="fa fa-edit"></i> Sửa
            </button>
            <button class="btn btn-sm" style="background: rgba(255,51,75,0.15); color: #FF334B; border: 1px solid rgba(255,51,75,0.3); margin-left: 6px;" onclick="handleDeleteInventory(${itemId})" title="Xóa sản phẩm">
              <i class="fa fa-trash"></i> Xóa
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" style="background: rgba(16,185,129,0.15); color: #10B981; border: 1px solid rgba(16,185,129,0.3); font-weight: 600;" onclick="openStaffStockModal(${itemId})">
              <i class="fa fa-plus"></i> Thêm số lượng
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
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
  document.getElementById('invDescription').value = '';
  openModal('inventoryModal');
}

async function openEditInventoryModal(id) {
  const items = await GymAPI.getInventory();
  const item = items.find(i => (i.ProductID || i.ID) === Number(id));
  if (!item) return;

  document.getElementById('invModalTitle').textContent = 'Chỉnh sửa Sản phẩm / Dịch vụ';
  document.getElementById('invId').value = item.ProductID || item.ID;
  document.getElementById('invName').value = item.ProductName || item.Name;
  document.getElementById('invDescription').value = item.Description || '';
  document.getElementById('invCategory').value = item.Category;
  document.getElementById('invPrice').value = item.Price;
  document.getElementById('invStock').value = item.Stock !== undefined ? item.Stock : 10;
  openModal('inventoryModal');
}

async function handleDeleteInventory(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho hàng?')) return;
  await GymAPI.deleteInventoryItem(id);
  showToast('Đã xóa sản phẩm khỏi kho hàng thành công!', 'success');
  loadInventory(currentInventoryCategory);
}

async function openStaffStockModal(id) {
  const items = await GymAPI.getInventory();
  const item = items.find(i => (i.ProductID || i.ID) === Number(id));
  if (!item) return;

  document.getElementById('staffStockItemId').value = item.ProductID || item.ID;
  document.getElementById('staffStockItemName').value = item.ProductName || item.Name;
  document.getElementById('staffStockCurrent').value = item.Stock !== undefined ? item.Stock : 0;
  document.getElementById('staffStockAddQty').value = '';
  openModal('staffStockModal');
}

async function handleStaffStockIncrement(e) {
  e.preventDefault();
  const id = document.getElementById('staffStockItemId').value;
  const addQty = Number(document.getElementById('staffStockAddQty').value);
  const itemName = document.getElementById('staffStockItemName').value;

  if (isNaN(addQty) || addQty <= 0) {
    showToast('Vui lòng nhập số lượng hợp lệ (> 0)', 'error');
    return;
  }

  await GymAPI.incrementInventoryStock(id, addQty);
  showToast(`Đã nhập thêm +${addQty} ${itemName} vào kho thành công!`, 'success');
  closeModal('staffStockModal');
  loadInventory(currentInventoryCategory);
}

async function handleSaveInventory(e) {
  e.preventDefault();
  const id = document.getElementById('invId').value;
  const name = document.getElementById('invName').value.trim();
  const description = document.getElementById('invDescription').value.trim();
  const category = document.getElementById('invCategory').value;
  const price = Number(document.getElementById('invPrice').value);
  const stock = Number(document.getElementById('invStock').value);

  const itemData = {
    ProductName: name,
    Name: name,
    Description: description,
    Category: category,
    Price: price,
    Stock: stock
  };

  if (id) {
    itemData.ID = Number(id);
    itemData.ProductID = Number(id);
    await GymAPI.updateInventoryItem(itemData);
    showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
  } else {
    await GymAPI.addInventoryItem(itemData);
    showToast('Thêm sản phẩm mới thành công!', 'success');
  }
  closeModal('inventoryModal');
  loadInventory(currentInventoryCategory);
}

window.openStaffStockModal = openStaffStockModal;
window.handleStaffStockIncrement = handleStaffStockIncrement;
window.handleDeleteInventory = handleDeleteInventory;


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

  // Tính tổng quỹ lương chi trả động
  const totalFund = salaries.reduce((sum, s) => {
    const base = Number(s.BaseSalary) || 0;
    const allow = Number(s.Allowance) || 0;
    const bonus = Number(s.Bonus) || 0;
    const deduct = Number(s.Deduction) || 0;
    const total = s.TotalSalary || (base + allow + bonus - deduct);
    return sum + total;
  }, 0);

  const fundEl = document.getElementById('totalSalaryFundDisplay');
  if (fundEl) fundEl.textContent = formatVND(totalFund);

  const staffCountEl = document.getElementById('totalSalaryStaffDisplay');
  if (staffCountEl) staffCountEl.textContent = `${salaries.length} nhân sự`;

  tableBody.innerHTML = salaries.map(s => {
    const base = Number(s.BaseSalary) || 0;
    const allow = Number(s.Allowance) || 0;
    const bonus = Number(s.Bonus) || 0;
    const deduct = Number(s.Deduction) || 0;
    const total = s.TotalSalary || (base + allow + bonus - deduct);

    return `
      <tr>
        <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${s.Code || `NV${s.ID}`}</td>
        <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${s.Name}</td>
        <td style="color: #E5E7EB; padding: 14px 18px;">${s.Role}</td>
        <td style="color: #FFFFFF; padding: 14px 18px; text-align: center;">${s.WorkDays || '26/26'}</td>
        <td style="color: #FFFFFF; padding: 14px 18px; text-align: center;">${s.Sessions !== undefined && s.Sessions > 0 ? `${s.Sessions} buổi` : '—'}</td>
        <td style="padding: 14px 18px; text-align: center;">
          <span style="font-weight: 700; color: ${s.LateDays === 0 ? '#10B981' : s.LateDays <= 2 ? '#F59E0B' : '#EF4444'};">
            ${s.LateDays || 0}
          </span>
        </td>
        <td style="color: #FFFFFF; padding: 14px 18px;">${formatVND(base)}</td>
        <td style="color: #10B981; font-weight: 700; padding: 14px 18px;">${formatVND(allow + bonus)}</td>
        <td style="text-align: center; padding: 14px 18px;">
          <div style="display: inline-flex; align-items: center; gap: 8px;">
            <button class="btn btn-primary btn-sm" style="border-radius: 8px; padding: 4px 12px; font-size: 12.5px; font-weight: 700;" onclick="openEditSalaryModal(${s.ID})">
              <i class="fa fa-edit"></i> Sửa lương
            </button>
            <button class="btn btn-secondary btn-sm" style="border-radius: 8px; padding: 4px 12px; font-size: 12.5px; font-weight: 600;" onclick="openSalaryDetailModal(${s.ID})">
              <i class="fa fa-file-invoice-dollar" style="color: #F59E0B;"></i> Chi tiết
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddSalaryModal() {
  document.getElementById('salaryModalTitle').innerHTML = '<i class="fa fa-plus-circle text-green"></i> Thêm Phiếu Lương Nhân Sự Mới';
  const subEl = document.getElementById('salaryModalSubtitle');
  if (subEl) subEl.textContent = 'Thiết lập bảng lương, phụ cấp, thưởng và thù lao cho nhân sự mới';
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
  document.getElementById('salBonus').value = 0;
  document.getElementById('salDeduction').value = 0;
  document.getElementById('salNote').value = '';
  calculateTotalSalary();
  openModal('salaryModal');
}

async function openEditSalaryModal(id) {
  const salaries = await GymAPI.getSalaries();
  const item = salaries.find(s => s.ID === Number(id));
  if (!item) return;

  document.getElementById('salaryModalTitle').innerHTML = `<i class="fa fa-edit text-red"></i> Điều Chỉnh Lương: ${item.Name}`;
  const subEl = document.getElementById('salaryModalSubtitle');
  if (subEl) subEl.textContent = 'Chủ phòng tập / Quản lý có thể điều chỉnh tăng hoặc giảm lương cơ bản, thưởng, phạt theo ý muốn';

  document.getElementById('salId').value = item.ID;
  document.getElementById('salCode').value = item.Code || `NV${item.ID}`;
  document.getElementById('salName').value = item.Name;
  document.getElementById('salRole').value = item.Role;
  document.getElementById('salWorkDays').value = item.WorkDays || '26/26';
  document.getElementById('salSessions').value = item.Sessions || 0;
  document.getElementById('salLateDays').value = item.LateDays || 0;
  document.getElementById('salBaseSalary').value = item.BaseSalary || 8000000;
  document.getElementById('salAllowance').value = item.Allowance || 0;
  document.getElementById('salBonus').value = item.Bonus || 0;
  document.getElementById('salDeduction').value = item.Deduction || 0;
  document.getElementById('salNote').value = item.Note || '';

  calculateTotalSalary();
  openModal('salaryModal');
}

async function openSalaryDetailModal(id) {
  const salaries = await GymAPI.getSalaries();
  const item = salaries.find(s => s.ID === Number(id));
  if (!item) return;

  document.getElementById('salaryModalTitle').innerHTML = `<i class="fa fa-file-invoice-dollar text-yellow"></i> Phiếu Lương Chi Tiết: ${item.Name}`;
  const subEl = document.getElementById('salaryModalSubtitle');
  if (subEl) subEl.textContent = 'Xem chi tiết các khoản lương cơ bản, phụ cấp, thưởng và khấu trừ';

  document.getElementById('salId').value = item.ID;
  document.getElementById('salCode').value = item.Code || `NV${item.ID}`;
  document.getElementById('salName').value = item.Name;
  document.getElementById('salRole').value = item.Role;
  document.getElementById('salWorkDays').value = item.WorkDays || '26/26';
  document.getElementById('salSessions').value = item.Sessions || 0;
  document.getElementById('salLateDays').value = item.LateDays || 0;
  document.getElementById('salBaseSalary').value = item.BaseSalary || 8000000;
  document.getElementById('salAllowance').value = item.Allowance || 0;
  document.getElementById('salBonus').value = item.Bonus || 0;
  document.getElementById('salDeduction').value = item.Deduction || 0;
  document.getElementById('salNote').value = item.Note || '';

  calculateTotalSalary();
  openModal('salaryModal');
}

function calculateTotalSalary() {
  const base = Number(document.getElementById('salBaseSalary').value) || 0;
  const allow = Number(document.getElementById('salAllowance').value) || 0;
  const bonus = Number(document.getElementById('salBonus').value) || 0;
  const deduct = Number(document.getElementById('salDeduction').value) || 0;
  const total = Math.max(0, base + allow + bonus - deduct);
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
  const bonus = Number(document.getElementById('salBonus').value);
  const deduction = Number(document.getElementById('salDeduction').value);
  const note = document.getElementById('salNote').value.trim();
  const totalSalary = Math.max(0, baseSalary + allowance + bonus - deduction);

  const salaryData = {
    Code: code,
    Name: name,
    Role: role,
    WorkDays: workDays,
    Sessions: sessions,
    LateDays: lateDays,
    BaseSalary: baseSalary,
    Allowance: allowance,
    Bonus: bonus,
    Deduction: deduction,
    Note: note,
    TotalSalary: totalSalary
  };

  if (id) {
    await GymAPI.updateSalary(id, salaryData);
    showToast(`Đã điều chỉnh lương của ${name}: ${formatVND(totalSalary)} thành công!`, 'success');
  } else {
    await GymAPI.addSalary(salaryData);
    showToast(`Thêm phiếu lương cho ${name} thành công!`, 'success');
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

window.openEditSalaryModal = openEditSalaryModal;


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

/**
 * Tải và lọc dữ liệu Báo cáo thống kê
 */
function loadReportsData() {
  const range = document.getElementById('reportTimeRange')?.value || 'month';
  const totalRevEl = document.getElementById('repTotalRevenue');
  const prodRevEl = document.getElementById('repProductRevenue');
  const newMemEl = document.getElementById('repNewMembers');
  const renewalEl = document.getElementById('repRenewalRate');

  if (range === 'q3') {
    if (totalRevEl) totalRevEl.textContent = '129.650.000đ';
    if (prodRevEl) prodRevEl.textContent = '37.800.000đ';
    if (newMemEl) newMemEl.textContent = '52 Hội viên';
    if (renewalEl) renewalEl.textContent = '78.2%';
    showToast('Đã cập nhật số liệu báo cáo theo Quý 3/2026', 'info');
  } else if (range === 'year') {
    if (totalRevEl) totalRevEl.textContent = '385.200.000đ';
    if (prodRevEl) prodRevEl.textContent = '112.500.000đ';
    if (newMemEl) newMemEl.textContent = '168 Hội viên';
    if (renewalEl) renewalEl.textContent = '75.8%';
    showToast('Đã cập nhật số liệu báo cáo cả năm 2026', 'info');
  } else {
    if (totalRevEl) totalRevEl.textContent = '48.250.000đ';
    if (prodRevEl) prodRevEl.textContent = '13.450.000đ';
    if (newMemEl) newMemEl.textContent = '18 Hội viên';
    if (renewalEl) renewalEl.textContent = '76.5%';
    showToast('Đã cập nhật số liệu báo cáo Tháng 8/2026', 'info');
  }
}

/**
 * Xuất file Excel chuẩn Microsoft SpreadsheetML (XML Spreadsheet 2003)
 * Chuẩn 100% độ rộng cột, không tràn ô, không che chữ, màu sắc và định dạng chuyên nghiệp.
 */
function exportReportToExcel() {
  const exportTime = new Date().toLocaleString('vi-VN');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>Fitness Gym Management</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Fitness Center</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Color="#1F2937"/>
  </Style>
  <!-- Main Banner -->
  <Style ss:ID="sBanner">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="15" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sSubBanner">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#94A3B8"/>
   <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>
  </Style>
  <!-- Section Headers -->
  <Style ss:ID="sSecHeaderRed">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#FF334B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sSecHeaderBlue">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1E40AF" ss:Pattern="Solid"/>
  </Style>
  <!-- Table Header -->
  <Style ss:ID="sTh">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#64748B"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#334155" ss:Pattern="Solid"/>
  </Style>
  <!-- Data Cells -->
  <Style ss:ID="sTd">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
  </Style>
  <Style ss:ID="sTdBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1"/>
  </Style>
  <Style ss:ID="sTdCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
  </Style>
  <Style ss:ID="sTdCenterBold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1"/>
  </Style>
  <!-- Striped Cells (Even rows) -->
  <Style ss:ID="sTdEven">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTdEvenBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTdEvenCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <!-- Currencies / Numbers -->
  <Style ss:ID="sMoneyRed">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#DC2626"/>
  </Style>
  <Style ss:ID="sMoneyRedEven">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sMoneyBlue">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#2563EB"/>
  </Style>
  <Style ss:ID="sMoneyGreen">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#059669"/>
  </Style>
  <Style ss:ID="sMoneyGreenEven">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#059669"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
  </Style>
  <!-- Badges -->
  <Style ss:ID="sBadgeGreen">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#059669"/>
  </Style>
  <Style ss:ID="sBadgeYellow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10.5" ss:Bold="1" ss:Color="#D97706"/>
  </Style>
  <!-- Total Rows -->
  <Style ss:ID="sTotalRed">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#DC2626"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#DC2626"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalRedMoney">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#DC2626"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#DC2626"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#DC2626"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#DC2626"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalBlue">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#2563EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#2563EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#2563EB"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sTotalBlueMoney">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:WrapText="0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#2563EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#2563EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#2563EB"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="11.5" ss:Bold="1" ss:Color="#2563EB"/>
   <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
  </Style>
  <!-- Signatures -->
  <Style ss:ID="sSignHead">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
  <Style ss:ID="sSignSub">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Font ss:FontName="Segoe UI" ss:Size="9.5" ss:Italic="1" ss:Color="#64748B"/>
  </Style>
  <Style ss:ID="sSignName">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="0"/>
   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#0F172A"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Báo cáo Doanh thu">
  <Table ss:DefaultRowHeight="22">
   <Column ss:Width="85"/>
   <Column ss:Width="250"/>
   <Column ss:Width="230"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Column ss:Width="175"/>
   <Column ss:Width="145"/>

   <!-- Banner -->
   <Row ss:Height="36">
    <Cell ss:MergeAcross="6" ss:StyleID="sBanner"><Data ss:Type="String">HỆ THỐNG PHÒNG TẬP GYM FITNESS - BÁO CÁO DOANH THU TỔNG HỢP</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="6" ss:StyleID="sSubBanner"><Data ss:Type="String">Thời gian xuất báo cáo: ${exportTime} • Kỳ thống kê: Tháng 08/2026</Data></Cell>
   </Row>
   <Row ss:Height="12"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 1 -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderRed"><Data ss:Type="String">  1. TỔNG QUAN DOANH THU THÁNG 08/2026</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Mã HM</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTh"><Data ss:Type="String">Hạng mục Doanh thu</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Doanh thu (VNĐ)</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tỷ trọng (%)</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tăng trưởng</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Trạng thái</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">HM-01</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Doanh thu Gói tập Hội viên (Membership)</Data></Cell>
    <Cell ss:StyleID="sMoneyRed"><Data ss:Type="String">34.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">72.1%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">+11.5%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">Đạt chỉ tiêu</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">HM-02</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Doanh thu Bán lẻ Sản phẩm (Whey / Nước / Phụ kiện)</Data></Cell>
    <Cell ss:StyleID="sMoneyBlue"><Data ss:Type="String">13.450.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">27.9%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">+28.5%</Data></Cell>
    <Cell ss:StyleID="sBadgeGreen"><Data ss:Type="String">Tăng trưởng mạnh</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="2" ss:StyleID="sTotalRed"><Data ss:Type="String">TỔNG CỘNG DOANH THU THÁNG 8</Data></Cell>
    <Cell ss:StyleID="sTotalRedMoney"><Data ss:Type="String">48.250.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTotalRed"><Data ss:Type="String">100.0%</Data></Cell>
    <Cell ss:StyleID="sTotalRed"><Data ss:Type="String">+14.2%</Data></Cell>
    <Cell ss:StyleID="sTotalRed"><Data ss:Type="String">Vượt KPI</Data></Cell>
   </Row>
   <Row ss:Height="14"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 2: PRODUCTS -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderBlue"><Data ss:Type="String">  2. DOANH THU KINH DOANH SẢN PHẨM CHI TIẾT (WHEY, NƯỚC UỐNG, TRANG PHỤC, PHỤ KIỆN)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Mã SP</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tên sản phẩm</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Danh mục</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Đơn giá bán</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Số lượng bán</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tổng doanh thu</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tỷ trọng SP</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">SP-101</Data></Cell>
    <Cell ss:StyleID="sTdBold"><Data ss:Type="String">Whey Gold Standard 5lbs</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Thực phẩm bổ sung (Supplement)</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">1.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">3 Hộp</Data></Cell>
    <Cell ss:StyleID="sMoneyRed"><Data ss:Type="String">5.400.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">40.1%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">SP-102</Data></Cell>
    <Cell ss:StyleID="sTdEvenBold"><Data ss:Type="String">BCAA 6000 Phục hồi cơ</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Thực phẩm bổ sung (Supplement)</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">850.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">3 Hộp</Data></Cell>
    <Cell ss:StyleID="sMoneyRedEven"><Data ss:Type="String">2.550.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">19.0%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">SP-103</Data></Cell>
    <Cell ss:StyleID="sTdBold"><Data ss:Type="String">Nước tăng lực Monster Energy</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Đồ uống &amp; Năng lượng (Beverage)</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">30.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">80 Lon</Data></Cell>
    <Cell ss:StyleID="sMoneyBlue"><Data ss:Type="String">2.400.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">17.8%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">SP-104</Data></Cell>
    <Cell ss:StyleID="sTdEvenBold"><Data ss:Type="String">Áo thun tập gym Gymshark</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Trang phục thể thao (Clothing)</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">250.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">8 Áo</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">2.000.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">14.9%</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">SP-105</Data></Cell>
    <Cell ss:StyleID="sTdBold"><Data ss:Type="String">Bình nước Shaker Gym 700ml</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Phụ kiện tập luyện (Accessory)</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">120.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">9 Bình</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">1.100.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">8.2%</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="sTotalBlue"><Data ss:Type="String">TỔNG DOANH THU KINH DOANH SẢN PHẨM (F&amp;B / WHEY)</Data></Cell>
    <Cell ss:StyleID="sTotalBlue"><Data ss:Type="String">103 Đơn vị</Data></Cell>
    <Cell ss:StyleID="sTotalBlueMoney"><Data ss:Type="String">13.450.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTotalBlue"><Data ss:Type="String">100.0%</Data></Cell>
   </Row>
   <Row ss:Height="14"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 3: TRAINERS -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderRed"><Data ss:Type="String">  3. HIỆU SUẤT DOANH THU THEO HUẤN LUYỆN VIÊN (HLV)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Mã HLV</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTh"><Data ss:Type="String">Họ và tên HLV</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Chuyên môn đào tạo</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Số học viên</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Doanh thu phụ trách</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Đánh giá sao</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">HLV-01</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Nguyễn Minh Tuấn</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Tăng cơ giảm mỡ &amp; PT Cá nhân</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">12 Học viên</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">18.500.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sBadgeYellow"><Data ss:Type="String">⭐⭐⭐⭐⭐ 4.9/5</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">HLV-02</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Trần Quốc Hùng</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Bodybuilding &amp; Sức mạnh</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">15 Học viên</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">21.200.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sBadgeYellow"><Data ss:Type="String">⭐⭐⭐⭐⭐ 5.0/5</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">HLV-03</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Lê Đức Mạnh</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">KickFit, Boxing &amp; Cardio</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">8 Học viên</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">9.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sBadgeYellow"><Data ss:Type="String">⭐⭐⭐⭐☆ 4.7/5</Data></Cell>
   </Row>
   <Row ss:Height="14"><Cell ss:MergeAcross="6"/></Row>

   <!-- SECTION 4: PAYMENT METHODS -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="6" ss:StyleID="sSecHeaderBlue"><Data ss:Type="String">  4. CƠ CẤU PHƯƠNG THỨC THANH TOÁN (PAYMENT METHODS)</Data></Cell>
   </Row>
   <Row ss:Height="24">
    <Cell ss:StyleID="sTh"><Data ss:Type="String">STT</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTh"><Data ss:Type="String">Phương thức thanh toán</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Số giao dịch</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Doanh thu thu về</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Tỷ trọng</Data></Cell>
    <Cell ss:StyleID="sTh"><Data ss:Type="String">Ghi chú</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">1</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Chuyển khoản VietQR (Ngân hàng MB Bank)</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">21 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">28.950.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">60.0%</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Chuyển khoản tự động</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">2</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Tiền mặt (Cash tại quầy tiếp tân)</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">11 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">11.500.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">23.8%</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Thu trực tiếp</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">3</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdBold"><Data ss:Type="String">Quẹt thẻ POS (Visa / MasterCard / ATM)</Data></Cell>
    <Cell ss:StyleID="sTdCenterBold"><Data ss:Type="String">4 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreen"><Data ss:Type="String">4.800.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdCenter"><Data ss:Type="String">10.0%</Data></Cell>
    <Cell ss:StyleID="sTd"><Data ss:Type="String">Máy POS chi nhánh</Data></Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">4</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sTdEvenBold"><Data ss:Type="String">Ví điện tử (MoMo / VNPay / ZaloPay)</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">2 Giao dịch</Data></Cell>
    <Cell ss:StyleID="sMoneyGreenEven"><Data ss:Type="String">3.000.000 VNĐ</Data></Cell>
    <Cell ss:StyleID="sTdEvenCenter"><Data ss:Type="String">6.2%</Data></Cell>
    <Cell ss:StyleID="sTdEven"><Data ss:Type="String">Ví điện tử</Data></Cell>
   </Row>
   <Row ss:Height="24"><Cell ss:MergeAcross="6"/></Row>

   <!-- SIGNATURES -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="sSignHead"><Data ss:Type="String">NGƯỜI LẬP BÁO CÁO</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="sSignHead"><Data ss:Type="String">KẾ TOÁN TRƯỞNG</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sSignHead"><Data ss:Type="String">GIÁM ĐỐC PHÒNG GYM</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="1" ss:StyleID="sSignSub"><Data ss:Type="String">(Ký và ghi rõ họ tên)</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="sSignSub"><Data ss:Type="String">(Ký và ghi rõ họ tên)</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sSignSub"><Data ss:Type="String">(Ký, đóng dấu)</Data></Cell>
   </Row>
   <Row ss:Height="45"><Cell ss:MergeAcross="6"/></Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="1" ss:StyleID="sSignName"><Data ss:Type="String">Văn Điền</Data></Cell>
    <Cell ss:MergeAcross="2" ss:StyleID="sSignName"><Data ss:Type="String">Nguyễn Văn Quản Lý</Data></Cell>
    <Cell ss:MergeAcross="1" ss:StyleID="sSignName"><Data ss:Type="String">Ban Giám Đốc Fitness</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'Bao_Cao_Doanh_Thu_Gym_Fitness_2026.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('🎉 Đã xuất file Báo cáo Excel chuẩn định dạng đẹp mắt không bị che chữ!', 'success');
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
window.loadReportsData = loadReportsData;
window.exportReportToExcel = exportReportToExcel;


