// ============================================================
// NOTIFICATIONS - ADMIN CUSTOMER (TO'LIQ)
// ============================================================

let allNotifications = [];
let currentFilter = 'all';
let refreshInterval = null;

// ⭐ NOTIFICATION PERMISSION SO'RASH
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('❌ Bu brauzer Notification API ni qo\'llab-quvvatlamaydi');
        return;
    }
    
    if (Notification.permission === 'granted') {
        console.log('✅ Notification ruxsati allaqachon berilgan');
        return;
    }
    
    if (Notification.permission === 'denied') {
        console.log('⚠️ Notification ruxsati rad etilgan');
        return;
    }
    
    // ⭐ RUXSAT SO'RASH
    try {
        const permission = await Notification.requestPermission();
        console.log('📨 Notification ruxsati:', permission);
        return permission === 'granted';
    } catch (error) {
        console.error('❌ Notification ruxsati xatosi:', error);
        return false;
    }
}

// ⭐ XABAR KELGANDA PUSH NOTIFICATION YUBORISH
function sendPushNotification(title, message, data = {}) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    
    try {
        const options = {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            data: data,
            requireInteraction: true
        };
        
        const notification = new Notification(title || 'Yangi xabar', options);
        notification.onclick = function() {
            window.focus();
            if (data.url) {
                window.location.href = data.url;
            }
            notification.close();
        };
        
        setTimeout(() => {
            notification.close();
        }, 30000);
        
        console.log('🔔 Push notification yuborildi:', title);
    } catch (error) {
        console.error('❌ Push notification xatosi:', error);
    }
}

// ⭐ TOSHKENT VAQTI BILAN SANANI FORMATLASH
function formatDateTimeTashkent(date) {
    if (!date) return 'Noma\'lum vaqt';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Noma\'lum vaqt';
        
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
        
        const formatter = new Intl.DateTimeFormat('uz-UZ', options);
        const parts = formatter.formatToParts(d);
        
        const dateObj = {};
        parts.forEach(part => {
            dateObj[part.type] = part.value;
        });
        
        const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
        const monthNum = parseInt(dateObj.month);
        const monthName = monthNames[monthNum - 1] || monthNum;
        
        return `${dateObj.day} ${monthName} ${dateObj.year}, ${dateObj.hour}:${dateObj.minute}:${dateObj.second}`;
    } catch (error) {
        return 'Noma\'lum vaqt';
    }
}

// ⭐ KUN BO'YICHA FILTRLASH
function filterByDate(notifications, filter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return notifications.filter(notif => {
        const notifDate = new Date(notif.createdAt);
        
        switch (filter) {
            case 'today':
                return notifDate >= today;
            case 'week':
                return notifDate >= weekAgo;
            case 'month':
                return notifDate >= monthAgo;
            case 'unread':
                return !notif.isRead;
            case 'read':
                return notif.isRead;
            case 'all':
            default:
                return true;
        }
    });
}

// ⭐ XABARLARNI YUKLASH
async function loadNotifications() {
    try {
        const token = Auth.getToken();
        if (!token) return;

        const response = await API.getNotifications();
        console.log('📨 Xabarlar javobi:', response);

        if (response.success) {
            const oldCount = allNotifications.filter(n => !n.isRead).length;
            allNotifications = response.data || [];
            renderNotifications(allNotifications);
            
            // ⭐ YANGI XABAR KELGANMI TEKSHIRISH
            const newCount = allNotifications.filter(n => !n.isRead).length;
            if (newCount > oldCount) {
                const newNotifications = allNotifications.filter(n => !n.isRead);
                const latest = newNotifications[0];
                if (latest) {
                    sendPushNotification(latest.title || 'Yangi xabar', latest.message || '', {
                        url: '/notifications.html'
                    });
                }
            }
        } else {
            showError('Xabarlar yuklanmadi: ' + (response.message || 'Noma\'lum xatolik'));
        }
    } catch (error) {
        console.error('❌ Xabarlarni yuklash xatosi:', error);
        showError('Xatolik yuz berdi: ' + error.message);
    }
}

