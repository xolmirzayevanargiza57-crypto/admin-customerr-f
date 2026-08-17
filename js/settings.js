// ============================================================
// SETTINGS - SOZLAMALAR (TO'LIQ TUZATILGAN)
// Loyiha: Admin-Customer Frontend
// Fayl: js/settings.js
// ============================================================

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
        
        // ⭐ PROFIL DISPLAY
        document.getElementById('profileNameDisplay').textContent = user.fullName || '-';
        document.getElementById('profileEmailDisplay').textContent = user.email || '-';
        document.getElementById('profilePhoneDisplay').textContent = user.phone || '-';
    }

    // ⭐ LANGUAGE SELECTOR - BU MUHIM!
    const languageContainer = document.getElementById('languageSelector');
    if (languageContainer && typeof I18N !== 'undefined') {
        // Eski elementlarni tozalash
        languageContainer.innerHTML = '';
        // Yangi selector yaratish
        const selector = I18N.createLanguageSelector();
        languageContainer.appendChild(selector);
        I18N.updateUI();
        console.log('✅ Language selector yaratildi');
    } else {
        console.warn('⚠️ Language selector topilmadi yoki I18N mavjud emas');
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
        // Eski eventlarni tozalash
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
                // Theme ni qo'llash
                const html = document.documentElement;
                if (theme === 'auto') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                } else {
                    html.setAttribute('data-theme', theme);
                }
                localStorage.setItem('theme', theme);
                
                // Theme UI yangilash
                updateThemeUI();
                
                // Serverga saqlash
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
            
            // UI yangilash
            document.getElementById('userName').textContent = fullName;
            document.getElementById('userInitial').textContent = fullName.charAt(0).toUpperCase();
            document.getElementById('profileNameDisplay').textContent = fullName;
            document.getElementById('profilePhoneDisplay').textContent = phone || '-';
            
            showProfileMessage('✅ Profil muvaffaqiyatli yangilandi!', 'success');
            
            // Boshqa qurilmalarga xabar
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
// ⭐ HISOBNI O'CHIRISH
// ============================================================
function deleteAccount() {
    if (confirm('Haqiqatan ham hisobingizni o\'chirmoqchimisiz?')) {
        if (confirm('Bu amal qaytarib bo\'lmaydi! Davom etmoqchimisiz?')) {
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
        
        document.getElementById('settingsName').value = user.fullName || '';
        document.getElementById('settingsPhone').value = user.phone || '';
        document.getElementById('settingsSchool').value = user.schoolName || '';
        
        document.getElementById('profileNameDisplay').textContent = user.fullName || '-';
        document.getElementById('profileEmailDisplay').textContent = user.email || '-';
        document.getElementById('profilePhoneDisplay').textContent = user.phone || '-';
        
        document.getElementById('userName').textContent = user.fullName || 'Admin';
        document.getElementById('userInitial').textContent = (user.fullName || 'A').charAt(0).toUpperCase();
        
        // ⭐ TIL SELECTOR NI YANGILASH
        const languageContainer = document.getElementById('languageSelector');
        if (languageContainer && typeof I18N !== 'undefined') {
            languageContainer.innerHTML = '';
            const selector = I18N.createLanguageSelector();
            languageContainer.appendChild(selector);
            I18N.updateUI();
        }
        
        // ⭐ THEME UI YANGILASH
        updateThemeUI();
        
        console.log('✅ Settings yuklandi');
    } catch (error) {
        console.error('❌ loadSettings xatosi:', error);
    }
}

console.log('✅ settings.js yuklandi');
