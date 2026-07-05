// ============================================================
// REPORTS - HISOBOTLAR (TO'LIQ TUZATILGAN)
// ============================================================

let reportsChart = null;
let attendanceDetails = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    await loadReports();
    await loadAttendanceDetails();
    setupListeners();
});

// ============================================================
// HISOBOTLARNI YUKLASH
// ============================================================
async function loadReports() {
    try {
        console.log('📊 Hisobotlar yuklanmoqda...');
        
        const data = await API.getDashboardStats();
        console.log('📊 Statistika javobi:', data);
        
        if (data.success) {
            const stats = data.data;
            
            // Teachers
            const totalTeachers = stats.teacherCount || 0;
            const activeTeachers = stats.activeTeachers || 0;
            const inactiveTeachers = totalTeachers - activeTeachers;
            
            document.getElementById('totalTeachers').textContent = totalTeachers;
            document.getElementById('activeTeachers').textContent = activeTeachers;
            document.getElementById('inactiveTeachers').textContent = inactiveTeachers;
            
            // Students
            const totalStudents = stats.studentCount || 0;
            const activeStudents = stats.activeStudents || 0;
            const inactiveStudents = totalStudents - activeStudents;
            
            document.getElementById('totalStudents').textContent = totalStudents;
            document.getElementById('activeStudents').textContent = activeStudents;
            document.getElementById('inactiveStudents').textContent = inactiveStudents;
            
            // XP
            const totalXP = stats.totalXP || 0;
            const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;
            document.getElementById('totalXP').textContent = totalXP;
            document.getElementById('avgXP').textContent = avgXP;
            
            // Attendance
            const present = stats.attendanceStats?.present || 0;
            const absent = stats.attendanceStats?.absent || 0;
            const totalAttendance = present + absent;
            
            document.getElementById('totalAttendance').textContent = totalAttendance;
            document.getElementById('presentCount').textContent = present;
            document.getElementById('absentCount').textContent = absent;
            
            console.log('✅ Hisobotlar muvaffaqiyatli yuklandi!');
            
            // Chart
            initChart({
                teachers: totalTeachers,
                students: totalStudents,
                present: present,
                absent: absent
            });
        } else {
            console.error('❌ Hisobotlar yuklanmadi:', data.message);
            showError(data.message || 'Ma\'lumotlarni yuklashda xatolik!');
        }
    } catch (error) {
        console.error('❌ Hisobotlarni yuklash xatosi:', error);
        showError('Server bilan bog\'lanib bo\'lmadi! Qayta urinib ko\'ring.');
    }
}

// ============================================================
// DAVOMAT TAFSILOTLARINI YUKLASH
// ============================================================
async function loadAttendanceDetails() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const data = await API.getAttendances({ date: today });
        
        if (data.success) {
            attendanceDetails = data.data || [];
            renderAttendanceDetails(attendanceDetails);
            renderWorkHours(attendanceDetails);
        }
    } catch (error) {
        console.error('❌ Davomat tafsilotlarini yuklash xatosi:', error);
    }
}

// ============================================================
// DAVOMAT TAFSILOTLARINI KO'RSATISH
// ============================================================
function renderAttendanceDetails(attendances) {
    const container = document.getElementById('attendanceDetailsContainer');
    if (!container) return;
    
    if (!attendances || attendances.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="padding:20px 0;">
                <p>Bugungi davomat ma'lumotlari mavjud emas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = attendances.map(att => {
        const statusMap = {
            'present': '✅ Keldi',
            'absent': '❌ Kelmadi',
            'absent_with_reason': '⚠️ Sababli'
        };
        const statusClass = att.attendance === 'present' ? 'present' : 
                           att.attendance === 'absent_with_reason' ? 'absent-reason' : 'absent';
        
        return `
            <div class="attendance-detail-card">
                <div class="info">
                    <div class="name">${att.studentName || att.teacherName || 'Noma\'lum'}</div>
                    <div class="role">${att.type === 'teacher' ? '👨‍🏫 O\'qituvchi' : '🎓 O\'quvchi'}</div>
                    <div class="time"><i class="far fa-clock"></i> ${att.time || '09:00 - 10:30'}</div>
                </div>
                <span class="status-badge ${statusClass}">${statusMap[att.attendance] || att.attendance}</span>
            </div>
        `;
    }).join('');
}

// ============================================================
// ISH VAQTLARINI KO'RSATISH
// ============================================================
function renderWorkHours(attendances) {
    const container = document.getElementById('workHoursContainer');
    if (!container) return;
    
    // O'qituvchilarning ish vaqtlarini hisoblash
    const teacherHours = {};
    attendances.forEach(att => {
        if (att.type === 'teacher' && att.teacherName) {
            if (!teacherHours[att.teacherName]) {
                teacherHours[att.teacherName] = 0;
            }
            // Har bir davomat uchun 1.5 soat (90 daqiqa) hisoblanadi
            teacherHours[att.teacherName] += 1.5;
        }
    });
    
    const entries = Object.entries(teacherHours);
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="padding:20px 0;">
                <p>Ish vaqtlari ma'lumotlari mavjud emas</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = entries.map(([name, hours]) => `
        <div class="work-hours-card">
            <div class="name">${name}</div>
            <div class="hours">${hours.toFixed(1)} soat</div>
            <div class="label">Bugungi ish vaqti</div>
        </div>
    `).join('');
}

// ============================================================
// CHART
// ============================================================
function initChart(data) {
    const ctx = document.getElementById('reportsChart')?.getContext('2d');
    if (!ctx) {
        console.warn('⚠️ Chart canvas topilmadi');
        return;
    }

    if (reportsChart) {
        reportsChart.destroy();
        reportsChart = null;
    }

    const labels = [
        I18N.t('teachers') || 'O\'qituvchilar',
        I18N.t('students') || 'O\'quvchilar',
        I18N.t('present') || 'Keldi',
        I18N.t('absent') || 'Kelmadi'
    ];

    const values = [
        data.teachers || 0,
        data.students || 0,
        data.present || 0,
        data.absent || 0
    ];

    const colors = [
        'rgba(0, 122, 255, 0.8)',
        'rgba(52, 199, 89, 0.8)',
        'rgba(52, 199, 89, 0.8)',
        'rgba(255, 59, 48, 0.8)'
    ];

    const borderColors = [
        '#007aff',
        '#34c759',
        '#34c759',
        '#ff3b30'
    ];

    reportsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: I18N.t('total') || 'Jami',
                data: values,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: { size: 11 }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11 }
                    }
                }
            }
        }
    });
    
    console.log('✅ Chart yaratildi');
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => Auth.logout());
    }

    // Sidebar open/close is handled globally by js/theme.js.
}

function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    
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

console.log('✅ reports.js yuklandi');