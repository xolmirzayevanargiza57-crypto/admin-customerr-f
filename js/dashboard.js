// ============================================================
// DASHBOARD - ADMIN-CUSTOMER (CHART BILAN)
// ============================================================

let dashboardLoaded = false;
let refreshInterval = null;
let notificationCheckInterval = null;
let profileCheckInterval = null;
let subscriptionUpdateInterval = null;
let lastUnreadCount = 0;
let audioContext = null;
let soundEnabled = true;
let notificationRetryCount = 0;
const maxNotificationRetry = 3;

// ⭐ CACHE
let cachedStats = null;
let statsCacheTime = 0;
const CACHE_DURATION = 30000;

// ⭐ CHART
let dashboardChart = null;

// ============================================================
// OVOZ YARATISH
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

        const now = audioContext.currentTime;

        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(audioContext.destination);
        osc1.frequency.value = 880;
        osc1.type = 'sine';
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc1.start(now);
        osc1.stop(now + 0.2);

        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1100;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.2, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.35);

        return true;
    } catch (e) {
        return false;
    }
}

function playNotificationSound() {
    if (!soundEnabled) return;
    if (createNotificationSound()) return;
    setTimeout(function() {
        createNotificationSound();
    }, 100);
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
        if (schoolEl) schoolEl.textContent = user.schoolName || "Nurli Ta'lim Markazi";
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }

    const initAudioOnce = function() {
        initAudio();
        document.removeEventListener('click', initAudioOnce);
        document.removeEventListener('touchstart', initAudioOnce);
        document.removeEventListener('keydown', initAudioOnce);
    };
    document.addEventListener('click', initAudioOnce);
    document.addEventListener('touchstart', initAudioOnce);
    document.addEventListener('keydown', initAudioOnce);

    updateNotificationBadge();
    loadDashboardStats();

    refreshInterval = setInterval(loadDashboardStats, 30000);
    notificationCheckInterval = setInterval(updateNotificationBadge, 5000);
    profileCheckInterval = setInterval(function() {
        Auth.checkAuth();
    }, 60000);
    subscriptionUpdateInterval = setInterval(updateSubscriptionCountdown, 1000);

    console.log('✅ Dashboard yuklandi!');
});

// ============================================================
// ⭐ SUBSCRIPTION COUNTDOWN
// ============================================================
function updateSubscriptionCountdown() {
    const subEndDateEl = document.getElementById('subEndDate');
    const subDaysLeftEl = document.getElementById('subDaysLeft');
    const subStatusEl = document.getElementById('subStatus');
    const subTypeEl = document.getElementById('subType');

    if (typeof window.statsData === 'undefined' || !window.statsData || !window.statsData.subscription) {
        return;
    }

    const sub = window.statsData.subscription;
    const endDate = sub.endDate ? new Date(sub.endDate) : null;
    const now = new Date();

    // HOLATI
    if (subStatusEl) {
        if (sub.status === 'active' && endDate && endDate > now) {
            subStatusEl.className = 'value status-active';
            subStatusEl.innerHTML = `
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Faol
            `;
        } else if (sub.status === 'active' && endDate && endDate <= now) {
            subStatusEl.className = 'value status-expired';
            subStatusEl.innerHTML = `
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Muddati tugagan
            `;
        } else {
            subStatusEl.className = 'value status-inactive';
            subStatusEl.innerHTML = `
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Faol emas
            `;
        }
    }

    // TURI
    if (subTypeEl) {
        const typeMap = {
            'monthly': 'Oylik',
            '6months': '6 oylik',
            'yearly': 'Yillik',
            'custom': 'Custom',
            'none': "Yo'q"
        };
        const typeLabel = typeMap[sub.type] || sub.type || "Yo'q";
        subTypeEl.innerHTML = `
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
            </svg>
            ${typeLabel}
        `;
    }

    // TUGASH VAQTI
    if (subEndDateEl && endDate) {
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
        const formatted = endDate.toLocaleString('uz-UZ', options).replace(/\//g, '-');
        const parts = formatted.split(', ');
        const datePart = parts[0] || '';
        const timePart = parts[1] || '';

        subEndDateEl.innerHTML = `
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            ${datePart} <span class="time-part">${timePart}</span>
        `;
    } else if (subEndDateEl) {
        subEndDateEl.innerHTML = `
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            -
        `;
    }

    // QOLGAN KUN
    if (subDaysLeftEl && endDate) {
        const diff = endDate - now;
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            subDaysLeftEl.innerHTML = `
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                ${days} <span class="countdown">kun ${hours}s ${minutes}m ${seconds}s</span>
            `;
        } else {
            subDaysLeftEl.innerHTML = `
                <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                0 <span class="countdown">kun</span>
            `;
        }
    } else if (subDaysLeftEl) {
        subDaysLeftEl.innerHTML = `
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            0 <span class="countdown">kun</span>
        `;
    }
}

