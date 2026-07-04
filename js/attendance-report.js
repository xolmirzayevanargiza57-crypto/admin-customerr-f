// ============================================================
// ATTENDANCE REPORT - DAVOMAT HISOBOTI (TUZATILGAN)
// ============================================================

let currentData = [];
let currentTeacher = 'all';
let currentStudent = 'all';
let dateFrom = '';
let dateTo = '';

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Default dates
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    document.getElementById('dateFrom').value = weekAgo.toISOString().split('T')[0];
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];
    
    loadTeachers();
    loadStudents();
    loadAttendance();
    
    document.getElementById('teacherFilter').addEventListener('change', (e) => {
        currentTeacher = e.target.value;
        loadAttendance();
    });
    
    document.getElementById('studentFilter').addEventListener('change', (e) => {
        currentStudent = e.target.value;
        loadAttendance();
    });
    
    document.getElementById('filterBtn').addEventListener('click', () => {
        dateFrom = document.getElementById('dateFrom').value;
        dateTo = document.getElementById('dateTo').value;
        loadAttendance();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('teacherFilter').value = 'all';
        document.getElementById('studentFilter').value = 'all';
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        document.getElementById('dateFrom').value = weekAgo.toISOString().split('T')[0];
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        currentTeacher = 'all';
        currentStudent = 'all';
        dateFrom = '';
        dateTo = '';
        loadAttendance();
    });
});

async function loadTeachers() {
    try {
        const data = await API.getTeachers();
        if (data.success) {
            const select = document.getElementById('teacherFilter');
            const teachers = data.data || [];
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher._id;
                option.textContent = teacher.fullName;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('O\'qituvchilar yuklash xatosi:', error);
    }
}

async function loadStudents() {
    try {
        const data = await API.getStudents();
        if (data.success) {
            const select = document.getElementById('studentFilter');
            const students = data.data || [];
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student._id;
                option.textContent = student.fullName;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('O\'quvchilar yuklash xatosi:', error);
    }
}

async function loadAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <div class="loading-spinner"></div>
                <p>Yuklanmoqda...</p>
            </td>
        </tr>
    `;
    
    try {
        const params = {};
        if (currentTeacher !== 'all') params.teacherId = currentTeacher;
        if (currentStudent !== 'all') params.studentId = currentStudent;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        
        const data = await API.getAttendances(params);
        if (data.success) {
            currentData = data.data || [];
            renderAttendance(currentData);
            updateSummary(currentData);
        } else {
            showEmpty('Ma\'lumotlar topilmadi');
        }
    } catch (error) {
        console.error('Davomat yuklash xatosi:', error);
        showEmpty('Xatolik yuz berdi');
    }
}

function renderAttendance(attendances) {
    const tbody = document.getElementById('attendanceTableBody');
    
    if (!attendances || attendances.length === 0) {
        showEmpty('Davomat ma\'lumotlari topilmadi');
        return;
    }
    
    const statusMap = {
        'present': '✅ Keldi',
        'absent': '❌ Kelmadi',
        'absent_reason': '⚠️ Sababli'
    };
    
    const statusClass = {
        'present': 'present',
        'absent': 'absent',
        'absent_reason': 'absent-reason'
    };
    
    tbody.innerHTML = attendances.map((att, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${att.date || '-'}</td>
            <td><strong>${att.studentName || '-'}</strong></td>
            <td>${att.teacherName || '-'}</td>
            <td>
                <span class="status-badge ${statusClass[att.attendance] || 'inactive'}">
                    ${statusMap[att.attendance] || att.attendance}
                </span>
            </td>
            <td>${att.reason || '-'}</td>
            <td>
                <span class="badge" style="background:var(--color-purple);color:#fff;padding:2px 10px;border-radius:12px;font-size:0.7rem;">
                    ${att.xpEarned || 0} XP
                </span>
            </td>
        </tr>
    `).join('');
}

function updateSummary(attendances) {
    const present = attendances.filter(a => a.attendance === 'present').length;
    const absent = attendances.filter(a => a.attendance === 'absent').length;
    const absentWithReason = attendances.filter(a => a.attendance === 'absent_reason').length;
    const total = attendances.length;
    
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('absentWithReasonCount').textContent = absentWithReason;
    
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    document.getElementById('attendancePercent').textContent = percent + '%';
}

function showEmpty(message) {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center" style="padding: 40px 20px; color: var(--text-muted);">
                <i class="fas fa-calendar-check" style="font-size: 2rem; display: block; margin-bottom: 8px; color: var(--text-muted);"></i>
                ${message}
            </td>
        </tr>
    `;
    document.getElementById('presentCount').textContent = '0';
    document.getElementById('absentCount').textContent = '0';
    document.getElementById('absentWithReasonCount').textContent = '0';
    document.getElementById('attendancePercent').textContent = '0%';
}