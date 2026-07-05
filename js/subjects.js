// ============================================================
// SUBJECTS - FANLAR (TO'LIQ)
// ============================================================

let subjectsData = [];
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
async function loadData(options = {}) {
    const { suppressError = false } = options;
    try {
        const teachersRes = await API.getTeachers();
        if (teachersRes.success) {
            teachersData = teachersRes.data || [];
        }

        const subjectsRes = await API.getSubjects();
        if (subjectsRes.success) {
            subjectsData = subjectsRes.data || [];
            renderSubjects(subjectsData);
        } else {
            renderSubjects([]);
        }
    } catch (error) {
        console.error('❌ Ma\'lumotlarni yuklash xatosi:', error);
        if (!suppressError) {
            showError(I18N.t('network_error'));
        }
        if (suppressError) {
            throw error;
        }
    }
}

// ============================================================
// FANLARNI KO'RSATISH
// ============================================================
function renderSubjects(subjects) {
    const container = document.getElementById('subjectsContainer');
    if (!subjects || subjects.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="grid-column:1/-1;padding:60px 0;">
                <i class="fas fa-book" style="font-size:3rem;display:block;margin-bottom:16px;opacity:0.3;"></i>
                <p data-i18n="no_data">Hozircha fanlar mavjud emas</p>
                <button class="btn-primary" style="width:auto;margin-top:16px;padding:8px 20px;font-size:0.85rem;" onclick="showAddSubjectModal()">
                    <i class="fas fa-plus"></i> <span data-i18n="add_subject">Yangi fan qo'shish</span>
                </button>
            </div>
        `;
        I18N.updateUI();
        return;
    }

    container.innerHTML = subjects.map(subject => `
        <div class="subject-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                    <h4 style="font-size:1rem;font-weight:600;color:var(--text-primary);margin:0;">
                        <i class="fas fa-book" style="margin-right:8px;color:var(--color-purple);"></i>
                        ${subject.name || 'Noma\'lum fan'}
                    </h4>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin:4px 0 0 0;">
                        <i class="fas fa-user"></i> ${subject.teacherName || 'O\'qituvchi biriktirilmagan'}
                    </p>
                </div>
                <span class="status-badge ${Utils.getStatusClass(subject.status)}">${Utils.formatStatus(subject.status)}</span>
            </div>
            <div style="display:flex;gap:16px;font-size:0.8rem;color:var(--text-secondary);">
                <span><i class="fas fa-money-bill"></i> ${Utils.formatMoney(subject.price || 0, 'UZS')}</span>
                <span><i class="fas fa-users"></i> ${subject.studentCount || 0} o'quvchi</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:4px;">
                <button class="btn-secondary" style="padding:4px 12px;font-size:0.7rem;width:auto;" onclick="editSubject('${subject._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" style="padding:4px 12px;font-size:0.7rem;width:auto;" onclick="deleteSubject('${subject._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    I18N.updateUI();
}

// ============================================================
// FAN QO'SHISH MODAL
// ============================================================
function showAddSubjectModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:500px;">
            <div class="modal-header">
                <h3><i class="fas fa-book"></i> ${I18N.t('add_subject')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="addSubjectForm">
                <div class="form-group">
                    <label>${I18N.t('subject_name')}</label>
                    <div class="input-wrapper">
                        <input type="text" id="subjectName" placeholder="Masalan: Fizika" required />
                        <i class="fas fa-check-circle input-icon success"></i>
                        <i class="fas fa-exclamation-circle input-icon error"></i>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('teacher')}</label>
                    <div class="input-wrapper">
                        <select id="subjectTeacher" required>
                            <option value="">${I18N.t('select_teacher')}</option>
                            ${teachersData.map(t => `<option value="${t._id}">${t.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('price')}</label>
                    <div class="input-wrapper">
                        <input type="number" id="subjectPrice" placeholder="0" value="0" />
                        <i class="fas fa-check-circle input-icon success"></i>
                        <i class="fas fa-exclamation-circle input-icon error"></i>
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

    document.getElementById('addSubjectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('subjectName').value.trim();
        const teacherId = document.getElementById('subjectTeacher').value;
        const price = parseInt(document.getElementById('subjectPrice').value) || 0;

        if (!name || !teacherId) {
            showError(I18N.t('all_fields_required'));
            return;
        }

        try {
            const data = await API.createSubject({ name, teacherId, price });
            if (data.success) {
                const modal = document.querySelector('.modal');
                if (modal) modal.remove();
                showSuccess(I18N.t('success'));
                try {
                    await loadData({ suppressError: true });
                } catch (loadError) {
                    console.warn('⚠️ Fan yaratildi, ammo ma\'lumotlar qayta yuklanmadi:', loadError);
                }
            } else {
                showError(data.message || I18N.t('error'));
            }
        } catch (error) {
            console.error('❌ Subject yaratish xatosi:', error);
            showError(error.message || I18N.t('network_error'));
        }
    });
}

// ============================================================
// FAN TAHRIRLASH
// ============================================================
async function editSubject(id) {
    const subject = subjectsData.find(s => s._id === id);
    if (!subject) {
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
            <form id="editSubjectForm">
                <div class="form-group">
                    <label>${I18N.t('subject_name')}</label>
                    <div class="input-wrapper">
                        <input type="text" id="editSubjectName" value="${subject.name}" required />
                        <i class="fas fa-check-circle input-icon success"></i>
                        <i class="fas fa-exclamation-circle input-icon error"></i>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('teacher')}</label>
                    <div class="input-wrapper">
                        <select id="editSubjectTeacher" required>
                            ${teachersData.map(t => `<option value="${t._id}" ${t._id === subject.teacherId ? 'selected' : ''}>${t.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('price')}</label>
                    <div class="input-wrapper">
                        <input type="number" id="editSubjectPrice" value="${subject.price || 0}" />
                        <i class="fas fa-check-circle input-icon success"></i>
                        <i class="fas fa-exclamation-circle input-icon error"></i>
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('status')}</label>
                    <div class="input-wrapper">
                        <select id="editSubjectStatus">
                            <option value="active" ${subject.status === 'active' ? 'selected' : ''}>${I18N.t('active')}</option>
                            <option value="inactive" ${subject.status === 'inactive' ? 'selected' : ''}>${I18N.t('inactive')}</option>
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

    document.getElementById('editSubjectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('editSubjectName').value.trim();
        const teacherId = document.getElementById('editSubjectTeacher').value;
        const price = parseInt(document.getElementById('editSubjectPrice').value) || 0;
        const status = document.getElementById('editSubjectStatus').value;

        if (!name || !teacherId) {
            showError(I18N.t('all_fields_required'));
            return;
        }

        try {
            const data = await API.updateSubject(id, { name, teacherId, price, status });
            if (data.success) {
                const modal = document.querySelector('.modal');
                if (modal) modal.remove();
                showSuccess(I18N.t('success'));
                await loadData();
            } else {
                showError(data.message || I18N.t('error'));
            }
        } catch (error) {
            console.error('❌ Subject yangilash xatosi:', error);
            showError(I18N.t('network_error'));
        }
    });
}

