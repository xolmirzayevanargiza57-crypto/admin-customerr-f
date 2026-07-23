// ============================================================
// DASHBOARD - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
// Loyiha: Admin-Customer Frontend
// Fayl: js/dashboard.js
// ============================================================

let dashboardLoaded = false;
let lastDashboardStats = null;
let refreshInterval = null;
let countdownInterval = null;

// ============================================================
// SAHIFA YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    if (dashboardLoaded) {
        console.log('⚠️ Dashboard allaqachon yuklangan');
        return;
    }
    dashboardLoaded = true;

    console.log('🚀 Dashboard yuklanmoqda...');

    try {
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        if (!token) {
            window.location.replace('index.html');
            return;
        }

        const user = Auth.getUser();
        if (user) {
            const nameEl = document.getElementById('userName');
            const initialEl = document.getElementById('userInitial');
            const schoolEl = document.getElementById('schoolName');
            if (nameEl) nameEl.textContent = Auth.getUserName();
            if (initialEl) initialEl.textContent = Auth.getUserInitial();
            if (schoolEl) schoolEl.textContent = user.schoolName || 'Nurli Ta\'lim Markazi';
        }

        // ⭐ LOGOUT TUGMASI
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            newLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                    Auth.logout();
                }
            });
        }

        // ⭐ Dashboard statistikasini yuklash
        await loadDashboardStats();

        // ⭐ HAR 60 SONIYADA YANGILASH (30 emas!)
        refreshInterval = setInterval(() => {
            loadDashboardStats();
        }, 60000);

        startCountdown();

        console.log('✅ Dashboard yuklandi!');
    } catch (error) {
        console.error('❌ Dashboard yuklash xatosi:', error);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// DASHBOARD STATISTIKASINI YUKLASH
// ============================================================
async function loadDashboardStats() {
    try {
        console.log('📊 Statistika yuklanmoqda...');
        const data = await API.getDashboardStats();
        console.log('📊 Statistika javobi:', data);

        if (!data.success) {
            if (data.status === 401 || data.status === 403) {
                Auth.logout();
                return;
            }
            console.error('❌ Statistika xatosi:', data.message);
            return;
        }

        const stats = data.data;
        lastDashboardStats = stats;
        console.log('📊 Statistika ma\'lumotlari:', stats);

        // ⭐ STATS
        const teacherCount = document.getElementById('teacherCount');
        const studentCount = document.getElementById('studentCount');
        const totalXP = document.getElementById('totalXP');
        const todayAttendance = document.getElementById('todayAttendance');
        const presentCount = document.getElementById('presentCount');
        const absentReasonCount = document.getElementById('absentReasonCount');
        const absentCount = document.getElementById('absentCount');
        const attendancePercent = document.getElementById('attendancePercent');
        const subscriptionStatus = document.getElementById('subscriptionStatus');
        const subscriptionType = document.getElementById('subscriptionType');
        const subscriptionEnd = document.getElementById('subscriptionEnd');
        const subscriptionDays = document.getElementById('subscriptionDays');

        if (teacherCount) teacherCount.textContent = stats.teacherCount || 0;
        if (studentCount) studentCount.textContent = stats.studentCount || 0;
        if (totalXP) totalXP.textContent = stats.totalXP || 0;
        if (todayAttendance) todayAttendance.textContent = stats.todayAttendance || 0;

        // ⭐ ATTENDANCE
        const present = stats.attendanceStats?.present || 0;
        const absentReason = stats.attendanceStats?.absent_reason || 0;
        const absent = stats.attendanceStats?.absent || 0;

        if (presentCount) presentCount.textContent = present;
        if (absentReasonCount) absentReasonCount.textContent = absentReason;
        if (absentCount) absentCount.textContent = absent;

        const total = present + absentReason + absent;
        if (attendancePercent) {
            if (total > 0) {
                const percent = Math.round((present / total) * 100);
                attendancePercent.textContent = `${percent}%`;
                attendancePercent.className = `stat-change ${percent >= 70 ? 'positive' : 'negative'}`;
            } else {
                attendancePercent.textContent = '0%';
            }
        }

        // ⭐ SUBSCRIPTION
        if (stats.subscription) {
            const sub = stats.subscription;
            const statusMap = { 'active': '✅ Faol', 'inactive': '⛔ Faol emas', 'expired': '⚠️ Muddati tugagan' };
            if (subscriptionStatus) {
                subscriptionStatus.textContent = statusMap[sub.status] || sub.status || 'Noma\'lum';
            }
            const typeMap = { 'monthly': '📅 Oylik', '6months': '📅 6 oylik', 'yearly': '📅 Yillik', 'custom': '⚙️ Custom', 'none': '❌ Yo\'q' };
            if (subscriptionType) {
                subscriptionType.textContent = typeMap[sub.type] || sub.type || 'Noma\'lum';
            }
            if (subscriptionEnd) {
                if (sub.formattedEndDate) {
                    subscriptionEnd.textContent = sub.formattedEndDate;
                } else if (sub.endDate) {
                    subscriptionEnd.textContent = formatDateTime(sub.endDate);
                } else {
                    subscriptionEnd.textContent = 'Muddati yo\'q';
                }
            }
            if (subscriptionDays) {
                if (!sub.endDate) {
                    subscriptionDays.textContent = '-';
                } else {
                    let endDate = null;
                    if (typeof sub.endDate === 'string' && sub.endDate.includes('M01')) {
                        const parts = sub.endDate.split(' ');
                        if (parts.length === 4) {
                            const year = parts[0];
                            const month = parts[1].replace('M', '').padStart(2, '0');
                            const day = parts[2].padStart(2, '0');
                            const time = parts[3];
                            endDate = new Date(`${year}-${month}-${day}T${time}`);
                        }
                    } else {
                        endDate = new Date(sub.endDate);
                    }
                    if (endDate && !isNaN(endDate.getTime())) {
                        const now = new Date();
                        const diff = endDate - now;
                        if (diff > 0) {
                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                            subscriptionDays.textContent = `${days} kun ${hours}s ${minutes}m ${seconds}s`;
                        } else {
                            subscriptionDays.textContent = '⚠️ Vaqt tugagan!';
                        }
                    } else {
                        subscriptionDays.textContent = sub.endDate || '-';
                    }
                }
            }
        }

        console.log('✅ Dashboard statistikasi yuklandi!');
    } catch (error) {
        console.error('❌ Statistikani yuklash xatosi:', error);
    }
}

// ============================================================
// COUNTDOWN - REAL TIME
// ============================================================
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    countdownInterval = setInterval(() => {
        updateCountdown();
    }, 1000);
}

