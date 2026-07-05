// ============================================================
// STUDENTS - O'QUVCHILAR (BIR KUNDA KO'P FAN + SOAT BILAN)
// ============================================================

let studentsData = [];
let teachersData = [];
let subjectsData = [];

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
        if (teachersRes.success) teachersData = teachersRes.data || [];

        const subjectsRes = await API.getSubjects();
        if (subjectsRes.success) subjectsData = subjectsRes.data || [];

        const studentsRes = await API.getStudents();
        if (studentsRes.success) {
            studentsData = studentsRes.data || [];
            renderStudents(studentsData);
        } else {
            renderStudents([]);
        }
    } catch (error) {
        console.error('❌ Ma\'lumotlarni yuklash xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// O'QUVCHILARNI KO'RSATISH
// ============================================================
function renderStudents(students) {
    const tbody = document.getElementById('studentsBody');
    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted" data-i18n="no_data">Ma'lumot yo'q</td></tr>`;
        I18N.updateUI();
        return;
    }

    tbody.innerHTML = students.map(student => {
        const subjectCount = (student.subjects && student.subjects.length) || 0;
        return `
            <tr>
                <td><strong><i class="fas fa-user-circle"></i> ${student.fullName || 'Noma\'lum'}</strong></td>
                <td><i class="fas fa-envelope"></i> ${student.email || '-'}</td>
                <td><i class="fas fa-phone"></i> ${student.phone || '-'}</td>
                <td><i class="fas fa-user"></i> ${student.teacherName || '-'}</td>
                <td><span class="age-badge"><i class="fas fa-calendar"></i> ${Utils.calculateAge(student.birthDate)} yosh</span></td>
                <td><i class="fas fa-star"></i> ${student.totalXP || 0}</td>
                <td><i class="fas fa-money-bill"></i> ${Utils.formatMoney(student.monthlyPayment || 0, 'UZS')}</td>
                <td><i class="fas fa-book"></i> ${subjectCount} ta fan</td>
                <td><span class="status-badge ${Utils.getStatusClass(student.status)}">${Utils.formatStatus(student.status)}</span></td>
                <td>
                    <div class="actions-container">
                        <button class="btn-view" onclick="viewStudent('${student._id}')" title="${I18N.t('view')}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-secondary" onclick="editStudent('${student._id}')" title="${I18N.t('edit')}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-danger" onclick="deleteStudent('${student._id}')" title="${I18N.t('delete')}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    I18N.updateUI();
}

function viewStudent(id) {
    window.location.href = `student-profile.html?id=${id}`;
}

// ============================================================
// ⭐ O'QUVCHI DARS QATORI YARATISH (FAN + SOAT)
// ============================================================
function createStudentLessonRow(data = null, index = 0) {
    const day    = data ? data.day    : '';
    const start  = data ? data.start  : '09:00';
    const end    = data ? data.end    : '10:00';
    const subjId = data ? data.subjectId : '';

    const days = ['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'];
    const dayOptions = days.map(d => `<option value="${d}" ${d===day?'selected':''}>${d}</option>`).join('');
    const subjOptions = subjectsData.map(s => `<option value="${s._id}" ${s._id===subjId?'selected':''}>${s.name}</option>`).join('');

    return `
        <div class="student-lesson-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;background:var(--bg-hover);padding:8px;border-radius:6px;">
            <select class="sched-day" style="padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.75rem;background:var(--bg-input);color:var(--text-primary);">
                <option value="">Kun...</option>
                ${dayOptions}
            </select>
            <input type="time" class="sched-start" value="${start}"
                   style="padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.75rem;width:80px;background:var(--bg-input);color:var(--text-primary);" />
            <span style="font-size:0.7rem;color:var(--text-muted);">—</span>
            <input type="time" class="sched-end" value="${end}"
                   style="padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.75rem;width:80px;background:var(--bg-input);color:var(--text-primary);" />
            <select class="sched-subject" style="padding:4px 6px;border:1px solid var(--border-color);border-radius:4px;font-size:0.75rem;flex:1;min-width:100px;background:var(--bg-input);color:var(--text-primary);">
                <option value="">Fan tanlang...</option>
                ${subjOptions}
            </select>
            <button type="button" onclick="this.closest('.student-lesson-row').remove()"
                    style="padding:4px 8px;background:#fee2e2;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-size:0.8rem;">✕</button>
        </div>
    `;
}

// ============================================================
// DARS JADVALINI YIG'ISH
// ============================================================
function collectStudentSchedule(containerSelector = '.student-lesson-row') {
    const schedule = [];
    document.querySelectorAll(containerSelector).forEach(row => {
        const day   = row.querySelector('.sched-day')?.value;
        const start = row.querySelector('.sched-start')?.value;
        const end   = row.querySelector('.sched-end')?.value;
        const subj  = row.querySelector('.sched-subject')?.value;
        if (day && start && end) {
            schedule.push({ day, start, end, subjectId: subj || null });
        }
    });
    return schedule;
}

// ============================================================
// O'QUVCHI QO'SHISH MODAL
// ============================================================
function showAddStudentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:640px;max-height:92vh;overflow-y:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-user-plus"></i> ${I18N.t('add_student')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="addStudentForm">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('full_name')} *</label>
                        <input type="text" id="studentName" placeholder="${I18N.t('full_name')}" required
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('email')}</label>
                        <input type="email" id="studentEmail" placeholder="email@example.com"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('password')} *</label>
                        <div style="position:relative;">
                            <input type="password" id="studentPassword" placeholder="••••••" required
                                   style="width:100%;padding:8px 36px 8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);box-sizing:border-box;" />
                            <button type="button" onclick="togglePassword('studentPassword',this)"
                                    style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('phone')}</label>
                        <input type="text" id="studentPhone" placeholder="+998 90 123 45 67"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('student_teacher')} *</label>
                        <select id="studentTeacher" required
                                style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);">
                            <option value="">${I18N.t('select_teacher')}</option>
                            ${teachersData.map(t => `<option value="${t._id}">${t.fullName}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('birth_date')}</label>
                        <input type="date" id="studentBirthDate"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('monthly_payment')}</label>
                        <input type="number" id="studentMonthlyPayment" placeholder="0" value="0"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('group')}</label>
                        <select id="studentGroup"
                                style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);">
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>

                <!-- ⭐ DARS JADVALI - KUN + SOAT + FAN -->
                <div class="form-group">
                    <label style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                        <span><i class="fas fa-calendar-alt"></i> Dars jadvali</span>
                        <button type="button" id="addStudentLessonBtn"
                                style="padding:4px 12px;background:var(--color-purple);color:#fff;border:none;border-radius:5px;font-size:0.75rem;cursor:pointer;">
                            + Dars qo'sh
                        </button>
                    </label>
                    <div id="studentLessonsContainer">
                        <!-- Bitta bo'sh qator -->
                    </div>
                    <p style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">
                        <i class="fas fa-info-circle"></i> Bir kunda bir nechta fanga borishi mumkin
                    </p>
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

    // Bitta bo'sh qator qo'shish
    const container = modal.querySelector('#studentLessonsContainer');
    container.insertAdjacentHTML('beforeend', createStudentLessonRow());

    // "Dars qo'sh" tugmasi
    modal.querySelector('#addStudentLessonBtn').addEventListener('click', () => {
        container.insertAdjacentHTML('beforeend', createStudentLessonRow());
    });

    I18N.updateUI();

    modal.querySelector('#addStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName       = modal.querySelector('#studentName').value.trim();
        const email          = modal.querySelector('#studentEmail').value.trim();
        const password       = modal.querySelector('#studentPassword').value;
        const phone          = modal.querySelector('#studentPhone').value.trim();
        const teacherId      = modal.querySelector('#studentTeacher').value;
        const birthDate      = modal.querySelector('#studentBirthDate').value;
        const monthlyPayment = parseInt(modal.querySelector('#studentMonthlyPayment').value) || 0;
        const group          = modal.querySelector('#studentGroup').value;

        if (!fullName || !password || !teacherId) { showError(I18N.t('all_fields_required')); return; }

        // Dars jadvalini yig'ish
        const schedule = [];
        modal.querySelectorAll('.student-lesson-row').forEach(row => {
            const day   = row.querySelector('.sched-day')?.value;
            const start = row.querySelector('.sched-start')?.value;
            const end   = row.querySelector('.sched-end')?.value;
            const subj  = row.querySelector('.sched-subject')?.value;
            if (day && start && end) schedule.push({ day, start, end, subjectId: subj||null });
        });

        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

        try {
            const studentData = await API.createStudent({
                fullName, email, phone, password, teacherId,
                birthDate, monthlyPayment, group,
                schedule  // ⭐ jadval ham yuboriladi
            });

            if (studentData.success) {
                const studentId = studentData.data._id;

                // ⭐ Har bir dars jadval yozuvida fan subjectId bo'lsa StudentSubject ham qo'shamiz
                const uniqueSubjectIds = [...new Set(schedule.filter(s => s.subjectId).map(s => s.subjectId))];
                for (const subjectId of uniqueSubjectIds) {
                    try { await API.createStudentSubject({ studentId, subjectId }); } catch(err) { console.error(err); }
                }

                modal.remove();
                showSuccess(`O'quvchi qo'shildi! ${schedule.length} ta dars saqlandi.`);
                await loadData();
            } else {
                showError(studentData.message || I18N.t('error'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
            }
        } catch (error) {
            console.error('❌ Student yaratish xatosi:', error);
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
// O'QUVCHI TAHRIRLASH MODAL
// ============================================================
async function editStudent(id) {
    const student = studentsData.find(s => s._id === id);
    if (!student) { showError(I18N.t('error')); return; }

    // Mavjud fanlar
    let existingSubjects = [];
    try {
        const res = await API.getStudentSubjects({ studentId: id });
        if (res.success) existingSubjects = res.data || [];
    } catch (error) { console.error(error); }

    // Mavjud dars jadvali (student.schedule yoki bo'sh)
    const existingSchedule = student.schedule || [];

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:640px;max-height:92vh;overflow-y:auto;">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> ${I18N.t('edit_student')}</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <form id="editStudentForm">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('full_name')} *</label>
                        <input type="text" id="editStudentName" value="${student.fullName}" required
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('email')}</label>
                        <input type="email" id="editStudentEmail" value="${student.email||''}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('phone')}</label>
                        <input type="text" id="editStudentPhone" value="${student.phone||''}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('student_teacher')} *</label>
                        <select id="editStudentTeacher" required
                                style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);">
                            ${teachersData.map(t => `<option value="${t._id}" ${t._id===student.teacherId?'selected':''}>${t.fullName}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('birth_date')}</label>
                        <input type="date" id="editStudentBirthDate" value="${student.birthDate||''}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('monthly_payment')}</label>
                        <input type="number" id="editStudentMonthlyPayment" value="${student.monthlyPayment||0}"
                               style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);" />
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>${I18N.t('group')}</label>
                        <select id="editStudentGroup"
                                style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);">
                            <option value="A" ${student.group==='A'?'selected':''}>A</option>
                            <option value="B" ${student.group==='B'?'selected':''}>B</option>
                            <option value="C" ${student.group==='C'?'selected':''}>C</option>
                            <option value="D" ${student.group==='D'?'selected':''}>D</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${I18N.t('status')}</label>
                        <select id="editStudentStatus"
                                style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-input);color:var(--text-primary);">
                            <option value="active"   ${student.status==='active'  ?'selected':''}>Faol</option>
                            <option value="inactive" ${student.status==='inactive'?'selected':''}>Faol emas</option>
                        </select>
                    </div>
                </div>

                <!-- ⭐ DARS JADVALI -->
                <div class="form-group">
                    <label style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                        <span><i class="fas fa-calendar-alt"></i> Dars jadvali</span>
                        <button type="button" id="addEditStudentLessonBtn"
                                style="padding:4px 12px;background:var(--color-purple);color:#fff;border:none;border-radius:5px;font-size:0.75rem;cursor:pointer;">
                            + Dars qo'sh
                        </button>
                    </label>
                    <div id="editStudentLessonsContainer">
                        ${existingSchedule.length > 0
                            ? existingSchedule.map((s,i) => createStudentLessonRow(s, i)).join('')
                            : createStudentLessonRow()
                        }
                    </div>
                    <p style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">
                        <i class="fas fa-info-circle"></i> Bir kunda bir nechta fanga borishi mumkin
                    </p>
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

    modal.querySelector('#addEditStudentLessonBtn').addEventListener('click', () => {
        const container = modal.querySelector('#editStudentLessonsContainer');
        container.insertAdjacentHTML('beforeend', createStudentLessonRow());
    });

    I18N.updateUI();

    modal.querySelector('#editStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName       = modal.querySelector('#editStudentName').value.trim();
        const email          = modal.querySelector('#editStudentEmail').value.trim();
        const phone          = modal.querySelector('#editStudentPhone').value.trim();
        const teacherId      = modal.querySelector('#editStudentTeacher').value;
        const birthDate      = modal.querySelector('#editStudentBirthDate').value;
        const monthlyPayment = parseInt(modal.querySelector('#editStudentMonthlyPayment').value) || 0;
        const group          = modal.querySelector('#editStudentGroup').value;
        const status         = modal.querySelector('#editStudentStatus').value;

        if (!fullName || !teacherId) { showError(I18N.t('all_fields_required')); return; }

        // Dars jadvalini yig'ish
        const schedule = [];
        modal.querySelectorAll('.student-lesson-row').forEach(row => {
            const day   = row.querySelector('.sched-day')?.value;
            const start = row.querySelector('.sched-start')?.value;
            const end   = row.querySelector('.sched-end')?.value;
            const subj  = row.querySelector('.sched-subject')?.value;
            if (day && start && end) schedule.push({ day, start, end, subjectId: subj||null });
        });

        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

        try {
            const studentData = await API.updateStudent(id, {
                fullName, email, phone, teacherId, birthDate,
                monthlyPayment, group, status, schedule
            });

            if (studentData.success) {
                // Eski fanlarni o'chirish va yangilarini qo'shish
                for (const ss of existingSubjects) {
                    try { await API.deleteStudentSubject(ss._id); } catch(err) { console.error(err); }
                }
                const uniqueSubjectIds = [...new Set(schedule.filter(s => s.subjectId).map(s => s.subjectId))];
                for (const subjectId of uniqueSubjectIds) {
                    try { await API.createStudentSubject({ studentId: id, subjectId }); } catch(err) { console.error(err); }
                }

                modal.remove();
                showSuccess(`O'quvchi yangilandi! ${schedule.length} ta dars saqlandi.`);
                await loadData();
            } else {
                showError(studentData.message || I18N.t('error'));
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
            }
        } catch (error) {
            console.error('❌ Student yangilash xatosi:', error);
            showError(I18N.t('network_error'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
        }
    });
}

// ============================================================
// O'QUVCHI O'CHIRISH
// ============================================================
async function deleteStudent(id) {
    if (!confirm(I18N.t('delete_account_warning'))) return;
    try {
        const data = await API.deleteStudent(id);
        if (data.success) { showSuccess(I18N.t('success')); await loadData(); }
        else showError(data.message || I18N.t('error'));
    } catch (error) {
        console.error('❌ Student o\'chirish xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// FILTER VA SEARCH
// ============================================================
function filterStudents() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    let filtered = studentsData;
    if (search) filtered = filtered.filter(s => s.fullName.toLowerCase().includes(search) || (s.email||'').toLowerCase().includes(search));
    if (status !== 'all') filtered = filtered.filter(s => s.status === status);
    renderStudents(filtered);
}

// ============================================================
// ⭐ EVENT LISTENERLAR - BIR MARTA ULASH
// ============================================================
function setupListeners() {
    document.getElementById('searchInput').addEventListener('input', filterStudents);
    document.getElementById('statusFilter').addEventListener('change', filterStudents);
    document.getElementById('addStudentBtn').addEventListener('click', showAddStudentModal);
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
    setTimeout(() => div.remove(), 3000);
}

console.log('✅ students.js yuklandi');