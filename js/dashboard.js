// ============================================================
// DASHBOARD - STATISTIKALAR (Admin-Customer)
// ============================================================

let lastDashboardStats = null;
let refreshInterval = null;
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard yuklanmoqda...');
    
    try {
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        if (!token) {
            window.location.href = 'index.html';
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

        await loadDashboardStats();
        
        // ⭐ HAR 30 SONIYADA MA'LUMOTLARNI YANGILASH
        refreshInterval = setInterval(() => {
            loadDashboardStats();
        }, 30000);
        
        // ⭐ REAL-TIME COUNTDOWN - HAR SONIYADA YANGILANADI
        startCountdown();
        
        setupListeners();
        initNotifications();
        
        console.log('✅ Dashboard yuklandi!');
    } catch (error) {
        console.error('❌ Dashboard yuklash xatosi:', error);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// ⭐ REAL-TIME COUNTDOWN - HAR SONIYADA YANGILANADI
// ============================================================
function startCountdown() {
    // Eski intervalni tozalash
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
    if (!sub.endDate) {
        daysEl.textContent = '-';
        return;
    }
    
    const endDate = new Date(sub.endDate);
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) {
        daysEl.textContent = '⚠️ Vaqt tugagan!';
        return;
    }
    
    // ⭐ KUN, SOAT, MINUT, SEKUNDNI HISOBLASH
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // ⭐ TO'G'RI FORMAT: "177 kun 4s 47m 48s"
    daysEl.textContent = `${days} kun ${hours}s ${minutes}m ${seconds}s`;
}

// ============================================================
// DASHBOARD STATISTIKA
// ============================================================
async function loadDashboardStats() {
    try {
        console.log('📊 Statistika yuklanmoqda...');
        
        const data = await API.getDashboardStats();
        console.log('📊 Statistika javobi:', data);
        
        if (!data.success) {
            const errorMessage = data.message || 'Noma\'lum xatolik';
            console.error('❌ Statistika xatosi:', errorMessage);
            showError('Ma\'lumotlarni yuklashda xatolik: ' + errorMessage);
            return;
        }
        
        const stats = data.data;
        lastDashboardStats = stats;
        console.log('📊 Statistika ma\'lumotlari:', stats);
        
        // Stats cards
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

        // ⭐ SUBSCRIPTION - TO'LIQ VA TO'G'RI
        if (stats.subscription) {
            const sub = stats.subscription;
            
            // Status
            const statusMap = {
                'active': '✅ Faol',
                'inactive': '⛔ Faol emas',
                'expired': '⚠️ Muddati tugagan'
            };
            if (elements.subscriptionStatus) {
                elements.subscriptionStatus.textContent = statusMap[sub.status] || sub.status || 'Noma\'lum';
            }
            
            // Turi
            const typeMap = {
                'monthly': '📅 Oylik',
                '6months': '📅 6 oylik',
                'yearly': '📅 Yillik',
                'custom': '⚙️ Custom',
                'none': '❌ Yo\'q'
            };
            if (elements.subscriptionType) {
                elements.subscriptionType.textContent = typeMap[sub.type] || sub.type || 'Noma\'lum';
            }
            
            // ⭐ TUGASH VAQTI - TO'G'RI FORMAT
            if (sub.endDate && elements.subscriptionEnd) {
                const endDate = new Date(sub.endDate);
                // ⭐ TO'G'RI FORMAT: 2027-yil 12-yanvar 21:13:00
                const formattedDate = endDate.toLocaleString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });
                elements.subscriptionEnd.textContent = formattedDate;
            } else if (elements.subscriptionEnd) {
                elements.subscriptionEnd.textContent = 'Muddati yo\'q';
            }
            
            // ⭐ QOLGAN KUN - REAL-TIME COUNTDOWN
            if (sub.endDate && elements.subscriptionDays) {
                const endDate = new Date(sub.endDate);
                const now = new Date();
                const diff = endDate - now;
                
                if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                    // ⭐ TO'G'RI FORMAT: "177 kun 4s 47m 48s"
                    elements.subscriptionDays.textContent = `${days} kun ${hours}s ${minutes}m ${seconds}s`;
                } else {
                    elements.subscriptionDays.textContent = '⚠️ Vaqt tugagan!';
                }
            } else if (elements.subscriptionDays) {
                elements.subscriptionDays.textContent = '-';
            }
        } else {
            if (elements.subscriptionStatus) elements.subscriptionStatus.textContent = '❌ Yo\'q';
            if (elements.subscriptionType) elements.subscriptionType.textContent = '❌ Yo\'q';
            if (elements.subscriptionEnd) elements.subscriptionEnd.textContent = '-';
            if (elements.subscriptionDays) elements.subscriptionDays.textContent = '-';
        }
        
        console.log('✅ Dashboard statistikasi yuklandi!');
    } catch (error) {
        console.error('❌ Statistikani yuklash xatosi:', error);
        throw error;
    }
}

