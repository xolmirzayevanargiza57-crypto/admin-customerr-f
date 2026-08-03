// ============================================================
// DASHBOARD - ADMIN-CUSTOMER (TO'LIQ)
// Loyiha: Admin-Customer Frontend
// Fayl: js/dashboard.js
// ============================================================

let dashboardLoaded = false;
let lastDashboardStats = null;
let refreshInterval = null;
let countdownInterval = null;
let profileCheckInterval = null;
let notificationCheckInterval = null;
let lastUnreadCount = 0;
let audioContext = null;
let soundEnabled = true;

// ============================================================
// ⭐ OVOZ YARATISH (100% ISHLASH UCHUN)
// ============================================================
function createNotificationSound() {
    try {
        // ⭐ 1. AudioContext ni yaratish (agar mavjud bo'lmasa)
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // ⭐ 2. Agar suspended bo'lsa, resume qilish
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // ⭐ 3. Agar closed bo'lsa, qayta yaratish
        if (audioContext.state === 'closed') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // ⭐ 4. Ovoz yaratish
        var now = audioContext.currentTime;
        
        // 1-OVOZ: 880 Hz (ding)
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
        
        // 2-OVOZ: 1100 Hz (ding) - 150ms keyin
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
        
        console.log('🔔 Ovoz chiqdi!');
        return true;
    } catch (error) {
        console.warn('⚠️ Ovoz xatosi:', error);
        return false;
    }
}

// ============================================================
// ⭐ OVOZ O'YNATISH (USER INTERACTION BILAN)
// ============================================================
function playNotificationSound() {
    // ⭐ Agar ovoz o'chirilgan bo'lsa
    if (!soundEnabled) return;
    
    // ⭐ Birinchi urinish
    if (createNotificationSound()) return;
    
    // ⭐ Agar birinchi urinish muvaffaqiyatsiz bo'lsa, qayta urinish
    setTimeout(function() {
        createNotificationSound();
    }, 100);
    
    // ⭐ Agar hali ham ishlamasa, user interaction orqali
    setTimeout(function() {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().then(function() {
                createNotificationSound();
            }).catch(function(e) {
                console.warn('⚠️ Resume xatosi:', e);
            });
        }
    }, 200);
}

// ============================================================
// ⭐ OVOZNI ISHGA TUSHIRISH (user interaction bilan)
// ============================================================
function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        console.log('✅ AudioContext tayyor');
    } catch (e) {
        console.warn('⚠️ AudioContext xatosi:', e);
    }
}

