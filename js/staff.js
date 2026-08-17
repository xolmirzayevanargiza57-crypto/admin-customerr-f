// ============================================================
// STAFF - XODIMLAR (TO'LIQ)
// Loyiha: Admin-Customer Frontend
// Fayl: js/staff.js
// ============================================================

let staffData = [];
let editingStaffId = null;
let currentFilter = { search: '', position: 'all', status: 'all' };

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

    // Foydalanuvchi ma'lumotlari
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

    // ⭐ CTRL+K - Qidiruvga fokus
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    // ⭐ Event listenerlar
    document.getElementById('searchInput').addEventListener('input', function() {
        currentFilter.search = this.value.toLowerCase();
        filterAndRenderStaff();
    });

    document.getElementById('positionFilter').addEventListener('change', function() {
        currentFilter.position = this.value;
        filterAndRenderStaff();
    });

    document.getElementById('statusFilter').addEventListener('change', function() {
        currentFilter.status = this.value;
        filterAndRenderStaff();
    });

    document.getElementById('addStaffBtn').addEventListener('click', function() {
        openStaffModal();
    });

    document.getElementById('closeStaffModal').addEventListener('click', function() {
        closeStaffModal();
    });

    document.getElementById('cancelStaffModal').addEventListener('click', function() {
        closeStaffModal();
    });

    document.getElementById('saveStaffModal').addEventListener('click', function() {
        saveStaff();
    });

    document.getElementById('closeStaffProfileModal').addEventListener('click', function() {
        closeStaffProfileModal();
    });

    document.getElementById('closeStaffProfileBtn').addEventListener('click', function() {
        closeStaffProfileModal();
    });

    document.getElementById('editFromProfileBtn').addEventListener('click', function() {
        const id = this.dataset.id;
        if (id) {
            closeStaffProfileModal();
            setTimeout(function() {
                openStaffModal(id);
            }, 300);
        }
    });

    document.getElementById('exportBtn').addEventListener('click', function() {
        exportStaffData();
    });

    // ⭐ Maosh o'zgarganda yillik va kunlik hisoblash
    document.getElementById('staffSalary').addEventListener('input', function() {
        const salary = parseInt(this.value) || 0;
        document.getElementById('yearlySalaryDisplay').textContent = formatMoney(salary * 12);
        document.getElementById('dailySalaryDisplay').textContent = formatMoney(Math.round(salary / 22));
    });

    // ⭐ Modalni tashqariga bosganda yopish
    document.getElementById('staffModal').addEventListener('click', function(e) {
        if (e.target === this) closeStaffModal();
    });

    document.getElementById('staffProfileModal').addEventListener('click', function(e) {
        if (e.target === this) closeStaffProfileModal();
    });

    // ⭐ Ma'lumotlarni yuklash
    loadStaff();
});

// ============================================================
// STAFF MA'LUMOTLARINI YUKLASH
// ============================================================
async function loadStaff() {
    try {
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        if (!token) return;

        const response = await fetch(window.__API_BASE_URL__ + '/api/staff', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            staffData = data.data || [];
            renderStaff(staffData);
            updateStats(staffData);
        } else {
            showError(data.message || 'Ma\'lumotlar yuklanmadi');
            staffData = [];
            renderStaff([]);
            updateStats([]);
        }
    } catch (error) {
        console.error('❌ Staff yuklash xatosi:', error);
        showError('Server bilan bog\'lanib bo\'lmadi');
        staffData = [];
        renderStaff([]);
        updateStats([]);
    }
}

// ============================================================
// STATISTIKANI YANGILASH
// ============================================================
function updateStats(staff) {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const inactive = staff.filter(s => s.status === 'inactive').length;
    const totalSalary = staff.reduce((sum, s) => sum + (s.salary || 0), 0);

    document.getElementById('totalStaff').textContent = total;
    document.getElementById('activeStaff').textContent = active;
    document.getElementById('inactiveStaff').textContent = inactive;
    document.getElementById('totalSalary').textContent = formatMoney(totalSalary);

    // ⭐ To'lov ogohlantirishi
    checkSalaryWarnings(staff);
}

