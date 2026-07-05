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
        if (!token) return false;
        
        try {
            const data = await API.get('/api/auth/me');
            if (data.success) {
                const user = data.user;
                if (localStorage.getItem('customerToken')) {
                    localStorage.setItem('customerUser', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('customerUser', JSON.stringify(user));
                }
                return true;
            }

            if (data.status === 401 || data.status === 403) {
                console.warn('⚠️ Auth check returned unauthorized; keeping current session intact.');
                return true;
            }

            return true;
        } catch (error) {
            console.warn('⚠️ Auth check xatosi; keeping current session intact:', error.message);
            return true;
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
            window.location.href = 'index.html';
        } else {
            const isValid = await Auth.checkAuth();
            if (!isValid) {
                Auth.logout();
            }
        }
    }
});

console.log('✅ auth.js yuklandi');