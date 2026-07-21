// ============================================================
// DASHBOARD - ADMIN CUSTOMER (TO'LIQ TUZATILGAN)
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

        // LOGOUT TUGMASI
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            newLogoutBtn.addEventListener('click', function (e) {
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

        // ⭐ BROWSER NOTIFICATION RUXSAT SO'RASH
        await requestNotificationPermission();

        // NOTIFICATIONS
        initNotifications();

        console.log('✅ Dashboard yuklandi!');
    } catch (error) {
        console.error('❌ Dashboard yuklash xatosi:', error);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// ⭐ BROWSER NOTIFICATION RUXSAT SO'RASH
// ============================================================
async function requestNotificationPermission() {
    // Browser notification qo'llab-quvvatlanishini tekshirish
    if (!('Notification' in window)) {
        console.log('⚠️ Bu brauzer bildirishnomalarni qo\'llab-quvvatlamaydi');
        return false;
    }

    if (Notification.permission === 'granted') {
        console.log('✅ Bildirishnoma ruxsati allaqachon berilgan');
        // Service Worker ro'yxatdan o'tkazish (telefon o'chiq paytda ham ishlash uchun)
        await registerServiceWorker();
        return true;
    }

    if (Notification.permission === 'denied') {
        console.log('❌ Bildirishnoma ruxsati rad etilgan');
        return false;
    }

    // Ruxsat so'rash - foydalanuvchiga tushuntirish
    const userWants = confirm(
        '🔔 Bildirishnomalar\n\n' +
        'Yangi xabarlar va muhim bildirishnomalar olish uchun ruxsat bering.\n\n' +
        '"OK" tugmasini bosing va keyin "Allow/Ruxsat berish" ni tanlang.'
    );

    if (!userWants) {
        console.log('ℹ️ Foydalanuvchi bildirishnomadan voz kechdi');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        console.log('📢 Notification permission:', permission);

        if (permission === 'granted') {
            console.log('✅ Bildirishnoma ruxsati berildi!');
            // Test notification yuborish
            showBrowserNotification('✅ Muvaffaqiyatli!', 'Bildirishnomalar yoqildi. Endi yangi xabarlarni olasiz.');
            // Service Worker ro'yxatdan o'tkazish
            await registerServiceWorker();
            return true;
        } else {
            console.log('❌ Bildirishnoma ruxsati berilmadi');
            return false;
        }
    } catch (error) {
        console.error('❌ Notification permission xatosi:', error);
        return false;
    }
}

// ============================================================
// ⭐ SERVICE WORKER - TELEFON O'CHIQ PAYTDA HAM ISHLASH UCHUN
// ============================================================
async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('⚠️ Service Worker qo\'llab-quvvatlanmaydi');
        return;
    }

    try {
        // sw.js faylini tekshirish
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker ro\'yxatdan o\'tdi:', reg.scope);

        // Push subscription
        if ('PushManager' in window) {
            try {
                const subscription = await reg.pushManager.getSubscription();
                if (!subscription) {
                    console.log('ℹ️ Push subscription yo\'q, hozircha polling ishlatiladi');
                }
            } catch (pushError) {
                console.log('ℹ️ Push Manager:', pushError.message);
            }
        }
    } catch (error) {
        console.log('ℹ️ Service Worker:', error.message, '(sw.js fayli bo\'lmasa normal)');
    }
}

// ============================================================
// ⭐ BROWSER NOTIFICATION KO'RSATISH
// ============================================================
function showBrowserNotification(title, body, icon = '/favicon.ico') {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            badge: icon,
            tag: 'admin-customer-notif',
            renotify: true,
            requireInteraction: false,
            silent: false
        });

        notification.onclick = function () {
            window.focus();
            notification.close();
        };

        setTimeout(() => notification.close(), 8000);
    } catch (error) {
        console.error('❌ Browser notification xatosi:', error);
    }
}

