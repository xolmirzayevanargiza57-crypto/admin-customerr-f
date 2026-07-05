// ============================================================
// STUDENT PROFILE - DARS JADVALI BILAN
// ============================================================

let studentId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    const params = new URLSearchParams(window.location.search);
    studentId = params.get('id');
    if (!studentId) {
        showError('O\'quvchi ID topilmadi!');
        setTimeout(() => window.location.href = 'students.html', 2000);
        return;
    }

    await loadStudentProfile();
    await loadStudentPayments();
    await loadStudentAttendance();
    setupListeners();
});

// ============================================================
// O'QUVCHI MA'LUMOTLARI
// ============================================================
async function loadStudentProfile() {
    try {
        const data = await API.getStudent(studentId);
        if (data.success) {
            renderProfile(data.data);
        } else {
            showError('O\'quvchi topilmadi!');
            setTimeout(() => window.location.href = 'students.html', 2000);
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// O'QUVCHI TO'LOVLARI
// ============================================================
async function loadStudentPayments() {
    try {
        const data = await API.getPayments({ studentId: studentId });
        if (data.success) {
            renderPayments(data.data || []);
        }
    } catch (error) {
        console.error('❌ To\'lovlarni yuklash xatosi:', error);
    }
}

// ============================================================
// O'QUVCHI DAVOMATI
// ============================================================
async function loadStudentAttendance() {
    try {
        const data = await API.getAttendances({ 
            studentId: studentId,
            type: 'student'
        });
        if (data.success) {
            renderAttendance(data.data || []);
        }
    } catch (error) {
        console.error('❌ Davomatni yuklash xatosi:', error);
    }
}

// ============================================================
// PROFILNI KO'RSATISH
// ============================================================
function renderProfile(student) {
    document.getElementById('studentAvatar').textContent = student.status === 'active' ? '👨‍🎓' : '👨‍🎓⛔';
    document.getElementById('studentFullName').textContent = student.fullName || 'Noma\'lum';
    document.getElementById('studentEmail').textContent = student.email || '-';
    document.getElementById('studentTeacher').textContent = student.teacherName || '-';
    document.getElementById('studentPhone').textContent = student.phone || '-';
    document.getElementById('studentProfileName').textContent = student.fullName || 'O\'quvchi';
    document.getElementById('studentXP').textContent = student.totalXP || 0;
    document.getElementById('studentJoined').textContent = Utils.formatDate(student.createdAt);
    document.getElementById('studentBirthDate').textContent = Utils.formatDate(student.birthDate);
    
    const paymentEl = document.getElementById('studentMonthlyPayment');
    if (paymentEl) {
        paymentEl.textContent = Utils.formatMoney(student.monthlyPayment || 0, 'UZS');
    }

    // Dars jadvali
    const scheduleEl = document.getElementById('studentSchedule');
    if (scheduleEl && student.schedule) {
        const activeLessons = student.schedule.filter(s => s.isActive !== false);
        if (activeLessons.length > 0) {
            scheduleEl.innerHTML = activeLessons.map(s => `
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);font-size:0.8rem;">
                    <span><strong>${s.day}</strong></span>
                    <span>${s.startTime} - ${s.endTime}</span>
                    <span style="color:var(--text-muted);">${s.subject || 'Fan'}</span>
                </div>
            `).join('');
        } else {
            scheduleEl.innerHTML = '<p class="text-muted" style="font-size:0.8rem;">Dars jadvali belgilanmagan</p>';
        }
    }

    const statusEl = document.getElementById('studentStatus');
    if (student.status === 'active') {
        statusEl.className = 'status-badge active';
        statusEl.textContent = '✅ Faol';
    } else {
        statusEl.className = 'status-badge inactive';
        statusEl.textContent = '⛔ Faol emas';
    }

    document.getElementById('profileAvatar').textContent = student.status === 'active' ? '👨‍🎓' : '👨‍🎓⛔';
    document.getElementById('profileName').textContent = student.fullName || 'Noma\'lum';
    document.getElementById('profileEmail').textContent = student.email || '-';
    document.getElementById('statXP').textContent = student.totalXP || 0;
    document.getElementById('statAge').textContent = Utils.calculateAge(student.birthDate);
    document.getElementById('statStatus').textContent = student.status === 'active' ? 'Faol' : 'Faol emas';
}

// ============================================================
// TO'LOVLARNI KO'RSATISH
// ============================================================
function renderPayments(payments) {
    const container = document.getElementById('studentPaymentsList');
    if (!container) return;
    
    if (!payments || payments.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">To\'lovlar mavjud emas</p>';
        return;
    }

    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('studentTotalPayment').textContent = Utils.formatMoney(total, 'UZS');

    container.innerHTML = payments.map(p => `
        <div class="payment-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">
            <div>
                <span style="font-weight:600;">${p.month || '-'}</span>
                <span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;">${p.teacherName || 'O\'qituvchi'}</span>
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
    const container = document.getElementById('studentAttendanceList');
    if (!container) return;
    
    if (!attendances || attendances.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">Davomat ma\'lumotlari mavjud emas</p>';
        return;
    }

    container.innerHTML = attendances.slice(0, 10).map(a => `
        <div class="attendance-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">
            <div>
                <span style="font-weight:500;">${a.date || '-'}</span>
                ${a.reason ? `<span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;"><i class="fas fa-comment"></i> ${a.reason}</span>` : ''}
            </div>
            <span class="status-badge ${Utils.getStatusClass(a.attendance)}" style="font-size:0.7rem;">${Utils.formatStatus(a.attendance)}</span>
        </div>
    `).join('');
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

console.log('✅ student-profile.js yuklandi');