// ============================================================
// XABAR BADGE
// ============================================================
async function updateNotificationBadge() {
    try {
        const token = Auth.getToken();
        if (!token) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(function() {
            controller.abort();
        }, 5000);

        try {
            const response = await fetch(API.baseURL + '/api/notifications', {
                headers: API.getHeaders(),
                signal: controller.signal,
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (!response.ok) return;

            const data = await response.json();
            if (!data.success || !data.data) return;

            const user = Auth.getUser();
            const userId = user?._id;

            const myNotifications = data.data.filter(function(n) {
                if (n.recipientId) {
                    return String(n.recipientId) === String(userId);
                }
                return n.recipientRole === 'all' || n.recipientRole === 'admin_customer';
            });

            const unreadCount = myNotifications.filter(function(n) {
                return !n.isRead;
            }).length;

            const badge = document.getElementById('notificationBadge');
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

            const sidebarBadge = document.getElementById('sidebarBadge');
            if (sidebarBadge) {
                if (unreadCount > 0) {
                    sidebarBadge.style.display = 'inline';
                    sidebarBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                } else {
                    sidebarBadge.style.display = 'none';
                }
            }

            if (unreadCount > lastUnreadCount && lastUnreadCount > 0) {
                const diff = unreadCount - lastUnreadCount;
                playNotificationSound();
                setTimeout(function() {
                    playNotificationSound();
                }, 300);
                showNotificationToast('🔔 ' + diff + ' ta yangi xabar keldi!');
            }

            lastUnreadCount = unreadCount;
            notificationRetryCount = 0;

        } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
                if (notificationRetryCount < maxNotificationRetry) {
                    notificationRetryCount++;
                    setTimeout(function() {
                        updateNotificationBadge();
                    }, 1000);
                }
            }
        }
    } catch (error) {
        console.error('Badge xatosi:', error);
    }
}

// ============================================================
// TOAST XABAR
// ============================================================
function showNotificationToast(message) {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
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
// DASHBOARD STATISTIKASI + CHART
// ============================================================
async function loadDashboardStats() {
    try {
        const now = Date.now();
        if (cachedStats && (now - statsCacheTime) < CACHE_DURATION) {
            console.log('📊 Cache dan statistika yuklandi');
            renderStats(cachedStats);
            return;
        }

        console.log('📊 Serverdan statistika yuklanmoqda...');

        const controller = new AbortController();
        const timeoutId = setTimeout(function() {
            controller.abort();
        }, 8000);

        const response = await fetch(API.baseURL + '/api/dashboard/stats', {
            headers: API.getHeaders(),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                Auth.logout();
            }
            return;
        }

        const data = await response.json();
        if (!data.success) return;

        const stats = data.data;

        cachedStats = stats;
        statsCacheTime = Date.now();
        window.statsData = stats;

        renderStats(stats);

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('❌ Statistika xatosi:', error);
        }
        if (cachedStats) {
            console.log('📊 Xatolikda cache dan ko\'rsatilmoqda');
            renderStats(cachedStats);
        }
    }
}