// ============================================================
// ⭐ NOTIFICATIONS — Admin Customer
// ============================================================
function initNotifications() {
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationPanel  = document.getElementById('notificationPanel');
    const notificationList   = document.getElementById('notificationList');
    const notificationBadge  = document.getElementById('notificationBadge');
    const markAllReadBtn     = document.getElementById('markAllRead');

    if (!notificationToggle || !notificationPanel) return;

    notificationToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notificationPanel.style.display === 'flex';
        notificationPanel.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) loadNotifications();
    });

    document.addEventListener('click', (e) => {
        if (
            notificationPanel.style.display === 'flex' &&
            !notificationPanel.contains(e.target) &&
            !notificationToggle.contains(e.target)
        ) {
            notificationPanel.style.display = 'none';
        }
    });

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            try {
                const token = getToken();
                if (!token) return;
                
                const response = await fetch('https://admin-customerr.onrender.com/api/notifications/mark-all-read', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) loadNotifications();
            } catch (error) {
                console.error('❌ Xatolik:', error);
            }
        });
    }

    async function loadNotifications() {
        try {
            const token = getToken();
            if (!token) return;

            notificationList.innerHTML = `
                <p style="text-align:center;padding:20px 0;font-size:0.82rem;color:var(--text-muted);">
                    <i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...
                </p>`;

            const response = await fetch('https://admin-customerr.onrender.com/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            console.log('📨 Xabarlar:', data);

            if (response.ok && data.success) {
                renderNotifications(data.data || []);
            } else {
                notificationList.innerHTML = `
                    <p style="text-align:center;padding:20px 0;font-size:0.82rem;color:var(--text-muted);">
                        Xabarlar yuklanmadi
                    </p>`;
            }
        } catch (error) {
            console.error('❌ Xabarlarni yuklash xatosi:', error);
            notificationList.innerHTML = `
                <p style="text-align:center;padding:20px 0;font-size:0.82rem;color:var(--text-muted);">
                    Xatolik yuz berdi
                </p>`;
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

        if (!notifications.length) {
            notificationList.innerHTML = `
                <p style="text-align:center;padding:24px 0;font-size:0.85rem;color:var(--text-muted);">
                    <i class="fas fa-bell-slash" style="font-size:1.5rem;display:block;margin-bottom:8px;opacity:0.4;"></i>
                    Hozircha xabarlar yo'q
                </p>`;
            return;
        }

        notificationList.innerHTML = notifications.map(notif => {
            const date = new Date(notif.createdAt);
            const timeStr = date.toLocaleString('uz-UZ', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const isUnread = !notif.isRead;

            return `
                <div class="notification-item ${isUnread ? 'unread' : ''}">
                    <div class="notification-item-inner">
                        <div class="notification-body">
                            <strong class="notification-title">${notif.title || 'Xabar'}</strong>
                            <p class="notification-message">${notif.message || ''}</p>
                            <span class="notification-time">${timeStr}</span>
                        </div>
                        ${isUnread
                            ? `<button class="mark-read-btn" data-id="${notif._id}">O'qildi</button>`
                            : `<span class="notif-read-label">✓ O'qilgan</span>`
                        }
                    </div>
                </div>`;
        }).join('');

        notificationList.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await markAsRead(btn.dataset.id);
            });
        });
    }

    async function markAsRead(id) {
        try {
            const token = getToken();
            if (!token) return;

            const response = await fetch(
                `https://admin-customerr.onrender.com/api/notifications/${id}/read`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) loadNotifications();
        } catch (error) {
            console.error('❌ Xatolik:', error);
        }
    }

    setInterval(() => {
        if (notificationPanel.style.display === 'flex') {
            loadNotifications();
        }
    }, 30000);
}

function getToken() {
    return localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => Auth.logout());
    }
}

function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        padding: 14px 18px; background: #fef2f2;
        border: 1px solid #fecaca; border-radius: 10px;
        color: #dc2626; max-width: 360px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex; align-items: center; gap: 10px;
        font-size: 0.85rem;
    `;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()"
            style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 8000);
}

console.log('✅ dashboard.js yuklandi');
