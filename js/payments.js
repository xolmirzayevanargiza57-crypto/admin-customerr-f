// ============================================================
// PAYMENTS - TO'LOVLAR (TO'LIQ)
// ============================================================

let paymentsData = [];
let studentsData = [];
let teachersData = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    await loadData();
    setupListeners();
});

// ============================================================
// MA'LUMOTLARNI YUKLASH
// ============================================================
async function loadData() {
    try {
        const teachersRes = await API.getTeachers();
        if (teachersRes.success) {
            teachersData = teachersRes.data || [];
        }

        const studentsRes = await API.getStudents();
        if (studentsRes.success) {
            studentsData = studentsRes.data || [];
        }

        const paymentsRes = await API.getPayments();
        if (paymentsRes.success) {
            paymentsData = paymentsRes.data || [];
            renderPayments(paymentsData);
        } else {
            renderPayments([]);
        }
    } catch (error) {
        console.error('❌ Ma\'lumotlarni yuklash xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// TO'LOVLARNI KO'RSATISH
// ============================================================
function renderPayments(payments) {
    const tbody = document.getElementById('paymentsBody');
    if (!payments || payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" data-i18n="no_data">Ma'lumot yo'q</td></tr>`;
        I18N.updateUI();
        return;
    }

    tbody.innerHTML = payments.map(payment => `
        <tr>
            <td><strong><i class="fas fa-user-circle"></i> ${payment.studentName || 'Noma\'lum'}</strong></td>
            <td><i class="fas fa-user"></i> ${payment.teacherName || '-'}</td>
            <td><i class="fas fa-money-bill"></i> ${Utils.formatMoney(payment.amount, 'UZS')}</td>
            <td><i class="fas fa-calendar"></i> ${payment.month || '-'}</td>
            <td><span class="payment-status ${Utils.getStatusClass(payment.status)}">${Utils.formatStatus(payment.status)}</span></td>
            <td>
                <div class="actions-container">
                    <button class="btn-secondary" onclick="editPayment('${payment._id}')" title="${I18N.t('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deletePayment('${payment._id}')" title="${I18N.t('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    I18N.updateUI();
}

// ============================================================
// TO'LOV QO'SHISH MODAL
// ============================================================
function showAddPaymentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3><i class="fas fa-money-bill"></i> ${I18N.t('add_payment')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="addPaymentForm">
                <div class="form-group">
                    <label>${I18N.t('select_student')}</label>
                    <div class="input-wrapper">
                        <select id="paymentStudent" required>
                            <option value="">${I18N.t('select_student')}</option>
                            ${studentsData.map(s => `<option value="${s._id}" data-teacher="${s.teacherId}">${s.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('teacher')}</label>
                    <div class="input-wrapper">
                        <select id="paymentTeacher" required>
                            <option value="">${I18N.t('select_teacher')}</option>
                            ${teachersData.map(t => `<option value="${t._id}">${t.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('payment_amount')}</label>
                    <div class="input-wrapper">
                        <input type="number" id="paymentAmount" placeholder="0" required />
                        <i class="fas fa-check-circle input-icon success"></i>
                        <i class="fas fa-exclamation-circle input-icon error"></i>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('payment_month')}</label>
                    <div class="input-wrapper">
                        <input type="month" id="paymentMonth" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('payment_status')}</label>
                    <div class="input-wrapper">
                        <select id="paymentStatus">
                            <option value="paid">${I18N.t('paid')}</option>
                            <option value="pending">${I18N.t('pending')}</option>
                            <option value="unpaid">${I18N.t('unpaid')}</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()" style="width:auto;padding:8px 20px;font-size:0.8rem;">${I18N.t('cancel')}</button>
                    <button type="submit" class="btn-primary" style="width:auto;padding:8px 20px;font-size:0.8rem;"><i class="fas fa-save"></i> ${I18N.t('save')}</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    I18N.updateUI();

    document.getElementById('addPaymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('paymentStudent').value;
        const teacherId = document.getElementById('paymentTeacher').value;
        const amount = parseInt(document.getElementById('paymentAmount').value) || 0;
        const month = document.getElementById('paymentMonth').value;
        const status = document.getElementById('paymentStatus').value;

        if (!studentId || !teacherId || !amount || !month) {
            showError(I18N.t('all_fields_required'));
            return;
        }

        try {
            const data = await API.createPayment({ studentId, teacherId, amount, month, status });
            if (data.success) {
                document.querySelector('.modal').remove();
                showSuccess(I18N.t('success'));
                await loadData();
            } else {
                showError(data.message || I18N.t('error'));
            }
        } catch (error) {
            console.error('❌ To\'lov yaratish xatosi:', error);
            showError(I18N.t('network_error'));
        }
    });
}

// ============================================================
// TO'LOV TAHRIRLASH
// ============================================================
async function editPayment(id) {
    const payment = paymentsData.find(p => p._id === id);
    if (!payment) {
        showError(I18N.t('error'));
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> ${I18N.t('edit')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="editPaymentForm">
                <div class="form-group">
                    <label>${I18N.t('payment_status')}</label>
                    <div class="input-wrapper">
                        <select id="editPaymentStatus">
                            <option value="paid" ${payment.status === 'paid' ? 'selected' : ''}>${I18N.t('paid')}</option>
                            <option value="pending" ${payment.status === 'pending' ? 'selected' : ''}>${I18N.t('pending')}</option>
                            <option value="unpaid" ${payment.status === 'unpaid' ? 'selected' : ''}>${I18N.t('unpaid')}</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()" style="width:auto;padding:8px 20px;font-size:0.8rem;">${I18N.t('cancel')}</button>
                    <button type="submit" class="btn-primary" style="width:auto;padding:8px 20px;font-size:0.8rem;"><i class="fas fa-save"></i> ${I18N.t('save')}</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    I18N.updateUI();

    document.getElementById('editPaymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('editPaymentStatus').value;

        try {
            const data = await API.updatePayment(id, { status });
            if (data.success) {
                document.querySelector('.modal').remove();
                showSuccess(I18N.t('success'));
                await loadData();
            } else {
                showError(data.message || I18N.t('error'));
            }
        } catch (error) {
            console.error('❌ To\'lov yangilash xatosi:', error);
            showError(I18N.t('network_error'));
        }
    });
}

// ============================================================
// TO'LOV O'CHIRISH
// ============================================================
async function deletePayment(id) {
    if (!confirm(I18N.t('delete_account_warning'))) return;
    try {
        const data = await API.deletePayment(id);
        if (data.success) {
            showSuccess(I18N.t('success'));
            await loadData();
        } else {
            showError(data.message || I18N.t('error'));
        }
    } catch (error) {
        console.error('❌ To\'lov o\'chirish xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    document.getElementById('searchInput').addEventListener('input', filterPayments);
    document.getElementById('statusFilter').addEventListener('change', filterPayments);
    document.getElementById('addPaymentBtn').addEventListener('click', showAddPaymentModal);
    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('show');
    });
    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('show');
    });
}

function filterPayments() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    let filtered = paymentsData;
    if (search) filtered = filtered.filter(p => 
        p.studentName?.toLowerCase().includes(search) || 
        p.teacherName?.toLowerCase().includes(search)
    );
    if (status !== 'all') filtered = filtered.filter(p => p.status === status);
    renderPayments(filtered);
}

function showError(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
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
        position: fixed; top: 20px; right: 20px; z-index: 9999;
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

console.log('✅ payments.js yuklandi');