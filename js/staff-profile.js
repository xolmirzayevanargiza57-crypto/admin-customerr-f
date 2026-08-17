// ============================================================
// STAFF PROFILE - XODIM PROFILI
// Loyiha: Admin-Customer Frontend
// Fayl: js/staff-profile.js
// ============================================================

let staffId = null;

// ============================================================
// PULNI FORMATLASH
// ============================================================
function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 so\'m';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0 so\'m';
    return num.toLocaleString('uz-UZ') + ' so\'m';
}

// ============================================================
// SAHIFA YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            const html = document.documentElement;
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Hamburger menu
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('show');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            const isSidebar = sidebar.contains(e.target);
            const isToggle = menuToggle.contains(e.target);
            if (!isSidebar && !isToggle && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        }
    });

    if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
    }

    // ⭐ ID ni olish
    const params = new URLSearchParams(window.location.search);
    staffId = params.get('id');

    if (!staffId) {
        showError('Xodim ID topilmadi!');
        setTimeout(() => window.location.href = 'staff.html', 2000);
        return;
    }

    loadStaffProfile(staffId);
});

// ============================================================
// STAFF PROFILINI YUKLASH
// ============================================================
async function loadStaffProfile(id) {
    try {
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        const response = await fetch(window.__API_BASE_URL__ + '/api/staff/' + id, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success && data.data) {
            renderProfile(data.data);
        } else {
            showError(data.message || 'Xodim topilmadi!');
            setTimeout(() => window.location.href = 'staff.html', 2000);
        }
    } catch (error) {
        console.error('❌ Staff profil yuklash xatosi:', error);
        showError('Server xatosi!');
        document.getElementById('profileCard').innerHTML = `
            <div class="text-center text-muted" style="padding: 40px 0;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; display: block; margin-bottom: 12px; color: var(--color-danger);"></i>
                <p>Xodim ma'lumotlari yuklanmadi</p>
                <button class="btn-secondary" style="width: auto; margin-top: 12px; padding: 8px 20px;" onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> Qayta yuklash
                </button>
            </div>
        `;
    }
}