// ============================================================
// SAHIFA YUKLANGANDA (Admin-Customer)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    if (dashboardLoaded) return;
    dashboardLoaded = true;

    console.log('🚀 Dashboard yuklanmoqda... (Admin-Customer)');

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
            var schoolEl = document.getElementById('schoolName');
            if (nameEl) nameEl.textContent = Auth.getUserName();
            if (initialEl) initialEl.textContent = Auth.getUserInitial();
            if (schoolEl) schoolEl.textContent = user.schoolName || 'Nurli Ta\'lim Markazi';
        }

        // ⭐ LOGOUT TUGMASI
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

        // ⭐ AUDIO CONTEXT NI TAYYORLASH (har qanday user interaction da)
        var initAudioOnce = function() {
            initAudio();
            document.removeEventListener('click', initAudioOnce);
            document.removeEventListener('touchstart', initAudioOnce);
            document.removeEventListener('keydown', initAudioOnce);
        };
        document.addEventListener('click', initAudioOnce);
        document.addEventListener('touchstart', initAudioOnce);
        document.addEventListener('keydown', initAudioOnce);
        
        // ⭐ Agar 5 soniyadan keyin ham ishga tushmagan bo'lsa, majburlab ishga tushirish
        setTimeout(function() {
            initAudio();
        }, 5000);

        // ⭐ XABAR BADGE NI YANGILASH
        updateNotificationBadge();

        // ⭐ DASHBOARD STATISTIKASINI YUKLASH
        loadDashboardStats();

        // ⭐ HAR 60 SONIYADA YANGILASH
        refreshInterval = setInterval(function() {
            loadDashboardStats();
        }, 60000);

        // ⭐ HAR 3 SONIYADA XABAR BADGE NI YANGILASH
        notificationCheckInterval = setInterval(function() {
            updateNotificationBadge();
        }, 3000);

        // ⭐ HAR 30 SONIYADA PROFIL O'ZGARGANMI TEKSHIRISH
        profileCheckInterval = setInterval(async function() {
            await Auth.checkAuth();
        }, 30000);

        // ⭐ COUNTDOWN
        startCountdown();

        console.log('✅ Dashboard yuklandi! (Admin-Customer)');
    } catch (error) {
        console.error('❌ Dashboard yuklash xatosi:', error);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// ⭐ XABAR BADGE NI YANGILASH (Admin-Customer)
// ============================================================
async function updateNotificationBadge() {
    try {
        var token = Auth.getToken();
        if (!token) return;

        var response = await API.getNotifications();
        
        if (response.success && response.data) {
            var user = Auth.getUser();
            var userId = user?._id;
            
            // ⭐ FAQAT O'ZIGA KELGAN XABARLAR
            var myNotifications = response.data.filter(function(n) {
                if (n.recipientId) {
                    return String(n.recipientId) === String(userId);
                }
                return n.recipientRole === 'all' || n.recipientRole === 'admin_customer';
            });
            
            var unreadCount = myNotifications.filter(function(n) { return !n.isRead; }).length;
            
            console.log('🔔 O\'qilmagan xabarlar:', unreadCount);

            // ⭐ HEADER BADGE
            var badge = document.getElementById('notificationBadge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.style.display = 'block';
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.animation = 'none';
                    setTimeout(function() {
                        badge.style.animation = 'badgePulse 0.5s ease';
                    }, 10);
                } else {
                    badge.style.display = 'none';
                }
            }

            // ⭐ SIDEBAR BADGE
            var sidebarBadge = document.getElementById('sidebarBadge');
            if (sidebarBadge) {
                if (unreadCount > 0) {
                    sidebarBadge.style.display = 'inline';
                    sidebarBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                } else {
                    sidebarBadge.style.display = 'none';
                }
            }

            // ⭐ YANGI XABAR KELGANDA OVOZ
            if (unreadCount > lastUnreadCount && lastUnreadCount > 0) {
                // ⭐ OVOZNI ISHGA TUSHIRISH (avval audioContext ni tekshirib)
                if (!audioContext || audioContext.state === 'closed') {
                    initAudio();
                }
                playNotificationSound();
                
                var diff = unreadCount - lastUnreadCount;
                showNotificationToast('🔔 ' + diff + ' ta yangi xabar keldi!');
            }
            
            lastUnreadCount = unreadCount;
        }
    } catch (error) {
        console.error('❌ Badge yangilash xatosi:', error);
    }
}

