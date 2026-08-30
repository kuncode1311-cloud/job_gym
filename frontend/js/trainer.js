/**
 * ==============================================================================
 * DỰ ÁN HỆ THỐNG QUẢN LÝ PHÒNG GYM (GYM MANAGEMENT SYSTEM)
 * ĐIỀU KHIỂN PHÂN HỆ HUẤN LUYỆN VIÊN, ĐẶT LỊCH & BUỔI KÈM (trainer.js)
 * ==============================================================================
 */

let currentBookingFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  initTrainerTabsFromHash();
  window.addEventListener('hashchange', initTrainerTabsFromHash);
  
  await loadTrainers();
  await loadBookings();
  await loadFeedbacks();
  loadSessions();
  populateBookingModalDropdowns();
});

/**
 * Điều hướng Tab thông qua URL hash (#trainers, #bookings, #feedbacks, #sessions, #my_students, #book_pt)
 */
function initTrainerTabsFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (['trainers', 'bookings', 'feedbacks', 'sessions', 'my_students', 'book_pt'].includes(hash)) {
    switchTrainerTab(hash);
  } else {
    const currentUser = (typeof GymAPI !== 'undefined' && GymAPI.getCurrentUser) ? GymAPI.getCurrentUser() : { Role: 'Admin' };
    if (currentUser.Role === 'Member') {
      switchTrainerTab('book_pt');
    } else {
      switchTrainerTab('trainers');
    }
  }
}

/**
 * Chuyển đổi tab hiển thị
 */
function switchTrainerTab(tabId) {
  const titles = {
    trainers: { title: '<i class="fa fa-users text-red"></i> Huấn luyện viên Chuyên nghiệp', sub: 'Quản lý đội ngũ HLV, chuyên môn đào tạo, số học viên và lịch hẹn' },
    book_pt: { title: '<i class="fa fa-calendar-plus text-red"></i> Đặt Lịch Tập Với PT', sub: 'Lựa chọn huấn luyện viên và đặt lịch rèn luyện cá nhân 1:1' },
    bookings: { title: '<i class="fa fa-calendar-alt text-red"></i> Quản lý Lịch hẹn (Booking)', sub: 'Điều phối lịch tập với HLV, duyệt lịch và xác nhận hoàn thành' },
    sessions: { title: '<i class="fa fa-calendar-week text-red"></i> Lịch dạy của tôi', sub: 'Theo dõi chi tiết thời gian biểu, ca dạy và lớp kèm trong tuần' },
    feedbacks: { title: '<i class="fa fa-star text-yellow"></i> Nhận xét & Đánh giá từ Hội viên', sub: 'Tổng hợp nhận xét 5 sao và đánh giá chất lượng HLV' },
    my_students: { title: '<i class="fa fa-user-check text-red"></i> Danh Sách Hội Viên Phụ Trách', sub: 'Quản lý và theo dõi thông số luyện tập của các hội viên được chỉ định' }
  };

  const titleEl = document.getElementById('trainerPageTitle');
  const subEl = document.getElementById('trainerPageSubtitle');
  if (titleEl && titles[tabId]) titleEl.innerHTML = titles[tabId].title;
  if (subEl && titles[tabId]) subEl.textContent = titles[tabId].sub;

  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.style.display = sec.id === `section_${tabId}` ? 'block' : 'none';
  });

  if (tabId === 'sessions') {
    loadSessions();
  }



  if (typeof initSidebarNavigation === 'function') {
    initSidebarNavigation();
  }
}



// ==============================================================================
// 1. ĐỘI NGŨ HUẤN LUYỆN VIÊN (TRAINERS DIRECTORY)
// ==============================================================================