function updateCountdown() {
    const daysEl = document.getElementById('subscriptionDays');
    const endEl = document.getElementById('subscriptionEnd');
    if (!daysEl || !lastDashboardStats || !lastDashboardStats.subscription) return;
    const sub = lastDashboardStats.subscription;

    if (endEl) {
        if (sub.formattedEndDate) {
            endEl.textContent = sub.formattedEndDate;
        } else if (sub.endDate) {
            endEl.textContent = formatDateTime(sub.endDate);
        } else {
            endEl.textContent = 'Muddati yo\'q';
        }
    }

    if (!sub.endDate) {
        daysEl.textContent = '-';
        return;
    }

    let endDate = null;
    if (typeof sub.endDate === 'string' && sub.endDate.includes('M01')) {
        const parts = sub.endDate.split(' ');
        if (parts.length === 4) {
            const year = parts[0];
            const month = parts[1].replace('M', '').padStart(2, '0');
            const day = parts[2].padStart(2, '0');
            const time = parts[3];
            endDate = new Date(`${year}-${month}-${day}T${time}`);
        }
    } else {
        endDate = new Date(sub.endDate);
    }

    if (!endDate || isNaN(endDate.getTime())) {
        daysEl.textContent = '-';
        return;
    }

    const now = new Date();
    const diff = endDate - now;

    if (diff <= 0) {
        daysEl.textContent = '⚠️ Vaqt tugagan!';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = `${days} kun ${hours}s ${minutes}m ${seconds}s`;
}

// ============================================================
// VAQTNI FORMATLASH
// ============================================================
function formatDateTime(date) {
    if (!date) return 'Noma\'lum vaqt';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Noma\'lum vaqt';
        return d.toLocaleString('uz-UZ', {
            timeZone: 'Asia/Tashkent',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (error) {
        return 'Noma\'lum vaqt';
    }
}

// ============================================================
// XATOLIK KO'RSATISH
// ============================================================
function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    // Ekranda xatolikni ko'rsatish
    const container = document.querySelector('.stats-grid');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'stat-card';
        errorDiv.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 20px; border-color: var(--color-danger);';
        errorDiv.innerHTML = `
            <p style="color: var(--color-danger);">
                <i class="fas fa-exclamation-circle"></i> 
                ${msg}
            </p>
            <button onclick="location.reload()" class="btn-secondary" style="margin-top: 8px; width: auto; padding: 8px 16px;">
                <i class="fas fa-sync-alt"></i> Qayta yuklash
            </button>
        `;
        container.prepend(errorDiv);
        setTimeout(() => {
            if (errorDiv.parentNode) errorDiv.remove();
        }, 10000);
    }
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
});

console.log('✅ dashboard.js yuklandi (Admin-Customer)');
