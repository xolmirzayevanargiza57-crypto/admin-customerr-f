// ============================================================
// AUTH - ADMIN CUSTOMER (TO'LIQ)
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
                return { success: true, data };
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
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        sessionStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerUser');
        window.location.href = 'index.html';
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
        return user ? user.fullName || 'Admin' : 'Admin';
    },
    
    getUserInitial() {
        const name = this.getUserName();
        if (name && name.length > 0) {
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name[0].toUpperCase();
        }
        return 'A';
    },
    
    // ============================================================
    // AUTHENTICATION TEKSHIRISH (SERVER BILAN)
    // ============================================================
    async checkAuth() {
        const token = this.getToken();
        if (!token) return { valid: false, reason: 'no_token' };

        try {
            const data = await API.get('/api/auth/me');
            if (!data || !data.success) {
                return { valid: false, reason: data && (data.status === 401 || data.status === 403) ? 'unauthorized' : 'server' };
            }

            const user = data.user;
            if (!user) return { valid: false, reason: 'no_user' };

            // persist fresh user
            if (localStorage.getItem('customerToken')) {
                localStorage.setItem('customerUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('customerUser', JSON.stringify(user));
            }

            // Account active check
            if (user.active === false || user.isActive === false || user.status === 'inactive' || user.status === 'blocked') {
                return { valid: false, reason: 'inactive' };
            }

            // Subscription / premium check (best-effort checks against common fields)
            if (user.isSubscribed === false || user.subscription === 'expired') {
                return { valid: false, reason: 'expired' };
            }

            if (user.subscriptionExpiry) {
                try {
                    const exp = new Date(user.subscriptionExpiry);
                    if (!isNaN(exp.getTime()) && exp < new Date()) {
                        return { valid: false, reason: 'expired' };
                    }
                } catch (e) { /* ignore parse errors */ }
            }

            return { valid: true, reason: null };
        } catch (error) {
            console.warn('⚠️ Auth check xatosi:', error.message);
            return { valid: false, reason: 'error' };
        }
    },
    
    // ============================================================
    // TOKEN OLISH
    // ============================================================
    getToken() {
        return localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    }
};

// ============================================================
// AUTO-REDIRECT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const isLoginPage = path.includes('index.html') || path === '/' || path.endsWith('/');
    
    if (!isLoginPage) {
        if (!Auth.isAuthenticated()) {
            window.location.href = 'index.html?reason=no_token';
        } else {
            const result = await Auth.checkAuth();
            if (!result || result.valid !== true) {
                const reason = result && result.reason ? result.reason : 'unauthorized';
                // Redirect to login with reason so the login page can show explanation
                window.location.href = `index.html?reason=${encodeURIComponent(reason)}`;
            }
        }
    }
});

console.log('✅ auth.js yuklandi');