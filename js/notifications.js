// ============================================================
// NOTIFICATIONS - ADMIN-CUSTOMER (TO'LIQ REAL TIME)
// Loyiha: Admin-Customer Frontend
// Fayl: js/notifications.js
// ============================================================

let allNotifications = [];
let currentFilter = 'all';
let refreshInterval = null;
let lastUnreadCount = 0;
let audioContext = null;

// ============================================================
// ⭐ OVOZ YARATISH
// ============================================================
function createNotificationSound() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (audioContext.state === 'closed') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        var now = audioContext.currentTime;
        var osc1 = audioContext.createOscillator();
        var gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.value = 880;
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.start(now);
        osc1.stop(now + 0.2);
        var osc2 = audioContext.createOscillator();
        var gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.35);
        return true;
    } catch (error) {
        return false;
    }
}

function playNotificationSound() {
    try {
        createNotificationSound();
        setTimeout(function() { createNotificationSound(); }, 200);
    } catch (e) {}
}

function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } catch (e) {}
}

// ============================================================
// SAHIFA YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Notifications sahifasi yuklanmoqda...');

    try {
        var token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        if (!token) {
            window.location.replace('index.html');
            return;
        }

        var user = Auth.getUser();
        if (user) {
            var nameEl = document.getElementById('userName');
            var initialEl = document.getElementById('userInitial');
            if (nameEl) nameEl.textContent = Auth.getUserName();
            if (initialEl) initialEl.textContent = Auth.getUserInitial();
        }

        // ⭐ AUDIO
        var initAudioOnce = function() {
            initAudio();
            document.removeEventListener('click', initAudioOnce);
            document.removeEventListener('touchstart', initAudioOnce);
            document.removeEventListener('keydown', initAudioOnce);
        };
        document.addEventListener('click', initAudioOnce);
        document.addEventListener('touchstart', initAudioOnce);
        document.addEventListener('keydown', initAudioOnce);
        setTimeout(initAudio, 3000);

        await loadNotifications();
        setupListeners();

        // ⭐ HAR 2 SONIYADA YANGILASH (REAL TIME)
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        refreshInterval = setInterval(function() {
            loadNotifications();
        }, 2000);

        console.log('✅ Notifications sahifasi yuklandi!');
    } catch (error) {
        console.error('❌ Notifications yuklash xatosi:', error);
        showError('Notifications yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// ⭐ XABARLARNI YUKLASH (REAL TIME)
// ============================================================
async function loadNotifications() {
    try {
        var token = Auth.getToken();
        if (!token) return;

        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 5000);

        try {
            var response = await fetch(API.baseURL + '/api/notifications', {
                headers: API.getHeaders(),
                signal: controller.signal,
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                console.warn('⚠️ Notifications response not OK:', response.status);
                // Agar xatolik bo'lsa ham bo'sh ro'yxat ko'rsatish
                allNotifications = [];
                renderNotifications([]);
                return;
            }

            var data = await response.json();

            if (data.success) {
                var oldUnread = allNotifications.filter(function(n) { return !n.isRead; }).length;
                allNotifications = data.data || [];
                
                // ⭐ YANGI XABAR KELGANDA OVOZ
                var newUnread = allNotifications.filter(function(n) { return !n.isRead; }).length;
                if (newUnread > oldUnread && oldUnread > 0) {
                    var diff = newUnread - oldUnread;
                    playNotificationSound();
                    showNotificationToast('🔔 ' + diff + ' ta yangi xabar keldi!');
                }
                lastUnreadCount = newUnread;
                
                renderNotifications(allNotifications);
            } else {
                allNotifications = [];
                renderNotifications([]);
            }
        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                console.log('⏱️ Notifications timeout');
            } else {
                console.error('❌ Xatolik:', fetchError);
                showError('Xabarlar yuklanmadi: ' + (fetchError.message || 'Tarmoq xatosi'));
            }
            // ⭐ TIMEOUT BO'LSA HAM BO'SH KO'RSAT
            if (allNotifications.length === 0) {
                allNotifications = [];
                renderNotifications([]);
            }
        }
    } catch (error) {
        console.error('❌ Xabarlarni yuklash xatosi:', error);
        showError('Xabarlar yuklanmadi: ' + (error.message || 'Noma\'lum xatolik'));
    }
}

// ============================================================
// ⭐ XABARLARNI KO'RSATISH (SCROLL BILAN)
// ============================================================
function renderNotifications(notifications) {
    var container = document.getElementById('notificationsList');
    if (!container) return;

    var user = Auth.getUser();
    var userId = user?._id;

    // ⭐ FAQAT O'ZIGA KELGAN XABARLAR
    var filtered = notifications ? notifications.filter(function(n) {
        var recipientIdStr = n.recipientId ? String(n.recipientId) : null;
        var userIdStr = userId ? String(userId) : null;
        if (recipientIdStr && userIdStr) {
            return recipientIdStr === userIdStr;
        }
        return n.recipientRole === 'all' || n.recipientRole === 'admin_customer';
    }) : [];

    // ⭐ SO'NGI 30 KUN
    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filtered = filtered.filter(function(n) {
        var notifDate = new Date(n.createdAt);
        return notifDate >= thirtyDaysAgo;
    });

    // ⭐ FILTRLASH
    var filteredByDate = filterByDate(filtered, currentFilter);

    if (!filteredByDate || filteredByDate.length === 0) {
        var filterLabels = {
            'all': 'Hozircha xabarlar yo\'q',
            'today': 'Bugun xabarlar yo\'q',
            'week': 'Shu hafta xabarlar yo\'q',
            'month': 'Shu oy xabarlar yo\'q',
            'unread': 'O\'qilmagan xabarlar yo\'q',
            'read': 'O\'qilgan xabarlar yo\'q'
        };
        container.innerHTML = 
            '<div class="notification-empty">' +
                '<i class="fas fa-bell-slash"></i>' +
                '<p>' + (filterLabels[currentFilter] || 'Xabarlar yo\'q') + '</p>' +
                '<p style="font-size:0.85rem;color:var(--text-muted);margin-top:4px;">Sizga yuborilgan xabarlar shu yerda ko\'rinadi</p>' +
            '</div>';
        return;
    }

    // ⭐ Xabarlarni sana bo'yicha guruhlash
    var grouped = {};
    filteredByDate.forEach(function(notif) {
        var date = new Date(notif.createdAt);
        var dateKey = date.toLocaleDateString('uz-UZ', {
            timeZone: 'Asia/Tashkent',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(notif);
    });

    var html = '';
    Object.keys(grouped).forEach(function(dateKey) {
        html += 
            '<div style="margin-bottom:16px;">' +
                '<div style="padding:6px 0;font-size:0.78rem;font-weight:600;color:var(--text-muted);border-bottom:2px solid var(--border-color);margin-bottom:8px;display:flex;align-items:center;gap:8px;">' +
                    '<i class="fas fa-calendar"></i> ' + dateKey +
                    '<span style="font-size:0.65rem;font-weight:400;color:var(--text-muted);margin-left:8px;">' +
                        grouped[dateKey].length + ' ta xabar' +
                    '</span>' +
                '</div>';

        grouped[dateKey].forEach(function(notif) {
            var isUnread = !notif.isRead;
            var sentByName = notif.sentByName || 'Admin';
            var formattedDate = formatDateTimeFull(notif.createdAt);
            var isSentByMe = notif.sentBy === user?._id;

            html += 
                '<div class="notification-item ' + (isUnread ? 'unread' : '') + '">' +
                    '<div class="notification-body">' +
                        '<span class="notification-title">' + (notif.title || 'Xabar') + '</span>' +
                        // ⭐ MESSAGE WRAPPER - SCROLL QILADIGAN QISM
                        '<div class="notification-message-wrapper">' +
                            '<p class="notification-message">' + (notif.message || '') + '</p>' +
                        '</div>' +
                        '<div class="notification-meta">' +
                            '<span><i class="fas fa-user"></i> ' + (isSentByMe ? '✉️ Yuborgan: Men' : '✉️ Yuborgan: ' + sentByName) + '</span>' +
                            '<span><i class="fas fa-clock"></i> ' + formattedDate + '</span>' +
                            '<span><i class="fas fa-circle" style="color: ' + (isUnread ? '#007aff' : '#34c759') + '; font-size: 0.5rem;"></i> ' + (isUnread ? 'O\'qilmagan' : 'O\'qilgan') + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="notification-actions">' +
                        (isUnread ? 
                            '<button class="btn-read" data-id="' + notif._id + '"><i class="fas fa-check"></i> O\'qildi</button>' :
                            '<span class="read-label">✓ O\'qilgan</span>'
                        ) +
                    '</div>' +
                '</div>';
        });

        html += '</div>';
    });

    container.innerHTML = html;

    // ⭐ O'qilgan deb belgilash
    document.querySelectorAll('.btn-read').forEach(function(btn) {
        btn.addEventListener('click', async function() {
            var id = this.dataset.id;
            await markAsRead(id);
        });
    });
}

// ============================================================
// ⭐ VAQTNI FORMATLASH (TOSHKENT VAQTI BILAN)
// ============================================================
function formatDateTimeFull(date) {
    if (!date) return 'Noma\'lum vaqt';
    try {
        var d = new Date(date);
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
// ⭐ FILTRLASH
// ============================================================
function filterByDate(notifications, filter) {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    var monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return notifications.filter(function(notif) {
        var notifDate = new Date(notif.createdAt);
        switch (filter) {
            case 'today': return notifDate >= today;
            case 'week': return notifDate >= weekAgo;
            case 'month': return notifDate >= monthAgo;
            case 'unread': return !notif.isRead;
            case 'read': return notif.isRead;
            default: return true;
        }
    });
}

// ============================================================
// ⭐ O'QILGAN DEB BELGILASH
// ============================================================
async function markAsRead(id) {
    try {
        var response = await API.markNotificationRead(id);
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
// ⭐ BARCHASINI O'QILGAN DEB BELGILASH
// ============================================================
async function markAllAsRead() {
    try {
        var response = await API.markAllNotificationsRead();
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
// ⭐ FILTER TUGMALARI
// ============================================================
function updateFilterButtons() {
    document.querySelectorAll('.filter-pill').forEach(function(btn) {
        btn.classList.remove('active');
        var filter = btn.dataset.filter;
        if (filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// ============================================================
// ⭐ TOAST XABAR
// ============================================================
function showNotificationToast(message) {
    var existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = 
        '<i class="fas fa-bell" style="font-size:1.2rem;"></i>' +
        '<span>' + message + '</span>' +
        '<button onclick="this.parentElement.remove()">×</button>';
    toast.addEventListener('click', function(e) {
        if (e.target.tagName !== 'BUTTON') {
            window.location.href = 'notifications.html';
        }
    });

    document.body.appendChild(toast);

    setTimeout(function() {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(function() {
                if (toast.parentElement) toast.remove();
            }, 500);
        }
    }, 5000);
}

// ============================================================
// ⭐ EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        var newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }

    document.querySelectorAll('.filter-pill').forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            updateFilterButtons();
            renderNotifications(allNotifications);
        });
    });

    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadNotifications();
            showSuccess('Yangilandi!');
        });
    }

    var markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }

    var backBtn = document.getElementById('backBtn');
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
// ⭐ XATOLIK VA MUVAFFAQIYAT XABARLARI
// ============================================================
function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    var div = document.createElement('div');
    div.style.cssText = 
        'position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#fef2f2;' +
        'border:1px solid #fecaca;border-radius:10px;color:#dc2626;max-width:400px;' +
        'box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;z-index:10000;';
    div.innerHTML = 
        '<i class="fas fa-exclamation-circle"></i><span>' + msg + '</span>' +
        '<button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>';
    document.body.appendChild(div);
    setTimeout(function() { if (div.parentElement) div.remove(); }, 5000);
}

function showSuccess(msg) {
    console.log('✅ Muvaffaqiyat:', msg);
    var div = document.createElement('div');
    div.style.cssText = 
        'position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#ecfdf5;' +
        'border:1px solid #a7f3d0;border-radius:10px;color:#065f46;max-width:400px;' +
        'box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;z-index:10000;';
    div.innerHTML = 
        '<i class="fas fa-check-circle"></i><span>' + msg + '</span>' +
        '<button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#065f46;cursor:pointer;font-size:1.1rem;">×</button>';
    document.body.appendChild(div);
    setTimeout(function() { if (div.parentElement) div.remove(); }, 3000);
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

console.log('✅ notifications.js yuklandi (Admin-Customer)');
