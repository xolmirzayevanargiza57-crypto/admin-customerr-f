// ============================================================
// ATTENDANCE - DAVOMAT (TO'LIQ TUZATILGAN)
// ============================================================

let allTeachers = [];
let allStudents = [];
let currentDate = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', async () => {
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

    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.value = currentDate;
        dateInput.addEventListener('change', (e) => {
            currentDate = e.target.value;
            loadAttendanceData();
        });
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('uz', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('todayDate').textContent = dateStr;
    document.getElementById('todayDate2').textContent = dateStr;

    await loadAttendanceData();
    setupListeners();
});

// ============================================================
// MA'LUMOTLARNI YUKLASH
// ============================================================
async function loadAttendanceData() {
    try {
        console.log('📊 Davomat yuklanmoqda... Sana:', currentDate);
        
        const teachersRes = await API.getTeachers();
        if (teachersRes.success) {
            allTeachers = teachersRes.data || [];
            await loadTeacherAttendance(allTeachers);
        }

        const studentsRes = await API.getStudents();
        if (studentsRes.success) {
            allStudents = studentsRes.data || [];
            await loadStudentAttendance(allStudents);
        }

        await loadAttendanceHistory();

        console.log('✅ Davomat ma\'lumotlari yuklandi!');
        I18N.updateUI();
    } catch (error) {
        console.error('❌ Davomat yuklash xatosi:', error);
        showError(I18N.t('network_error'));
    }
}

