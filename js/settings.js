// ============================================================
// SETTINGS - SOZLAMALAR (TO'LIQ)
// Loyiha: Admin-Customer Frontend
// Fayl: js/settings.js
// ============================================================

let deleteAccountInProgress = false;

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    if (!token) { 
        window.location.href = 'index.html'; 
        return; 
    }

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
        document.getElementById('settingsName').value = user.fullName || '';
        document.getElementById('settingsPhone').value = user.phone || '';
        document.getElementById('settingsSchool').value = user.schoolName || '';
        
        document.getElementById('profileNameDisplay').textContent = user.fullName || '-';
        document.getElementById('profileEmailDisplay').textContent = user.email || '-';
        document.getElementById('profilePhoneDisplay').textContent = user.phone || '-';
    }

    // ⭐ LANGUAGE SELECTOR
    const languageContainer = document.getElementById('languageSelector');
    if (languageContainer && typeof I18N !== 'undefined') {
        languageContainer.innerHTML = '';
        const selector = I18N.createLanguageSelector();
        languageContainer.appendChild(selector);
        I18N.updateUI();
        console.log('✅ Language selector yaratildi');
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
    // ⭐ PROFIL SAQLASH
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        newBtn.addEventListener('click', saveProfile);
    }

    // ⭐ CHIQISH
    const logoutBtn = document.getElementById('settingsLogout');
    if (logoutBtn) {
        const newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', function() {
            if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }

    // ⭐ HISOBNI O'CHIRISH
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        const newBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newBtn, deleteBtn);
        newBtn.addEventListener('click', deleteAccount);
    }

    // ⭐ THEME OPTIONS
    document.querySelectorAll('.theme-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            if (theme) {
                const html = document.documentElement;
                if (theme === 'auto') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                } else {
                    html.setAttribute('data-theme', theme);
                }
                localStorage.setItem('theme', theme);
                updateThemeUI();
                
                const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
                if (token) {
                    fetch(window.__API_BASE_URL__ + '/api/auth/theme', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ theme: theme })
                    }).catch(function(err) {
                        console.error('Theme saqlash xatosi:', err);
                    });
                }
            }
        });
    });
}

// ============================================================
// ⭐ THEME UI YANGILASH
// ============================================================
function updateThemeUI() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const actualTheme = document.documentElement.getAttribute('data-theme');
    
    document.querySelectorAll('.theme-option').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });

    const statusText = document.getElementById('themeStatus');
    if (statusText) {
        const themeNames = { light: 'Yorug\'', dark: 'Qorong\'u' };
        if (currentTheme === 'auto') {
            statusText.textContent = 'Hozirgi holat: Avtomatik (' + (themeNames[actualTheme] || actualTheme) + ')';
        } else {
            statusText.textContent = 'Hozirgi holat: ' + (themeNames[actualTheme] || actualTheme);
        }
    }
}

// ============================================================
// ⭐ PROFILNI SAQLASH
// ============================================================
async function saveProfile(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('settingsName').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();
    const schoolName = document.getElementById('settingsSchool').value.trim();

    if (!fullName) {
        showProfileMessage('To\'liq ism majburiy!', 'error');
        return;
    }

    const btn = document.getElementById('saveProfileBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saqlanmoqda...';

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
            
            document.getElementById('userName').textContent = fullName;
            document.getElementById('userInitial').textContent = fullName.charAt(0).toUpperCase();
            document.getElementById('profileNameDisplay').textContent = fullName;
            document.getElementById('profilePhoneDisplay').textContent = phone || '-';
            
            showProfileMessage('✅ Profil muvaffaqiyatli yangilandi!', 'success');
            
            document.dispatchEvent(new CustomEvent('profileUpdated', { 
                detail: { user: user } 
            }));
            localStorage.setItem('customerLastAuth', '0');
            
        } else {
            showProfileMessage(data.message || 'Xatolik yuz berdi!', 'error');
        }
    } catch (error) {
        console.error('❌ Profil saqlash xatosi:', error);
        showProfileMessage('Server xatosi! Qayta urinib ko\'ring.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Saqlash';
    }
}

// ============================================================
// ⭐ PROFIL XABARI
// ============================================================
function showProfileMessage(msg, type) {
    const div = document.getElementById('profileMessage');
    if (!div) return;
    div.textContent = msg;
    div.className = 'form-message ' + type;
    div.style.display = 'block';
    setTimeout(function() {
        div.style.display = 'none';
    }, 5000);
}

