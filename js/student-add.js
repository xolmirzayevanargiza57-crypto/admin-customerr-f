// ============================================
// STUDENT ADD - YANGI O'QUVCHI
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    const form = document.getElementById('addStudentForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('formMessage');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    
    // Password toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
    
    // Load teachers
    loadTeachers();
    
    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const teacherId = document.getElementById('teacherId').value;
        let password = passwordInput.value.trim();
        
        // Validatsiya
        if (!fullName || !teacherId) {
            showMessage('F.I.SH va O\'qituvchi majburiy!', 'error');
            return;
        }

        if (!password) {
            password = `std${Math.floor(1000 + Math.random() * 9000)}`;
        }
        
        if (password.length < 6) {
            showMessage('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';
        messageDiv.className = 'form-message';
        messageDiv.style.display = 'none';
        
        try {
            const data = await API.post('/students', {
                fullName,
                email,
                phone,
                password,
                teacherId
            });
            
            if (data.success) {
                const generatedHint = passwordInput.value.trim() ? '' : ` Parol: ${password}`;
                showMessage(`✅ O\'quvchi muvaffaqiyatli yaratildi!${generatedHint}`, 'success');
                form.reset();
                passwordInput.value = '';
                setTimeout(() => {
                    window.location.href = 'students.html';
                }, 1600);
            } else {
                showMessage(data.message || 'Xatolik yuz berdi!', 'error');
            }
        } catch (error) {
            showMessage(error.message || 'Server xatosi! Qayta urinib ko\'ring.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
        }
    });
    
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});

async function loadTeachers() {
    try {
        const data = await API.get('/teachers');
        if (data.success) {
            const select = document.getElementById('teacherId');
            const teachers = data.data || [];
            select.innerHTML = '<option value="">O\'qituvchi tanlang...</option>';
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher._id;
                option.textContent = teacher.fullName + ' (' + (teacher.subject || 'Fan yo\'q') + ')';
                select.appendChild(option);
            });
            if (teachers.length === 1) {
                select.value = teachers[0]._id;
            }
        }
    } catch (error) {
        console.error('O\'qituvchilar yuklash xatosi:', error);
    }
}