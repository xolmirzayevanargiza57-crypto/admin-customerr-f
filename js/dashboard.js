// ============================================================
// DASHBOARD - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
// ============================================================

let dashboardLoaded = false;
let refreshInterval = null;
let notificationCheckInterval = null;
let profileCheckInterval = null;
let lastUnreadCount = 0;
let audioContext = null;
let soundEnabled = true;
let notificationRetryCount = 0;
const maxNotificationRetry = 3;
let dashboardChart = null;
let subscriptionUpdateInterval = null;

// ============================================================
// OVOZ YARATISH
// ============================================================
function createNotificationSound() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') audioContext.resume();
        if (audioContext.state === 'closed') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const now = audioContext.currentTime;

        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.value = 880;
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.start(now);
        osc1.stop(now + 0.2);

        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.35);

        return true;
    } catch (e) {
        return false;
    }
}

function playNotificationSound() {
    if (!soundEnabled) return;
    if (createNotificationSound()) return;
    setTimeout(() => createNotificationSound(), 100);
}

function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') audioContext.resume();
    } catch (e) {}
}

// ============================================================
// SAHIFA YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    if (dashboardLoaded) return;
    dashboardLoaded = true;

    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) {
        window.location.replace('index.html');
        return;
    }

    // Foydalanuvchi ma'lumotlari
    const user = Auth.getUser();
    if (user) {
        const nameEl = document.getElementById('userName');
        const initialEl = document.getElementById('userInitial');
        const schoolEl = document.getElementById('schoolName');
        if (nameEl) nameEl.textContent = Auth.getUserName();
        if (initialEl) initialEl.textContent = Auth.getUserInitial();
        if (schoolEl) schoolEl.textContent = user.schoolName || "Nurli Ta'lim Markazi";
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }

    // Audio — foydalanuvchi birinchi interaksiyada init
    const initAudioOnce = function () {
        initAudio();
        document.removeEventListener('click', initAudioOnce);
        document.removeEventListener('touchstart', initAudioOnce);
        document.removeEventListener('keydown', initAudioOnce);
    };
    document.addEventListener('click', initAudioOnce);
    document.addEventListener('touchstart', initAudioOnce);
    document.addEventListener('keydown', initAudioOnce);

    // Ma'lumotlarni yuklash
    updateNotificationBadge();
    loadDashboardStats();

    // Har 10 soniyada statistika yangilash
    refreshInterval = setInterval(loadDashboardStats, 10000);

    // Har 3 soniyada xabar badge yangilash
    notificationCheckInterval = setInterval(updateNotificationBadge, 3000);

    // Har 30 soniyada auth tekshirish
    profileCheckInterval = setInterval(() => Auth.checkAuth(), 30000);

    // Har 1 soniyada subscription vaqtini yangilash
    subscriptionUpdateInterval = setInterval(updateSubscriptionCountdown, 1000);
});

