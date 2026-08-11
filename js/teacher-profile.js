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
// O'QITUVCHI MA'LUMOTLARI
// ============================================================
async function loadTeacherProfile() {
    try {
        var data = await API.getTeacher(teacherId);
        if (data.success) {
            currentTeacher = data.data;
            renderProfile(currentTeacher);
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
// O'QITUVCHI TO'LOVLARI
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
// O'QITUVCHI DAVOMATI
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
// PROFILNI KO'RSATISH
// ============================================================
function renderProfile(teacher) {
    document.getElementById('teacherAvatar').textContent = teacher.status === 'active' ? '👨‍🏫' : '👨‍🏫⛔';
    document.getElementById('teacherFullName').textContent = teacher.fullName || 'Noma\'lum';
    document.getElementById('teacherEmail').textContent = teacher.email || '-';
    document.getElementById('teacherSubject').textContent = teacher.subject || '-';
    document.getElementById('teacherPhone').textContent = teacher.phone || '-';
    document.getElementById('teacherProfileName').textContent = teacher.fullName || 'O\'qituvchi';
    document.getElementById('teacherStudentCount').textContent = teacher.studentCount || 0;
    document.getElementById('teacherJoined').textContent = formatDate(teacher.createdAt);
    document.getElementById('teacherBirthDate').textContent = formatDate(teacher.birthDate);
    document.getElementById('teacherSalary').textContent = formatMoney(teacher.salary || 0);
    document.getElementById('teacherDailyLessons').textContent = teacher.dailyLessons || 4;
    document.getElementById('teacherLessonDuration').textContent = (teacher.lessonDuration || 60) + ' daqiqa';

    // Ish vaqtlari
    var workingHoursEl = document.getElementById('teacherWorkingHours');
    if (workingHoursEl && teacher.lessons && teacher.lessons.length > 0) {
        var workingDays = teacher.lessons.filter(function(w) { return w.isActive !== false; });
        if (workingDays.length > 0) {
            workingHoursEl.innerHTML = workingDays.map(function(w) {
                return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-color);font-size:0.8rem;">' +
                    '<span>' + w.day + '</span>' +
                    '<span>' + w.startTime + ' - ' + w.endTime + '</span>' +
                '</div>';
            }).join('');
        } else {
            workingHoursEl.innerHTML = '<p class="text-muted" style="font-size:0.8rem;">Ish vaqtlari belgilanmagan</p>';
        }
    } else {
        workingHoursEl.innerHTML = '<p class="text-muted" style="font-size:0.8rem;">Ish vaqtlari belgilanmagan</p>';
    }

    var statusEl = document.getElementById('teacherStatus');
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
    document.getElementById('statStudents').textContent = teacher.studentCount || 0;
    document.getElementById('statAge').textContent = calculateAge(teacher.birthDate);
    document.getElementById('statStatus').textContent = teacher.status === 'active' ? 'Faol' : teacher.status === 'blocked' ? 'Bloklangan' : 'Faol emas';

    var studentsList = document.getElementById('studentsList');
    if (teacher.students && teacher.students.length > 0) {
        studentsList.innerHTML = teacher.students.map(function(s) {
            return '<div class="student-item" onclick="window.location.href=\'student-profile.html?id=' + s._id + '\'" style="cursor:pointer;">' +
                '<span><i class="fas fa-user-circle"></i> ' + (s.fullName || 'Noma\'lum') + '</span>' +
                '<span class="status-badge ' + getStatusClass(s.status) + '" style="font-size:0.65rem;">' + formatStatus(s.status) + '</span>' +
            '</div>';
        }).join('');
    } else {
        studentsList.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">O\'quvchilar mavjud emas</p>';
    }
}

// ============================================================
// TO'LOVLARNI KO'RSATISH
// ============================================================
function renderPayments(payments) {
    var container = document.getElementById('teacherPaymentsList');
    if (!container) return;
    
    if (!payments || payments.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">To\'lovlar mavjud emas</p>';
        return;
    }

    var total = payments.reduce(function(sum, p) { return sum + (p.amount || 0); }, 0);
    document.getElementById('teacherTotalSalary').textContent = formatMoney(total);

    container.innerHTML = payments.map(function(p) {
        return '<div class="payment-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">' +
            '<div>' +
                '<span style="font-weight:600;">' + (p.studentName || 'Noma\'lum') + '</span>' +
                '<span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;">' + (p.month || '-') + '</span>' +
            '</div>' +
            '<div>' +
                '<span style="font-weight:600;color:var(--color-success);">' + formatMoney(p.amount) + '</span>' +
                '<span class="payment-status ' + getStatusClass(p.status) + '" style="font-size:0.6rem;margin-left:8px;">' + formatStatus(p.status) + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

// ============================================================
// DAVOMATNI KO'RSATISH
// ============================================================
function renderAttendance(attendances) {
    var container = document.getElementById('teacherAttendanceList');
    if (!container) return;
    
    if (!attendances || attendances.length === 0) {
        container.innerHTML = '<p class="text-muted" style="text-align:center; padding:10px 0;">Davomat ma\'lumotlari mavjud emas</p>';
        return;
    }

    var visible = teacherAttendanceExpanded ? attendances : attendances.slice(0, 5);
    var moreCount = Math.max(attendances.length - visible.length, 0);

    container.innerHTML = visible.map(function(a) {
        return '<div class="attendance-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">' +
            '<div>' +
                '<span style="font-weight:500;">' + (a.date || '-') + '</span>' +
                (a.reason ? '<span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;"><i class="fas fa-comment"></i> ' + a.reason + '</span>' : '') +
            '</div>' +
            '<span class="status-badge ' + getStatusClass(a.attendance) + '" style="font-size:0.7rem;">' + formatStatus(a.attendance) + '</span>' +
        '</div>';
    }).join('');

    if (moreCount > 0) {
        container.innerHTML += '<button id="toggleTeacherAttendance" class="btn-secondary" style="margin:12px auto 0;display:block;padding:8px 16px;font-size:0.85rem;">' +
            (teacherAttendanceExpanded ? 'Yopish' : 'Barchasini ko\'rsatish (' + moreCount + '+)') +
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
    document.getElementById('logoutBtn').addEventListener('click', function() {
        Auth.logout();
    });
}

// ============================================================
// YORDAMCHI FUNKSIYALAR
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
