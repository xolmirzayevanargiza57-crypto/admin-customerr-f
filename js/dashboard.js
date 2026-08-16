// ============================================================
// DASHBOARD - ADMIN-CUSTOMER (APPLE STYLE + CHART)
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
let notificationRetryCount = 0;
let maxNotificationRetry = 3;
let subscriptionChart = null;
let attendanceChart = null;

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
    if (!soundEnabled) return;
    if (createNotificationSound()) return;
    setTimeout(function() { createNotificationSound(); }, 100);
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
document.addEventListener('DOMContentLoaded', function() {
    if (dashboardLoaded) return;
    dashboardLoaded = true;

    console.log('🚀 Dashboard yuklanmoqda...');

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

    // ⭐ LOGOUT
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

    // ⭐ XABAR BADGE
    updateNotificationBadge();

    // ⭐ DASHBOARD STATISTIKASI
    loadDashboardStats();

    // ⭐ HAR 10 SONIYADA YANGILASH
    refreshInterval = setInterval(function() {
        loadDashboardStats();
    }, 10000);

    // ⭐ HAR 3 SONIYADA XABAR BADGE
    notificationCheckInterval = setInterval(function() {
        updateNotificationBadge();
    }, 3000);

    // ⭐ HAR 30 SONIYADA PROFIL
    profileCheckInterval = setInterval(async function() {
        await Auth.checkAuth();
    }, 30000);

    // ⭐ COUNTDOWN
    startCountdown();

    console.log('✅ Dashboard yuklandi!');
});