// ============================================================
// ⭐ TOAST XABAR (Admin-Customer)
// ============================================================
function showNotificationToast(message) {
    var existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <i class="fas fa-bell" style="font-size: 1.2rem;"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
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
// DASHBOARD STATISTIKASINI YUKLASH (Admin-Customer)
// ============================================================
async function loadDashboardStats() {
    try {
        var data = await API.getDashboardStats();

        if (!data.success) {
            if (data.status === 401 || data.status === 403) {
                Auth.logout();
                return;
            }
            console.error('❌ Statistika xatosi:', data.message);
            return;
        }

        var stats = data.data;
        lastDashboardStats = stats;

        var elements = {
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

        var present = stats.attendanceStats?.present || 0;
        var absentReason = stats.attendanceStats?.absent_reason || 0;
        var absent = stats.attendanceStats?.absent || 0;

        if (elements.presentCount) elements.presentCount.textContent = present;
        if (elements.absentReasonCount) elements.absentReasonCount.textContent = absentReason;
        if (elements.absentCount) elements.absentCount.textContent = absent;

        var total = present + absentReason + absent;
        if (elements.attendancePercent) {
            if (total > 0) {
                var percent = Math.round((present / total) * 100);
                elements.attendancePercent.textContent = percent + '%';
                elements.attendancePercent.className = 'stat-change ' + (percent >= 70 ? 'positive' : 'negative');
            } else {
                elements.attendancePercent.textContent = '0%';
            }
        }

        // ⭐ SUBSCRIPTION
        if (stats.subscription) {
            var sub = stats.subscription;
            var statusMap = { 'active': '✅ Faol', 'inactive': '⛔ Faol emas', 'expired': '⚠️ Muddati tugagan' };
            if (elements.subscriptionStatus) {
                elements.subscriptionStatus.textContent = statusMap[sub.status] || sub.status || 'Noma\'lum';
            }
            var typeMap = { 'monthly': '📅 Oylik', '6months': '📅 6 oylik', 'yearly': '📅 Yillik', 'custom': '⚙️ Custom', 'none': '❌ Yo\'q' };
            if (elements.subscriptionType) {
                elements.subscriptionType.textContent = typeMap[sub.type] || sub.type || 'Noma\'lum';
            }
            if (elements.subscriptionEnd) {
                if (sub.formattedEndDate) {
                    elements.subscriptionEnd.textContent = sub.formattedEndDate;
                } else if (sub.endDate) {
                    elements.subscriptionEnd.textContent = formatDateTime(sub.endDate);
                } else {
                    elements.subscriptionEnd.textContent = 'Muddati yo\'q';
                }
            }
            if (elements.subscriptionDays) {
                if (!sub.endDate) {
                    elements.subscriptionDays.textContent = '-';
                } else {
                    var endDate = new Date(sub.endDate);
                    if (!isNaN(endDate.getTime())) {
                        var now = new Date();
                        var diff = endDate - now;
                        if (diff > 0) {
                            var days = Math.floor(diff / (1000 * 60 * 60 * 24));
                            var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            var seconds = Math.floor((diff % (1000 * 60)) / 1000);
                            elements.subscriptionDays.textContent = days + ' kun ' + hours + 's ' + minutes + 'm ' + seconds + 's';
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
    countdownInterval = setInterval(function() {
        updateCountdown();
    }, 1000);
}

function updateCountdown() {
    var daysEl = document.getElementById('subscriptionDays');
    var endEl = document.getElementById('subscriptionEnd');
    if (!daysEl || !lastDashboardStats || !lastDashboardStats.subscription) return;
    var sub = lastDashboardStats.subscription;

    if (endEl) {
        if (sub.formattedEndDate) {
            endEl.textContent = sub.formattedEndDate;
        } else if (sub.endDate) {
            endEl.textContent = formatDateTime(sub.endDate);
        } else {
            endEl.textContent = 'Muddati yo\'q';
        }
    }

    if (!sub.endDate) {
        daysEl.textContent = '-';
        return;
    }

    var endDate = new Date(sub.endDate);
    if (isNaN(endDate.getTime())) {
        daysEl.textContent = '-';
        return;
    }

    var now = new Date();
    var diff = endDate - now;

    if (diff <= 0) {
        daysEl.textContent = '⚠️ Vaqt tugagan!';
        return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days + ' kun ' + hours + 's ' + minutes + 'm ' + seconds + 's';
}

// ============================================================
// VAQTNI FORMATLASH
// ============================================================
function formatDateTime(date) {
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
// XATOLIK VA MUVAFFAQIYAT XABARLARI
// ============================================================
function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#dc2626;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;z-index:10000;';
    div.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>' + msg + '</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>';
    document.body.appendChild(div);
    setTimeout(function() { if (div.parentElement) div.remove(); }, 5000);
}

function showSuccess(msg) {
    console.log('✅ Muvaffaqiyat:', msg);
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;color:#065f46;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;z-index:10000;';
    div.innerHTML = '<i class="fas fa-check-circle"></i><span>' + msg + '</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#065f46;cursor:pointer;font-size:1.1rem;">×</button>';
    document.body.appendChild(div);
    setTimeout(function() { if (div.parentElement) div.remove(); }, 3000);
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (profileCheckInterval) {
        clearInterval(profileCheckInterval);
        profileCheckInterval = null;
    }
    if (notificationCheckInterval) {
        clearInterval(notificationCheckInterval);
        notificationCheckInterval = null;
    }
});

// ⭐ BADGE PULSE ANIMATSIYASI
var style = document.createElement('style');
style.textContent = `
    @keyframes badgePulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

console.log('✅ dashboard.js yuklandi (Admin-Customer)');
