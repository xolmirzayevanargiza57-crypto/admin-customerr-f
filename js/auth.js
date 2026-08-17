// ============================================================
// AUTH - ADMIN-CUSTOMER (REAL-TIME PROFIL SINXRONIZATSIYASI BILAN)
// Loyiha: Admin-Customer Frontend
// Fayl: js/auth.js
// ============================================================

const Auth = {
    // ============================================================
    // LOGIN
    // ============================================================
    async login(email, password) {
        try {
            console.log('📡 Login so\'rovi yuborilmoqda...');
            const data = await API.post('/api/auth/login', { email, password });
            console.log('📥 Login javobi:', data);
            
            if (data.success && data.token) {
                localStorage.setItem('customerToken', data.token);
                localStorage.setItem('customerUser', JSON.stringify(data.user));
                sessionStorage.setItem('customerToken', data.token);
                sessionStorage.setItem('customerUser', JSON.stringify(data.user));
                localStorage.setItem('customerLastAuth', Date.now().toString());
                
                return { success: true, data };
            }
            
            if (data.action === 'contact_support') {
                const phone = data.phone || '+998 94 022 44 92';
                const message = data.message || 'Iltimos, yordam uchun raqamga qo\'ng\'iroq qiling.';
                
                const confirmCall = confirm(
                    `${message}\n\n📞 Raqamga qo'ng'iroq qilmoqchimisiz? ${phone}`
                );
                
                if (confirmCall) {
                    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
                }
                
                return { 
                    success: false, 
                    error: message,
                    phone: phone,
                    action: 'contact_support'
                };
            }
            
            return { success: false, error: data.message || 'Login xatosi' };
        } catch (error) {
            console.error('❌ Login xatosi:', error);
            return { success: false, error: error.message };
        }
    },
    
    // ============================================================
    // LOGOUT
    // ============================================================
    logout() {
        console.log('🔓 Logout bosildi');
        
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        localStorage.removeItem('customerLastAuth');
        localStorage.removeItem('authMessage');
        localStorage.removeItem('theme');
        localStorage.removeItem('admin-language');
        
        sessionStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerUser');
        sessionStorage.removeItem('customerLastAuth');
        
        document.cookie.split(';').forEach(function(c) {
            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        
        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }
        
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const target = basePath + 'index.html';
        
        console.log('🔓 Logoutdan keyin yo\'naltirish:', target);
        
        try {
            window.location.replace(target);
        } catch (e) {
            try {
                window.location.href = target;
            } catch (e2) {
                document.location = target;
            }
        }
    },
    
    // ============================================================
    // AUTHENTICATED TEKSHIRISH
    // ============================================================
    isAuthenticated() {
        return !!localStorage.getItem('customerToken') || !!sessionStorage.getItem('customerToken');
    },
    
    // ============================================================
    // USER MA'LUMOTLARI
    // ============================================================
    getUser() {
        const user = localStorage.getItem('customerUser') || sessionStorage.getItem('customerUser');
        return user ? JSON.parse(user) : null;
    },

    getUserName() {
        const user = this.getUser();
        return user?.fullName || 'Admin';
    },
    
    getUserInitial() {
        const name = this.getUserName();
        if (name && name.length > 0) {
            const parts = name.split(/\s+/).filter(Boolean);
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name[0].toUpperCase();
        }
        return 'A';
    },
    
    // ============================================================
    // TOKEN OLISH
    // ============================================================
    getToken() {
        return localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    },
    
    // ============================================================
    // ⭐ REAL-TIME PROFIL SINXRONIZATSIYASI
    // ============================================================
    getLastAuthAge() {
        const last = localStorage.getItem('customerLastAuth');
        return last ? Date.now() - parseInt(last) : Infinity;
    },

    // ⭐ PROFILNI YANGILASH (BOSHQA QURILMALARDA O'ZGARSA)
    async syncProfile() {
        const token = this.getToken();
        if (!token) return { valid: false, reason: 'no_token' };

        try {
            const data = await API.get('/api/auth/me');
            
            if (data.status === 0) {
                console.warn('⚠️ Server javob bermadi');
                return { valid: true, reason: null };
            }
            
            if (!data.success) {
                if (data.status === 401 || data.status === 403) {
                    this.logout();
                    return { valid: false, reason: 'unauthorized' };
                }
                return { valid: true, reason: null };
            }

            const serverUser = data.user;
            if (!serverUser) return { valid: false, reason: 'no_user' };

            // ⭐ LOCALDA SAQLANGAN USER BILAN SOLISHTIRISH
            const localUser = this.getUser();
            let changed = false;

            if (localUser) {
                // Email o'zgarganmi?
                if (localUser.email !== serverUser.email) {
                    console.log('📧 Email o\'zgargan:', localUser.email, '→', serverUser.email);
                    changed = true;
                }
                
                // Ism o'zgarganmi?
                if (localUser.fullName !== serverUser.fullName) {
                    console.log('👤 Ism o\'zgargan:', localUser.fullName, '→', serverUser.fullName);
                    changed = true;
                }
                
                // Telefon o'zgarganmi?
                if (localUser.phone !== serverUser.phone) {
                    console.log('📱 Telefon o\'zgargan:', localUser.phone, '→', serverUser.phone);
                    changed = true;
                }
                
                // School name o'zgarganmi?
                if (localUser.schoolName !== serverUser.schoolName) {
                    console.log('🏫 O\'quv markazi o\'zgargan:', localUser.schoolName, '→', serverUser.schoolName);
                    changed = true;
                }
                
                // Status o'zgarganmi?
                if (localUser.status !== serverUser.status) {
                    console.log('📌 Status o\'zgargan:', localUser.status, '→', serverUser.status);
                    changed = true;
                }
                
                // Subscription o'zgarganmi?
                if (localUser.subscription?.status !== serverUser.subscription?.status) {
                    console.log('💰 Subscription o\'zgargan');
                    changed = true;
                }
            }

            // ⭐ AGAR O'ZGARGAN BO'LSA, LOCALNI YANGILASH
            if (changed || !localUser) {
                console.log('🔄 Profil yangilanmoqda...');
                
                const updatedUser = {
                    id: serverUser._id || serverUser.id,
                    fullName: serverUser.fullName,
                    email: serverUser.email,
                    phone: serverUser.phone || '',
                    role: serverUser.role,
                    status: serverUser.status,
                    subscription: serverUser.subscription,
                    schoolName: serverUser.schoolName || '',
                    language: serverUser.language || 'uz',
                    theme: serverUser.theme || 'auto'
                };
                
                // ⭐ LOCAL STORAGE NI YANGILASH
                if (localStorage.getItem('customerToken')) {
                    localStorage.setItem('customerUser', JSON.stringify(updatedUser));
                } else {
                    sessionStorage.setItem('customerUser', JSON.stringify(updatedUser));
                }
                localStorage.setItem('customerLastAuth', Date.now().toString());
                
                // ⭐ UI NI YANGILASH UCHUN EVENT
                document.dispatchEvent(new CustomEvent('profileUpdated', { 
                    detail: { user: updatedUser } 
                }));
                
                // ⭐ SAHIFADAGI ELEMENTLARNI YANGILASH
                this.updateUI(updatedUser);
                
                return { valid: true, reason: null, changed: true };
            }

            // Persist fresh user
            if (localStorage.getItem('customerToken')) {
                localStorage.setItem('customerUser', JSON.stringify(serverUser));
            } else {
                sessionStorage.setItem('customerUser', JSON.stringify(serverUser));
            }
            localStorage.setItem('customerLastAuth', Date.now().toString());

            // Account active check
            if (serverUser.active === false || serverUser.isActive === false || serverUser.status === 'inactive' || serverUser.status === 'blocked') {
                this.logout();
                return { valid: false, reason: 'inactive' };
            }

            // Subscription check
            if (serverUser.isSubscribed === false || serverUser.subscription?.status === 'expired' || serverUser.subscription?.status === 'inactive') {
                this.logout();
                return { valid: false, reason: 'expired' };
            }

            return { valid: true, reason: null };
        } catch (error) {
            console.warn('⚠️ Auth check xatosi:', error.message);
            return { valid: true, reason: null };
        }
    },

    // ⭐ UI NI YANGILASH
    updateUI(user) {
        if (!user) return;
        
        // User name
        const nameEl = document.getElementById('userName');
        if (nameEl) {
            nameEl.textContent = user.fullName || 'Admin';
        }
        
        // User initial
        const initialEl = document.getElementById('userInitial');
        if (initialEl) {
            const name = user.fullName || 'Admin';
            if (name && name.length > 0) {
                const parts = name.split(/\s+/).filter(Boolean);
                if (parts.length >= 2) {
                    initialEl.textContent = (parts[0][0] + parts[1][0]).toUpperCase();
                } else {
                    initialEl.textContent = name[0].toUpperCase();
                }
            }
        }
        
        // School name
        const schoolEl = document.getElementById('schoolName');
        if (schoolEl) {
            schoolEl.textContent = user.schoolName || "Nurli Ta'lim Markazi";
        }
        
        console.log('✅ UI yangilandi:', user.fullName);
    },

    // ⭐ REAL-TIME SINXRONIZATSIYA (HAR 10 SONIYADA)
    startRealtimeSync() {
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
        }
        
        this._syncInterval = setInterval(async () => {
            const token = this.getToken();
            if (!token) return;
            
            const result = await this.syncProfile();
            if (result && result.changed) {
                console.log('🔄 Profil real-time yangilandi!');
            }
        }, 10000); // Har 10 soniyada
        
        console.log('✅ Real-time sinxronizatsiya boshlandi (10 soniyada)');
    },

    // ⭐ REAL-TIME SINXRONIZATSIYANI TO'XTATISH
    stopRealtimeSync() {
        if (this._syncInterval) {
            clearInterval(this._syncInterval);
            this._syncInterval = null;
            console.log('❌ Real-time sinxronizatsiya to\'xtatildi');
        }
    },

    // ============================================================
    // CHECK AUTH - PROFIL O'ZGARGANDA LOGOUT QILADI
    // ============================================================
    async checkAuth() {
        const token = this.getToken();
        if (!token) return { valid: false, reason: 'no_token' };

        const CACHE = 5 * 60 * 1000; // 5 daqiqa
        if (this.getLastAuthAge() < CACHE) {
            console.log('✅ Auth cache — server chaqirilmadi');
            return { valid: true, reason: null };
        }

        return this.syncProfile();
    }
};

