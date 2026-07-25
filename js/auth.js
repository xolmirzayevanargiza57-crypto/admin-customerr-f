// ============================================================
// AUTH - ADMIN-CUSTOMER (TO'LIQ)
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
    // CHECK AUTH - PROFIL O'ZGARGANDA LOGOUT QILADI
    // ============================================================
    getLastAuthAge() {
        const last = localStorage.getItem('customerLastAuth');
        return last ? Date.now() - parseInt(last) : Infinity;
    },

    async checkAuth() {
        const token = this.getToken();
        if (!token) return { valid: false, reason: 'no_token' };

        const CACHE = 5 * 60 * 1000; // 5 daqiqa
        if (this.getLastAuthAge() < CACHE) {
            console.log('✅ Auth cache — server chaqirilmadi');
            return { valid: true, reason: null };
        }

        try {
            const data = await API.get('/api/auth/me');
            
            if (data.status === 0) {
                console.warn('⚠️ Server javob bermadi — sahifada qolindi');
                return { valid: true, reason: null };
            }
            
            if (!data.success) {
                if (data.status === 401 || data.status === 403) {
                    this.logout();
                    return { valid: false, reason: 'unauthorized' };
                }
                return { valid: true, reason: null };
            }

            const user = data.user;
            if (!user) return { valid: false, reason: 'no_user' };

            // ⭐ LOCALDA SAQLANGAN USER BILAN SERVERDAGI USERNI SOLISHTIRISH
            const localUser = this.getUser();
            if (localUser) {
                // Email o'zgarganmi?
                if (localUser.email !== user.email) {
                    console.warn('⚠️ Email o\'zgargan, logout qilinmoqda...');
                    localStorage.setItem('authMessage', 'Profilingiz o\'zgartirilgan. Iltimos, qayta kiring.');
                    this.logout();
                    return { valid: false, reason: 'email_changed' };
                }
                
                // Status o'zgarganmi? (active -> blocked/inactive)
                if (localUser.status !== user.status && user.status !== 'active') {
                    console.warn('⚠️ Status o\'zgargan, logout qilinmoqda...');
                    localStorage.setItem('authMessage', 'Hisobingiz bloklangan yoki faol emas.');
                    this.logout();
                    return { valid: false, reason: 'status_changed' };
                }
                
                // Subscription o'zgarganmi?
                if (localUser.subscription?.status !== user.subscription?.status) {
                    console.warn('⚠️ Subscription o\'zgargan, logout qilinmoqda...');
                    localStorage.setItem('authMessage', 'Obuna holatingiz o\'zgargan. Iltimos, qayta kiring.');
                    this.logout();
                    return { valid: false, reason: 'subscription_changed' };
                }
            }

            // Persist fresh user
            if (localStorage.getItem('customerToken')) {
                localStorage.setItem('customerUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('customerUser', JSON.stringify(user));
            }
            localStorage.setItem('customerLastAuth', Date.now().toString());

            // Account active check
            if (user.active === false || user.isActive === false || user.status === 'inactive' || user.status === 'blocked') {
                this.logout();
                return { valid: false, reason: 'inactive' };
            }

            // Subscription check
            if (user.isSubscribed === false || user.subscription?.status === 'expired' || user.subscription?.status === 'inactive') {
                this.logout();
                return { valid: false, reason: 'expired' };
            }

            return { valid: true, reason: null };
        } catch (error) {
            console.warn('⚠️ Auth check xatosi:', error.message);
            return { valid: true, reason: null };
        }
    }
};

// ============================================================
// AUTO-REDIRECT
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

        const result = await Auth.checkAuth();
        if (!result || result.valid !== true) {
            const reason = result && result.reason ? result.reason : 'unauthorized';
            const blockingReasons = ['inactive', 'expired', 'no_token', 'no_user', 'email_changed', 'status_changed', 'subscription_changed'];

            if (blockingReasons.includes(reason)) {
                const basePath = path.substring(0, path.lastIndexOf('/') + 1);
                window.location.replace(basePath + 'index.html');
                return;
            }
        }
    }
});

console.log('✅ auth.js yuklandi (Admin-Customer)');
