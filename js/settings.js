// ============================================================
// SETTINGS - SOZLAMALAR
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    const user = Auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = Auth.getUserInitial();
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('schoolName').value = user.schoolName || '';
    }

    const languageContainer = document.getElementById('languageSelector');
    if (languageContainer && typeof I18N !== 'undefined') {
        const selector = I18N.createLanguageSelector();
        languageContainer.appendChild(selector);
        I18N.updateUI();
    }

    setupListeners();
});

function setupListeners() {
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
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

async function saveProfile() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const schoolName = document.getElementById('schoolName').value.trim();

    if (!fullName) {
        showError(I18N.t('all_fields_required'));
        return;
    }

    const btn = document.getElementById('saveProfileBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + I18N.t('loading');

    try {
        const data = await API.put('/api/auth/profile', { fullName, phone, schoolName });
        if (data.success) {
            const user = Auth.getUser();
            if (user) {
                user.fullName = fullName;
                user.phone = phone;
                user.schoolName = schoolName;
                localStorage.setItem('customerUser', JSON.stringify(user));
                sessionStorage.setItem('customerUser', JSON.stringify(user));
            }
            showSuccess(I18N.t('success'));
            document.getElementById('userName').textContent = fullName;
            document.getElementById('userInitial').textContent = fullName.charAt(0).toUpperCase();
        } else {
            showError(data.message || I18N.t('error'));
        }
    } catch (error) {
        showError(I18N.t('network_error'));
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> ' + I18N.t('save');
    }
}

function deleteAccount() {
    if (confirm(I18N.t('delete_account_warning'))) {
        if (confirm('Haqiqatan ham hisobingizni o\'chirmoqchimisiz?')) {
            alert('Bu funksiya hali ishlab chiqilmoqda.');
        }
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
    setTimeout(() => div.remove(), 5000);
}

console.log('✅ settings.js yuklandi');