// ============================================================
// ⭐ REAL-TIME SINXRONIZATSIYANI AVTOMATIK BOSHLASH
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const isLoginPage = path.includes('index.html') || 
                        path === '/' || 
                        path.endsWith('/');

    if (!isLoginPage) {
        if (!Auth.isAuthenticated()) {
            const basePath = path.substring(0, path.lastIndexOf('/') + 1);
            window.location.replace(basePath + 'index.html');
            return;
        }

        // ⭐ REAL-TIME SINXRONIZATSIYANI BOSHLASH
        Auth.startRealtimeSync();

        const result = await Auth.checkAuth();
        if (!result || result.valid !== true) {
            const reason = result && result.reason ? result.reason : 'unauthorized';
            const blockingReasons = ['inactive', 'expired', 'no_token', 'no_user', 'email_changed', 'status_changed', 'subscription_changed', 'token_invalid'];

            if (blockingReasons.includes(reason)) {
                const basePath = path.substring(0, path.lastIndexOf('/') + 1);
                window.location.replace(basePath + 'index.html');
                return;
            }
        }
    }
});

// ⭐ SAHIFA YOPILGANDA SINXRONIZATSIYANI TO'XTATISH
window.addEventListener('beforeunload', function() {
    Auth.stopRealtimeSync();
});

console.log('✅ auth.js yuklandi (Real-time sinxronizatsiya bilan)');