// ============================================================
// ⭐ SUBSCRIPTION COUNTDOWN - REAL TIME
// ============================================================
function updateSubscriptionCountdown() {
    const subEndDateEl = document.getElementById('subEndDate');
    const subDaysLeftEl = document.getElementById('subDaysLeft');
    const subStatusEl = document.getElementById('subStatus');
    const subTypeEl = document.getElementById('subType');

    // Ma'lumotlarni dashboard.js dan olamiz
    // Agar statsData mavjud bo'lsa
    if (typeof statsData !== 'undefined' && statsData && statsData.subscription) {
        const sub = statsData.subscription;
        const endDate = sub.endDate ? new Date(sub.endDate) : null;
        const now = new Date();

        // Holat
        if (subStatusEl) {
            if (sub.status === 'active' && endDate && endDate > now) {
                subStatusEl.textContent = '✅ Faol';
                subStatusEl.className = 'value status-active';
            } else if (sub.status === 'active' && endDate && endDate <= now) {
                subStatusEl.textContent = '⏰ Muddati tugagan';
                subStatusEl.className = 'value status-expired';
            } else {
                subStatusEl.textContent = '❌ Faol emas';
                subStatusEl.className = 'value status-inactive';
            }
        }

        // Turi
        if (subTypeEl) {
            const typeMap = {
                'monthly': 'Oylik',
                '6months': '6 oylik',
                'yearly': 'Yillik',
                'custom': 'Custom',
                'none': 'Yo\'q'
            };
            subTypeEl.textContent = typeMap[sub.type] || sub.type || 'Yo\'q';
        }

        // Tugash vaqti
        if (subEndDateEl && endDate) {
            const options = {
                timeZone: 'Asia/Tashkent',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            subEndDateEl.textContent = endDate.toLocaleString('uz-UZ', options);
        } else if (subEndDateEl) {
            subEndDateEl.textContent = '-';
        }

        // Qolgan kun
        if (subDaysLeftEl && endDate) {
            const diff = endDate - now;
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                subDaysLeftEl.innerHTML = `${days} <span class="countdown">kun ${hours}s ${minutes}m ${seconds}s</span>`;
            } else {
                subDaysLeftEl.innerHTML = `0 <span class="countdown">kun (muddati tugagan)</span>`;
            }
        } else if (subDaysLeftEl) {
            subDaysLeftEl.innerHTML = `0 <span class="countdown">kun</span>`;
        }
    }
}

// ============================================================
// XABAR BADGE
// ============================================================
async function updateNotificationBadge() {
    try {
        const token = Auth.getToken();
        if (!token) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(API.baseURL + '/api/notifications', {
                headers: API.getHeaders(),
                signal: controller.signal,
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (!response.ok) return;

            const data = await response.json();
            if (!data.success || !data.data) return;

            const user = Auth.getUser();
            const userId = user?._id;

            const myNotifications = data.data.filter(n => {
                if (n.recipientId) return String(n.recipientId) === String(userId);
                return n.recipientRole === 'all' || n.recipientRole === 'admin_customer';
            });

            const unreadCount = myNotifications.filter(n => !n.isRead).length;

            // Header badge
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.style.display = 'block';
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.animation = 'none';
                    setTimeout(() => { badge.style.animation = 'badgePulse 0.5s ease'; }, 10);
                } else {
                    badge.style.display = 'none';
                }
            }

            // Sidebar badge
            const sidebarBadge = document.getElementById('sidebarBadge');
            if (sidebarBadge) {
                if (unreadCount > 0) {
                    sidebarBadge.style.display = 'inline';
                    sidebarBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                } else {
                    sidebarBadge.style.display = 'none';
                }
            }

            // Yangi xabar — ovoz va toast
            if (unreadCount > lastUnreadCount && lastUnreadCount > 0) {
                const diff = unreadCount - lastUnreadCount;
                playNotificationSound();
                setTimeout(playNotificationSound, 300);
                showNotificationToast('🔔 ' + diff + ' ta yangi xabar keldi!');
            }

            lastUnreadCount = unreadCount;
            notificationRetryCount = 0;

        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                if (notificationRetryCount < maxNotificationRetry) {
                    notificationRetryCount++;
                    setTimeout(updateNotificationBadge, 1000);
                }
            }
        }
    } catch (error) {
        console.error('Badge xatosi:', error);
    }
}

// ============================================================
// TOAST XABAR
// ============================================================
function showNotificationToast(message) {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML =
        '<i class="fas fa-bell" style="font-size:1.2rem;"></i>' +
        '<span>' + message + '</span>' +
        '<button onclick="this.parentElement.remove()">×</button>';

    toast.addEventListener('click', function (e) {
        if (e.target.tagName !== 'BUTTON') {
            window.location.href = 'notifications.html';
        }
    });

    document.body.appendChild(toast);

    setTimeout(function () {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => { if (toast.parentElement) toast.remove(); }, 500);
        }
    }, 5000);
}