// ============================================================
// FAN O'CHIRISH
// ============================================================
async function deleteSubject(id) {
    if (!confirm(I18N.t('delete_account_warning'))) return;
    try {
        const data = await API.deleteSubject(id);
        if (data.success) {
            showSuccess(I18N.t('success'));
            await loadData();
        } else {
            showError(data.message || I18N.t('error'));
        }
    } catch (error) {
        console.error('❌ Subject o\'chirish xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// SEARCH
// ============================================================
function filterSubjects() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    let filtered = subjectsData;
    if (search) filtered = filtered.filter(s => s.name?.toLowerCase().includes(search) || s.teacherName?.toLowerCase().includes(search));
    renderSubjects(filtered);
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    document.getElementById('searchInput').addEventListener('input', filterSubjects);
    document.getElementById('addSubjectBtn').addEventListener('click', showAddSubjectModal);
    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

    // Sidebar open/close is handled globally by js/theme.js.
}

function showError(msg) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#dc2626;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;`;
    div.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${msg}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#dc2626;cursor:pointer;font-size:1.1rem;">×</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

function showSuccess(msg) {
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:20px;right:20px;z-index:9999;padding:14px 18px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;color:#065f46;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,0.1);display:flex;align-items:center;gap:10px;font-size:0.85rem;`;
    div.innerHTML = `<i class="fas fa-check-circle"></i><span>${msg}</span><button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:#065f46;cursor:pointer;font-size:1.1rem;">×</button>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

console.log('✅ subjects.js yuklandi');