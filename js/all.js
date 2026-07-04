// ============================================================
// ALL - BARCHA MA'LUMOTLAR (TO'LIQ TUZATILGAN)
// ============================================================

let allTeachers = [];
let allStudents = [];
let allPayments = [];
let todayDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 All sahifasi yuklanmoqda...');
    
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

    const today = new Date();
    const dateEl = document.getElementById('todayDate');
    if (dateEl) {
        dateEl.textContent = ' - ' + today.toLocaleDateString('uz', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    await loadAllData();
    setupListeners();
});

// ============================================================
// MA'LUMOTLARNI YUKLASH
// ============================================================
async function loadAllData() {
    try {
        console.log('📊 Barcha ma\'lumotlar yuklanmoqda...');
        
        const stats = await API.getDashboardStats();
        if (stats.success) {
            const data = stats.data;
            document.getElementById('allTeachers').textContent = data.teacherCount || 0;
            document.getElementById('allStudents').textContent = data.studentCount || 0;
            document.getElementById('allPayments').textContent = data.paymentCount || 0;
            console.log('✅ Statistika yuklandi:', data);
        }

        const teachers = await API.getTeachers();
        if (teachers.success) {
            allTeachers = teachers.data || [];
            console.log('✅ O\'qituvchilar yuklandi:', allTeachers.length, 'ta');
            await loadTeacherAttendance(allTeachers);
        } else {
            console.error('❌ O\'qituvchilar yuklanmadi:', teachers);
            renderTeacherAttendance([]);
        }

        const students = await API.getStudents();
        if (students.success) {
            allStudents = students.data || [];
            console.log('✅ O\'quvchilar yuklandi:', allStudents.length, 'ta');
            await loadStudentAttendance(allStudents);
        } else {
            console.error('❌ O\'quvchilar yuklanmadi:', students);
            renderStudentAttendance([]);
        }

        I18N.updateUI();
        console.log('✅ All sahifasi yuklandi!');
        
    } catch (error) {
        console.error('❌ Ma\'lumotlarni yuklash xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// O'QITUVCHILAR DAVOMATI - YUKLASH
// ============================================================
async function loadTeacherAttendance(teachers) {
    for (const teacher of teachers) {
        try {
            const att = await API.getAttendances({ 
                studentId: teacher._id, 
                date: todayDate,
                type: 'teacher'
            });
            if (att.success && att.data && att.data.length > 0) {
                teacher.attendanceStatus = att.data[0].attendance;
                teacher.attendanceId = att.data[0]._id;
                teacher.attendanceReason = att.data[0].reason || '';
            } else {
                teacher.attendanceStatus = 'absent';
                teacher.attendanceReason = '';
            }
        } catch (e) {
            teacher.attendanceStatus = 'absent';
            teacher.attendanceReason = '';
        }
    }
    renderTeacherAttendance(teachers);
}

// ============================================================
// O'QUVCHILAR DAVOMATI - YUKLASH
// ============================================================
async function loadStudentAttendance(students) {
    for (const student of students) {
        try {
            const att = await API.getAttendances({ 
                studentId: student._id, 
                date: todayDate,
                type: 'student'
            });
            if (att.success && att.data && att.data.length > 0) {
                student.attendanceStatus = att.data[0].attendance;
                student.attendanceId = att.data[0]._id;
                student.attendanceReason = att.data[0].reason || '';
                if (student.teacherId) {
                    const teacher = await API.getTeacher(student.teacherId);
                    if (teacher.success) {
                        student.teacherName = teacher.data.fullName;
                    }
                }
            } else {
                student.attendanceStatus = 'absent';
                student.attendanceReason = '';
            }
        } catch (e) {
            student.attendanceStatus = 'absent';
            student.attendanceReason = '';
        }
    }
    renderStudentAttendance(students);
}

// ============================================================
// O'QITUVCHILAR RO'YXATI - RENDER
// ============================================================
function renderTeacherAttendance(teachers) {
    const container = document.getElementById('teachersAttendanceList');
    if (!container) {
        console.warn('⚠️ teachersAttendanceList elementi topilmadi!');
        return;
    }
    
    if (!teachers || !Array.isArray(teachers) || teachers.length === 0) {
        container.innerHTML = `
            <div class="text-muted" style="grid-column:1/-1;text-align:center;padding:30px 0;" data-i18n="no_data">
                <i class="fas fa-info-circle" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.3;"></i>
                Ma'lumot yo'q
            </div>
        `;
        I18N.updateUI();
        return;
    }

    console.log('📊 O\'qituvchilar render qilinmoqda:', teachers.length, 'ta');

    const cards = teachers.map(teacher => {
        const status = teacher.attendanceStatus || 'absent';
        const statusMap = {
            'present': '✅ Keldi',
            'absent_reason': '⚠️ Sababli',
            'absent': '❌ Kelmadi'
        };
        const statusClass = {
            'present': 'present',
            'absent_reason': 'absent-reason',
            'absent': 'absent'
        };

        // ⭐ absent_reason bo'lsa reason input darhol ko'rsatiladi
        const showReason = status === 'absent_reason';
        
        return `
            <div class="all-attendance-card" data-id="${teacher._id}" data-type="teacher">
                <div class="info">
                    <div class="name"><i class="fas fa-user-circle"></i> ${teacher.fullName || 'Noma\'lum'}</div>
                    <div class="role">${teacher.subject || 'Fani yo\'q'}</div>
                    ${teacher.attendanceReason ? `<div class="reason" style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;"><i class="fas fa-comment"></i> ${teacher.attendanceReason}</div>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span class="status-badge ${statusClass[status]}">${statusMap[status]}</span>
                        <div class="attendance-btn-group">
                            <button class="btn-attendance ${status === 'present' ? 'active-present' : ''}" 
                                    onclick="markTeacherAttendance('${teacher._id}', 'present', this)" title="Keldi">✅</button>
                            <button class="btn-attendance ${status === 'absent_reason' ? 'active-absent-reason' : ''}" 
                                    onclick="markTeacherAttendance('${teacher._id}', 'absent_reason', this)" title="Sababli">⚠️</button>
                            <button class="btn-attendance ${status === 'absent' ? 'active-absent' : ''}" 
                                    onclick="markTeacherAttendance('${teacher._id}', 'absent', this)" title="Kelmadi">❌</button>
                        </div>
                    </div>
                    <!-- ⭐ REASON CONTAINER -->
                    <div class="reason-container" style="display:${showReason ? 'flex' : 'none'};align-items:center;gap:6px;flex-wrap:wrap;">
                        <input type="text" class="reason-input" placeholder="Sabab yozing..."
                               data-id="${teacher._id}" value="${teacher.attendanceReason || ''}"
                               style="padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;font-size:0.75rem;flex:1;min-width:150px;background:var(--bg-input);color:var(--text-primary);outline:none;" />
                        <button class="btn-save-reason" data-id="${teacher._id}"
                                style="padding:6px 12px;background:var(--color-purple);color:#fff;border:none;border-radius:6px;font-size:0.7rem;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:4px;">
                            <i class="fas fa-save"></i> Saqlash
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = cards.join('');
    
    // ⭐ EVENT LISTENERLAR
    container.querySelectorAll('.btn-save-reason').forEach(btn => {
        btn.addEventListener('click', handleReasonSave);
    });
    
    container.querySelectorAll('.reason-input').forEach(input => {
        input.addEventListener('keydown', handleReasonKeydown);
    });
    
    I18N.updateUI();
}

// ============================================================
// O'QUVCHILAR RO'YXATI - RENDER (FAQAT KO'RISH)
// ============================================================
function renderStudentAttendance(students) {
    const container = document.getElementById('studentsAttendanceList');
    if (!container) {
        console.warn('⚠️ studentsAttendanceList elementi topilmadi!');
        return;
    }
    
    if (!students || !Array.isArray(students) || students.length === 0) {
        container.innerHTML = `
            <div class="text-muted" style="grid-column:1/-1;text-align:center;padding:30px 0;" data-i18n="no_data">
                <i class="fas fa-info-circle" style="font-size:2rem;display:block;margin-bottom:10px;opacity:0.3;"></i>
                Ma'lumot yo'q
            </div>
        `;
        I18N.updateUI();
        return;
    }

    console.log('📊 O\'quvchilar render qilinmoqda:', students.length, 'ta');

    const cards = students.map(student => {
        const status = student.attendanceStatus || 'absent';
        const statusMap = {
            'present': '✅ Keldi',
            'absent_reason': '⚠️ Sababli',
            'absent': '❌ Kelmadi'
        };
        const statusClass = {
            'present': 'present',
            'absent_reason': 'absent-reason',
            'absent': 'absent'
        };
        
        return `
            <div class="all-attendance-card" data-id="${student._id}" data-type="student">
                <div class="info">
                    <div class="name"><i class="fas fa-user-circle"></i> ${student.fullName || 'Noma\'lum'}</div>
                    <div class="role">${student.teacherName || 'O\'qituvchi yo\'q'}</div>
                    ${student.attendanceReason ? `<div class="reason" style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;"><i class="fas fa-comment"></i> ${student.attendanceReason}</div>` : ''}
                </div>
                <div>
                    <span class="status-badge ${statusClass[status]}">${statusMap[status]}</span>
                    <span style="font-size:0.65rem;color:var(--text-muted);margin-left:8px;">
                        <i class="fas fa-lock"></i> Faqat o'qituvchi belgilaydi
                    </span>
                </div>
            </div>
        `;
    });

    container.innerHTML = cards.join('');
    I18N.updateUI();
}

// ============================================================
// ⭐ O'QITUVCHI DAVOMATINI BELGILASH - TO'G'RI VERSIYA
// ============================================================
async function markTeacherAttendance(id, status, button) {
    const card = button.closest('.all-attendance-card');
    if (!card) return;

    // ⭐ absent_reason: avval input ko'rsatamiz, API ga KEYINROQ yuboramiz
    if (status === 'absent_reason') {
        // Tugmalar holatini vizual yangilash
        const btns = card.querySelectorAll('.btn-attendance');
        btns.forEach(btn => {
            btn.className = 'btn-attendance';
            if (btn.title === 'Sababli') btn.classList.add('active-absent-reason');
        });

        // Badge yangilash
        const badge = card.querySelector('.status-badge');
        if (badge) {
            badge.className = 'status-badge absent-reason';
            badge.textContent = '⚠️ Sababli';
        }

        // Reason container ko'rsatish
        const reasonContainer = card.querySelector('.reason-container');
        if (reasonContainer) {
            reasonContainer.style.display = 'flex';
            const input = reasonContainer.querySelector('.reason-input');
            if (input) {
                input.value = '';
                input.focus();
            }
        }

        // ⭐ API ga HALI YUBORMAYMIZ - foydalanuvchi sabab yozib "Saqlash" bosadi
        return;
    }

    // ⭐ present yoki absent: to'g'ridan-to'g'ri saqlash
    button.disabled = true;
    button.style.opacity = '0.6';

    try {
        const data = await API.createAttendance({
            studentId: id,
            date: todayDate,
            attendance: status,
            type: 'teacher',
            reason: ''
        });

        if (data.success) {
            // Badge yangilash
            const badge = card.querySelector('.status-badge');
            if (badge) {
                const statusMap = {
                    'present': '✅ Keldi',
                    'absent': '❌ Kelmadi'
                };
                const statusClass = {
                    'present': 'present',
                    'absent': 'absent'
                };
                badge.className = `status-badge ${statusClass[status]}`;
                badge.textContent = statusMap[status];
            }

            // Tugmalar holatini yangilash
            const btns = card.querySelectorAll('.btn-attendance');
            btns.forEach(btn => {
                btn.className = 'btn-attendance';
                btn.disabled = false;
                btn.style.opacity = '1';
                if (btn.title === 'Keldi' && status === 'present') btn.classList.add('active-present');
                if (btn.title === 'Kelmadi' && status === 'absent') btn.classList.add('active-absent');
            });

            // Reason container yashirish
            const reasonContainer = card.querySelector('.reason-container');
            if (reasonContainer) {
                reasonContainer.style.display = 'none';
                const input = reasonContainer.querySelector('.reason-input');
                if (input) input.value = '';
            }

            // Eski reason divni tozalash
            const reasonDiv = card.querySelector('.reason');
            if (reasonDiv) reasonDiv.innerHTML = '';

            showSuccess('Davomat saqlandi!');
        } else {
            showError(data.message || 'Xatolik yuz berdi!');
            button.disabled = false;
            button.style.opacity = '1';
        }
    } catch (error) {
        console.error('❌ Davomat saqlash xatosi:', error);
        showError(I18N.t('network_error'));
        button.disabled = false;
        button.style.opacity = '1';
    }
}

// ============================================================
// ⭐ SABABNI SAQLASH - "Saqlash" tugmasi bosilganda API ga yuboradi
// ============================================================
async function handleReasonSave(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const card = btn.closest('.all-attendance-card');
    const input = card.querySelector('.reason-input');
    const reason = input ? input.value.trim() : '';

    if (!reason) {
        showError('Iltimos, sababni yozing!');
        if (input) {
            input.focus();
            input.style.borderColor = '#ff3b30';
            setTimeout(() => {
                input.style.borderColor = 'var(--border-color)';
            }, 2000);
        }
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        // ⭐ MANA SHU YERDA reason bilan birga API ga yuboramiz
        const data = await API.createAttendance({
            studentId: id,
            date: todayDate,
            attendance: 'absent_reason',
            type: 'teacher',
            reason: reason
        });

        if (data.success) {
            btn.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
                btn.disabled = false;
            }, 1500);

            // Badge yangilash
            const badge = card.querySelector('.status-badge');
            if (badge) {
                badge.className = 'status-badge absent-reason';
                badge.textContent = '⚠️ Sababli';
            }

            // Reason ko'rsatish
            let reasonDiv = card.querySelector('.reason');
            if (!reasonDiv) {
                const infoDiv = card.querySelector('.info');
                reasonDiv = document.createElement('div');
                reasonDiv.className = 'reason';
                reasonDiv.style.cssText = 'font-size:0.7rem;color:var(--text-muted);margin-top:2px;';
                infoDiv.appendChild(reasonDiv);
            }
            reasonDiv.innerHTML = `<i class="fas fa-comment"></i> ${reason}`;

            showSuccess('Sabab muvaffaqiyatli saqlandi!');
        } else {
            showError(data.message || 'Sabab saqlashda xatolik!');
            btn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
            btn.disabled = false;
        }
    } catch (error) {
        console.error('❌ Sabab saqlash xatosi:', error);
        showError('Tarmoq xatosi!');
        btn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
        btn.disabled = false;
    }
}

// ============================================================
// SABAB INPUTI ENTER TUGMASI
// ============================================================
function handleReasonKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = e.currentTarget;
        const card = input.closest('.all-attendance-card');
        const btn = card.querySelector('.btn-save-reason');
        if (btn) btn.click();
    }
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
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

// ============================================================
// XATOLIK VA MUVAFFAQIYAT XABARLARI
// ============================================================
function showError(msg) {
    console.error('⚠️ Xatolik:', msg);
    
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
    console.log('✅ Muvaffaqiyat:', msg);
    
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

console.log('✅ all.js yuklandi');