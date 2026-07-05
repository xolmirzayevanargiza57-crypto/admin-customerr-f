// ============================================================
// DASHBOARD - STATISTIKALAR (XATOLIKLARNI LOGDA KO'RSATADI)
// ============================================================

let attendanceChart = null;
let attendancePieChart = null;
let groupChart = null;
let studentAttendanceChart = null;

// ⭐ XATOLIKLARNI USHLASH VA LOGGA YOZISH
window.addEventListener('error', function(e) {
    console.error('❌ GLOBAL XATOLIK:', e.message);
    console.error('📍 Fayl:', e.filename);
    console.error('📍 Qator:', e.lineno);
    console.error('📍 Ustun:', e.colno);
    console.error('📍 Element:', e.target);
});

// ⭐ UNHANDLED PROMISE REJECTION
window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ UNHANDLED REJECTION:', e.reason);
    console.error('📍 Promise:', e.promise);
});

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 ========================================');
    console.log('🚀 DASHBOARD YUKLANMOQDA...');
    console.log('🚀 ========================================');
    console.log('📍 Hozirgi URL:', window.location.href);
    console.log('📍 Hozirgi vaqt:', new Date().toISOString());
    
    try {
        // ============================================================
        // 1. TOKEN TEKSHIRISH
        // ============================================================
        console.log('🔍 1. Token tekshirilmoqda...');
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        console.log('📌 Token mavjudmi?', token ? '✅ Ha' : '❌ Yo\'q');
        
        if (!token) {
            console.warn('⚠️ Token topilmadi! Login sahifasiga o\'tilmoqda...');
            window.location.href = 'index.html';
            return;
        }

        // ============================================================
        // 2. USER MA'LUMOTLARI
        // ============================================================
        console.log('🔍 2. Foydalanuvchi ma\'lumotlari yuklanmoqda...');
        const user = Auth.getUser();
        console.log('📌 Foydalanuvchi:', user ? user.fullName || 'Admin' : 'Yo\'q');
        
        if (user) {
            const nameEl = document.getElementById('userName');
            const initialEl = document.getElementById('userInitial');
            const schoolEl = document.getElementById('schoolName');
            
            if (nameEl) {
                nameEl.textContent = user.fullName || 'Admin';
                console.log('✅ userName yangilandi:', nameEl.textContent);
            } else {
                console.warn('⚠️ userName elementi topilmadi!');
            }
            
            if (initialEl) {
                initialEl.textContent = Auth.getUserInitial();
                console.log('✅ userInitial yangilandi:', initialEl.textContent);
            }
            
            if (schoolEl) {
                schoolEl.textContent = user.schoolName || 'Nurli Ta\'lim Markazi';
                console.log('✅ schoolName yangilandi:', schoolEl.textContent);
            }
        }

        // ============================================================
        // 3. CHART.JS TEKSHIRISH
        // ============================================================
        console.log('🔍 3. Chart.js tekshirilmoqda...');
        console.log('📌 typeof Chart:', typeof Chart);
        console.log('📌 Chart:', Chart);
        
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js yuklanmagan!');
            console.log('🔄 Chart.js ni dinamik yuklashga harakat qilinmoqda...');
            
            try {
                await loadChartJS();
                console.log('✅ Chart.js dinamik yuklandi!');
                console.log('📌 Yangi typeof Chart:', typeof Chart);
                console.log('📌 Yangi Chart versiya:', Chart?.version);
            } catch (error) {
                console.error('❌ Chart.js yuklanmadi:', error);
                showError('Chart.js kutubxonasi yuklanmadi! Internet ulanishini tekshiring.');
                return;
            }
        } else {
            console.log('✅ Chart.js yuklandi, versiya:', Chart.version);
        }

        // ============================================================
        // 4. CANVAS ELEMENTLARINI TEKSHIRISH
        // ============================================================
        console.log('🔍 4. Canvas elementlari tekshirilmoqda...');
        
        const canvas1 = document.getElementById('attendanceChart');
        const canvas2 = document.getElementById('attendancePieChart');
        
        console.log('📌 attendanceChart canvas:', canvas1);
        console.log('📌 attendancePieChart canvas:', canvas2);
        
        if (!canvas1) {
            console.error('❌ attendanceChart canvas topilmadi!');
            showError('attendanceChart canvas elementi topilmadi!');
            return;
        }
        if (!canvas2) {
            console.error('❌ attendancePieChart canvas topilmadi!');
            showError('attendancePieChart canvas elementi topilmadi!');
            return;
        }
        console.log('✅ Canvas elementlari topildi!');

        // ============================================================
        // 5. CHART'LARNI YARATISH
        // ============================================================
        console.log('🔍 5. Chart\'lar yaratilmoqda...');
        try {
            initCharts();
            console.log('✅ Chart\'lar yaratildi!');
        } catch (error) {
            console.error('❌ Chart\'lar yaratishda xatolik:', error);
            console.error('📍 Xatolik stack:', error.stack);
            showError('Grafiklar yaratishda xatolik: ' + error.message);
            return;
        }

        // ============================================================
        // 6. MA'LUMOTLARNI YUKLASH
        // ============================================================
        console.log('🔍 6. Dashboard statistikasi yuklanmoqda...');
        try {
            await loadDashboardStats();
            console.log('✅ Dashboard statistikasi yuklandi!');
        } catch (error) {
            console.error('❌ Statistikani yuklashda xatolik:', error);
            console.error('📍 Xatolik stack:', error.stack);
            showError('Ma\'lumotlarni yuklashda xatolik: ' + error.message);
        }

        // ============================================================
        // 7. EVENT LISTENERLAR
        // ============================================================
        console.log('🔍 7. Event listenerlar o\'rnatilmoqda...');
        setupListeners();
        console.log('✅ Event listenerlar o\'rnatildi!');
        
        console.log('🚀 ========================================');
        console.log('🚀 DASHBOARD YUKLANDI!');
        console.log('🚀 ========================================');
        
    } catch (error) {
        console.error('❌ DASHBOARD YUKLASHDA XATOLIK:', error);
        console.error('📍 Xatolik stack:', error.stack);
        showError('Dashboard yuklashda xatolik: ' + error.message);
    }
});

