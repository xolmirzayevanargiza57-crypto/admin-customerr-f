// ============================================================
// DASHBOARD - ADMIN-CUSTOMER
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
});

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

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Statistika xatosi:', error);
        }
    }
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function () {
    if (refreshInterval) clearInterval(refreshInterval);
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    if (profileCheckInterval) clearInterval(profileCheckInterval);
});

console.log('✅ dashboard.js yuklandi');