// ⭐ XABARLARNI KO'RSATISH
function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    const filtered = filterByDate(notifications, currentFilter);

    if (!filtered || filtered.length === 0) {
        const filterLabels = {
            'all': 'Hozircha xabarlar yo\'q',
            'today': 'Bugun xabarlar yo\'q',
            'week': 'Shu hafta xabarlar yo\'q',
            'month': 'Shu oy xabarlar yo\'q',
            'unread': 'O\'qilmagan xabarlar yo\'q',
            'read': 'O\'qilgan xabarlar yo\'q'
        };
        container.innerHTML = `
            <div class="notif-empty" style="text-align: center; padding: 40px 0;">
                <i class="fas fa-bell-slash" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                <p style="color: var(--text-muted); font-size: 1rem;">${filterLabels[currentFilter] || 'Xabarlar yo\'q'}</p>
                <p class="sub-text" style="color: var(--text-muted); font-size: 0.85rem;">Sizga yuborilgan xabarlar shu yerda ko\'rinadi</p>
            </div>
        `;
        return;
    }

    // ⭐ Xabarlarni sana bo'yicha guruhlash
    const grouped = {};
    filtered.forEach(notif => {
        const date = new Date(notif.createdAt);
        const dateKey = date.toLocaleDateString('uz-UZ', {
            timeZone: 'Asia/Tashkent',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(notif);
    });

    let html = '';
    Object.keys(grouped).forEach(dateKey => {
        html += `
            <div class="notification-date-group" style="margin-bottom: 16px;">
                <div class="date-header" style="padding: 8px 0; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; border-bottom: 2px solid var(--border-color); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-calendar"></i> ${dateKey}
                    <span style="font-size: 0.65rem; font-weight: 400; color: var(--text-muted); margin-left: 8px;">
                        ${grouped[dateKey].length} ta xabar
                    </span>
                </div>
        `;

        grouped[dateKey].forEach(notif => {
            const isUnread = !notif.isRead;
            const sentByName = notif.sentByName || 'Admin';
            const formattedDate = formatDateTimeTashkent(notif.createdAt);

            html += `
                <div class="notification-item ${isUnread ? 'unread' : ''}" style="padding: 14px 18px; border-bottom: 1px solid var(--border-color); transition: background 0.2s ease; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; ${isUnread ? 'background: var(--bg-hover); border-left: 4px solid #007aff;' : ''}">
                    <div class="notification-body" style="flex: 1; min-width: 0;">
                        <span class="notification-title" style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary); display: block; margin-bottom: 4px;">${notif.title || 'Xabar'}</span>
                        <p class="notification-message" style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 8px 0; word-break: break-word; white-space: pre-wrap; line-height: 1.5; max-height: 100px; overflow-y: auto;">${notif.message || ''}</p>
                        <div class="notification-meta" style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.7rem; color: var(--text-muted);">
                            <span><i class="fas fa-user"></i> ✉️ Yuborgan: ${sentByName}</span>
                            <span><i class="fas fa-clock"></i> ${formattedDate}</span>
                            <span><i class="fas fa-circle" style="color: ${isUnread ? '#007aff' : '#34c759'}; font-size: 0.5rem;"></i> ${isUnread ? 'O\'qilmagan' : 'O\'qilgan'}</span>
                        </div>
                    </div>
                    <div class="notification-actions" style="display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; align-items: center;">
                        ${isUnread ? `
                            <button class="btn-read" data-id="${notif._id}" style="background: none; border: 1px solid #007aff; color: #007aff; font-size: 0.68rem; cursor: pointer; padding: 4px 12px; border-radius: 6px; transition: all 0.3s ease;">
                                <i class="fas fa-check"></i> O'qildi
                            </button>
                        ` : `
                            <span class="read-label" style="font-size: 0.68rem; color: var(--text-muted);">✓ O'qilgan</span>
                        `}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;

    // ⭐ O'qilgan deb belgilash
    document.querySelectorAll('.btn-read').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            await markAsRead(id);
        });
    });
}

// ⭐ XABARNI O'QILGAN DEB BELGILASH
async function markAsRead(id) {
    try {
        const response = await API.markNotificationRead(id);
        if (response.success) {
            showSuccess('Xabar o\'qilgan deb belgilandi!');
            await loadNotifications();
        } else {
            showError(response.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError('Xabarni o\'qilgan deb belgilashda xatolik!');
    }
}

// ⭐ BARCHA XABARLARNI O'QILGAN DEB BELGILASH
async function markAllAsRead() {
    try {
        const response = await API.markAllNotificationsRead();
        if (response.success) {
            showSuccess('Barcha xabarlar o\'qilgan deb belgilandi!');
            await loadNotifications();
        } else {
            showError(response.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError('Xatolik yuz berdi: ' + error.message);
    }
}

// ⭐ FILTER TUGMALARI
function updateFilterButtons() {
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.classList.remove('active');
        const filter = btn.dataset.filter;
        if (filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// ⭐ EVENT LISTENERLAR
function setupListeners() {
    // Logout
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

    // Filter - Barchasi
    const filterAll = document.getElementById('filterAll');
    if (filterAll) {
        filterAll.addEventListener('click', function() {
            currentFilter = 'all';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // Filter - Bugun
    const filterToday = document.getElementById('filterToday');
    if (filterToday) {
        filterToday.addEventListener('click', function() {
            currentFilter = 'today';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // Filter - Shu hafta
    const filterWeek = document.getElementById('filterWeek');
    if (filterWeek) {
        filterWeek.addEventListener('click', function() {
            currentFilter = 'week';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // Filter - Shu oy
    const filterMonth = document.getElementById('filterMonth');
    if (filterMonth) {
        filterMonth.addEventListener('click', function() {
            currentFilter = 'month';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // Filter - O'qilmagan
    const filterUnread = document.getElementById('filterUnread');
    if (filterUnread) {
        filterUnread.addEventListener('click', function() {
            currentFilter = 'unread';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // Filter - O'qilgan
    const filterRead = document.getElementById('filterRead');
    if (filterRead) {
        filterRead.addEventListener('click', function() {
            currentFilter = 'read';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // Mark all as read
    const markAllRead = document.getElementById('markAllRead');
    if (markAllRead) {
        markAllRead.addEventListener('click', markAllAsRead);
    }

    // Refresh
    const refreshBtn = document.getElementById('refreshNotifications');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadNotifications();
            showSuccess('Yangilandi!');
        });
    }

    // Sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const isSidebar = sidebar.contains(e.target);
                const isToggle = menuToggle.contains(e.target);
                if (!isSidebar && !isToggle) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
}

// ⭐ XATOLIK VA MUVAFFAQIYAT XABARLARI
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
    setTimeout(() => div.remove(), 6000);
}

function showSuccess(msg) {
    console.log('✅ Muvaffaqiyat:', msg);
    
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        padding: 14px 18px; background: #ecfdf5;
        border: 1px solid #a7f3d0; border-radius: 10px;
        color: #065f46; max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex; align-items: center; gap: 10px;
        font-size: 0.85rem;
        z-index: 10000;
    `;
    div.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #065f46; cursor: pointer; font-size: 1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// ⭐ SAHIFA YUKLANGANDA
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Notifications sahifasi yuklanmoqda... (Admin Customer)');

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
            if (nameEl) nameEl.textContent = Auth.getUserName();
            if (initialEl) initialEl.textContent = Auth.getUserInitial();
        }

        // ⭐ NOTIFICATION RUXSAT SO'RASH
        await requestNotificationPermission();

        await loadNotifications();

        refreshInterval = setInterval(() => {
            loadNotifications();
        }, 5000); // ⭐ 5 soniyada yangilash

        setupListeners();

        console.log('✅ Notifications sahifasi yuklandi! (Admin Customer)');
    } catch (error) {
        console.error('❌ Notifications yuklash xatosi:', error);
        showError('Notifications yuklashda xatolik: ' + error.message);
    }
});

// ⭐ CLEANUP
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
});

console.log('✅ notifications.js yuklandi (Admin Customer)');