// ============================================================
// ⭐ CHART.JS NI DINAMIK YUKLASH
// ============================================================
function loadChartJS() {
    console.log('📥 Chart.js yuklanmoqda...');
    return new Promise((resolve, reject) => {
        if (typeof Chart !== 'undefined') {
            console.log('✅ Chart.js allaqachon yuklangan');
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = function() {
            console.log('✅ Chart.js dinamik yuklandi!');
            console.log('📌 Yangi versiya:', Chart?.version);
            resolve();
        };
        
        script.onerror = function(error) {
            console.error('❌ Chart.js yuklanmadi!', error);
            reject(new Error('Chart.js yuklanmadi: ' + (error.message || 'Noma\'lum xatolik')));
        };
        
        document.head.appendChild(script);
        console.log('📥 Chart.js skripti yuklanmoqda...');
    });
}

// ============================================================
// ⭐ CHART'LARNI YARATISH
// ============================================================
function getWeeklyChartLabels() {
    const dayNames = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
    const today = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() - i);
        labels.push(dayNames[(d.getDay() + 6) % 7]);
    }

    return labels;
}

function initCharts() {
    console.log('📊 Chart\'lar yaratilmoqda...');
    
    try {
        // === BAR CHART ===
        const ctx = document.getElementById('attendanceChart');
        console.log('📌 attendanceChart canvas:', ctx);
        
        if (!ctx) {
            throw new Error('attendanceChart canvas topilmadi!');
        }
        
        if (attendanceChart) {
            console.log('🔄 Eski attendanceChart o\'chirilmoqda...');
            attendanceChart.destroy();
            attendanceChart = null;
        }

        console.log('📊 Bar chart yaratilmoqda...');
        
        attendanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: getWeeklyChartLabels(),
                datasets: [
                    {
                        label: 'Keldi',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(52, 199, 89, 0.7)',
                        borderColor: '#34c759',
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    {
                        label: 'Sababli',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(255, 149, 0, 0.7)',
                        borderColor: '#ff9500',
                        borderWidth: 2,
                        borderRadius: 4
                    },
                    {
                        label: 'Kelmadi',
                        data: [0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(255, 59, 48, 0.7)',
                        borderColor: '#ff3b30',
                        borderWidth: 2,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 11 },
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            font: { size: 11 }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('✅ Bar chart yaratildi');
        console.log('📌 attendanceChart:', attendanceChart);

        // === PIE CHART ===
        const pieCtx = document.getElementById('attendancePieChart');
        console.log('📌 attendancePieChart canvas:', pieCtx);
        
        if (!pieCtx) {
            throw new Error('attendancePieChart canvas topilmadi!');
        }
        
        if (attendancePieChart) {
            console.log('🔄 Eski attendancePieChart o\'chirilmoqda...');
            attendancePieChart.destroy();
            attendancePieChart = null;
        }

        console.log('📊 Pie chart yaratilmoqda...');
        
        attendancePieChart = new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Keldi', 'Sababli', 'Kelmadi'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#34c759', '#ff9500', '#ff3b30'],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 11 },
                            padding: 15
                        }
                    }
                },
                cutout: '70%'
            }
        });
        
        console.log('✅ Pie chart yaratildi');
        console.log('📌 attendancePieChart:', attendancePieChart);

        // === GROUP CHART ===
        const groupCtx = document.getElementById('groupChart');
        if (groupCtx) {
            if (groupChart) {
                groupChart.destroy();
                groupChart = null;
            }
            groupChart = new Chart(groupCtx, {
                type: 'bar',
                data: {
                    labels: ['A', 'B', 'C', 'Boshqa'],
                    datasets: [{
                        label: 'O\'quvchilar',
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#007aff', '#34c759', '#ff9500', '#8e8e93'],
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        x: { ticks: { font: { size: 11 } } }
                    }
                }
            });
        }

        const studentChartCtx = document.getElementById('studentAttendanceChart');
        if (studentChartCtx) {
            if (studentAttendanceChart) {
                studentAttendanceChart.destroy();
                studentAttendanceChart = null;
            }
            studentAttendanceChart = new Chart(studentChartCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Keldi',
                            data: [],
                            backgroundColor: '#34c759',
                            borderRadius: 4,
                            stack: 'Stack 0'
                        },
                        {
                            label: 'Sababli',
                            data: [],
                            backgroundColor: '#ff9500',
                            borderRadius: 4,
                            stack: 'Stack 0'
                        },
                        {
                            label: 'Sababsiz',
                            data: [],
                            backgroundColor: '#ff3b30',
                            borderRadius: 4,
                            stack: 'Stack 0'
                        }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: { size: 11 },
                                padding: 12
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { font: { size: 11 }, stepSize: 1 },
                            stacked: true,
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        y: {
                            ticks: { font: { size: 11 } },
                            stacked: true,
                            grid: { display: false }
                        }
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Chart yaratish xatosi:', error);
        console.error('📍 Xatolik stack:', error.stack);
        throw error;
    }
}