// ============================================================
// DASHBOARD STATISTIKASI
// ============================================================
async function loadDashboardStats() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(API.baseURL + '/api/dashboard/stats', {
            headers: API.getHeaders(),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                Auth.logout();
            }
            return;
        }

        const data = await response.json();
        if (!data.success) return;

        const stats = data.data;

        // ⭐ Global statsData - subscription uchun
        window.statsData = stats;

        // Jami xodimlar
        const totalStaff = (stats.teacherCount || 0) + (stats.studentCount || 0);
        const staffEl = document.getElementById('totalStaff');
        if (staffEl) staffEl.textContent = totalStaff;

        // O'qituvchilar
        const teacherEl = document.getElementById('teacherCount');
        const activeTeacherEl = document.getElementById('activeTeachers');
        if (teacherEl) teacherEl.textContent = stats.teacherCount || 0;
        if (activeTeacherEl) activeTeacherEl.textContent = stats.activeTeachers || 0;

        // O'quvchilar
        const studentEl = document.getElementById('studentCount');
        const activeStudentEl = document.getElementById('activeStudents');
        if (studentEl) studentEl.textContent = stats.studentCount || 0;
        if (activeStudentEl) activeStudentEl.textContent = stats.activeStudents || 0;

        // ⭐ Subscription ma'lumotlarini yangilash
        updateSubscriptionCountdown();

        // ⭐ Chart yaratish
        createDashboardChart(stats);

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Statistika xatosi:', error);
        }
    }
}

// ============================================================
// ⭐ DASHBOARD CHART - APPLE STYLE (KO'K GRADIENT)
// ============================================================
function createDashboardChart(stats) {
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;

    // Eski chartni o'chirish
    if (dashboardChart) {
        dashboardChart.destroy();
        dashboardChart = null;
    }

    // Ma'lumotlar
    const teacherCount = stats.teacherCount || 0;
    const activeTeachers = stats.activeTeachers || 0;
    const studentCount = stats.studentCount || 0;
    const activeStudents = stats.activeStudents || 0;
    const todayAttendance = stats.todayAttendance || 0;
    const attendanceStats = stats.attendanceStats || { present: 0, absent: 0 };

    const labels = [
        'Jami o\'qituvchilar',
        'Faol o\'qituvchilar',
        'Jami o\'quvchilar',
        'Faol o\'quvchilar',
        'Bugungi davomat',
        'Keldi',
        'Kelmadi'
    ];

    const dataValues = [
        teacherCount,
        activeTeachers,
        studentCount,
        activeStudents,
        todayAttendance,
        attendanceStats.present || 0,
        attendanceStats.absent || 0
    ];

    const colors = [
        'rgba(0, 122, 255, 0.85)',
        'rgba(0, 122, 255, 0.55)',
        'rgba(52, 199, 89, 0.85)',
        'rgba(52, 199, 89, 0.55)',
        'rgba(255, 149, 0, 0.85)',
        'rgba(52, 199, 89, 0.85)',
        'rgba(255, 59, 48, 0.85)'
    ];

    const borderColors = [
        '#007aff',
        '#007aff',
        '#34c759',
        '#34c759',
        '#ff9500',
        '#34c759',
        '#ff3b30'
    ];

    dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Statistika',
                data: dataValues,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        font: {
                            size: 11,
                            family: 'Inter'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8e8e93'
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e5e5ea',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10,
                            family: 'Inter'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8e8e93',
                        maxRotation: 30,
                        minRotation: 20
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function () {
    if (refreshInterval) clearInterval(refreshInterval);
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    if (profileCheckInterval) clearInterval(profileCheckInterval);
    if (subscriptionUpdateInterval) clearInterval(subscriptionUpdateInterval);
    if (dashboardChart) {
        dashboardChart.destroy();
        dashboardChart = null;
    }
});

console.log('✅ dashboard.js yuklandi (Admin-Customer)');
