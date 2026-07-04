// ============================================================
// TEACHERS - O'QITUVCHILAR (BIR KUNDA KO'P DARS BILAN)
// ============================================================

let teachersData = [];

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
    }

    await loadTeachers();
    setupListeners();
});

// ============================================================
// O'QITUVCHILARNI YUKLASH
// ============================================================
async function loadTeachers() {
    try {
        const data = await API.getTeachers();
        if (data.success) {
            teachersData = data.data || [];
            renderTeachers(teachersData);
        } else {
            renderTeachers([]);
        }
    } catch (error) {
        console.error('❌ O\'qituvchilarni yuklash xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// O'QITUVCHILARNI KO'RSATISH
// ============================================================
function renderTeachers(teachers) {
    const tbody = document.getElementById('teachersBody');
    if (!teachers || teachers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" data-i18n="no_data">Ma'lumot yo'q</td></tr>`;
        I18N.updateUI();
        return;
    }

    tbody.innerHTML = teachers.map(teacher => `
        <tr>
            <td><strong><i class="fas fa-user-circle"></i> ${teacher.fullName || 'Noma\'lum'}</strong></td>
            <td><i class="fas fa-envelope"></i> ${teacher.email || '-'}</td>
            <td><i class="fas fa-phone"></i> ${teacher.phone || '-'}</td>
            <td><i class="fas fa-book"></i> ${teacher.subject || '-'}</td>
            <td><span class="age-badge"><i class="fas fa-calendar"></i> ${Utils.calculateAge(teacher.birthDate)} yosh</span></td>
            <td><i class="fas fa-users"></i> ${teacher.studentCount || 0}</td>
            <td><i class="fas fa-money-bill"></i> ${Utils.formatMoney(teacher.salary || 0, 'UZS')}</td>
            <td><i class="fas fa-clock"></i> ${teacher.lessonCount || 0} dars</td>
            <td><span class="status-badge ${Utils.getStatusClass(teacher.status)}">${Utils.formatStatus(teacher.status)}</span></td>
            <td>
                <div class="actions-container">
                    <button class="btn-view" onclick="viewTeacher('${teacher._id}')" title="${I18N.t('view')}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-secondary" onclick="editTeacher('${teacher._id}')" title="${I18N.t('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteTeacher('${teacher._id}')" title="${I18N.t('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    I18N.updateUI();
}

function viewTeacher(id) {
    window.location.href = `teacher-profile.html?id=${id}`;
}

// ============================================================
// ⭐ DARS QATOR YARATISH (YANI 1 QATOR = 1 DARS VAQTI)
// ============================================================
function createLessonRow(day, lessonData = null, index = 0) {
    const startVal = lessonData ? lessonData.startTime : '09:00';
    const endVal   = lessonData ? lessonData.endTime   : '10:00';
    const subjVal  = lessonData ? lessonData.subject   : '';
    const grpVal   = lessonData ? lessonData.group     : 'A';
    const uid = `${day.replace(/\s/g,'')}_${index}_${Date.now()}`;

    return `
        <div class="lesson-row" data-day="${day}" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;background:var(--bg-hover);padding:6px 8px;border-radius:6px;">
            <input type="time" class="lesson-start" value="${startVal}"
                   style="padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.72rem;width:80px;background:var(--bg-input);color:var(--text-primary);" />
            <span style="font-size:0.7rem;color:var(--text-muted);">—</span>
            <input type="time" class="lesson-end" value="${endVal}"
                   style="padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.72rem;width:80px;background:var(--bg-input);color:var(--text-primary);" />
            <input type="text" class="lesson-subject" placeholder="Fan" value="${subjVal}"
                   style="padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.72rem;flex:1;min-width:80px;background:var(--bg-input);color:var(--text-primary);" />
            <input type="text" class="lesson-group" placeholder="Guruh" value="${grpVal}"
                   style="padding:3px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.72rem;width:55px;background:var(--bg-input);color:var(--text-primary);" />
            <button type="button" onclick="this.closest('.lesson-row').remove()"
                    style="padding:3px 7px;background:#fee2e2;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">✕</button>
        </div>
    `;
}

// ============================================================
// ⭐ KUN BLOKI YARATISH
// ============================================================
function createDayBlock(day, existingLessons = []) {
    const dayId = day.replace(/\s/g,'');
    const lessonsHtml = existingLessons.length > 0
        ? existingLessons.map((l, i) => createLessonRow(day, l, i)).join('')
        : createLessonRow(day, null, 0);

    return `
        <div class="day-block" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:10px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:6px;">
                    <input type="checkbox" class="day-check" data-day="${day}" ${existingLessons.length > 0 ? 'checked' : (day !== 'Yakshanba' ? 'checked' : '')}
                           onchange="toggleDayBlock(this)" />
                    <strong style="font-size:0.82rem;">${day}</strong>
                </div>
                <button type="button" onclick="addLessonRow('${dayId}', '${day}')"
                        style="padding:3px 10px;background:var(--color-purple);color:#fff;border:none;border-radius:5px;font-size:0.72rem;cursor:pointer;">
                    + Dars qo'sh
                </button>
            </div>
            <div class="day-lessons" id="lessons_${dayId}" style="${(existingLessons.length === 0 && day === 'Yakshanba') ? 'display:none;' : ''}">
                ${lessonsHtml}
            </div>
        </div>
    `;
}

// ============================================================
// KUN BLOKI TOGGLE
// ============================================================
function toggleDayBlock(checkbox) {
    const day = checkbox.dataset.day;
    const dayId = day.replace(/\s/g,'');
    const lessonsDiv = document.getElementById(`lessons_${dayId}`);
    if (!lessonsDiv) return;
    if (checkbox.checked) {
        lessonsDiv.style.display = '';
        if (!lessonsDiv.querySelector('.lesson-row')) {
            lessonsDiv.insertAdjacentHTML('beforeend', createLessonRow(day, null, 0));
        }
    } else {
        lessonsDiv.style.display = 'none';
    }
}

// ============================================================
// YANGI DARS QATORI QO'SHISH
// ============================================================
function addLessonRow(dayId, day) {
    const lessonsDiv = document.getElementById(`lessons_${dayId}`);
    if (!lessonsDiv) return;
    const existing = lessonsDiv.querySelectorAll('.lesson-row').length;
    lessonsDiv.insertAdjacentHTML('beforeend', createLessonRow(day, null, existing));
    // Checkbox ni check qilish
    const checkbox = document.querySelector(`.day-check[data-day="${day}"]`);
    if (checkbox) { checkbox.checked = true; lessonsDiv.style.display = ''; }
}

// ============================================================
// DARSLARNI YIG'ISH (MODAL ICHIDAN)
// ============================================================
function collectLessons() {
    const lessons = [];
    document.querySelectorAll('.day-block').forEach(block => {
        const day = block.querySelector('.day-check').dataset.day;
        const isChecked = block.querySelector('.day-check').checked;
        if (!isChecked) return;
        block.querySelectorAll('.lesson-row').forEach(row => {
            const start = row.querySelector('.lesson-start')?.value;
            const end   = row.querySelector('.lesson-end')?.value;
            const subj  = row.querySelector('.lesson-subject')?.value || '';
            const grp   = row.querySelector('.lesson-group')?.value  || 'A';
            if (start && end) {
                lessons.push({ day, startTime: start, endTime: end, subject: subj, group: grp });
            }
        });
    });
    return lessons;
}

// ============================================================
// O'QITUVCHI QO'SHISH MODAL
// ============================================================
function showAddTeacherModal() {
    const days = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'];
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:680px;max-height:92vh;overflow-y:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> ${I18N.t('add_teacher')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="addTeacherForm">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('full_name')} *</label>
                        <input type="text" id="teacherName" placeholder="${I18N.t('full_name')}" required
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('email')} *</label>
                        <input type="email" id="teacherEmail" placeholder="email@example.com" required
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('password')} *</label>
                        <div style="position:relative;">
                            <input type="password" id="teacherPassword" placeholder="••••••" required
                                   style="width:100%;padding:8px 36px 8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);box-sizing:border-box;" />
                            <button type="button" onclick="togglePassword('teacherPassword',this)"
                                    style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('phone')}</label>
                        <input type="text" id="teacherPhone" placeholder="+998 90 123 45 67"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('teacher_subject')}</label>
                        <input type="text" id="teacherSubject" placeholder="Matematika"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('birth_date')}</label>
                        <input type="date" id="teacherBirthDate"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-money-bill"></i> ${I18N.t('salary')}</label>
                    <input type="number" id="teacherSalary" placeholder="0" value="0"
                           style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                </div>

                <!-- ⭐ DARS JADVALI - BIR KUNDA KO'P DARS -->
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <i class="fas fa-calendar-alt"></i> Dars jadvali
                        <span style="font-size:0.7rem;color:var(--text-muted);">(bir kunda bir nechta dars qo'shish mumkin)</span>
                    </label>
                    <div id="dayBlocksContainer">
                        ${days.map(day => createDayBlock(day, [])).join('')}
                    </div>
                </div>

                <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()"
                            style="width:auto;padding:8px 20px;font-size:0.85rem;">${I18N.t('cancel')}</button>
                    <button type="submit" class="btn-primary"
                            style="width:auto;padding:8px 20px;font-size:0.85rem;"><i class="fas fa-save"></i> ${I18N.t('save')}</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    I18N.updateUI();

    document.getElementById('addTeacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName  = document.getElementById('teacherName').value.trim();
        const email     = document.getElementById('teacherEmail').value.trim();
        const password  = document.getElementById('teacherPassword').value;
        const phone     = document.getElementById('teacherPhone').value.trim();
        const subject   = document.getElementById('teacherSubject').value.trim();
        const birthDate = document.getElementById('teacherBirthDate').value;
        const salary    = parseInt(document.getElementById('teacherSalary').value) || 0;

        if (!fullName || !email || !password) { showError(I18N.t('all_fields_required')); return; }
        if (password.length < 6) { showError('Parol kamida 6 ta belgi bo\'lishi kerak!'); return; }

        const lessons = collectLessons();

        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

        try {
            const teacherData = await API.createTeacher({ fullName, email, password, phone, subject, birthDate, salary });
            if (teacherData.success) {
                const teacherId = teacherData.data._id;
                for (const lesson of lessons) {
                    try { await API.createTeacherLesson({ teacherId, ...lesson }); } catch(err) { console.error(err); }
                }
                modal.remove();
                showSuccess(`O'qituvchi qo'shildi! ${lessons.length} ta dars saqlandi.`);
                await loadTeachers();
            } else {
                showError(teacherData.message || I18N.t('error'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
            }
        } catch (error) {
            console.error('❌ Teacher yaratish xatosi:', error);
            showError(I18N.t('network_error'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
        }
    });
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const icon = button.querySelector('i');
    if (input.type === 'password') { input.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { input.type = 'password'; icon.className = 'fas fa-eye'; }
}

// ============================================================
// O'QITUVCHI TAHRIRLASH MODAL
// ============================================================
async function editTeacher(id) {
    const teacher = teachersData.find(t => t._id === id);
    if (!teacher) { showError(I18N.t('error')); return; }

    let existingLessons = [];
    try {
        const lessonsRes = await API.getTeacherLessons({ teacherId: id });
        if (lessonsRes.success) existingLessons = lessonsRes.data || [];
    } catch (error) { console.error('Darslarni yuklash xatosi:', error); }

    // Darslarni kunlarga guruhlash
    const days = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'];
    const lessonsByDay = {};
    days.forEach(d => { lessonsByDay[d] = []; });
    existingLessons.forEach(l => { if (lessonsByDay[l.day]) lessonsByDay[l.day].push(l); });

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:680px;max-height:92vh;overflow-y:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> ${I18N.t('edit_teacher')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="editTeacherForm">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('full_name')} *</label>
                        <input type="text" id="editTeacherName" value="${teacher.fullName}" required
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('email')} *</label>
                        <input type="email" id="editTeacherEmail" value="${teacher.email}" required
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('phone')}</label>
                        <input type="text" id="editTeacherPhone" value="${teacher.phone||''}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('teacher_subject')}</label>
                        <input type="text" id="editTeacherSubject" value="${teacher.subject||''}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('birth_date')}</label>
                        <input type="date" id="editTeacherBirthDate" value="${teacher.birthDate||''}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-money-bill"></i> ${I18N.t('salary')}</label>
                        <input type="number" id="editTeacherSalary" value="${teacher.salary||0}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div class="form-group">
                    <label>${I18N.t('status')}</label>
                    <select id="editTeacherStatus"
                            style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);">
                        <option value="active"   ${teacher.status==='active'   ?'selected':''}>Faol</option>
                        <option value="inactive" ${teacher.status==='inactive' ?'selected':''}>Faol emas</option>
                        <option value="blocked"  ${teacher.status==='blocked'  ?'selected':''}>Bloklangan</option>
                    </select>
                </div>

                <!-- ⭐ DARS JADVALI - BIR KUNDA KO'P DARS -->
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <i class="fas fa-calendar-alt"></i> Dars jadvali
                        <span style="font-size:0.7rem;color:var(--text-muted);">(bir kunda bir nechta dars qo'shish mumkin)</span>
                    </label>
                    <div id="dayBlocksContainer">
                        ${days.map(day => createDayBlock(day, lessonsByDay[day])).join('')}
                    </div>
                </div>

                <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()"
                            style="width:auto;padding:8px 20px;font-size:0.85rem;">${I18N.t('cancel')}</button>
                    <button type="submit" class="btn-primary"
                            style="width:auto;padding:8px 20px;font-size:0.85rem;"><i class="fas fa-save"></i> ${I18N.t('save')}</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    I18N.updateUI();

    document.getElementById('editTeacherForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName  = document.getElementById('editTeacherName').value.trim();
        const email     = document.getElementById('editTeacherEmail').value.trim();
        const phone     = document.getElementById('editTeacherPhone').value.trim();
        const subject   = document.getElementById('editTeacherSubject').value.trim();
        const birthDate = document.getElementById('editTeacherBirthDate').value;
        const salary    = parseInt(document.getElementById('editTeacherSalary').value) || 0;
        const status    = document.getElementById('editTeacherStatus').value;

        if (!fullName || !email) { showError(I18N.t('all_fields_required')); return; }

        const lessons = collectLessons();

        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

        try {
            const teacherData = await API.updateTeacher(id, { fullName, email, phone, subject, birthDate, salary, status });
            if (teacherData.success) {
                // Eski darslarni o'chirish
                for (const lesson of existingLessons) {
                    try { await API.deleteTeacherLesson(lesson._id); } catch(err) { console.error(err); }
                }
                // Yangi darslarni qo'shish
                for (const lesson of lessons) {
                    try { await API.createTeacherLesson({ teacherId: id, ...lesson }); } catch(err) { console.error(err); }
                }
                modal.remove();
                showSuccess(`O'qituvchi yangilandi! ${lessons.length} ta dars saqlandi.`);
                await loadTeachers();
            } else {
                showError(teacherData.message || I18N.t('error'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
            }
        } catch (error) {
            console.error('❌ Teacher yangilash xatosi:', error);
            showError(I18N.t('network_error'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
        }
    });
}

// ============================================================
// O'QITUVCHI O'CHIRISH
// ============================================================
async function deleteTeacher(id) {
    if (!confirm(I18N.t('delete_account_warning'))) return;
    try {
        const data = await API.deleteTeacher(id);
        if (data.success) { showSuccess(I18N.t('success')); await loadTeachers(); }
        else showError(data.message || I18N.t('error'));
    } catch (error) {
        console.error('❌ Teacher o\'chirish xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// FILTER VA SEARCH
// ============================================================
function filterTeachers() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    let filtered = teachersData;
    if (search) filtered = filtered.filter(t => t.fullName.toLowerCase().includes(search) || t.email.toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(t => t.status === status);
    renderTeachers(filtered);
}

// ============================================================
// ⭐ EVENT LISTENERLAR - BIR MARTA ULASH
// ============================================================
function setupListeners() {
    document.getElementById('searchInput').addEventListener('input', filterTeachers);
    document.getElementById('statusFilter').addEventListener('change', filterTeachers);
    document.getElementById('addTeacherBtn').addEventListener('click', showAddTeacherModal);
    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

    // ⭐ HAMBURGER MENU - BIR MARTA BOSISHDA ISHLAYDI
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('show');
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }
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
    setTimeout(() => div.remove(), 3000);
}

console.log('✅ teachers.js yuklandi');