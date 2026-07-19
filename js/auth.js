// ============================================================
// AUTH - ADMIN CUSTOMER (TO'LIQ TUZATILGAN)
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
            
            // ⭐ BLOKLANGAN YOKI OBUNA TUGAGAN USER
            if (data.action === 'contact_support') {
                const phone = data.phone || '+998 94 022 44 92';
                const message = data.message || 'Iltimos, yordam uchun raqamga qo\'ng\'iroq qiling.';
                
                // Telefon raqamiga qo'ng'iroq qilish uchun havola
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
        sessionStorage.removeItem('customerToken');
        sessionStorage.removeItem('customerUser');

        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        const target = `${basePath}index.html`;
        window.location.replace(target);
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
            return;
        }
    }
});

console.log('✅ auth.js yuklandi');