async function loadTrainers() {
  const container = document.getElementById('trainerTableBody');
  if (!container) return;

  const trainers = await GymAPI.getTrainers();
  container.innerHTML = trainers.map(t => `
    <tr>
      <td style="font-weight: 700; color: #FFFFFF;">${t.TrainerID}</td>
      <td style="font-weight: 700; color: #FFFFFF;">${t.FullName}</td>
      <td style="color: #E5E7EB;">${t.Gender || 'Male'}</td>
      <td style="color: #E5E7EB;">${t.DateofBirth || '1995-03-15'}</td>
      <td style="color: #E5E7EB;">${t.Phone || '--'}</td>
      <td style="color: #E5E7EB;">${t.Email || '--'}</td>
      <td style="color: #D1D5DB;">${t.Specialty || 'Fitness'}</td>
      <td style="color: #E5E7EB;">${t.Experience ? t.Experience + ' năm' : '5 năm'}</td>
      <td>
        <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 12px; border-radius: 14px; font-size: 12px; font-weight: 600;">Active</span>
      </td>
      <td style="text-align: center;">
        <div style="display: inline-flex; gap: 14px; justify-content: center; align-items: center;">
          <button class="action-btn" title="Sửa HLV" onclick="openEditTrainerModal(${t.TrainerID})" style="background: transparent; border: none; color: #FFFFFF; font-size: 18px; cursor: pointer; padding: 4px;">
            <i class="fa fa-edit"></i>
          </button>
          <button class="action-btn" title="Xóa HLV" onclick="handleDeleteTrainer(${t.TrainerID})" style="background: transparent; border: none; color: #FFFFFF; font-size: 18px; cursor: pointer; padding: 4px;">
            <i class="fa fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleDeleteTrainer(trainerId) {
  if (!confirm('Bạn có chắc chắn muốn xóa Huấn luyện viên này?')) return;
  const res = await GymAPI.deleteTrainer(trainerId);
  if (res.success) {
    showToast(res.message || 'Đã xóa Huấn luyện viên thành công!', 'success');
    loadTrainers();
  } else {
    showToast(res.message || 'Không thể xóa HLV!', 'error');
  }
}


function openAddTrainerModal() {
  document.getElementById('trainerForm').reset();
  openModal('trainerModal');
}

async function handleSaveTrainer(e) {
  e.preventDefault();
  const name = document.getElementById('trName').value.trim();
  const phone = document.getElementById('trPhone').value.trim();
  const exp = Number(document.getElementById('trExp').value);
  const specialty = document.getElementById('trSpecialty').value.trim();

  const db = MockDB.getDB();
  const newId = db.trainers.length > 0 ? Math.max(...db.trainers.map(t => t.TrainerID)) + 1 : 1;
  db.trainers.push({
    TrainerID: newId,
    FullName: name,
    Phone: phone,
    Experience: exp,
    Specialty: specialty,
    Rating: 5.0,
    TotalStudents: 0,
    MonthlyIncome: 6000000,
    Status: 'Active'
  });
  MockDB.saveDB(db);

  showToast('Thêm Huấn luyện viên mới thành công!', 'success');
  closeModal('trainerModal');
  loadTrainers();
  populateBookingModalDropdowns();
}

// ==============================================================================
// 2. QUẢN LÝ LỊCH HẸN VÀ BUỔI KÈM (BOOKINGS)
// ==============================================================================

async function loadBookings(filter = 'all') {
  const tableBody = document.getElementById('bookingTableBody');
  if (!tableBody) return;

  currentBookingFilter = filter;
  let bookings = await GymAPI.getBookings();
  const searchInput = document.getElementById('bookingSearchInput');
  const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (filter === 'Pending') {
    bookings = bookings.filter(b => (b.Status || '').toLowerCase() === 'pending');
  } else if (filter === 'Confirmed') {
    bookings = bookings.filter(b => (b.Status || '').toLowerCase() === 'confirmed');
  }

  if (term) {
    bookings = bookings.filter(b => 
      String(b.BookingID).includes(term) ||
      String(b.MemberID).includes(term) ||
      String(b.TrainerID).includes(term) ||
      (b.MemberName && b.MemberName.toLowerCase().includes(term)) ||
      (b.TrainerName && b.TrainerName.toLowerCase().includes(term)) ||
      (b.Status && b.Status.toLowerCase().includes(term))
    );
  }

  tableBody.innerHTML = bookings.map(b => {
    let statusBadge = `<span class="badge badge-green" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Đã duyệt</span>`;
    if ((b.Status || '').toLowerCase() === 'completed') {
      statusBadge = `<span class="badge badge-blue" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Đã hoàn thành</span>`;
    } else if ((b.Status || '').toLowerCase() === 'cancelled') {
      statusBadge = `<span class="badge badge-red" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Đã hủy</span>`;
    } else if ((b.Status || '').toLowerCase() === 'pending') {
      statusBadge = `<span class="badge badge-yellow" style="padding: 4px 14px; border-radius: 12px; font-weight: 600; font-size: 12px;">Chờ duyệt</span>`;
    }

    const actionButtons = (b.Status || '').toLowerCase() === 'confirmed' ? `
      <div class="action-btn-group" style="justify-content: center;">
        <button class="btn-action-icon btn-success" title="Xác nhận hoàn thành" onclick="handleUpdateBookingStatus(${b.BookingID}, 'Completed', 'Đã check-in')">
          <i class="fa fa-check"></i>
        </button>
        <button class="btn-action-icon btn-danger" title="Hủy lịch hẹn" onclick="handleUpdateBookingStatus(${b.BookingID}, 'Cancelled', 'Chờ tập')">
          <i class="fa fa-times"></i>
        </button>
      </div>
    ` : `
      <div class="action-btn-group" style="justify-content: center;">
        <button class="btn-action-icon" style="color: #60A5FA;" title="Kích hoạt lại lịch tập" onclick="handleUpdateBookingStatus(${b.BookingID}, 'Confirmed', 'Chờ tập')">
          <i class="fa fa-redo"></i>
        </button>
      </div>
    `;

    return `
      <tr>
        <td style="font-weight: 700; color: #FF334B; padding: 14px 18px;">#BK-${String(b.BookingID).padStart(3, '0')}</td>
        <td style="color: #FFFFFF; font-weight: 700; padding: 14px 18px;">${b.StartTime} - ${b.EndTime}</td>
        <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${b.MemberName || `Hội viên #${b.MemberID}`}</td>
        <td style="color: #E5E7EB; font-weight: 600; padding: 14px 18px;">${b.TrainerName || `HLV #${b.TrainerID}`}</td>
        <td style="color: #9CA3AF; padding: 14px 18px;">${formatDate(b.BookingDate)}</td>
        <td style="color: #9CA3AF; font-size: 13.5px; padding: 14px 18px;">${b.Notes || b.Type || 'Tập thể lực & PT'}</td>
        <td style="padding: 14px 18px;">${statusBadge}</td>
        <td style="text-align: center; padding: 14px 18px;">${actionButtons}</td>
      </tr>
    `;
  }).join('');
}



function filterBookings(status, event) {
  document.querySelectorAll('#bookingFilterTabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  loadBookings(status);
}

function handleBookingSearch() {
  loadBookings(currentBookingFilter);
}

async function handleUpdateBookingStatus(id, status, attendanceStatus) {
  const res = await GymAPI.updateBookingStatus(id, status, attendanceStatus);
  if (res.success) {
    showToast(`Đã cập nhật trạng thái lịch hẹn: ${status}`, 'success');
    loadBookings(currentBookingFilter);
  }
}



async function openAddBookingModal() {
  document.getElementById('bookingForm').reset();
  const members = await GymAPI.getMembers();
  const trainers = await GymAPI.getTrainers();

  const memSelect = document.getElementById('bkMember');
  if (memSelect) {
    memSelect.innerHTML = members.map(m => `<option value="${m.MemberID}">${m.Code} - ${m.Fullname}</option>`).join('');
  }

  const trSelect = document.getElementById('bkTrainer');
  if (trSelect) {
    trSelect.innerHTML = trainers.map(t => `<option value="${t.TrainerID}">${t.FullName} (${t.Specialty || 'HLV'})</option>`).join('');
  }

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('bkDate');
  if (dateInput) dateInput.value = today;

  openModal('bookingModal');
}


function openAddBookingModalWithTrainer(trainerId) {
  openAddBookingModal();
  const select = document.getElementById('bkTrainer');
  if (select) select.value = trainerId;
}

async function handleSaveBooking(e) {
  e.preventDefault();
  const memberId = document.getElementById('bkMember').value;
  const trainerId = document.getElementById('bkTrainer').value;
  const date = document.getElementById('bkDate').value;
  const startTime = document.getElementById('bkStartTime').value;
  const endTime = document.getElementById('bkEndTime').value;
  const type = document.getElementById('bkType').value;
  const notes = document.getElementById('bkNotes').value.trim();

  const members = await GymAPI.getMembers();
  const trainers = await GymAPI.getTrainers();

  const member = members.find(m => m.MemberID === Number(memberId));
  const trainer = trainers.find(t => t.TrainerID === Number(trainerId));

  const bookingData = {
    MemberID: Number(memberId),
    MemberName: member ? member.Fullname : 'Hội viên',
    TrainerID: Number(trainerId),
    TrainerName: trainer ? trainer.FullName : 'Huấn luyện viên',
    BookingDate: date,
    StartTime: startTime,
    EndTime: endTime,
    Type: type,
    Notes: notes || 'Luyện tập cùng PT'
  };

  await GymAPI.addBooking(bookingData);
  showToast('Đặt lịch hẹn thành công!', 'success');
  closeModal('bookingModal');
  loadBookings();
}

// ==============================================================================
// 3. ĐÁNH GIÁ & NHẬN XÉT (FEEDBACKS)
// ==============================================================================

async function loadFeedbacks() {
  const tableBody = document.getElementById('feedbackTableBody');
  if (!tableBody) return;

  const feedbacks = await GymAPI.getFeedbacks();

  // Update KPI summary counters
  const totalCountEl = document.getElementById('fbTotalCount');
  const avgRatingEl = document.getElementById('fbAvgRating');
  const trainer1El = document.getElementById('fbTrainer1Count');
  const trainer2El = document.getElementById('fbTrainer2Count');

  if (totalCountEl) totalCountEl.textContent = feedbacks.length;
  if (feedbacks.length > 0 && avgRatingEl) {
    const avg = (feedbacks.reduce((sum, f) => sum + Number(f.Rating || 0), 0) / feedbacks.length).toFixed(2);
    avgRatingEl.textContent = `${avg} ★`;
  }
  if (trainer1El) {
    const count = feedbacks.filter(f => Number(f.TrainerID) === 1).length;
    trainer1El.textContent = `${count} FB`;
  }
  if (trainer2El) {
    const count = feedbacks.filter(f => Number(f.TrainerID) === 2).length;
    trainer2El.textContent = `${count} FB`;
  }

  tableBody.innerHTML = feedbacks.map(f => {
    const stars = '★'.repeat(f.Rating) + '☆'.repeat(Math.max(0, 5 - f.Rating));
    const trainerBadgeClass = Number(f.TrainerID) === 1 ? 'badge-green' : 'badge-blue';

    return `
      <tr>
        <td style="font-weight: 700; color: #FFFFFF; padding: 14px 18px;">${f.FeedbackID}</td>
        <td style="color: #F59E0B; font-weight: 700; padding: 14px 18px; font-size: 14px;">
          ${stars} <span style="color: #FFFFFF; font-size: 13px; margin-left: 4px;">${f.Rating}</span>
        </td>
        <td style="color: #E5E7EB; padding: 14px 18px; line-height: 1.5;">
          ${f.Comment || f.Commemt}
        </td>
        <td style="color: #9CA3AF; padding: 14px 18px;">${f.FeedbackDate}</td>
        <td style="text-align: center; padding: 14px 18px;">
          <span class="badge ${trainerBadgeClass}" style="width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
            ${f.TrainerID}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}


function openAddFeedbackModal() {
  document.getElementById('feedbackForm').reset();
  openModal('feedbackModal');
}

async function handleSaveFeedback(e) {
  e.preventDefault();
  const trainerId = document.getElementById('fbTrainerSelect').value;
  const memberName = document.getElementById('fbMemberName').value.trim();
  const rating = Number(document.getElementById('fbRating').value);
  const comment = document.getElementById('fbComment').value.trim();

  const trainers = await GymAPI.getTrainers();
  const trainer = trainers.find(t => t.TrainerID === Number(trainerId));

  const db = MockDB.getDB();
  db.feedbacks.unshift({
    FeedbackID: db.feedbacks.length + 1,
    TrainerID: Number(trainerId),
    TrainerName: trainer ? trainer.FullName : 'HLV',
    MemberName: memberName,
    Rating: rating,
    Comment: comment,
    FeedbackDate: new Date().toISOString().split('T')[0]
  });
  MockDB.saveDB(db);

  showToast('Đã gửi nhận xét & đánh giá thành công!', 'success');
  closeModal('feedbackModal');
  loadFeedbacks();
}

async function populateBookingModalDropdowns() {
  const memberSelect = document.getElementById('bkMember');
  const trainerSelect = document.getElementById('bkTrainer');
  const fbTrainerSelect = document.getElementById('fbTrainerSelect');

  if (memberSelect) {
    const members = await GymAPI.getMembers();
    memberSelect.innerHTML = members.map(m => `
      <option value="${m.MemberID}">${m.Code} - ${m.Fullname}</option>
    `).join('');
  }

  if (trainerSelect || fbTrainerSelect) {
    const trainers = await GymAPI.getTrainers();
    const optionsHtml = trainers.map(t => `
      <option value="${t.TrainerID}">HLV ${t.FullName} (${t.Specialty})</option>
    `).join('');
    if (trainerSelect) trainerSelect.innerHTML = optionsHtml;
    if (fbTrainerSelect) fbTrainerSelect.innerHTML = optionsHtml;
  }
}

function viewTrainerSchedule(trainerName) {
  switchTrainerTab('bookings');
  showToast(`Hiển thị lịch làm việc của HLV: ${trainerName}`, 'info');
}


// ==============================================================================
// 4. LỊCH DẠY CỦA TÔI (BUỔI KÈM PT - SESSIONS)
// ==============================================================================


const SESSIONS_DATA = [
  { day: 'T2', time: '08:00 - 09:00', student: 'Nguyễn Minh Khoa', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 12/24', status: 'LỚP KÈM' },
  { day: 'T2', time: '14:00 - 15:00', student: 'Phạm Ngọc Anh', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 25/96', status: 'LỚP KÈM' },
  { day: 'T3', time: '09:00 - 10:00', student: 'Trần Thị Lan', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 13/48', status: 'LỚP KÈM' },
  { day: 'T3', time: '16:00 - 17:00', student: 'Đỗ Thị Mai', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 15/48', status: 'LỚP KÈM' },
  { day: 'T4', time: '08:00 - 09:00', student: 'Nguyễn Minh Khoa', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 13/24', status: 'LỚP KÈM' },
  { day: 'T5', time: '10:00 - 11:00', student: 'Lê Văn Hùng', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 8/36', status: 'LỚP KÈM' },
  { day: 'T6', time: '15:00 - 16:00', student: 'Phạm Ngọc Anh', discipline: 'Gym & Fitness', sessionInfo: 'Buổi 26/96', status: 'LỚP KÈM' }
];

let currentSessionDayFilter = 'all';

function loadSessions(dayFilter = 'all') {
  const container = document.getElementById('sessionListContainer');
  if (!container) return;

  currentSessionDayFilter = dayFilter;
  let list = SESSIONS_DATA;
  if (dayFilter !== 'all') {
    list = list.filter(s => s.day === dayFilter);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9CA3AF; font-size: 14px;">
        Không có lịch dạy kèm nào trong ngày này.
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(s => `
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px;">
      <div style="display: flex; align-items: center; gap: 28px; flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; width: 60px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #FF334B; display: inline-block;"></span>
          <span style="font-weight: 700; color: #FFFFFF; font-size: 14.5px;">${s.day}</span>
        </div>
        <div style="font-weight: 600; color: #9CA3AF; font-size: 14px; width: 120px;">
          ${s.time}
        </div>
        <div style="font-size: 14.5px; color: #FFFFFF; font-weight: 700;">
          ${s.student} <span style="font-weight: 400; color: #9CA3AF;">| ${s.discipline} (${s.sessionInfo})</span>
        </div>
      </div>
      <div>
        <span class="badge" style="background: rgba(255, 51, 75, 0.12); color: #FF334B; border: 1px solid rgba(255, 51, 75, 0.3); padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
          ${s.status}
        </span>
      </div>
    </div>
  `).join('');
}

function filterSessionDay(day, event) {
  if (event && event.target) {
    const parent = event.target.closest('.filter-tabs');
    if (parent) {
      parent.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
    }
  }
  loadSessions(day);
}

window.switchTrainerTab = switchTrainerTab;
window.filterBookings = filterBookings;
window.handleUpdateBookingStatus = handleUpdateBookingStatus;
window.openAddTrainerModal = openAddTrainerModal;
window.handleSaveTrainer = handleSaveTrainer;
window.openAddBookingModal = openAddBookingModal;
window.openAddBookingModalWithTrainer = openAddBookingModalWithTrainer;
window.handleSaveBooking = handleSaveBooking;
window.openAddFeedbackModal = openAddFeedbackModal;
window.handleSaveFeedback = handleSaveFeedback;
window.viewTrainerSchedule = viewTrainerSchedule;
window.filterSessionDay = filterSessionDay;
window.loadSessions = loadSessions;

