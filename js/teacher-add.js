// ============================================
// TEACHER ADD - YANGI O'QITUVCHI
// ============================================

let subjectSelect = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    const form = document.getElementById('addTeacherForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('formMessage');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    subjectSelect = document.getElementById('subject');
    
    // Load subjects for teacher assignment
    loadSubjects();
    
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
    
    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = passwordInput.value;
        const subject = subjectSelect.value.trim();
        
        // Validatsiya
        if (!fullName || !email || !password || !subject) {
            showMessage((getTranslation('all_fields_required') || 'F.I.SH, Email, Fan va Parol majburiy!'), 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage((getTranslation('password_min_length') || 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!'), 'error');
            return;
        }
        
        if (!email.includes('@')) {
            showMessage((getTranslation('email_invalid') || 'Email noto\'g\'ri formatda!'), 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (getTranslation('loading') || 'Saqlanmoqda...');
        messageDiv.className = 'form-message';
        messageDiv.style.display = 'none';
        
        try {
            const data = await API.post('/teachers', {
                fullName,
                email,
                phone,
                password,
                subject
            });
            
            if (data.success) {
                showMessage('✅ ' + (getTranslation('teacher_added') || 'O\'qituvchi muvaffaqiyatli yaratildi!'), 'success');
                form.reset();
                passwordInput.value = '';
                setTimeout(() => {
                    window.location.href = 'teachers.html';
                }, 2000);
            } else {
                showMessage(data.message || (getTranslation('error') || 'Xatolik yuz berdi!'), 'error');
            }
        } catch (error) {
            showMessage(error.message || (getTranslation('server_error') || 'Server xatosi! Qayta urinib ko\'ring.'), 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> ' + (getTranslation('save') || 'Saqlash');
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

async function loadSubjects() {
    try {
        const data = await API.getSubjects();
        const subjects = data.data || [];
        subjectSelect.innerHTML = '<option value="" selected disabled>' + (getTranslation('select_subject') || 'Fan tanlang...') + '</option>';

        if (data.success && subjects.length > 0) {
            subjectSelect.disabled = false;
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name || subject.title || '';
                option.textContent = subject.name || subject.title || '—';
                subjectSelect.appendChild(option);
            });
        } else {
            subjectSelect.disabled = true;
            subjectSelect.innerHTML = '<option value="" selected disabled>' + (getTranslation('no_subjects_available') || 'Fanlar mavjud emas. Avval fan qo\'shing.') + '</option>';
        }
    } catch (error) {
        console.error('Fanlar yuklash xatosi:', error);
        subjectSelect.innerHTML = '<option value="" selected disabled>' + (getTranslation('no_subjects_available') || 'Fanlar mavjud emas. Avval fan qo\'shing.') + '</option>';
        subjectSelect.disabled = true;
    }
}