// ============================================================
// STATISTIKANI RENDER QILISH
// ============================================================
function renderStats(stats) {
    // 1. Jami Xodimlar
    const totalStaff = (stats.teacherCount || 0) + (stats.studentCount || 0);
    document.getElementById('totalStaff').textContent = totalStaff;

    // 2. Jami O'qituvchilar
    document.getElementById('teacherCount').textContent = stats.teacherCount || 0;
    document.getElementById('activeTeachers').textContent = stats.activeTeachers || 0;

    // 3. Jami O'quvchilar
    document.getElementById('studentCount').textContent = stats.studentCount || 0;
    document.getElementById('activeStudents').textContent = stats.activeStudents || 0;

    // 4. Jami XP
    const totalXP = stats.totalXP || 0;
    const studentCount = stats.studentCount || 0;
    const avgXP = studentCount > 0 ? Math.round(totalXP / studentCount) : 0;
    document.getElementById('totalXP').textContent = totalXP;
    document.getElementById('avgXPValue').textContent = avgXP;

    // 5. Keldi
    const present = stats.attendanceStats?.present || 0;
    document.getElementById('presentCount').textContent = present;

    // 6. Sababli / Kelmadi
    const absentReason = stats.attendanceStats?.absent_reason || 0;
    const absent = stats.attendanceStats?.absent || 0;
    document.getElementById('absentReasonCount').textContent = absentReason;
    document.getElementById('absentCount').textContent = absent;

    // Bu oy yangi xodimlar
    const newThisMonth = stats.newThisMonth || 0;
    document.getElementById('staffNewThisMonth').textContent = newThisMonth;

    // ⭐ Subscription yangilash
    updateSubscriptionCountdown();

    // ⭐ CHART yaratish
    createDashboardChart(stats);
}

// ============================================================
// ⭐ CHART YARATISH - RASMDAGIGA O'XSHASH
// ============================================================
function createDashboardChart(stats) {
    const ctx = document.getElementById('dashboardChart');
    if (!ctx) return;

    if (dashboardChart) {
        dashboardChart.destroy();
        dashboardChart = null;
    }

    const teacherCount = stats.teacherCount || 0;
    const activeTeachers = stats.activeTeachers || 0;
    const studentCount = stats.studentCount || 0;
    const activeStudents = stats.activeStudents || 0;
    const present = stats.attendanceStats?.present || 0;
    const absent = stats.attendanceStats?.absent || 0;

    const labels = [
        'Jami O\'qituvchilar',
        'Faol O\'qituvchilar',
        'Jami O\'quvchilar',
        'Faol O\'quvchilar',
        'Keldi',
        'Kelmadi'
    ];

    const dataValues = [
        teacherCount,
        activeTeachers,
        studentCount,
        activeStudents,
        present,
        absent
    ];

    const colors = [
        'rgba(0, 122, 255, 0.85)',
        'rgba(0, 122, 255, 0.55)',
        'rgba(52, 199, 89, 0.85)',
        'rgba(52, 199, 89, 0.55)',
        'rgba(52, 199, 89, 0.85)',
        'rgba(255, 59, 48, 0.85)'
    ];

    const borderColors = [
        '#007aff',
        '#007aff',
        '#34c759',
        '#34c759',
        '#34c759',
        '#ff3b30'
    ];

    dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Statistika',
                data: dataValues,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        font: {
                            size: 11,
                            family: 'Inter'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8e8e93'
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e5e5ea',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10,
                            family: 'Inter'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#8e8e93',
                        maxRotation: 30,
                        minRotation: 20
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ============================================================
// CLEANUP
// ============================================================
window.addEventListener('beforeunload', function() {
    if (refreshInterval) clearInterval(refreshInterval);
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    if (profileCheckInterval) clearInterval(profileCheckInterval);
    if (subscriptionUpdateInterval) clearInterval(subscriptionUpdateInterval);
    if (dashboardChart) {
        dashboardChart.destroy();
        dashboardChart = null;
    }
    cachedStats = null;
});

console.log('✅ dashboard.js yuklandi');