// ============================================================
// PROFILNI RENDER QILISH
// ============================================================
function renderProfile(staff) {
    const container = document.getElementById('profileCard');
    document.getElementById('profileName').textContent = staff.fullName || 'Xodim';

    const positionLabels = {
        'tozalovchi': '🧹 Tozalovchi',
        'tamirlovchi': '🔧 Tamirlovchi',
        'haydovchi': '🚗 Haydovchi',
        'oshpaz': '🍳 Oshpaz',
        'farrosh': '🧹 Farrosh',
        'qorovul': '🔒 Qorovul',
        'ofitsiant': '🍽️ Ofitsiant',
        'administrator': '📋 Administrator',
        'buxgalter': '📊 Buxgalter',
        'kotib': '📝 Kotib',
        'menejer': '💼 Menejer',
        'xodim': '👤 Xodim'
    };

    const salary = staff.salary || 0;
    const yearly = salary * 12;
    const daily = Math.round(salary / 22);

    // To'lov holati
    const now = new Date();
    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'April', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
    const currentMonth = monthNames[now.getMonth()];
    const paidAmount = staff.paidAmount || 0;
    const remaining = salary - paidAmount;

    container.innerHTML = `
        <div class="header">
            <div class="avatar">${(staff.fullName || 'A').charAt(0).toUpperCase()}</div>
            <div class="info">
                <h2>${staff.fullName || '-'}</h2>
                <div class="position">${positionLabels[staff.position] || staff.position || '-'}</div>
                <span class="status-badge ${staff.status === 'active' ? 'active' : 'inactive'}" style="margin-top:4px; display:inline-block;">
                    ${staff.status === 'active' ? '✅ Faol' : '⛔ Faol emas'}
                </span>
            </div>
        </div>

        <div class="details">
            <div class="item">
                <div class="label"><i class="fas fa-phone"></i> Telefon</div>
                <div class="value">${staff.phone || '-'}</div>
            </div>
            <div class="item">
                <div class="label"><i class="fas fa-money-bill"></i> Oylik maosh</div>
                <div class="value" style="color: var(--color-success);">${formatMoney(salary)}</div>
            </div>
            <div class="item">
                <div class="label"><i class="fas fa-calendar"></i> Qo'shilgan</div>
                <div class="value">${staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('uz-UZ') : '-'}</div>
            </div>
            <div class="item">
                <div class="label"><i class="fas fa-id-card"></i> ID</div>
                <div class="value" style="font-size: 0.8rem; color: var(--text-muted);">${staff._id || '-'}</div>
            </div>
        </div>

        <div class="salary-breakdown">
            <div class="title">📊 Maosh tafsilotlari</div>
            <div class="row">
                <span class="label">📅 Oylik</span>
                <span class="value">${formatMoney(salary)}</span>
            </div>
            <div class="row">
                <span class="label">📆 Yillik</span>
                <span class="value">${formatMoney(yearly)}</span>
            </div>
            <div class="row">
                <span class="label">⏰ Kunlik (22 kun)</span>
                <span class="value">${formatMoney(daily)}</span>
            </div>
        </div>

        <div class="payment-warning" ${remaining > 0 ? '' : 'style="display:none;"'}>
            <div class="title">
                <i class="fas fa-exclamation-triangle"></i> To'lov ogohlantirishi
            </div>
            <div class="text">
                ${remaining > 0 ? 
                    `<strong>${staff.fullName}</strong> (${positionLabels[staff.position] || staff.position}) uchun 
                    <strong>${currentMonth}</strong> oyida <strong>${formatMoney(remaining)}</strong> to'lanishi kerak!
                    (Jami: ${formatMoney(salary)}, To'langan: ${formatMoney(paidAmount)})` : 
                    '✅ Barcha to\'lovlar to\'liq amalga oshirilgan.'
                }
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
            <button class="btn-secondary" style="width: auto; padding: 8px 20px;" onclick="window.location.href='staff.html'">
                <i class="fas fa-arrow-left"></i> Orqaga
            </button>
            <button class="btn-primary" style="width: auto; padding: 8px 20px; background: var(--color-blue);" onclick="window.location.href='staff-add.html?id=${staff._id}'">
                <i class="fas fa-edit"></i> Tahrirlash
            </button>
            <button class="btn-danger" style="width: auto; padding: 8px 20px;" onclick="deleteStaff('${staff._id}')">
                <i class="fas fa-trash"></i> O'chirish
            </button>
        </div>
    `;
}

// ============================================================
// STAFF O'CHIRISH
// ============================================================
async function deleteStaff(id) {
    if (!confirm('Haqiqatan ham bu xodimni o\'chirmoqchimisiz?')) return;

    try {
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        const response = await fetch(window.__API_BASE_URL__ + '/api/staff/' + id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('Xodim o\'chirildi!');
            setTimeout(() => window.location.href = 'staff.html', 1000);
        } else {
            showError(result.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ Staff o\'chirish xatosi:', error);
        showError('Server xatosi! Qayta urinib ko\'ring.');
    }
}

// ============================================================
// XABAR FUNKSIYALARI
// ============================================================
function showError(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        padding: 14px 18px; background: #fef2f2;
        border: 1px solid #fecaca; border-radius: 10px;
        color: #dc2626; max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex; align-items: center; gap: 10px;
        font-size: 0.85rem;
    `;
    div.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #dc2626; cursor: pointer; font-size: 1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        padding: 14px 18px; background: #ecfdf5;
        border: 1px solid #a7f3d0; border-radius: 10px;
        color: #065f46; max-width: 400px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex; align-items: center; gap: 10px;
        font-size: 0.85rem;
    `;
    div.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${msg}</span>
        <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: #065f46; cursor: pointer; font-size: 1.1rem;">×</button>
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

console.log('✅ staff-profile.js yuklandi');