// ============================================================
// ⭐ STATISTIKALARNI YUKLASH
// ============================================================
async function loadDashboardStats() {
    console.log('📊 Dashboard statistikasi yuklanmoqda...');
    
    try {
        const data = await API.getDashboardStats();
        console.log('📊 Statistika javobi:', data);
        
        if (!data.success) {
            console.error('❌ Statistika xatosi:', data.message);
            showError('Ma\'lumotlarni yuklashda xatolik: ' + (data.message || 'Noma\'lum xatolik'));
            return;
        }
        
        const stats = data.data;
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
        
        console.log('📌 Elementlar tekshirilmoqda...');
        Object.keys(elements).forEach(key => {
            if (!elements[key]) {
                console.warn(`⚠️ ${key} elementi topilmadi!`);
            }
        });
        
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

        // Subscription
        if (stats.subscription) {
            const statusMap = { active: 'Faol', inactive: 'Faol emas', expired: 'Muddati tugagan' };
            const typeMap = { monthly: 'Oylik', sixmonths: '6 oylik', yearly: 'Yillik', none: "Yo'q" };
            if (elements.subscriptionStatus) {
                elements.subscriptionStatus.textContent = statusMap[stats.subscription.status] || 'Noma\'lum';
            }
            if (elements.subscriptionType) {
                elements.subscriptionType.textContent = typeMap[stats.subscription.type] || 'Noma\'lum';
            }
            if (stats.subscription.endDate && elements.subscriptionEnd) {
                const end = new Date(stats.subscription.endDate);
                elements.subscriptionEnd.textContent = end.toLocaleDateString('uz');
                const days = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
                if (elements.subscriptionDays) {
                    elements.subscriptionDays.textContent = days > 0 ? `${days} kun` : 'Tugagan';
                }
            }
        }

        // ⭐ CHART'LARNI YANGILASH
        console.log('📊 Chart\'lar yangilanmoqda...');
        
        if (stats.weeklyAttendance && stats.weeklyAttendance.length > 0) {
            console.log('📊 Haftalik davomat ma\'lumotlari:', stats.weeklyAttendance);
            updateAttendanceChart(stats.weeklyAttendance);
        } else {
            console.warn('⚠️ Haftalik davomat ma\'lumotlari mavjud emas');
            const defaultData = getWeeklyChartLabels().map((label) => ({
                date: label,
                present: 0,
                absent_reason: 0,
                absent: 0
            }));
            updateAttendanceChart(defaultData);
        }
        
        if (stats.attendanceStats) {
            console.log('📊 Davomat statistikasi:', stats.attendanceStats);
            updatePieChart(stats.attendanceStats);
        } else {
            console.warn('⚠️ Davomat statistikasi mavjud emas');
            updatePieChart({ present: 0, absent_reason: 0, absent: 0 });
        }

        await loadGroupChartData();
        updateStudentAttendanceChart(stats.studentAttendanceSummary || []);
        
        console.log('✅ Dashboard statistikasi yuklandi!');
        
    } catch (error) {
        console.error('❌ Statistikani yuklash xatosi:', error);
        console.error('📍 Xatolik stack:', error.stack);
        throw error;
    }
}

