// ============================================================
// DASHBOARD - ADMIN CUSTOMER (TO'LIQ)
// ============================================================

let dashboardLoaded = false;
let lastDashboardStats = null;
let refreshInterval = null;
let countdownInterval = null;

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

        await loadDashboardStats();

        refreshInterval = setInterval(() => {
            loadDashboardStats();
        }, 30000);

        startCountdown();

        // ⭐ NOTIFICATIONS
        initNotifications();

        console.log('✅ Dashboard yuklandi!');
    } catch (error) {
        console.error('❌ Dashboard yuklash xatosi:', error);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// ⭐ FORMAT DATE FUNCTION
// ============================================================
function formatDate(date) {
    if (!date) return 'Noma\'lum vaqt';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Noma\'lum vaqt';
        const year = d.getFullYear();
        const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
        const month = monthNames[d.getMonth()];
        const day = d.getDate();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-yil ${day}-${month} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        return 'Noma\'lum vaqt';
    }
}

// ============================================================
// ⭐ COUNTDOWN - REAL TIME
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
            endEl.textContent = formatDate(sub.endDate);
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
// LOAD DASHBOARD STATS
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
            showError('Ma\'lumotlarni yuklashda xatolik: ' + data.message);
            return;
        }

        const stats = data.data;
        lastDashboardStats = stats;
        console.log('📊 Statistika ma\'lumotlari:', stats);

        const elements = {
            teacherCount: document.getElementById('teacherCount'),
            studentCount: document.getElementById('studentCount'),
            totalXP: document.getElementById('totalXP'),
            todayAttendance: document.getElementById('todayAttendance'),
            presentCount: document.getElementById('presentCount'),
            absentReasonCount: document.getElementById('absentReasonCount'),
            absentCount: document.getElementById('absentCount'),
            attendancePercent: document.getElementById('attendancePercent'),
            subscriptionStatus: document.getElementById('subscriptionStatus'),
            subscriptionType: document.getElementById('subscriptionType'),
            subscriptionEnd: document.getElementById('subscriptionEnd'),
            subscriptionDays: document.getElementById('subscriptionDays')
        };

        if (elements.teacherCount) elements.teacherCount.textContent = stats.teacherCount || 0;
        if (elements.studentCount) elements.studentCount.textContent = stats.studentCount || 0;
        if (elements.totalXP) elements.totalXP.textContent = stats.totalXP || 0;
        if (elements.todayAttendance) elements.todayAttendance.textContent = stats.todayAttendance || 0;

        const present = stats.attendanceStats?.present || 0;
        const absentReason = stats.attendanceStats?.absent_reason || 0;
        const absent = stats.attendanceStats?.absent || 0;

        if (elements.presentCount) elements.presentCount.textContent = present;
        if (elements.absentReasonCount) elements.absentReasonCount.textContent = absentReason;
        if (elements.absentCount) elements.absentCount.textContent = absent;

        const total = present + absentReason + absent;
        if (elements.attendancePercent) {
            if (total > 0) {
                const percent = Math.round((present / total) * 100);
                elements.attendancePercent.textContent = `${percent}%`;
                elements.attendancePercent.className = `stat-change ${percent >= 70 ? 'positive' : 'negative'}`;
            } else {
                elements.attendancePercent.textContent = '0%';
            }
        }

        // SUBSCRIPTION
        if (stats.subscription) {
            const sub = stats.subscription;
            const statusMap = { 'active': '✅ Faol', 'inactive': '⛔ Faol emas', 'expired': '⚠️ Muddati tugagan' };
            if (elements.subscriptionStatus) {
                elements.subscriptionStatus.textContent = statusMap[sub.status] || sub.status || 'Noma\'lum';
            }
            const typeMap = { 'monthly': '📅 Oylik', '6months': '📅 6 oylik', 'yearly': '📅 Yillik', 'custom': '⚙️ Custom', 'none': '❌ Yo\'q' };
            if (elements.subscriptionType) {
                elements.subscriptionType.textContent = typeMap[sub.type] || sub.type || 'Noma\'lum';
            }
            if (elements.subscriptionEnd) {
                if (sub.formattedEndDate) {
                    elements.subscriptionEnd.textContent = sub.formattedEndDate;
                } else if (sub.endDate) {
                    elements.subscriptionEnd.textContent = formatDate(sub.endDate);
                } else {
                    elements.subscriptionEnd.textContent = 'Muddati yo\'q';
                }
            }
            if (elements.subscriptionDays) {
                if (!sub.endDate) {
                    elements.subscriptionDays.textContent = '-';
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
                            elements.subscriptionDays.textContent = `${days} kun ${hours}s ${minutes}m ${seconds}s`;
                        } else {
                            elements.subscriptionDays.textContent = '⚠️ Vaqt tugagan!';
                        }
                    } else {
                        elements.subscriptionDays.textContent = sub.endDate || '-';
                    }
                }
            }
        }

        console.log('✅ Dashboard statistikasi yuklandi!');
    } catch (error) {
        console.error('❌ Statistikani yuklash xatosi:', error);
        showError('Ma\'lumotlarni yuklashda xatolik: ' + error.message);
    }
}

