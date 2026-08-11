// ============================================
// TEACHER ADD - YANGI O'QITUVCHI (TO'LIQ TUZATILGAN)
// ============================================

let subjectSelect = null;
let subjectsData = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    var form = document.getElementById('addTeacherForm');
    var submitBtn = document.getElementById('submitBtn');
    var messageDiv = document.getElementById('formMessage');
    var passwordInput = document.getElementById('password');
    var passwordToggle = document.getElementById('passwordToggle');
    subjectSelect = document.getElementById('subject');
    
    // Load subjects for teacher assignment
    loadSubjects();
    
    // Password toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            var icon = this.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
    
    // Form submit
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        var fullName = document.getElementById('fullName').value.trim();
        var email = document.getElementById('email').value.trim();
        var phone = document.getElementById('phone').value.trim();
        var password = passwordInput.value;
        var subject = subjectSelect.value.trim();
        
        // Validatsiya
        if (!fullName || !email || !password || !subject) {
            showMessage('F.I.SH, Email, Fan va Parol majburiy!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Parol kamida 6 ta belgidan iborat bo\'lishi kerak!', 'error');
            return;
        }
        
        if (!email.includes('@')) {
            showMessage('Email noto\'g\'ri formatda!', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';
        messageDiv.className = 'form-message';
        messageDiv.style.display = 'none';
        
        try {
            var data = await API.createTeacher({
                fullName: fullName,
                email: email,
                phone: phone,
                password: password,
                subject: subject
            });
            
            if (data.success) {
                showMessage('✅ O\'qituvchi muvaffaqiyatli yaratildi!', 'success');
                form.reset();
                passwordInput.value = '';
                setTimeout(function() {
                    window.location.href = 'teachers.html';
                }, 2000);
            } else {
                showMessage(data.message || 'Xatolik yuz berdi!', 'error');
            }
        } catch (error) {
            console.error('❌ O\'qituvchi yaratish xatosi:', error);
            showMessage(error.message || 'Server xatosi! Qayta urinib ko\'ring.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
        }
    });
    
    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = 'form-message ' + type;
        messageDiv.style.display = 'block';
        setTimeout(function() {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});

// ============================================
// ⭐ FANLARNI YUKLASH (TUZATILGAN)
// ============================================
async function loadSubjects() {
    try {
        console.log('📡 Fanlar yuklanmoqda...');
        
        // ⭐ API.subjects() - TO'G'RI
        var data = await API.getSubjects();
        
        console.log('📦 Fanlar javobi:', data);
        
        if (data.success && data.data) {
            subjectsData = data.data || [];
            renderSubjectSelect(subjectsData);
        } else {
            console.warn('⚠️ Fanlar yuklanmadi:', data.message);
            subjectSelect.innerHTML = '<option value="" selected disabled>Fanlar mavjud emas. Avval fan qo\'shing.</option>';
            subjectSelect.disabled = true;
        }
    } catch (error) {
        console.error('❌ Fanlar yuklash xatosi:', error);
        subjectSelect.innerHTML = '<option value="" selected disabled>Fanlar yuklanmadi. Qayta urining.</option>';
        subjectSelect.disabled = true;
        showMessage('Fanlar yuklanmadi. Iltimos, qayta urining.', 'error');
    }
}

// ============================================
// ⭐ FANLARNI SELECT GA JOYLASH
// ============================================
function renderSubjectSelect(subjects) {
    if (!subjectSelect) return;
    
    // Select ni tozalash
    subjectSelect.innerHTML = '';
    
    // Default option
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Fan tanlang...';
    defaultOption.selected = true;
    defaultOption.disabled = true;
    subjectSelect.appendChild(defaultOption);
    
    if (!subjects || subjects.length === 0) {
        var emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Fanlar mavjud emas. Avval fan qo\'shing.';
        emptyOption.disabled = true;
        subjectSelect.appendChild(emptyOption);
        subjectSelect.disabled = true;
        return;
    }
    
    // Fanlarni qo'shish
    subjects.forEach(function(subject) {
        var option = document.createElement('option');
        option.value = subject.name || subject.title || '';
        option.textContent = subject.name || subject.title || '—';
        subjectSelect.appendChild(option);
    });
    
    subjectSelect.disabled = false;
    console.log('✅ ' + subjects.length + ' ta fan yuklandi');
}

console.log('✅ teacher-add.js yuklandi');