// ============================================================
// TO'LOV OGOHLANTIRISHI
// ============================================================
function checkSalaryWarnings(staff) {
    const warningEl = document.getElementById('salaryWarning');
    const warningText = document.getElementById('salaryWarningText');

    // Har bir xodim uchun to'lov holatini tekshirish
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let warnings = [];

    staff.forEach(s => {
        if (s.status !== 'active') return;
        const salary = s.salary || 0;
        const lastPayment = s.lastPayment || null;
        const paidAmount = s.paidAmount || 0;

        // Qancha to'lanishi kerak (100% to'liq)
        const expectedAmount = salary;

        // Qancha to'langan
        const paid = paidAmount;

        // Qolgan qarz
        const remaining = expectedAmount - paid;

        if (remaining > 0) {
            const monthNames = ['Yanvar', 'Fevral', 'Mart', 'April', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
            const monthName = monthNames[currentMonth];

            warnings.push({
                name: s.fullName,
                position: s.position,
                salary: salary,
                paid: paid,
                remaining: remaining,
                month: monthName,
                monthIndex: currentMonth,
                year: currentYear
            });
        }
    });

    if (warnings.length > 0) {
        warningEl.classList.add('show');
        let html = '<i class="fas fa-exclamation-triangle"></i> ';
        html += warnings.map(w => 
            `<strong>${w.name}</strong> (${w.position}): ` +
            `${formatMoney(w.salary)} dan ${formatMoney(w.paid)} to'langan, ` +
            `<span style="color: #d32f2f;">${formatMoney(w.remaining)} qoldi</span> ` +
            `(${w.month} ${w.year})`
        ).join('<br>');
        warningText.innerHTML = html;
    } else {
        warningEl.classList.remove('show');
    }
}

// ============================================================
// STAFF RO'YXATINI RENDER QILISH
// ============================================================
function renderStaff(staff) {
    const tbody = document.getElementById('staffTableBody');

    if (!staff || staff.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 40px 20px; color: var(--text-muted);">
                    <i class="fas fa-users" style="font-size: 2rem; display: block; margin-bottom: 8px; color: var(--text-muted);"></i>
                    Xodimlar topilmadi
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = staff.map((s, index) => {
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

        const statusClass = s.status === 'active' ? 'active' : 'inactive';
        const statusLabel = s.status === 'active' ? '✅ Faol' : '⛔ Faol emas';

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${s.fullName || '-'}</strong></td>
                <td>${positionLabels[s.position] || s.position || '-'}</td>
                <td>${s.phone || '-'}</td>
                <td>${formatMoney(s.salary || 0)}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon view" onclick="viewStaff('${s._id}')" title="Ko'rish">
                            <i class="fas fa-eye"></i> <span>Ko'rish</span>
                        </button>
                        <button class="btn-icon edit" onclick="openStaffModal('${s._id}')" title="Tahrirlash">
                            <i class="fas fa-edit"></i> <span>Tahrirlash</span>
                        </button>
                        <button class="btn-icon delete" onclick="deleteStaff('${s._id}')" title="O'chirish">
                            <i class="fas fa-trash"></i> <span>O'chirish</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================================
// FILTRLASH VA QIDIRISH
// ============================================================
function filterAndRenderStaff() {
    let filtered = staffData;

    // Qidiruv
    if (currentFilter.search) {
        filtered = filtered.filter(s =>
            s.fullName?.toLowerCase().includes(currentFilter.search) ||
            s.position?.toLowerCase().includes(currentFilter.search) ||
            s.phone?.includes(currentFilter.search)
        );
    }

    // Lavozim bo'yicha
    if (currentFilter.position !== 'all') {
        filtered = filtered.filter(s => s.position === currentFilter.position);
    }

    // Holat bo'yicha
    if (currentFilter.status !== 'all') {
        filtered = filtered.filter(s => s.status === currentFilter.status);
    }

    renderStaff(filtered);
    updateStats(filtered);
}

// ============================================================
// STAFF MODAL (QO'SHISH/TAHRIRLASH)
// ============================================================
function openStaffModal(id = null) {
    const modal = document.getElementById('staffModal');
    const title = document.getElementById('staffModalTitle');
    const form = document.getElementById('staffForm');
    const saveBtn = document.getElementById('saveStaffModal');

    editingStaffId = id;

    if (id) {
        title.innerHTML = '<i class="fas fa-edit"></i> Xodimni tahrirlash';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Yangilash';

        // Ma'lumotlarni yuklash
        const staff = staffData.find(s => s._id === id);
        if (staff) {
            document.getElementById('staffFullName').value = staff.fullName || '';
            document.getElementById('staffPosition').value = staff.position || '';
            document.getElementById('staffPhone').value = staff.phone || '';
            document.getElementById('staffSalary').value = staff.salary || '';
            document.getElementById('staffStatus').value = staff.status || 'active';

            // Maosh hisoblash
            const salary = staff.salary || 0;
            document.getElementById('yearlySalaryDisplay').textContent = formatMoney(salary * 12);
            document.getElementById('dailySalaryDisplay').textContent = formatMoney(Math.round(salary / 22));
        }
    } else {
        title.innerHTML = '<i class="fas fa-user-plus"></i> Yangi xodim';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
        form.reset();
        document.getElementById('staffStatus').value = 'active';
        document.getElementById('yearlySalaryDisplay').textContent = '0 so\'m';
        document.getElementById('dailySalaryDisplay').textContent = '0 so\'m';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Fokus birinchi maydonga
    setTimeout(function() {
        document.getElementById('staffFullName').focus();
    }, 100);
}

function closeStaffModal() {
    document.getElementById('staffModal').classList.remove('active');
    document.body.style.overflow = '';
    editingStaffId = null;
}

// ============================================================
// STAFF SAQLASH
// ============================================================
async function saveStaff() {
    const fullName = document.getElementById('staffFullName').value.trim();
    const position = document.getElementById('staffPosition').value;
    const phone = document.getElementById('staffPhone').value.trim();
    const salary = parseInt(document.getElementById('staffSalary').value) || 0;
    const status = document.getElementById('staffStatus').value;

    // Validatsiya
    if (!fullName) {
        showError('F.I.SH majburiy!');
        document.getElementById('staffFullName').focus();
        return;
    }

    if (!position) {
        showError('Lavozim tanlang!');
        document.getElementById('staffPosition').focus();
        return;
    }

    if (!salary || salary <= 0) {
        showError('Maosh 0 dan katta bo\'lishi kerak!');
        document.getElementById('staffSalary').focus();
        return;
    }

    const saveBtn = document.getElementById('saveStaffModal');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

    try {
        const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
        const data = {
            fullName,
            position,
            phone,
            salary,
            status
        };

        let url = window.__API_BASE_URL__ + '/api/staff';
        let method = 'POST';

        if (editingStaffId) {
            url += '/' + editingStaffId;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(editingStaffId ? 'Xodim yangilandi!' : 'Xodim qo\'shildi!');
            closeStaffModal();
            await loadStaff();
        } else {
            showError(result.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ Staff saqlash xatosi:', error);
        showError('Server xatosi! Qayta urinib ko\'ring.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = editingStaffId ? '<i class="fas fa-save"></i> Yangilash' : '<i class="fas fa-save"></i> Saqlash';
    }
}

// ============================================================
// STAFF KO'RISH (PROFIL)
// ============================================================
function viewStaff(id) {
    const staff = staffData.find(s => s._id === id);
    if (!staff) {
        showError('Xodim topilmadi!');
        return;
    }

    const modal = document.getElementById('staffProfileModal');
    const body = document.getElementById('staffProfileBody');
    const editBtn = document.getElementById('editFromProfileBtn');
    editBtn.dataset.id = id;

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

    body.innerHTML = `
        <div class="staff-profile-card">
            <div class="profile-header">
                <div class="profile-avatar">${(staff.fullName || 'A').charAt(0).toUpperCase()}</div>
                <div class="profile-info">
                    <h3>${staff.fullName || '-'}</h3>
                    <div class="position">${positionLabels[staff.position] || staff.position || '-'}</div>
                    <span class="status-badge ${staff.status === 'active' ? 'active' : 'inactive'}" style="margin-top:4px;">
                        ${staff.status === 'active' ? '✅ Faol' : '⛔ Faol emas'}
                    </span>
                </div>
            </div>

            <div class="profile-details">
                <div class="detail-item">
                    <div class="label"><i class="fas fa-phone"></i> Telefon</div>
                    <div class="value">${staff.phone || '-'}</div>
                </div>
                <div class="detail-item">
                    <div class="label"><i class="fas fa-money-bill"></i> Oylik maosh</div>
                    <div class="value salary">${formatMoney(salary)}</div>
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

            <div class="payment-warning ${remaining > 0 ? '' : 'style="display:none;"'}">
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
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeStaffProfileModal() {
    document.getElementById('staffProfileModal').classList.remove('active');
    document.body.style.overflow = '';
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
            await loadStaff();
        } else {
            showError(result.message || 'Xatolik yuz berdi!');
        }
    } catch (error) {
        console.error('❌ Staff o\'chirish xatosi:', error);
        showError('Server xatosi! Qayta urinib ko\'ring.');
    }
}

// ============================================================
// EKSPORT (Excel/PDF)
// ============================================================
function exportStaffData() {
    // Eksport formatini tanlash
    const format = confirm('Excel (.csv) formatida eksport qilmoqchimisiz? "OK" - CSV, "Bekor" - PDF');

    if (format) {
        exportToCSV();
    } else {
        exportToPDF();
    }
}

function exportToCSV() {
    const headers = ['#', 'F.I.SH', 'Lavozimi', 'Telefon', 'Oylik maosh', 'Holati'];
    const rows = staffData.map((s, i) => [
        i + 1,
        s.fullName || '',
        s.position || '',
        s.phone || '',
        s.salary || 0,
        s.status === 'active' ? 'Faol' : 'Faol emas'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'xodimlar_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportToPDF() {
    // PDF eksport uchun html tayyorlash
    let html = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #f5f5f7; padding: 10px; border: 1px solid #ddd; text-align: left; }
                td { padding: 10px; border: 1px solid #ddd; }
            </style>
        </head>
        <body>
            <h1>Xodimlar ro'yxati</h1>
            <p>Sana: ${new Date().toLocaleString('uz-UZ')}</p>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>F.I.SH</th>
                        <th>Lavozimi</th>
                        <th>Telefon</th>
                        <th>Oylik maosh</th>
                        <th>Holati</th>
                    </tr>
                </thead>
                <tbody>
    `;

    staffData.forEach((s, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${s.fullName || ''}</td>
                <td>${s.position || ''}</td>
                <td>${s.phone || ''}</td>
                <td>${formatMoney(s.salary || 0)}</td>
                <td>${s.status === 'active' ? 'Faol' : 'Faol emas'}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            <p style="margin-top: 20px; color: #666;">Jami: ${staffData.length} ta xodim</p>
        </body>
        </html>
    `;

    // Yangi oynada ochish
    const win = window.open('', '_blank');
    if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
    } else {
        showError('PDF ochish uchun popup blokirovkasini o\'chiring!');
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

console.log('✅ staff.js yuklandi');
