// ============================================================
// NOTIFICATIONS - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
// ============================================================

let allNotifications = [];
let currentFilter = 'all';
let refreshInterval = null;

// ============================================================
// SAHIFA YUKLANGANDA
// ============================================================
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
        setupListeners();

        refreshInterval = setInterval(() => {
            loadNotifications();
        }, 30000);

        console.log('✅ Notifications sahifasi yuklandi!');
    } catch (error) {
        console.error('❌ Notifications yuklash xatosi:', error);
        showError('Notifications yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// XABARLARNI YUKLASH
// ============================================================
async function loadNotifications() {
    try {
        const token = Auth.getToken();
        if (!token) return;

        const response = await API.getNotifications();
        console.log('📨 Xabarlar javobi:', response);

        if (response.success) {
            allNotifications = response.data || [];
            renderNotifications(allNotifications);
        } else {
            showError('Xabarlar yuklanmadi: ' + (response.message || 'Noma\'lum xatolik'));
        }
    } catch (error) {
        console.error('❌ Xabarlarni yuklash xatosi:', error);
        showError('Xatolik yuz berdi: ' + error.message);
    }
}

// ============================================================
// XABARLARNI KO'RSATISH (FAQAT O'ZIGA KELGANLAR)
// ============================================================
function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    const user = Auth.getUser();
    const userId = user?._id;

    console.log('👤 Current userId:', userId);
    console.log('📨 Barcha xabarlar:', notifications);

    // ⭐ FAQAT O'ZIGA KELGAN XABARLAR - TO'G'RI FILTR
    let filtered = notifications.filter(n => {
        // recipientId ni string ga aylantirib solishtirish
        const recipientIdStr = n.recipientId ? String(n.recipientId) : null;
        const userIdStr = userId ? String(userId) : null;
        
        // Agar recipientId mavjud bo'lsa va u user ID ga teng bo'lsa
        if (recipientIdStr && userIdStr) {
            const isMatch = recipientIdStr === userIdStr;
            if (isMatch) {
                console.log('✅ O\'z xabari:', n.title);
            }
            return isMatch;
        }
        
        // Agar recipientId bo'lmasa, recipientRole bo'yicha tekshirish
        const isRoleMatch = n.recipientRole === 'all' || n.recipientRole === 'admin_customer';
        if (isRoleMatch) {
            console.log('✅ Role bo\'yicha xabar:', n.title);
        }
        return isRoleMatch;
    });

    console.log('📨 Filtrdan keyin:', filtered);

    // ⭐ FILTRLASH
    const filteredByDate = filterByDate(filtered, currentFilter);

    if (!filteredByDate || filteredByDate.length === 0) {
        const filterLabels = {
            'all': 'Hozircha xabarlar yo\'q',
            'today': 'Bugun xabarlar yo\'q',
            'week': 'Shu hafta xabarlar yo\'q',
            'month': 'Shu oy xabarlar yo\'q',
            'unread': 'O\'qilmagan xabarlar yo\'q',
            'read': 'O\'qilgan xabarlar yo\'q'
        };
        container.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>${filterLabels[currentFilter] || 'Xabarlar yo\'q'}</p>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">Sizga yuborilgan xabarlar shu yerda ko\'rinadi</p>
            </div>
        `;
        return;
    }

    // ⭐ Xabarlarni sana bo'yicha guruhlash
    const grouped = {};
    filteredByDate.forEach(notif => {
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
            <div style="margin-bottom:16px;">
                <div style="padding:6px 0;font-size:0.78rem;font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border-color);margin-bottom:8px;display:flex;align-items:center;gap:8px;">
                    <i class="fas fa-calendar"></i> ${dateKey}
                    <span style="font-size:0.65rem;font-weight:400;color:var(--text-muted);margin-left:8px;">
                        ${grouped[dateKey].length} ta xabar
                    </span>
                </div>
        `;

        grouped[dateKey].forEach(notif => {
            const isUnread = !notif.isRead;
            const sentByName = notif.sentByName || 'Admin';
            const formattedDate = formatDateTime(notif.createdAt);
            const isSentByMe = notif.sentBy === user?._id;

            html += `
                <div class="notification-item ${isUnread ? 'unread' : ''}">
                    <div class="notification-body">
                        <span class="notification-title">${notif.title || 'Xabar'}</span>
                        <div class="notification-message-wrapper">
                            <p class="notification-message">${notif.message || ''}</p>
                        </div>
                        <div class="notification-meta">
                            <span><i class="fas fa-user"></i> ${isSentByMe ? '✉️ Yuborgan: Men' : '✉️ Yuborgan: ' + sentByName}</span>
                            <span><i class="fas fa-clock"></i> ${formattedDate}</span>
                            <span><i class="fas fa-circle" style="color: ${isUnread ? '#007aff' : '#34c759'}; font-size: 0.5rem;"></i> ${isUnread ? 'O\'qilmagan' : 'O\'qilgan'}</span>
                        </div>
                    </div>
                    <div class="notification-actions">
                        ${isUnread ? `
                            <button class="btn-read" data-id="${notif._id}">
                                <i class="fas fa-check"></i> O'qildi
                            </button>
                        ` : `
                            <span class="read-label">✓ O'qilgan</span>
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
        btn.addEventListener('click', async function() {
            const id = this.dataset.id;
            await markAsRead(id);
        });
    });
}

// ============================================================
// KUN BO'YICHA FILTRLASH
// ============================================================
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

// ============================================================
// XABARNI O'QILGAN DEB BELGILASH
// ============================================================
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

// ============================================================
// BARCHA XABARLARNI O'QILGAN DEB BELGILASH
// ============================================================
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
// FILTER TUGMALARI
// ============================================================
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
// EVENT LISTENERLAR
// ============================================================
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

    // Filter
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    });

    // Refresh
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadNotifications();
            showSuccess('Yangilandi!');
        });
    }

    // Mark all as read
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (document.referrer && document.referrer.includes(window.location.host)) {
                window.history.back();
            } else {
                window.location.href = 'dashboard.html';
            }
        });
    }
}

// ============================================================
// XATOLIK VA MUVAFFAQIYAT XABARLARI
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

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
});

console.log('✅ notifications.js yuklandi (Admin-Customer)');