// ============================================================
// ⭐ CHART'LARNI YANGILASH
// ============================================================
function updateAttendanceChart(weeklyData) {
    console.log('📊 Bar chart yangilanmoqda...');
    
    if (!attendanceChart) {
        console.warn('⚠️ attendanceChart mavjud emas, qayta yaratilmoqda...');
        initCharts();
        if (!attendanceChart) {
            console.error('❌ attendanceChart yaratib bo\'lmadi!');
            return;
        }
    }
    
    try {
        const labels = getWeeklyChartLabels();
        const presentData = weeklyData.map(d => d.present || 0);
        const absentReasonData = weeklyData.map(d => d.absent_reason || 0);
        const absentData = weeklyData.map(d => d.absent || 0);
        
        console.log('📊 Bar chart ma\'lumotlari:', { labels, presentData, absentReasonData, absentData });
        
        attendanceChart.data.labels = labels;
        attendanceChart.data.datasets[0].data = presentData;
        attendanceChart.data.datasets[1].data = absentReasonData;
        attendanceChart.data.datasets[2].data = absentData;
        attendanceChart.update();
        
        console.log('✅ Bar chart yangilandi');
    } catch (error) {
        console.error('❌ Bar chart yangilash xatosi:', error);
        console.error('📍 Xatolik stack:', error.stack);
    }
}

