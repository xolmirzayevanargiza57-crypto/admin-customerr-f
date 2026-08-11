// ============================================================
// TEACHER PROFILE - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
// ============================================================

let teacherId = null;
let currentTeacher = null;
let teacherAttendanceData = [];
let teacherAttendanceExpanded = false;

document.addEventListener('DOMContentLoaded', async function() {
    var token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    var user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    var params = new URLSearchParams(window.location.search);
    teacherId = params.get('id');
    if (!teacherId) {
        showError('O\'qituvchi ID topilmadi!');
        setTimeout(function() { window.location.href = 'teachers.html'; }, 2000);
        return;
    }

    await loadTeacherProfile();
    await loadTeacherPayments();
    await loadTeacherAttendance();
    setupListeners();
});

// ============================================================
// ⭐ O'QITUVCHI MA'LUMOTLARI
// ============================================================
async function loadTeacherProfile() {
    try {
        var data = await API.getTeacher(teacherId);
        if (data.success) {
            currentTeacher = data.data;
            renderProfile(currentTeacher);
            updateTeacherSalary(currentTeacher);
        } else {
            showError('O\'qituvchi topilmadi!');
            setTimeout(function() { window.location.href = 'teachers.html'; }, 2000);
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// ⭐ O'QITUVCHI TO'LOVLARI
// ============================================================
async function loadTeacherPayments() {
    try {
        var data = await API.getPayments({ teacherId: teacherId });
        if (data.success) {
            renderPayments(data.data || []);
        }
    } catch (error) {
        console.error('❌ To\'lovlarni yuklash xatosi:', error);
    }
}

// ============================================================
// ⭐ O'QITUVCHI DAVOMATI
// ============================================================
async function loadTeacherAttendance() {
    try {
        var endDate = new Date();
        var startDate = new Date();
        startDate.setDate(endDate.getDate() - 9);

        var data = await API.getAttendances({
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
// ⭐ PROFILNI KO'RSATISH
// ============================================================
function renderProfile(teacher) {
    // Avatar
    document.getElementById('teacherAvatar').textContent = teacher.status === 'active' ? '👨‍🏫' : '👨‍🏫⛔';
    
    // Ism va ma'lumotlar
    document.getElementById('teacherFullName').textContent = teacher.fullName || 'Noma\'lum';
    document.getElementById('teacherEmail').textContent = teacher.email || '-';
    document.getElementById('teacherPhone').textContent = teacher.phone || '-';
    document.getElementById('teacherProfileName').textContent = teacher.fullName || 'O\'qituvchi';
    document.getElementById('teacherSubject').textContent = teacher.subject || '-';
    document.getElementById('teacherStudentCount').textContent = teacher.studentCount || 0;
    document.getElementById('teacherJoined').textContent = formatDate(teacher.createdAt);
    document.getElementById('teacherBirthDate').textContent = formatDate(teacher.birthDate);

    // Darslar
    document.getElementById('teacherDailyLessons').textContent = teacher.dailyLessons || 4;
    document.getElementById('teacherLessonDuration').textContent = (teacher.lessonDuration || 60) + ' daqiqa';

    // Status
    var statusEl = document.getElementById('teacherStatus');
    if (teacher.status === 'active') {
        statusEl.textContent = '✅ Faol';
        statusEl.style.color = '#34c759';
    } else if (teacher.status === 'blocked') {
        statusEl.textContent = '⛔ Bloklangan';
        statusEl.style.color = '#ff3b30';
    } else {
        statusEl.textContent = '⛔ Faol emas';
        statusEl.style.color = 'var(--text-muted)';
    }

    // Stats
    document.getElementById('statStudents').textContent = teacher.studentCount || 0;
    document.getElementById('statAge').textContent = calculateAge(teacher.birthDate);
    document.getElementById('statStatus').textContent = teacher.status === 'active' ? 'Faol' : teacher.status === 'blocked' ? 'Bloklangan' : 'Faol emas';

    // ⭐ O'quvchilar soni badge
    document.getElementById('studentCountBadge').textContent = teacher.studentCount || 0;

    // ⭐ Ish vaqtlari
    renderWorkingHours(teacher);

    // ⭐ O'quvchilar ro'yxati
    renderStudents(teacher);
}

// ============================================================
// ⭐ ISH VAQTLARINI KO'RSATISH
// ============================================================
function renderWorkingHours(teacher) {
    var container = document.getElementById('teacherWorkingHours');
    if (!container) return;

    var lessons = teacher.lessons || [];
    if (lessons.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><p>Ish vaqtlari belgilanmagan</p></div>';
        return;
    }

    var sortedLessons = lessons.slice().sort(function(a, b) {
        var days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
        return days.indexOf(a.day) - days.indexOf(b.day);
    });

    container.innerHTML = sortedLessons.map(function(lesson) {
        return '<div class="working-hour-item">' +
            '<span class="day">' + lesson.day + '</span>' +
            '<span class="time">' + lesson.startTime + ' - ' + lesson.endTime + '</span>' +
        '</div>';
    }).join('');
}

// ============================================================
// ⭐ O'QUVCHILAR RO'YXATI
// ============================================================
function renderStudents(teacher) {
    var container = document.getElementById('studentsList');
    if (!container) return;

    var students = teacher.students || [];
    if (students.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-user-graduate"></i><p>O\'quvchilar mavjud emas</p></div>';
        return;
    }

    container.innerHTML = students.map(function(s) {
        var statusClass = s.status === 'active' ? 'active' : 'inactive';
        var statusLabel = s.status === 'active' ? '✅ Faol' : '⛔ Faol emas';
        return '<div class="student-list-item" onclick="window.location.href=\'student-profile.html?id=' + s._id + '\'">' +
            '<span class="name"><i class="fas fa-user-circle"></i> ' + (s.fullName || 'Noma\'lum') + '</span>' +
            '<span class="status-badge ' + statusClass + '" style="font-size:0.65rem;">' + statusLabel + '</span>' +
        '</div>';
    }).join('');
}

// ============================================================
// ⭐ MAOSH MA'LUMOTLARINI YANGILASH
// ============================================================
function updateTeacherSalary(teacher) {
    var salary = teacher.salary || 0;
    var totalPaid = teacher.totalPaid || 0;
    var remaining = salary - totalPaid;
    var yearly = salary * 12;
    var daily = Math.round(salary / 22);

    document.getElementById('teacherMonthlySalaryDisplay').textContent = formatMoney(salary);
    document.getElementById('teacherTotalPaidDisplay').textContent = formatMoney(totalPaid);
    document.getElementById('teacherRemainingDisplay').textContent = formatMoney(remaining);
    document.getElementById('teacherYearlySalaryDisplay').textContent = formatMoney(yearly);
    document.getElementById('teacherDailySalaryDisplay').textContent = formatMoney(daily);
    document.getElementById('teacherTotalSalaryDisplay2').textContent = formatMoney(totalPaid);
}

// ============================================================
// ⭐ TO'LOVLARNI KO'RSATISH
// ============================================================
function renderPayments(payments) {
    var container = document.getElementById('teacherPaymentsList');
    if (!container) return;
    
    if (!payments || payments.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-money-bill"></i><p>To\'lovlar mavjud emas</p></div>';
        return;
    }

    var total = payments.reduce(function(sum, p) { return sum + (p.amount || 0); }, 0);
    document.getElementById('teacherTotalSalaryDisplay2').textContent = formatMoney(total);

    container.innerHTML = payments.map(function(p) {
        return '<div class="history-item-slim">' +
            '<div class="left">' +
                '<span class="name">' + (p.studentName || 'Noma\'lum') + '</span>' +
                '<span class="meta">' + (p.month || '-') + '</span>' +
            '</div>' +
            '<div class="right">' +
                '<span class="amount">' + formatMoney(p.amount) + '</span>' +
                '<span class="status status-badge ' + getStatusClass(p.status) + '" style="font-size:0.6rem;">' + formatStatus(p.status) + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ============================================================
// ⭐ DAVOMATNI KO'RSATISH
// ============================================================
function renderAttendance(attendances) {
    var container = document.getElementById('teacherAttendanceList');
    if (!container) return;
    
    if (!attendances || attendances.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>Davomat ma\'lumotlari mavjud emas</p></div>';
        return;
    }

    var visible = teacherAttendanceExpanded ? attendances : attendances.slice(0, 5);
    var moreCount = Math.max(attendances.length - visible.length, 0);

    container.innerHTML = visible.map(function(a) {
        return '<div class="history-item-slim">' +
            '<div class="left">' +
                '<span class="name">' + (a.date || '-') + '</span>' +
                (a.reason ? '<span class="meta"><i class="fas fa-comment"></i> ' + a.reason + '</span>' : '') +
            '</div>' +
            '<div class="right">' +
                '<span class="status status-badge ' + getStatusClass(a.attendance) + '" style="font-size:0.65rem;">' + formatStatus(a.attendance) + '</span>' +
            '</div>' +
        '</div>';
    }).join('');

    if (moreCount > 0) {
        container.innerHTML += '<button id="toggleTeacherAttendance" class="btn-secondary" style="margin:12px auto 0;display:block;padding:8px 16px;font-size:0.85rem;width:auto;">' +
            (teacherAttendanceExpanded ? '🔽 Yopish' : '📋 Barchasini ko\'rsatish (' + moreCount + '+)') +
        '</button>';

        var toggleButton = document.getElementById('toggleTeacherAttendance');
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
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
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        var newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', function() {
            if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }

    var menuToggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            this.classList.remove('show');
        });
    }
}

// ============================================================
// ⭐ YORDAMCHI FUNKSIYALAR
// ============================================================
function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 so\'m';
    var num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 so\'m';
    return num.toLocaleString('uz-UZ') + ' so\'m';
}

function formatDate(date) {
    if (!date) return '-';
    var d = new Date(date);
    return d.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateAge(birthDate) {
    if (!birthDate) return '-';
    var today = new Date();
    var birth = new Date(birthDate);
    var age = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function getStatusClass(status) {
    var map = {
        'active': 'active',
        'inactive': 'inactive',
        'blocked': 'blocked',
        'present': 'present',
        'absent': 'absent',
        'absent_reason': 'absent-reason',
        'paid': 'paid',
        'pending': 'pending',
        'unpaid': 'unpaid'
    };
    return map[status] || 'inactive';
}

function formatStatus(status) {
    var map = {
        'active': '✅ Faol',
        'inactive': '⛔ Faol emas',
        'blocked': '🚫 Bloklangan',
        'present': '✅ Keldi',
        'absent': '❌ Kelmadi',
        'absent_reason': '⚠️ Sababli',
        'paid': '✅ To\'langan',
        'pending': '⏳ Kutilmoqda',
        'unpaid': '❌ To\'lanmagan'
    };
    return map[status] || status;
}

function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#dc2626;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;';
    div.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>' + msg + '</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>';
    document.body.appendChild(div);
    setTimeout(function() { if (div.parentElement) div.remove(); }, 5000);
}

console.log('✅ teacher-profile.js yuklandi');