// ============================================================
// FORMAT DATE FUNCTION
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
            endEl.textContent = formatDate(sub.endDate);
        } else {
            endEl.textContent = 'Muddati yo\'q';
        }
    }

    if (!sub.endDate) {
        daysEl.textContent = '-';
        return;
    }

    const endDate = new Date(sub.endDate);
    if (isNaN(endDate.getTime())) {
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
            if (elements.subscriptionEnd) {
                if (sub.formattedEndDate) {
                    elements.subscriptionEnd.textContent = sub.formattedEndDate;
                } else if (sub.endDate) {
                    elements.subscriptionEnd.textContent = formatDate(sub.endDate);
                } else {
                    elements.subscriptionEnd.textContent = 'Muddati yo\'q';
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
// ⭐ NOTIFICATIONS - TO'LIQ TUZATILGAN
// ============================================================
function initNotifications() {
    const notificationToggle = document.getElementById('notificationToggle');
    const notificationPanel = document.getElementById('notificationPanel');
    const notificationList = document.getElementById('notificationList');
    const notificationBadge = document.getElementById('notificationBadge');
    const markAllRead = document.getElementById('markAllRead');

    if (!notificationToggle || !notificationPanel) {
        console.log('⚠️ Notification elementlari topilmadi');
        return;
    }

    let panelOpen = false;

    // ⭐ TOGGLE - style.display o'rniga classList ishlatamiz
    notificationToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        panelOpen = !panelOpen;
        if (panelOpen) {
            notificationPanel.style.display = 'block';
            notificationPanel.style.opacity = '1';
            loadNotifications();
        } else {
            notificationPanel.style.display = 'none';
        }
    });

    // ⭐ TASHQARIDA BOSISHDA YOPISH
    document.addEventListener('click', function (e) {
        if (!notificationPanel.contains(e.target) && e.target !== notificationToggle && !notificationToggle.contains(e.target)) {
            panelOpen = false;
            notificationPanel.style.display = 'none';
        }
    });

    // HAMMASINI O'QILGAN DEB BELGILASH
    if (markAllRead) {
        markAllRead.addEventListener('click', async function (e) {
            e.stopPropagation();
            try {
                const token = Auth.getToken();
                if (!token) return;
                const response = await fetch(`${API.baseURL}/api/notifications/mark-all-read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) await loadNotifications();
            } catch (error) {
                console.error('❌ Xatolik:', error);
            }
        });
    }

    // ⭐ HAR 30 SONIYADA YANGILASH VA BROWSER NOTIFICATION
    let lastNotifCount = 0;
    setInterval(async () => {
        const token = Auth.getToken();
        if (!token) return;
        try {
            const response = await fetch(`${API.baseURL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                const unread = (data.data || []).filter(n => !n.isRead).length;
                // ⭐ Yangi xabar kelganida browser notification
                if (unread > lastNotifCount && lastNotifCount !== 0) {
                    showBrowserNotification(
                        '🔔 Yangi xabar!',
                        `${unread - lastNotifCount} ta yangi bildirishnoma bor`
                    );
                }
                lastNotifCount = unread;
                // Badge yangilash
                if (notificationBadge) {
                    if (unread > 0) {
                        notificationBadge.style.display = 'block';
                        notificationBadge.textContent = unread > 99 ? '99+' : unread;
                    } else {
                        notificationBadge.style.display = 'none';
                    }
                }
                // Panel ochiq bo'lsa ro'yxatni yangilash
                if (panelOpen) {
                    renderNotifications(data.data || []);
                }
            }
        } catch (error) {
            console.error('❌ Notification check xatosi:', error);
        }
    }, 30000);

    // Birinchi yuklash
    loadNotifications();

    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================
    async function loadNotifications() {
        try {
            const token = Auth.getToken();
            if (!token) return;

            const response = await fetch(`${API.baseURL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            console.log('📨 Xabarlar:', data);

            if (response.ok && data.success) {
                renderNotifications(data.data || []);
            } else {
                if (notificationList) {
                    notificationList.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px 0;font-size:0.85rem;">Xabarlar yuklanmadi</p>`;
                }
            }
        } catch (error) {
            console.error('❌ Xabarlarni yuklash xatosi:', error);
            if (notificationList) {
                notificationList.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px 0;font-size:0.85rem;">Xatolik yuz berdi</p>`;
            }
        }
    }

    // ============================================================
    // RENDER NOTIFICATIONS
    // ============================================================
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
                <div class="notif-empty" style="text-align:center;padding:30px 0;">
                    <i class="fas fa-bell-slash" style="font-size:2rem;opacity:0.3;display:block;margin-bottom:10px;"></i>
                    <p style="color:var(--text-muted);font-size:0.85rem;">Hozircha xabarlar yo'q</p>
                </div>
            `;
            return;
        }

        // SANALAR BO'YICHA GURUHLASH
        const grouped = {};
        notifications.forEach(notif => {
            const date = new Date(notif.createdAt);
            const dateKey = date.toLocaleDateString('uz-UZ', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(notif);
        });

        let html = '';
        Object.keys(grouped).forEach(dateKey => {
            const items = grouped[dateKey];
            html += `<div style="padding:4px 0;font-size:0.7rem;color:var(--text-muted);font-weight:600;">${dateKey}</div>`;
            items.forEach(notif => {
                const time = new Date(notif.createdAt).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit', minute: '2-digit'
                });
                const isUnread = !notif.isRead;
                html += `
                    <div class="notification-item ${isUnread ? 'unread' : ''}" style="padding:10px 0;border-bottom:1px solid var(--border-color);${isUnread ? 'border-left:3px solid #007aff;padding-left:8px;' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                            <div style="flex:1;min-width:0;">
                                <strong style="font-size:0.85rem;color:var(--text-primary);display:block;">${notif.title || 'Xabar'}</strong>
                                <p style="font-size:0.8rem;color:var(--text-secondary);margin:4px 0;white-space:pre-wrap;word-break:break-word;">${notif.message || ''}</p>
                                <span style="font-size:0.7rem;color:var(--text-muted);"><i class="fas fa-clock"></i> ${time}</span>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
                                ${isUnread ? `
                                    <button class="mark-read-btn" data-id="${notif._id}"
                                        style="background:none;border:1px solid #007aff;color:#007aff;font-size:0.65rem;cursor:pointer;padding:3px 8px;border-radius:5px;">
                                        O'qildi
                                    </button>
                                ` : `<span style="font-size:0.65rem;color:var(--text-muted);">✓</span>`}
                                <button class="delete-notif-btn" data-id="${notif._id}"
                                    style="background:none;border:1px solid #ff3b30;color:#ff3b30;font-size:0.65rem;cursor:pointer;padding:3px 8px;border-radius:5px;"
                                    title="O'chirish">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        });

        notificationList.innerHTML = html;

        // O'qildi tugmalari
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async function (e) {
                e.stopPropagation();
                await markAsRead(this.dataset.id);
            });
        });

        // ⭐ DELETE tugmalari
        document.querySelectorAll('.delete-notif-btn').forEach(btn => {
            btn.addEventListener('click', async function (e) {
                e.stopPropagation();
                await deleteNotification(this.dataset.id);
            });
        });
    }

    // ============================================================
    // MARK AS READ
    // ============================================================
    async function markAsRead(id) {
        try {
            const token = Auth.getToken();
            if (!token) return;
            const response = await fetch(`${API.baseURL}/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) await loadNotifications();
        } catch (error) {
            console.error('❌ Xatolik:', error);
        }
    }

    // ============================================================
    // ⭐ DELETE NOTIFICATION - Admin Customer
    // ============================================================
    async function deleteNotification(id) {
        // Admin Customer o'z xabarini o'chira olmaydi serverda
        // Shuning uchun localda yashiramiz
        try {
            const token = Auth.getToken();
            if (!token) return;

            // Avval serverda o'chirishga urinish
            const response = await fetch(`${API.baseURL}/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                console.log('✅ Xabar o\'chirildi (server)');
            } else {
                // Server o'chirmasа - local yashirish
                console.log('ℹ️ Serverdan o\'chirilmadi, localda yashirildi');
                const hidden = JSON.parse(localStorage.getItem('hiddenNotifs') || '[]');
                if (!hidden.includes(id)) hidden.push(id);
                localStorage.setItem('hiddenNotifs', JSON.stringify(hidden));
            }
            await loadNotifications();
        } catch (error) {
            console.error('❌ Delete xatosi:', error);
            // Xato bo'lsa ham localda yashirish
            const hidden = JSON.parse(localStorage.getItem('hiddenNotifs') || '[]');
            if (!hidden.includes(id)) hidden.push(id);
            localStorage.setItem('hiddenNotifs', JSON.stringify(hidden));
            await loadNotifications();
        }
    }
}

// ============================================================
// SHOW ERROR
// ============================================================
function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    const div = document.createElement('div');
    div.style.cssText = `
        position:fixed;top:20px;right:20px;z-index:10000;
        padding:14px 18px;background:#fef2f2;
        border:1px solid #fecaca;border-radius:10px;
        color:#dc2626;max-width:400px;
        box-shadow:0 10px 40px rgba(0,0,0,0.1);
        display:flex;align-items:center;gap:10px;font-size:0.85rem;
    `;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 8000);
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function () {
    if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
});

console.log('✅ dashboard.js yuklandi');