// ============================================================
// ⭐ HISOBNI O'CHIRISH (TO'LIQ)
// ============================================================
async function deleteAccount() {
    // ⭐ 1. Agar o'chirish jarayoni davom etayotgan bo'lsa
    if (deleteAccountInProgress) {
        return;
    }

    // ⭐ 2. TASDIQLASH
    if (!confirm('⚠️ Haqiqatan ham hisobingizni o\'chirmoqchimisiz?')) {
        return;
    }

    if (!confirm('⛔ Bu amal qaytarib bo\'lmaydi! Barcha ma\'lumotlaringiz o\'chib ketadi. Davom etmoqchimisiz?')) {
        return;
    }

    // ⭐ 3. PAROLNI SO'RASH (xavfsizlik)
    const password = prompt('🔐 Xavfsizlik uchun parolingizni kiriting:');
    if (password === null) {
        return;
    }

    if (!password || password.trim() === '') {
        showDeleteMessage('❌ Parol kiritilmadi!', 'error');
        return;
    }

    // ⭐ 4. JARAYONNI BOSHLASH
    deleteAccountInProgress = true;
    const btn = document.getElementById('deleteAccountBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> O\'chirilmoqda...';
    }

    try {
        // ⭐ 4.1. Parolni tekshirish
        const checkResult = await API.post('/api/auth/check-password', { password });
        
        if (!checkResult.success) {
            showDeleteMessage('❌ Parol noto\'g\'ri!', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-trash"></i> ' + (I18N.t('delete_account') || 'Hisobni o\'chirish');
            }
            deleteAccountInProgress = false;
            return;
        }

        // ⭐ 4.2. Hisobni o'chirish
        const result = await API.delete('/api/auth/delete-account');

        if (result.success) {
            showDeleteMessage('✅ Hisobingiz muvaffaqiyatli o\'chirildi!', 'success');
            
            // ⭐ 4.3. Logout qilish
            setTimeout(() => {
                Auth.logout();
            }, 2000);
        } else {
            showDeleteMessage('❌ Xatolik: ' + (result.message || 'Noma\'lum xatolik'), 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-trash"></i> ' + (I18N.t('delete_account') || 'Hisobni o\'chirish');
            }
            deleteAccountInProgress = false;
        }
    } catch (error) {
        console.error('❌ Hisob o\'chirish xatosi:', error);
        showDeleteMessage('❌ Server xatosi! Qayta urinib ko\'ring.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-trash"></i> ' + (I18N.t('delete_account') || 'Hisobni o\'chirish');
        }
        deleteAccountInProgress = false;
    }
}

// ============================================================
// ⭐ DELETE MESSAGE
// ============================================================
function showDeleteMessage(msg, type) {
    const div = document.getElementById('deleteMessage');
    if (!div) {
        // Toast ko'rsatish
        if (type === 'success') {
            showSuccess(msg);
        } else {
            showError(msg);
        }
        return;
    }
    div.textContent = msg;
    div.className = 'form-message ' + type;
    div.style.display = 'block';
    setTimeout(() => {
        div.style.display = 'none';
    }, 5000);
}

// ============================================================
// ⭐ LOAD SETTINGS
// ============================================================
function loadSettings() {
    try {
        const user = Auth.getUser();
        if (!user) {
            console.warn('⚠️ User topilmadi');
            return;
        }
        
        console.log('👤 User ma\'lumotlari:', user);
        
        document.getElementById('settingsName').value = user.fullName || '';
        document.getElementById('settingsPhone').value = user.phone || '';
        document.getElementById('settingsSchool').value = user.schoolName || '';
        
        document.getElementById('profileNameDisplay').textContent = user.fullName || '-';
        document.getElementById('profileEmailDisplay').textContent = user.email || '-';
        document.getElementById('profilePhoneDisplay').textContent = user.phone || '-';
        
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = (user.fullName || 'A').charAt(0).toUpperCase();
        
        // Language selector
        const languageContainer = document.getElementById('languageSelector');
        if (languageContainer && typeof I18N !== 'undefined') {
            languageContainer.innerHTML = '';
            const selector = I18N.createLanguageSelector();
            languageContainer.appendChild(selector);
            I18N.updateUI();
        }
        
        updateThemeUI();
        
        console.log('✅ Settings yuklandi');
    } catch (error) {
        console.error('❌ loadSettings xatosi:', error);
    }
}

// ============================================================
// ⭐ TOAST FUNKSIYALARI
// ============================================================
function showError(msg) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
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
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
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

console.log('✅ settings.js yuklandi (Hisob o\'chirish bilan)');
