// ============================================================
// NOTIFICATIONS - Admin Customer (TO'LIQ)
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
// ⭐ TOSHKENT VAQTI BILAN SANANI FORMATLASH (sekundigacha)
// ============================================================
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

// ============================================================
// ⭐ KUN BO'YICHA FILTRLASH
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
// ⭐ XABARLARNI YUKLASH
// ============================================================
async function loadNotifications() {
    try {
        const token = Auth.getToken();
        if (!token) return;

        const response = await API.get('/notifications');
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
// ⭐ XABARLARNI KO'RSATISH
// ============================================================
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
            <div class="notif-empty">
                <i class="fas fa-bell-slash"></i>
                <p>${filterLabels[currentFilter] || 'Xabarlar yo\'q'}</p>
                <p class="sub-text">Sizga yuborilgan xabarlar shu yerda ko\'rinadi</p>
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
            <div class="notification-date-group">
                <div class="date-header">
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
                <div class="notification-item ${isUnread ? 'unread' : ''}">
                    <div class="notification-body">
                        <span class="notification-title">${notif.title || 'Xabar'}</span>
                        <p class="notification-message">${notif.message || ''}</p>
                        <div class="notification-meta">
                            <span><i class="fas fa-user"></i> ✉️ Yuborgan: ${sentByName}</span>
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
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const id = this.dataset.id;
            await markAsRead(id);
        });
    });
}

// ============================================================
// ⭐ XABARNI O'QILGAN DEB BELGILASH
// ============================================================
async function markAsRead(id) {
    try {
        const response = await API.post(`/notifications/${id}/read`);
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
// ⭐ BARCHA XABARLARNI O'QILGAN DEB BELGILASH
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

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess('Barcha xabarlar o\'qilgan deb belgilandi!');
            await loadNotifications();
        } else {
            showError(data.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ Xatolik:', error);
        showError('Xatolik yuz berdi: ' + error.message);
    }
}

// ============================================================
// ⭐ FILTER TUGMALARI
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
// ⭐ EVENT LISTENERLAR
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

// ============================================================
// ⭐ XATOLIK VA MUVAFFAQIYAT XABARLARI
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
// ⭐ CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
});

console.log('✅ notifications.js yuklandi');