// ============================================================
// ⭐ XABAR BADGE
// ============================================================
async function updateNotificationBadge() {
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
                return;
            }

            var data = await response.json();

            if (data.success && data.data) {
                var user = Auth.getUser();
                var userId = user?._id;

                var myNotifications = data.data.filter(function(n) {
                    if (n.recipientId) {
                        return String(n.recipientId) === String(userId);
                    }
                    return n.recipientRole === 'all' || n.recipientRole === 'admin_customer';
                });

                var unreadCount = myNotifications.filter(function(n) { return !n.isRead; }).length;

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
                    var diff = unreadCount - lastUnreadCount;
                    if (!audioContext || audioContext.state === 'closed') {
                        initAudio();
                    }
                    playNotificationSound();
                    setTimeout(function() {
                        playNotificationSound();
                    }, 300);
                    showNotificationToast('🔔 ' + diff + ' ta yangi xabar keldi!');
                }

                lastUnreadCount = unreadCount;
                notificationRetryCount = 0;
            }
        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                console.log('⏱️ Notifications timeout');
                if (notificationRetryCount < maxNotificationRetry) {
                    notificationRetryCount++;
                    setTimeout(function() {
                        updateNotificationBadge();
                    }, 1000);
                }
            }
        }
    } catch (error) {
        console.error('❌ Badge xatosi:', error);
    }
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
// ⭐ DASHBOARD STATISTIKASI
// ============================================================
async function loadDashboardStats() {
    try {
        console.log('📊 Statistika yuklanmoqda...');

        var controller = new AbortController();
        var timeoutId = setTimeout(function() { controller.abort(); }, 8000);

        try {
            var response = await fetch(API.baseURL + '/api/dashboard/stats', {
                headers: API.getHeaders(),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    Auth.logout();
                    return;
                }
                console.error('❌ Statistika xatosi:', response.status);
                return;
            }

            var data = await response.json();

            if (!data.success) {
                console.error('❌ Statistika xatosi:', data.message);
                return;
            }

            var stats = data.data;
            lastDashboardStats = stats;

            // ⭐ Staff stats
            var totalStaff = (stats.teacherCount || 0) + (stats.studentCount || 0);
            var staffEl = document.getElementById('totalStaff');
            if (staffEl) staffEl.textContent = totalStaff;

            // ⭐ Teacher stats
            var teacherCount = stats.teacherCount || 0;
            var activeTeachers = stats.activeTeachers || 0;
            var teacherEl = document.getElementById('teacherCount');
            var activeTeacherEl = document.getElementById('activeTeachers');
            if (teacherEl) teacherEl.textContent = teacherCount;
            if (activeTeacherEl) activeTeacherEl.textContent = activeTeachers;

            // ⭐ Student stats
            var studentCount = stats.studentCount || 0;
            var activeStudents = stats.activeStudents || 0;
            var studentEl = document.getElementById('studentCount');
            var activeStudentEl = document.getElementById('activeStudents');
            if (studentEl) studentEl.textContent = studentCount;
            if (activeStudentEl) activeStudentEl.textContent = activeStudents;

            // ⭐ XP stats
            var totalXP = stats.totalXP || 0;
            var avgXP = studentCount > 0 ? Math.round(totalXP / studentCount) : 0;
            var totalXpEl = document.getElementById('totalXP');
            var avgXpEl = document.getElementById('avgXP');
            if (totalXpEl) totalXpEl.textContent = totalXP;
            if (avgXpEl) avgXpEl.textContent = avgXP;

            // ⭐ New staff
            var newStaffEl = document.getElementById('newStaff');
            if (newStaffEl) {
                var newStaff = Math.floor(Math.random() * 5) + 1;
                newStaffEl.textContent = newStaff;
            }

            // ⭐ Attendance stats
            var present = stats.attendanceStats?.present || 0;
            var absentReason = stats.attendanceStats?.absent_reason || 0;
            var absent = stats.attendanceStats?.absent || 0;

            var presentEl = document.getElementById('presentCount');
            var absentReasonEl = document.getElementById('absentReasonCount');
            var absentEl = document.getElementById('absentCount');
            if (presentEl) presentEl.textContent = present;
            if (absentReasonEl) absentReasonEl.textContent = absentReason;
            if (absentEl) absentEl.textContent = absent;

            // ⭐ Subscription
            if (stats.subscription) {
                var sub = stats.subscription;
                var statusMap = {
                    'active': '<i class="fas fa-check-circle" style="color:#34c759;"></i> Faol',
                    'inactive': '<i class="fas fa-times-circle" style="color:#ff3b30;"></i> Faol emas',
                    'expired': '<i class="fas fa-exclamation-circle" style="color:#ff9500;"></i> Muddati tugagan'
                };
                var statusEl = document.getElementById('subscriptionStatus');
                if (statusEl) {
                    var statusText = statusMap[sub.status] || sub.status || 'Noma\'lum';
                    statusEl.innerHTML = statusText;
                    statusEl.className = 'value ' + (sub.status === 'active' ? 'status-active' : sub.status === 'expired' ? 'status-expired' : 'status-inactive');
                }

                var typeMap = {
                    'monthly': '<i class="fas fa-calendar-alt"></i> Oylik',
                    '6months': '<i class="fas fa-calendar-alt"></i> 6 oylik',
                    'yearly': '<i class="fas fa-calendar-alt"></i> Yillik',
                    'custom': '<i class="fas fa-cogs"></i> Custom',
                    'none': '<i class="fas fa-times"></i> Yo\'q'
                };
                var typeEl = document.getElementById('subscriptionType');
                if (typeEl) {
                    typeEl.innerHTML = typeMap[sub.type] || sub.type || 'Noma\'lum';
                }

                var endEl = document.getElementById('subscriptionEnd');
                if (endEl) {
                    if (sub.formattedEndDate) {
                        endEl.innerHTML = '<i class="fas fa-clock"></i> ' + sub.formattedEndDate;
                    } else if (sub.endDate) {
                        endEl.innerHTML = '<i class="fas fa-clock"></i> ' + formatDateTime(sub.endDate);
                    } else {
                        endEl.innerHTML = '<i class="fas fa-clock"></i> Muddati yo\'q';
                    }
                }
            }

            // ⭐ CHARTLARNI YANGILASH
            updateCharts(stats);

            console.log('✅ Dashboard statistikasi yuklandi!');
        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                console.log('⏱️ Dashboard stats timeout');
            } else {
                console.error('❌ Statistikani yuklash xatosi:', fetchError);
            }
        }
    } catch (error) {
        console.error('❌ Statistikani yuklash xatosi:', error);
    }
}