async function loadGroupChartData() {
    try {
        const studentsRes = await API.getStudents();
        const counts = { A: 0, B: 0, C: 0, other: 0 };

        if (studentsRes.success) {
            (studentsRes.data || []).forEach(student => {
                const group = String(student.group || 'A').toUpperCase();
                if (group.startsWith('A')) counts.A += 1;
                else if (group.startsWith('B')) counts.B += 1;
                else if (group.startsWith('C')) counts.C += 1;
                else counts.other += 1;
            });
        }

        updateGroupChart(counts);
    } catch (error) {
        console.error('❌ Guruh chart ma\'lumotlarini yuklash xatosi:', error);
        updateGroupChart({ A: 0, B: 0, C: 0, other: 0 });
    }
}

function updateGroupChart(counts) {
    if (!groupChart) {
        if (document.getElementById('groupChart')) {
            initCharts();
        }
        if (!groupChart) return;
    }

    groupChart.data.datasets[0].data = [counts.A || 0, counts.B || 0, counts.C || 0, counts.other || 0];
    groupChart.update();
}

function updateStudentAttendanceChart(summary) {
    if (!studentAttendanceChart) {
        if (document.getElementById('studentAttendanceChart')) {
            initCharts();
        }
        if (!studentAttendanceChart) return;
    }

    const labels = summary.map(item => item.studentName || 'Noma\'lum');
    const presentData = summary.map(item => item.present || 0);
    const absentReasonData = summary.map(item => item.absent_reason || 0);
    const absentData = summary.map(item => item.absent || 0);

    studentAttendanceChart.data.labels = labels;
    studentAttendanceChart.data.datasets[0].data = presentData;
    studentAttendanceChart.data.datasets[1].data = absentReasonData;
    studentAttendanceChart.data.datasets[2].data = absentData;
    studentAttendanceChart.update();
}

function updatePieChart(stats) {
    console.log('📊 Pie chart yangilanmoqda...');
    
    if (!attendancePieChart) {
        console.warn('⚠️ attendancePieChart mavjud emas, qayta yaratilmoqda...');
        initCharts();
        if (!attendancePieChart) {
            console.error('❌ attendancePieChart yaratib bo\'lmadi!');
            return;
        }
    }
    
    try {
        const present = stats.present || 0;
        const absentReason = stats.absent_reason || 0;
        const absent = stats.absent || 0;
        
        console.log('📊 Pie chart ma\'lumotlari:', { present, absentReason, absent });
        
        attendancePieChart.data.datasets[0].data = [present, absentReason, absent];
        attendancePieChart.update();
        
        console.log('✅ Pie chart yangilandi');
    } catch (error) {
        console.error('❌ Pie chart yangilash xatosi:', error);
        console.error('📍 Xatolik stack:', error.stack);
    }
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    console.log('🔧 Event listenerlar o\'rnatilmoqda...');
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('🔓 Chiqish tugmasi bosildi');
            Auth.logout();
        });
        console.log('✅ logoutBtn event listener o\'rnatildi');
    } else {
        console.warn('⚠️ logoutBtn elementi topilmadi!');
    }

    // Sidebar open/close is managed globally by js/theme.js to avoid duplicate handlers.

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log('🔄 Oyna o\'lchami o\'zgardi, chart\'lar yangilanmoqda...');
            if (attendanceChart) {
                attendanceChart.resize();
                console.log('✅ attendanceChart resize qilindi');
            }
            if (attendancePieChart) {
                attendancePieChart.resize();
                console.log('✅ attendancePieChart resize qilindi');
            }
            if (studentAttendanceChart) {
                studentAttendanceChart.resize();
                console.log('✅ studentAttendanceChart resize qilindi');
            }
        }, 500);
    });
    
    console.log('✅ resize event listener o\'rnatildi');
}

// ============================================================
// ⭐ XATOLIKNI KO'RSATISH
// ============================================================
function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    
    // Konsolda ko'rsatish
    console.group('❌ XATOLIK MA\'LUMOTLARI');
    console.error('📌 Xabar:', msg);
    console.error('📌 Vaqt:', new Date().toISOString());
    console.error('📌 URL:', window.location.href);
    console.groupEnd();
    
    // Ekranda ko'rsatish
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
console.log('📌 Vaqt:', new Date().toISOString());