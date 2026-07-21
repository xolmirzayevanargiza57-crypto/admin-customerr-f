// ============================================================
// NOTIFICATIONS - ADMIN CUSTOMER (TO'LIQ)
// ============================================================

let allNotifications = [];
let currentFilter = 'all';
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Notifications sahifasi yuklanmoqda...');

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

        await loadNotifications();

        // HAR 30 SONIYADA YANGILASH
        refreshInterval = setInterval(() => {
            loadNotifications();
        }, 30000);

        setupListeners();

        console.log('✅ Notifications sahifasi yuklandi!');
    } catch (error) {
        console.error('❌ Notifications yuklash xatosi:', error);
        showError('Notifications yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// FORMAT DATE
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
// LOAD NOTIFICATIONS
// ============================================================
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
            allNotifications = data.data || [];
            renderNotifications(allNotifications);
        } else {
            showError('Xabarlar yuklanmadi');
        }
    } catch (error) {
        console.error('❌ Xabarlarni yuklash xatosi:', error);
        showError('Xatolik yuz berdi');
    }
}

// ============================================================
// RENDER NOTIFICATIONS
// ============================================================
function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    // FILTER
    let filtered = notifications;
    if (currentFilter === 'unread') {
        filtered = notifications.filter(n => !n.isRead);
    } else if (currentFilter === 'read') {
        filtered = notifications.filter(n => n.isRead);
    }

    if (!filtered || filtered.length === 0) {
        container.innerHTML = `
            <div class="notif-empty" style="text-align: center; padding: 60px 0;">
                <i class="fas fa-bell-slash" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
                <p style="color: var(--text-muted); font-size: 1rem;">Hozircha xabarlar yo'q</p>
                <p style="color: var(--text-muted); font-size: 0.85rem;">Sizga yuborilgan xabarlar shu yerda ko'rinadi</p>
            </div>
        `;
        return;
    }

    // SANALAR BO'YICHA GURUHLASH
    const grouped = {};
    filtered.forEach(notif => {
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
        html += `
            <div class="notification-date-group" style="margin-bottom: 12px;">
                <div style="padding: 6px 0; font-size: 0.75rem; color: var(--text-muted); font-weight: 600; border-bottom: 1px solid var(--border-color); margin-bottom: 8px;">
                    <i class="fas fa-calendar"></i> ${dateKey}
                </div>
        `;

        grouped[dateKey].forEach(notif => {
            const time = new Date(notif.createdAt).toLocaleTimeString('uz-UZ', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const isUnread = !notif.isRead;
            const formattedDate = formatDate(notif.createdAt);
            const sender = notif.sentByName || 'Admin';

            html += `
                <div class="notification-item ${isUnread ? 'unread' : ''}" style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); ${isUnread ? 'background: var(--bg-hover); border-left: 3px solid #007aff;' : ''}">
                    <div class="notification-item-inner" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                        <div class="notification-body" style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <strong class="notification-title" style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">${notif.title || 'Xabar'}</strong>
                                <span style="font-size: 0.65rem; color: var(--text-muted); background: var(--bg-hover); padding: 2px 8px; border-radius: 10px;">${sender}</span>
                            </div>
                            <p class="notification-message" style="font-size: 0.85rem; color: var(--text-secondary); margin: 6px 0; word-break: break-word; white-space: pre-wrap; line-height: 1.5;">${notif.message || ''}</p>
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <span class="notification-time" style="font-size: 0.7rem; color: var(--text-muted);"><i class="fas fa-clock"></i> ${time}</span>
                                <span class="notification-time" style="font-size: 0.7rem; color: var(--text-muted);"><i class="fas fa-calendar"></i> ${formattedDate}</span>
                                ${notif.recipientName ? `<span style="font-size: 0.65rem; color: var(--text-muted);"><i class="fas fa-user"></i> ${notif.recipientName}</span>` : ''}
                            </div>
                        </div>
                        ${isUnread ? `
                            <button class="mark-read-btn" data-id="${notif._id}" style="background: none; border: 1px solid #007aff; color: #007aff; font-size: 0.7rem; cursor: pointer; padding: 4px 12px; border-radius: 6px; flex-shrink: 0; transition: all 0.3s ease;">
                                O'qildi
                            </button>
                        ` : `
                            <span class="notif-read-label" style="font-size: 0.7rem; color: var(--text-muted); flex-shrink: 0; padding: 4px 0;">✓ O'qilgan</span>
                        `}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;

    // O'qilgan deb belgilash
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            await markAsRead(id);
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

        const response = await fetch(`https://admin-customerr.onrender.com/api/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadNotifications();
            showSuccess('Xabar o\'qilgan deb belgilandi');
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError('Xatolik yuz berdi');
    }
}

// ============================================================
// MARK ALL AS READ
// ============================================================
async function markAllAsRead() {
    try {
        const token = Auth.getToken();
        if (!token) return;

        const response = await fetch('https://admin-customerr.onrender.com/api/notifications/mark-all-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadNotifications();
            showSuccess('Barcha xabarlar o\'qilgan deb belgilandi');
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError('Xatolik yuz berdi');
    }
}

// ============================================================
// SETUP LISTENERS
// ============================================================
function setupListeners() {
    // LOGOUT
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

    // FILTER - Barchasi
    const filterAll = document.getElementById('filterAll');
    if (filterAll) {
        filterAll.addEventListener('click', function() {
            currentFilter = 'all';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // FILTER - O'qilmagan
    const filterUnread = document.getElementById('filterUnread');
    if (filterUnread) {
        filterUnread.addEventListener('click', function() {
            currentFilter = 'unread';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // FILTER - O'qilgan
    const filterRead = document.getElementById('filterRead');
    if (filterRead) {
        filterRead.addEventListener('click', function() {
            currentFilter = 'read';
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    }

    // MARK ALL READ
    const markAllRead = document.getElementById('markAllRead');
    if (markAllRead) {
        markAllRead.addEventListener('click', markAllAsRead);
    }

    // REFRESH
    const refreshBtn = document.getElementById('refreshNotifications');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadNotifications();
            showSuccess('Yangilandi');
        });
    }

    // SIDEBAR TOGGLE
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
}

function updateFilterButtons() {
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.classList.remove('active');
        const filter = btn.dataset.filter;
        if (filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// ============================================================
// SHOW MESSAGES
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
    setTimeout(() => div.remove(), 6000);
}

function showSuccess(msg) {
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

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
});

console.log('✅ notifications.js yuklandi');