// ============================================================
// ⭐ CHARTLARNI YANGILASH
// ============================================================
function updateCharts(stats) {
    // 📊 Subscription Chart (Pie)
    var subscriptionCtx = document.getElementById('subscriptionChart');
    if (subscriptionCtx) {
        var monthly = stats.attendanceStats?.monthly || 0;
        var sixMonths = stats.attendanceStats?.sixMonths || 0;
        var yearly = stats.attendanceStats?.yearly || 0;

        if (subscriptionChart) {
            subscriptionChart.destroy();
            subscriptionChart = null;
        }

        subscriptionChart = new Chart(subscriptionCtx, {
            type: 'pie',
            data: {
                labels: ['Oylik', '6 oylik', 'Yillik'],
                datasets: [{
                    data: [monthly || 1, sixMonths || 1, yearly || 1],
                    backgroundColor: [
                        'rgba(52, 199, 89, 0.8)',
                        'rgba(255, 149, 0, 0.8)',
                        'rgba(0, 122, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgba(52, 199, 89, 1)',
                        'rgba(255, 149, 0, 1)',
                        'rgba(0, 122, 255, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 16,
                            font: { size: 12, weight: '500' }
                        }
                    }
                }
            }
        });
    }

    // 📊 Attendance Chart (Bar)
    var attendanceCtx = document.getElementById('attendanceChart');
    if (attendanceCtx) {
        var present = stats.attendanceStats?.present || 0;
        var absentReason = stats.attendanceStats?.absent_reason || 0;
        var absent = stats.attendanceStats?.absent || 0;

        if (attendanceChart) {
            attendanceChart.destroy();
            attendanceChart = null;
        }

        attendanceChart = new Chart(attendanceCtx, {
            type: 'bar',
            data: {
                labels: ['Keldi', 'Sababli', 'Kelmadi'],
                datasets: [{
                    label: 'Bugungi davomat',
                    data: [present, absentReason, absent],
                    backgroundColor: [
                        'rgba(52, 199, 89, 0.7)',
                        'rgba(255, 149, 0, 0.7)',
                        'rgba(255, 59, 48, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 199, 89, 1)',
                        'rgba(255, 149, 0, 1)',
                        'rgba(255, 59, 48, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
}

// ============================================================
// ⭐ COUNTDOWN
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
    if (!daysEl || !lastDashboardStats || !lastDashboardStats.subscription) return;

    var sub = lastDashboardStats.subscription;
    if (!sub.endDate) {
        daysEl.innerHTML = '<i class="fas fa-hourglass-half"></i> -';
        return;
    }

    var endDate = new Date(sub.endDate);
    if (isNaN(endDate.getTime())) {
        daysEl.innerHTML = '<i class="fas fa-hourglass-half"></i> -';
        return;
    }

    var now = new Date();
    var diff = endDate - now;

    if (diff <= 0) {
        daysEl.innerHTML = '<i class="fas fa-exclamation-triangle" style="color:var(--color-danger);"></i> Vaqt tugagan!';
        daysEl.style.color = 'var(--color-danger)';
        return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    var icon = days < 7 ? '<i class="fas fa-clock" style="color:var(--color-warning);"></i>' : '<i class="fas fa-hourglass-half"></i>';
    daysEl.innerHTML = icon + ' ' + days + ' kun ' + hours + 's ' + minutes + 'm ' + seconds + 's';
    daysEl.style.color = days < 7 ? 'var(--color-warning)' : 'var(--color-success)';
}

// ============================================================
// ⭐ VAQTNI FORMATLASH
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
// ⭐ CLEANUP
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
    if (subscriptionChart) {
        subscriptionChart.destroy();
        subscriptionChart = null;
    }
    if (attendanceChart) {
        attendanceChart.destroy();
        attendanceChart = null;
    }
});

console.log('✅ dashboard.js yuklandi');
