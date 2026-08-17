// ============================================================
// SETTINGS - SOZLAMALAR (REAL-TIME SINXRONIZATSIYA BILAN)
// Loyiha: Admin-Customer Frontend
// Fayl: js/settings.js
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { window.location.href = 'index.html'; return; }

    // ⭐ PROFIL O'ZGARGANDA UI YANGILASH
    document.addEventListener('profileUpdated', function(e) {
        const user = e.detail?.user;
        if (user) {
            console.log('🔄 Profil yangilandi event:', user);
            loadSettings();
        }
    });

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

    // ⭐ HAR 10 SONIYADA PROFILNI TEKSHIRISH
    setInterval(async function() {
        const result = await Auth.syncProfile();
        if (result && result.changed) {
            loadSettings();
        }
    }, 10000);
});

function setupListeners() {
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
    document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
}

// ============================================================
// ⭐ PROFILNI SAQLASH (BARCHA QURILMALARGA TARQALADI)
// ============================================================
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
            
            // ⭐ BOSHQA QURILMALARGA XABAR YUBORISH UCHUN EVENT
            document.dispatchEvent(new CustomEvent('profileUpdated', { 
                detail: { user: user } 
            }));
            
            // ⭐ BOSHQA QURILMALARDA O'ZGARISH UCHUN AUTH CACHE NI TOZALASH
            localStorage.setItem('customerLastAuth', '0');
            
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

// ============================================================
// ⭐ PROFIL MA'LUMOTLARINI YUKLASH
// ============================================================
function loadSettings() {
    try {
        const user = Auth.getUser();
        if (!user) {
            console.warn('⚠️ User topilmadi');
            return;
        }
        
        console.log('👤 User ma\'lumotlari:', user);
        
        const nameInput = document.getElementById('settingsName');
        const emailInput = document.getElementById('settingsEmail');
        const phoneInput = document.getElementById('settingsPhone');
        
        if (nameInput) nameInput.value = user.fullName || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        
        const nameDisplay = document.getElementById('profileNameDisplay');
        const emailDisplay = document.getElementById('profileEmailDisplay');
        const phoneDisplay = document.getElementById('profilePhoneDisplay');
        
        if (nameDisplay) nameDisplay.textContent = user.fullName || '-';
        if (emailDisplay) emailDisplay.textContent = user.email || '-';
        if (phoneDisplay) phoneDisplay.textContent = user.phone || '-';
        
        const userName = document.getElementById('userName');
        const userInitial = document.getElementById('userInitial');
        if (userName) userName.textContent = user.fullName || 'Admin';
        if (userInitial) userInitial.textContent = (user.fullName || 'A').charAt(0).toUpperCase();
        
        console.log('✅ Settings yuklandi');
    } catch (error) {
        console.error('❌ loadSettings xatosi:', error);
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

console.log('✅ settings.js yuklandi (Real-time sinxronizatsiya bilan)');