// ============================================================
// ⭐ NOTIFICATIONS (Admin-Customer)
// ============================================================
function initNotifications() {
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationPanel = document.getElementById('notificationPanel');
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    const markAllRead = document.getElementById('markAllRead');

    if (!notificationToggle) return;

    notificationToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notificationPanel.style.display === 'block';
        notificationPanel.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) {
            loadNotifications();
        }
    });

    document.addEventListener('click', (e) => {
        if (!notificationPanel.contains(e.target) && e.target !== notificationToggle && !notificationToggle.contains(e.target)) {
            notificationPanel.style.display = 'none';
        }
    });

    if (markAllRead) {
        markAllRead.addEventListener('click', async () => {
            try {
                const token = Auth.getToken();
                if (!token) return;
                const response = await fetch('https://admin-customerr.onrender.com/api/notifications/mark-all-read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) loadNotifications();
            } catch (error) {
                console.error('❌ Xatolik:', error);
            }
        });
    }

    async function loadNotifications() {
        try {
            const token = Auth.getToken();
            if (!token) return;

            const response = await fetch('https://admin-customerr.onrender.com/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            console.log('📨 Xabarlar:', data);

            if (response.ok && data.success) {
                renderNotifications(data.data || []);
            } else {
                notificationList.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px 0; font-size: 0.85rem;">Xabarlar yuklanmadi</p>`;
            }
        } catch (error) {
            console.error('❌ Xabarlarni yuklash xatosi:', error);
            notificationList.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px 0; font-size: 0.85rem;">Xatolik yuz berdi</p>`;
        }
    }

    function renderNotifications(notifications) {
        if (!notificationList || !notificationBadge) return;

        const unreadCount = notifications.filter(n => !n.isRead).length;
        if (unreadCount > 0) {
            notificationBadge.style.display = 'block';
            notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        } else {
            notificationBadge.style.display = 'none';
        }

        if (!notifications || notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notif-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Hozircha xabarlar yo'q</p>
                </div>
            `;
            return;
        }

        // ⭐ SANALAR BO'YICHA GURUHLASH
        const grouped = {};
        notifications.forEach(notif => {
            const date = new Date(notif.createdAt);
            const dateKey = date.toLocaleDateString('uz-UZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(notif);
        });

        let html = '';
        Object.keys(grouped).forEach(dateKey => {
            const items = grouped[dateKey];
            html += `<div style="padding: 4px 0; font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">${dateKey}</div>`;
            items.forEach(notif => {
                const time = new Date(notif.createdAt).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const isUnread = !notif.isRead;
                const formattedDate = formatDate(notif.createdAt);
                html += `
                    <div class="notification-item ${isUnread ? 'unread' : ''}">
                        <div class="notification-item-inner">
                            <div class="notification-body">
                                <strong class="notification-title">${notif.title || 'Xabar'}</strong>
                                <p class="notification-message">${notif.message || ''}</p>
                                <span class="notification-time"><i class="fas fa-clock"></i> ${time} • ${formattedDate}</span>
                            </div>
                            ${isUnread ? `
                                <button class="mark-read-btn" data-id="${notif._id}">O'qildi</button>
                            ` : `
                                <span class="notif-read-label">✓ O'qilgan</span>
                            `}
                        </div>
                    </div>
                `;
            });
        });

        notificationList.innerHTML = html;

        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                await markAsRead(id);
            });
        });
    }

    async function markAsRead(id) {
        try {
            const token = Auth.getToken();
            if (!token) return;
            const response = await fetch(`https://admin-customerr.onrender.com/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) loadNotifications();
        } catch (error) {
            console.error('❌ Xatolik:', error);
        }
    }

    setInterval(() => {
        if (notificationPanel.style.display === 'block') {
            loadNotifications();
        }
    }, 30000);
}

// ============================================================
// SHOW ERROR
// ============================================================
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
        z-index: 10000;
    `;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 8000);
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
});

console.log('✅ dashboard.js yuklandi');