// ============================================================
// O'QITUVCHILAR DAVOMATI - ADMIN BELGILAYDI
// ============================================================
async function loadTeacherAttendance(teachers) {
    for (const teacher of teachers) {
        try {
            const att = await API.getAttendances({ 
                studentId: teacher._id, 
                date: currentDate,
                type: 'teacher'
            });
            if (att.success && att.data.length > 0) {
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
// O'QUVCHILAR DAVOMATI - FAQAT KO'RISH
// ============================================================
async function loadStudentAttendance(students) {
    for (const student of students) {
        try {
            const att = await API.getAttendances({ 
                studentId: student._id, 
                date: currentDate,
                type: 'student'
            });
            if (att.success && att.data.length > 0) {
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
// DAVOMAT TARIXI
// ============================================================
async function loadAttendanceHistory() {
    try {
        const att = await API.getAttendances({ date: currentDate });
        if (att.success) {
            renderAttendanceHistory(att.data || []);
        }
    } catch (error) {
        console.error('❌ Davomat tarixini yuklash xatosi:', error);
    }
}

// ============================================================
// ⭐ O'QITUVCHILAR RO'YXATI - INPUT VA TUGMA SHU YERDA
// ============================================================
function renderTeacherAttendance(teachers) {
    const container = document.getElementById('teachersAttendanceList');
    if (!container) return;
    
    if (!teachers || teachers.length === 0) {
        container.innerHTML = `<div class="text-muted" style="text-align:center;padding:20px 0;" data-i18n="no_data">Ma'lumot yo'q</div>`;
        I18N.updateUI();
        return;
    }

    console.log('📊 O\'qituvchilar render qilinmoqda:', teachers.length);

    container.innerHTML = teachers.map(teacher => {
        const status = teacher.attendanceStatus || 'absent';
        
        // ⭐ MUHIM: showReasonInput = true agar status 'absent_reason' bo'lsa
        const showReasonInput = (status === 'absent_reason');
        
        console.log(`👤 ${teacher.fullName} - Status: ${status}, ShowReasonInput: ${showReasonInput}`);
        
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
            <div class="teacher-item" data-id="${teacher._id}">
                <div class="info">
                    <div class="name"><i class="fas fa-user-circle"></i> ${teacher.fullName || 'Noma\'lum'}</div>
                    <div class="role">${teacher.subject || 'Fani yo\'q'} • Oylik: ${Utils.formatMoney(teacher.salary || 0, 'UZS')}</div>
                    ${teacher.attendanceReason ? `<div class="reason" style="font-size:0.7rem;color:var(--text-muted);"><i class="fas fa-comment"></i> ${teacher.attendanceReason}</div>` : ''}
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <span class="status-badge ${statusClass[status]}">${statusMap[status]}</span>
                    <div class="attendance-btn-group">
                        <button class="btn-attendance ${status === 'present' ? 'active-present' : ''}" 
                                data-id="${teacher._id}" data-type="teacher" data-status="present" 
                                title="Keldi">✅</button>
                        <button class="btn-attendance ${status === 'absent_reason' ? 'active-absent-reason' : ''}" 
                                data-id="${teacher._id}" data-type="teacher" data-status="absent_reason" 
                                title="Sababli kelmadi">⚠️</button>
                        <button class="btn-attendance ${status === 'absent' ? 'active-absent' : ''}" 
                                data-id="${teacher._id}" data-type="teacher" data-status="absent" 
                                title="Kelmadi">❌</button>
                    </div>
                </div>
                <!-- ⭐ SABAB INPUTI VA SAQLASH TUGMASI - SHU YERDA -->
                <div class="reason-container" style="display:${showReasonInput ? 'flex' : 'none'};align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;width:100%;padding-top:8px;border-top:1px solid var(--border-color);">
                    <input type="text" class="reason-input" placeholder="Sababni yozing..." 
                           data-id="${teacher._id}" value="${teacher.attendanceReason || ''}"
                           style="flex:1;min-width:200px;padding:8px 12px;border:2px solid var(--border-color);border-radius:8px;font-size:0.85rem;background:var(--bg-input);color:var(--text-primary);outline:none;transition:var(--transition);" />
                    <button class="btn-save-reason" data-id="${teacher._id}" 
                            style="padding:8px 18px;background:var(--color-purple);color:#fff;border:none;border-radius:8px;font-size:0.8rem;cursor:pointer;transition:var(--transition);display:flex;align-items:center;gap:6px;white-space:nowrap;">
                        <i class="fas fa-save"></i> Saqlash
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // ⭐ EVENT LISTENERLAR
    document.querySelectorAll('#teachersAttendanceList .btn-attendance').forEach(btn => {
        btn.removeEventListener('click', handleTeacherAttendanceClick);
        btn.addEventListener('click', handleTeacherAttendanceClick);
    });
    
    document.querySelectorAll('#teachersAttendanceList .btn-save-reason').forEach(btn => {
        btn.removeEventListener('click', handleReasonSave);
        btn.addEventListener('click', handleReasonSave);
    });
    
    document.querySelectorAll('#teachersAttendanceList .reason-input').forEach(input => {
        input.removeEventListener('keydown', handleReasonKeydown);
        input.addEventListener('keydown', handleReasonKeydown);
    });
    
    I18N.updateUI();
}

// ============================================================
// O'QUVCHILAR RO'YXATI - FAQAT KO'RISH
// ============================================================
function renderStudentAttendance(students) {
    const container = document.getElementById('studentsAttendanceList');
    if (!container) return;
    
    if (!students || students.length === 0) {
        container.innerHTML = `<div class="text-muted" style="text-align:center;padding:20px 0;" data-i18n="no_data">Ma'lumot yo'q</div>`;
        I18N.updateUI();
        return;
    }

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

    container.innerHTML = students.map(student => {
        const status = student.attendanceStatus || 'absent';
        return `
            <div class="student-item" data-id="${student._id}">
                <div class="info">
                    <div class="name"><i class="fas fa-user-circle"></i> ${student.fullName || 'Noma\'lum'}</div>
                    <div class="role">${student.teacherName || 'O\'qituvchi yo\'q'} • To'lov: ${Utils.formatMoney(student.monthlyPayment || 0, 'UZS')}</div>
                    ${student.attendanceReason ? `<div class="reason" style="font-size:0.7rem;color:var(--text-muted);"><i class="fas fa-comment"></i> ${student.attendanceReason}</div>` : ''}
                </div>
                <div>
                    <span class="status-badge ${statusClass[status]}">${statusMap[status]}</span>
                    <span style="font-size:0.65rem;color:var(--text-muted);margin-left:8px;">
                        <i class="fas fa-lock"></i> Faqat o'qituvchi belgilaydi
                    </span>
                </div>
            </div>
        `;
    }).join('');
    I18N.updateUI();
}

// ============================================================
// DAVOMAT TARIXI
// ============================================================
function renderAttendanceHistory(attendances) {
    const container = document.getElementById('attendanceHistoryList');
    if (!container) return;
    
    if (!attendances || attendances.length === 0) {
        container.innerHTML = `<div class="text-muted" style="text-align:center;padding:20px 0;">Bugungi davomat ma'lumotlari mavjud emas</div>`;
        return;
    }

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

    container.innerHTML = attendances.map(att => `
        <div class="attendance-history-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border-color);">
            <div>
                <strong>${att.studentName || att.teacherName || 'Noma\'lum'}</strong>
                <span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;">${att.type === 'teacher' ? '👨‍🏫 O\'qituvchi' : '🎓 O\'quvchi'}</span>
                ${att.reason ? `<span style="font-size:0.7rem;color:var(--text-muted);margin-left:8px;"><i class="fas fa-comment"></i> ${att.reason}</span>` : ''}
            </div>
            <span class="status-badge ${statusClass[att.attendance] || 'inactive'}">${statusMap[att.attendance] || att.attendance}</span>
        </div>
    `).join('');
}

// ============================================================
// ⭐ ADMIN O'QITUVCHI DAVOMATINI BELGILAYDI
// ============================================================
async function handleTeacherAttendanceClick(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const type = btn.dataset.type;
    const status = btn.dataset.status;
    
    if (type !== 'teacher') {
        showError('Siz faqat o\'qituvchilar davomatini belgilay olasiz!');
        return;
    }
    
    btn.disabled = true;
    btn.style.opacity = '0.6';
    
    try {
        // ⭐ Agar status absent_reason bo'lsa, avval sabab so'raladi
        if (status === 'absent_reason') {
            const reason = prompt('Sababni yozing:');
            if (!reason || reason.trim() === '') {
                showError('Sabab yozilishi kerak!');
                btn.disabled = false;
                btn.style.opacity = '1';
                return;
            }
            
            const data = await API.createAttendance({
                studentId: id,
                date: currentDate,
                attendance: status,
                type: type,
                reason: reason.trim()
            });
            
            if (data.success) {
                const item = btn.closest('.teacher-item');
                if (item) {
                    const badge = item.querySelector('.status-badge');
                    if (badge) {
                        badge.className = 'status-badge absent-reason';
                        badge.textContent = '⚠️ Sababli';
                    }
                    
                    let reasonDiv = item.querySelector('.reason');
                    if (!reasonDiv) {
                        const infoDiv = item.querySelector('.info');
                        reasonDiv = document.createElement('div');
                        reasonDiv.className = 'reason';
                        reasonDiv.style.cssText = 'font-size:0.7rem;color:var(--text-muted);margin-top:2px;';
                        infoDiv.appendChild(reasonDiv);
                    }
                    reasonDiv.innerHTML = `<i class="fas fa-comment"></i> ${reason.trim()}`;
                    
                    const btns = item.querySelectorAll('.btn-attendance');
                    btns.forEach(b => {
                        b.className = 'btn-attendance';
                        b.disabled = false;
                        b.style.opacity = '1';
                        const btnStatus = b.dataset.status;
                        if (btnStatus === 'absent_reason') {
                            b.classList.add('active-absent-reason');
                        }
                    });

                    // ⭐ INPUT VA TUGMANI KO'RSATISH
                    const reasonContainer = item.querySelector('.reason-container');
                    const reasonInput = item.querySelector('.reason-input');
                    if (reasonContainer) {
                        reasonContainer.style.display = 'flex';
                    }
                    if (reasonInput) {
                        reasonInput.value = reason.trim();
                    }
                }
                
                await loadAttendanceHistory();
                showSuccess('Davomat muvaffaqiyatli saqlandi!');
            } else {
                showError(data.message || 'Xatolik yuz berdi!');
            }
            
            btn.disabled = false;
            btn.style.opacity = '1';
            return;
        }
        
        // ⭐ Present yoki Absent uchun
        const data = await API.createAttendance({
            studentId: id,
            date: currentDate,
            attendance: status,
            type: type
        });

        if (data.success) {
            const item = btn.closest('.teacher-item');
            if (item) {
                const badge = item.querySelector('.status-badge');
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
                if (badge) {
                    badge.className = `status-badge ${statusClass[status]}`;
                    badge.textContent = statusMap[status];
                }
                
                const btns = item.querySelectorAll('.btn-attendance');
                btns.forEach(b => {
                    b.className = 'btn-attendance';
                    b.disabled = false;
                    b.style.opacity = '1';
                    const btnStatus = b.dataset.status;
                    if (btnStatus === status) {
                        if (status === 'present') b.classList.add('active-present');
                        else if (status === 'absent_reason') b.classList.add('active-absent-reason');
                        else if (status === 'absent') b.classList.add('active-absent');
                    }
                });

                // ⭐ Absent_reason bo'lmasa, input va tugmani yashirish
                if (status !== 'absent_reason') {
                    const reasonContainer = item.querySelector('.reason-container');
                    const reasonInput = item.querySelector('.reason-input');
                    if (reasonContainer) {
                        reasonContainer.style.display = 'none';
                    }
                    if (reasonInput) {
                        reasonInput.value = '';
                    }
                }
            }
            
            await loadAttendanceHistory();
            showSuccess('Davomat muvaffaqiyatli saqlandi!');
        } else {
            showError(data.message || 'Xatolik yuz berdi!');
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    } catch (error) {
        console.error('❌ Davomat saqlash xatosi:', error);
        showError('Tarmoq xatosi! Qayta urinib ko\'ring.');
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

// ============================================================
// ⭐ SABABNI SAQLASH (TUGMA BILAN)
// ============================================================
async function handleReasonSave(e) {
    const btn = e.currentTarget;
    const id = btn.dataset.id;
    const item = btn.closest('.teacher-item');
    const input = item.querySelector('.reason-input');
    const reason = input.value.trim();
    
    console.log('📝 Sabab saqlash:', { id, reason });
    
    if (!reason) {
        showError('Iltimos, sababni yozing!');
        input.focus();
        input.style.borderColor = '#ff3b30';
        setTimeout(() => {
            input.style.borderColor = 'var(--border-color)';
        }, 2000);
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        const data = await API.createAttendance({
            studentId: id,
            date: currentDate,
            attendance: 'absent_reason',
            type: 'teacher',
            reason: reason
        });
        
        console.log('📥 Sabab saqlash javobi:', data);
        
        if (data.success) {
            btn.innerHTML = '<i class="fas fa-check"></i> Saqlandi!';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
                btn.disabled = false;
            }, 1500);
            
            const badge = item.querySelector('.status-badge');
            if (badge) {
                badge.className = 'status-badge absent-reason';
                badge.textContent = '⚠️ Sababli';
            }
            
            let reasonDiv = item.querySelector('.reason');
            if (!reasonDiv) {
                const infoDiv = item.querySelector('.info');
                reasonDiv = document.createElement('div');
                reasonDiv.className = 'reason';
                reasonDiv.style.cssText = 'font-size:0.7rem;color:var(--text-muted);margin-top:2px;';
                infoDiv.appendChild(reasonDiv);
            }
            reasonDiv.innerHTML = `<i class="fas fa-comment"></i> ${reason}`;
            
            await loadAttendanceHistory();
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
// ⭐ SABAB INPUTI ENTER TUGMASI
// ============================================================
function handleReasonKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = e.currentTarget;
        const item = input.closest('.teacher-item');
        const btn = item.querySelector('.btn-save-reason');
        if (btn) {
            btn.click();
        }
    }
}

// ============================================================
// EVENT LISTENERLAR
// ============================================================
function setupListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

    // Sidebar open/close is handled globally by js/theme.js.
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

console.log('✅ attendance.js yuklandi');