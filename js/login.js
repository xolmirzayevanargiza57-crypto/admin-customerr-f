// ============================================================
// LOGIN - TIZIMGA KIRISH (TO'LIQ)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btn = document.getElementById('loginBtn');
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const passwordToggle = document.getElementById('passwordToggle');

    // Agar allaqachon kirgan bo'lsa
    if (Auth.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Agar redirect bilan sabab kelsa (masalan: inactive, expired, no_token)
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason');
    if (reason) {
        let msgKey = 'session_expired';
        if (reason === 'inactive' || reason === 'no_user') msgKey = 'account_inactive';
        else if (reason === 'expired') msgKey = 'subscription_expired';
        else if (reason === 'no_token' || reason === 'unauthorized') msgKey = 'session_expired';
        errorText.textContent = I18N.t(msgKey) || 'Sessiya muddati tugagan';
        errorDiv.classList.add('show');
    }

    // Parolni ko'rsatish/yashirish
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            const icon = this.querySelector('i');
            if (icon) icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    // Email validation
    emailInput.addEventListener('blur', function() {
        const value = this.value.trim();
        const isValid = value.includes('@') && value.includes('.');
        this.classList.remove('success', 'error');
        if (value.length > 0) {
            this.classList.add(isValid ? 'success' : 'error');
        }
    });

    // Password validation
    passwordInput.addEventListener('blur', function() {
        const value = this.value;
        const isValid = value.length >= 6;
        this.classList.remove('success', 'error');
        if (value.length > 0) {
            this.classList.add(isValid ? 'success' : 'error');
        }
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validation
        let isValid = true;
        if (!email || !email.includes('@') || !email.includes('.')) {
            emailInput.classList.add('error');
            emailInput.classList.remove('success');
            isValid = false;
        } else {
            emailInput.classList.add('success');
            emailInput.classList.remove('error');
        }
        
        if (!password || password.length < 6) {
            passwordInput.classList.add('error');
            passwordInput.classList.remove('success');
            isValid = false;
        } else {
            passwordInput.classList.add('success');
            passwordInput.classList.remove('error');
        }

        if (!isValid) {
            errorText.textContent = I18N.t('all_fields_required');
            errorDiv.classList.add('show');
            return;
        }

        // Loading state
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + I18N.t('loading');
        errorDiv.classList.remove('show');

        try {
            console.log('📡 Login so\'rovi yuborilmoqda...');
            const result = await Auth.login(email, password);
            console.log('📥 Login natijasi:', result);
            
            if (result.success) {
                btn.innerHTML = '<i class="fas fa-check"></i> ' + I18N.t('success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                errorText.textContent = result.error || I18N.t('error');
                errorDiv.classList.add('show');
                btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + I18N.t('login_btn');
                btn.disabled = false;
            }
        } catch (error) {
            console.error('❌ Login xatosi:', error);
            errorText.textContent = I18N.t('network_error');
            errorDiv.classList.add('show');
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + I18N.t('login_btn');
            btn.disabled = false;
        }
    });

    // Enter tugmasi
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            form.requestSubmit();
        }
    });

    // Xatolikni tozalash
    [emailInput, passwordInput].forEach(inp => {
        inp.addEventListener('input', () => {
            errorText.textContent = '';
            errorDiv.classList.remove('show');
        });
        inp.addEventListener('focus', () => {
            errorText.textContent = '';
            errorDiv.classList.remove('show');
        });
    });
});

console.log('✅ login.js yuklandi');