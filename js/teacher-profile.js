// ============================================================
// TEACHER PROFILE - ISH VAQTLARI BILAN
// ============================================================

let teacherId = null;
let teacherAttendanceData = [];
let teacherAttendanceExpanded = false;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    const params = new URLSearchParams(window.location.search);
    teacherId = params.get('id');
    if (!teacherId) {
        showError('O\'qituvchi ID topilmadi!');
        setTimeout(() => window.location.href = 'teachers.html', 2000);
        return;
    }

    await loadTeacherProfile();
    await loadTeacherPayments();
    await loadTeacherAttendance();
    setupListeners();
});

// ============================================================
// O'QITUVCHI MA'LUMOTLARI
// ============================================================
async function loadTeacherProfile() {
    try {
        const data = await API.getTeacher(teacherId);
        if (data.success) {
            renderProfile(data.data);
        } else {
            showError('O\'qituvchi topilmadi!');
            setTimeout(() => window.location.href = 'teachers.html', 2000);
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// O'QITUVCHI TO'LOVLARI
// ============================================================
async function loadTeacherPayments() {
    try {
        const data = await API.getPayments({ teacherId: teacherId });
        if (data.success) {
            renderPayments(data.data || []);
        }
    } catch (error) {
        console.error('❌ To\'lovlarni yuklash xatosi:', error);
    }
}

// ============================================================
// O'QITUVCHI DAVOMATI
// ============================================================
async function loadTeacherAttendance() {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 9);

        const data = await API.getAttendances({
            studentId: teacherId,
            type: 'teacher',
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: endDate.toISOString().split('T')[0]
        });

        if (data.success) {
            teacherAttendanceData = data.data || [];
            renderAttendance(teacherAttendanceData);
        }
    } catch (error) {
        console.error('❌ Davomatni yuklash xatosi:', error);
    }
}

// ============================================================
// PROFILNI KO'RSATISH
// ============================================================
function renderProfile(teacher) {
    document.getElementById('teacherAvatar').textContent = teacher.status === 'active' ? '👨‍🏫' : '👨‍🏫⛔';
    document.getElementById('teacherFullName').textContent = teacher.fullName || 'Noma\'lum';
    document.getElementById('teacherEmail').textContent = teacher.email || '-';
    document.getElementById('teacherSubject').textContent = teacher.subject || '-';
    document.getElementById('teacherPhone').textContent = teacher.phone || '-';
    document.getElementById('teacherProfileName').textContent = teacher.fullName || 'O\'qituvchi';
    document.getElementById('teacherStudentCount').textContent = teacher.students?.length || 0;
    document.getElementById('teacherJoined').textContent = Utils.formatDate(teacher.createdAt);
    document.getElementById('teacherBirthDate').textContent = Utils.formatDate(teacher.birthDate);
    
    // Oylik maosh
    const salaryEl = document.getElementById('teacherSalary');
    if (salaryEl) {
        salaryEl.textContent = Utils.formatMoney(teacher.salary || 0, 'UZS');
    }
    
    // Kunlik darslar va davomiylik
    document.getElementById('teacherDailyLessons').textContent = teacher.dailyLessons || 4;
    document.getElementById('teacherLessonDuration').textContent = (teacher.lessonDuration || 60) + ' daqiqa';

    // Ish vaqtlari
    const workingHoursEl = document.getElementById('teacherWorkingHours');
    if (workingHoursEl && teacher.workingHours) {
        const workingDays = teacher.workingHours.filter(w => w.isWorking !== false);
        if (workingDays.length > 0) {
            workingHoursEl.innerHTML = workingDays.map(w => 
                `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-color);font-size:0.8rem;">
                    <span>${w.day}</span>
                    <span>${w.startTime} - ${w.endTime}</span>
                </div>`
            ).join('');
        } else {
            workingHoursEl.innerHTML = '<p class="text-muted" style="font-size:0.8rem;">Ish vaqtlari belgilanmagan</p>';
        }
    }

    const statusEl = document.getElementById('teacherStatus');
    if (teacher.status === 'active') {
        statusEl.className = 'status-badge active';
        statusEl.textContent = '✅ Faol';
    } else if (teacher.status === 'blocked') {
        statusEl.className = 'status-badge blocked';
        statusEl.textContent = '⛔ Bloklangan';
    } else {
        statusEl.className = 'status-badge inactive';
        statusEl.textContent = '⛔ Faol emas';
    }

    document.getElementById('profileAvatar').textContent = teacher.status === 'active' ? '👨‍🏫' : '👨‍🏫⛔';
    document.getElementById('profileName').textContent = teacher.fullName || 'Noma\'lum';
    document.getElementById('profileEmail').textContent = teacher.email || '-';
    document.getElementById('statStudents').textContent = teacher.students?.length || 0;
    document.getElementById('statAge').textContent = Utils.calculateAge(teacher.birthDate);
    document.getElementById('statStatus').textContent = teacher.status === 'active' ? 'Faol' : teacher.status === 'blocked' ? 'Bloklangan' : 'Faol emas';

    const studentsList = document.getElementById('studentsList');
    if (teacher.students && teacher.students.length > 0) {
        studentsList.innerHTML = teacher.students.map(s => `
            <div class="student-item" onclick="window.location.href='student-profile.html?id=${s._id}'" style="cursor:pointer;">
                <span><i class="fas fa-user-circle"></i> ${s.fullName || 'Noma\'lum'}</span>
                <span class="status-badge ${Utils.getStatusClass(s.status)}" style="font-size:0.65rem;">${Utils.formatStatus(s.status)}</span>
            </div>
        `).join('');
    } else {
        studentsList.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">O\'quvchilar mavjud emas</p>';
    }
}

// ============================================================
// TO'LOVLARNI KO'RSATISH
// ============================================================
function renderPayments(payments) {
    const container = document.getElementById('teacherPaymentsList');
    if (!container) return;
    
    if (!payments || payments.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">To\'lovlar mavjud emas</p>';
        return;
    }

    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('teacherTotalSalary').textContent = Utils.formatMoney(total, 'UZS');

    container.innerHTML = payments.map(p => `
        <div class="payment-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">
            <div>
                <span style="font-weight:600;">${p.studentName || 'Noma\'lum'}</span>
                <span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;">${p.month || '-'}</span>
            </div>
            <div>
                <span style="font-weight:600;color:var(--color-success);">${Utils.formatMoney(p.amount, 'UZS')}</span>
                <span class="payment-status ${Utils.getStatusClass(p.status)}" style="font-size:0.6rem;margin-left:8px;">${Utils.formatStatus(p.status)}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================
// DAVOMATNI KO'RSATISH
// ============================================================
function renderAttendance(attendances) {
    const container = document.getElementById('teacherAttendanceList');
    if (!container) return;
    
    if (!attendances || attendances.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">Davomat ma\'lumotlari mavjud emas</p>';
        return;
    }

    const visible = teacherAttendanceExpanded ? attendances : attendances.slice(0, 5);
    const moreCount = Math.max(attendances.length - visible.length, 0);

    container.innerHTML = visible.map(a => `
        <div class="attendance-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">
            <div>
                <span style="font-weight:500;">${a.date || '-'}</span>
                ${a.reason ? `<span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;"><i class="fas fa-comment"></i> ${a.reason}</span>` : ''}
            </div>
            <span class="status-badge ${Utils.getStatusClass(a.attendance)}" style="font-size:0.7rem;">${Utils.formatStatus(a.attendance)}</span>
        </div>
    `).join('');

    if (moreCount > 0) {
        container.innerHTML += `
            <button id="toggleTeacherAttendance" class="btn-secondary" style="margin:12px auto 0;display:block;padding:8px 16px;font-size:0.85rem;">
                ${teacherAttendanceExpanded ? 'Yopish' : `Barchasini ko'rsatish (${moreCount}+)`}
            </button>
        `;

        const toggleButton = document.getElementById('toggleTeacherAttendance');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                teacherAttendanceExpanded = !teacherAttendanceExpanded;
                renderAttendance(teacherAttendanceData);
            });
        }
    }
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

    // Sidebar open/close is handled globally by js/theme.js.
}

function showError(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 14px 18px; background: #fef2f2;
        border: 1px solid #fecaca; border-radius: 10px;
        color: #dc2626; max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex; align-items: center; gap: 10px;
        font-size: 0.85rem;
    `;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

console.log('✅ teacher-profile.js yuklandi');