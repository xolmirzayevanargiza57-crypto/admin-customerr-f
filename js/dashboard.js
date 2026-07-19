// ============================================================
// DASHBOARD - STATISTIKALAR (Admin-Customer)
// ============================================================

let lastDashboardStats = null;
let refreshInterval = null;

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
        
        refreshInterval = setInterval(() => {
            loadDashboardStats();
        }, 30000);
        
        setupListeners();
        initNotifications();
        
        console.log('✅ Dashboard yuklandi!');
    } catch (error) {
        console.error('❌ Dashboard yuklash xatosi:', error);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

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

        // ⭐ SUBSCRIPTION - TO'LIQ
        if (stats.subscription) {
            console.log('📊 Subscription ma\'lumotlari:', stats.subscription);
            
            const sub = stats.subscription;
            
            const statusMap = {
                'active': '✅ Faol',
                'inactive': '⛔ Faol emas',
                'expired': '⚠️ Muddati tugagan'
            };
            if (elements.subscriptionStatus) {
                elements.subscriptionStatus.textContent = statusMap[sub.status] || sub.status || 'Noma\'lum';
            }
            
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
            
            if (sub.endDate && elements.subscriptionEnd) {
                const endDate = new Date(sub.endDate);
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
            
            if (sub.endDate && elements.subscriptionDays) {
                const endDate = new Date(sub.endDate);
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
// ⭐ NOTIFICATIONS - Admin Customer (dashboard.js ichida)
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
                const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
                if (!token) return;
                
                const response = await fetch('https://admin-customerr.onrender.com/api/notifications/mark-all-read', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    loadNotifications();
                }
            } catch (error) {
                console.error('❌ Xatolik:', error);
            }
        });
    }

    async function loadNotifications() {
        try {
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;

            const response = await fetch('https://admin-customerr.onrender.com/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('📨 Xabarlar:', data);

            if (response.ok && data.success) {
                const notifications = data.data || [];
                renderNotifications(notifications);
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
            notificationList.innerHTML = `<p class="text-muted" style="text-align: center; padding: 20px 0; font-size: 0.85rem;">Hozircha xabarlar yo'q</p>`;
            return;
        }

        notificationList.innerHTML = notifications.map(notif => {
            const date = new Date(notif.createdAt);
            const timeStr = date.toLocaleString('uz-UZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const isRead = notif.isRead || false;

            return `
                <div class="notification-item" style="padding: 10px 12px; border-bottom: 1px solid var(--border-color); ${!isRead ? 'background: var(--bg-hover); border-left: 3px solid #007aff;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <div style="flex: 1; min-width: 0;">
                            <strong style="font-size: 0.85rem; color: var(--text-primary); display: block; word-wrap: break-word;">${notif.title || 'Xabar'}</strong>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 4px 0; word-wrap: break-word;">${notif.message || ''}</p>
                            <span style="font-size: 0.7rem; color: var(--text-muted);">${timeStr}</span>
                        </div>
                        ${!isRead ? `
                            <button class="mark-read-btn" data-id="${notif._id}" style="background: none; border: none; color: #007aff; font-size: 0.7rem; cursor: pointer; white-space: nowrap; padding: 4px 8px;">
                                O'qildi
                            </button>
                        ` : `
                            <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; padding: 4px 8px;">✓ O'qilgan</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');

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
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;

            const response = await fetch(`https://admin-customerr.onrender.com/api/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadNotifications();
            }
        } catch (error) {
            console.error('❌ Xatolik:', error);
        }
    }

    setInterval(() => {
        if (notificationPanel && notificationPanel.style.display === 'block') {
            loadNotifications();
        }
    }, 30000);
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });
    }
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

console.log('✅ dashboard.js yuklandi');
