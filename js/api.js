// ============================================================
// API - ADMIN CUSTOMER (TO'LIQ)
// ============================================================

function getApiBaseURL() {
    if (typeof window === 'undefined') {
        return 'https://admin-customerr.onrender.com';
    }

    const override = window.__API_BASE_URL__ || window.API_BASE_URL || window.__ENV__?.API_BASE_URL || document.querySelector('meta[name="api-base-url"]')?.getAttribute('content');
    if (override && typeof override === 'string' && override.trim()) {
        return override.trim().replace(/\/$/, '');
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:5001';
    }

    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        return window.location.origin.replace(/\/$/, '');
    }

    return 'https://admin-customerr.onrender.com';
}

const API = {
    baseURL: getApiBaseURL(),
    
    getToken() {
        return localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
    },
    
    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    
    async request(endpoint, options = {}) {
        try {
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${normalizedEndpoint}`;
            console.log(`📡 ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            const contentType = response.headers.get('content-type') || '';
            let data;

            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    data = {
                        success: false,
                        message: `Server JSON emas javob qaytardi: ${response.status}`,
                        status: response.status,
                        rawText: text
                    };
                }
            }
            
            if (!response.ok) {
                console.error(`❌ ${response.status} ${url}`, data);
                return {
                    ...data,
                    success: false,
                    status: response.status,
                    message: data?.message || data?.error || `Request failed with status ${response.status}`
                };
            }
            
            return data;
        } catch (error) {
            console.error('❌ API xatosi:', error);
            return {
                success: false,
                message: error?.message || 'Network request failed',
                status: 0,
                error
            };
        }
    },
    
    async get(endpoint, params = {}) {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const query = new URLSearchParams(params).toString();
        const url = query ? `${normalizedEndpoint}?${query}` : normalizedEndpoint;
        return this.request(url, { method: 'GET' });
    },
    
    async post(endpoint, data = {}) {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return this.request(normalizedEndpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async put(endpoint, data = {}) {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return this.request(normalizedEndpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(endpoint) {
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return this.request(normalizedEndpoint, {
            method: 'DELETE'
        });
    },
    
    // ============================================================
    // ⭐ AUTH / PROFILE
    // ============================================================
    
    // Profil ma'lumotlarini olish
    async getProfile() {
        return this.get('/api/auth/me');
    },
    
    // Profilni yangilash
    async updateProfile(data) {
        return this.put('/api/auth/profile', data);
    },
    
    // Parolni o'zgartirish
    async changePassword(data) {
        return this.post('/api/auth/change-password', data);
    },
    
    // Theme ni yangilash
    async updateTheme(theme) {
        return this.put('/api/auth/theme', { theme });
    },
    
    // Tilni yangilash
    async updateLanguage(lang) {
        return this.put('/api/auth/language', { language: lang });
    },
    
    // Obuna holatini olish
    async getSubscriptionStatus() {
        return this.get('/api/auth/subscription-status');
    },
    
    // ============================================================
    // ⭐ DASHBOARD
    // ============================================================
    
    // Dashboard statistikasini olish
    async getDashboardStats() {
        return this.get('/api/dashboard/stats');
    },
    
    // ============================================================
    // ⭐ TEACHERS (O'QITUVCHILAR)
    // ============================================================
    
    // Barcha o'qituvchilarni olish
    async getTeachers(params = {}) {
        return this.get('/api/teachers', params);
    },
    
    // Bitta o'qituvchini olish
    async getTeacher(id) {
        return this.get(`/api/teachers/${id}`);
    },
    
    // O'qituvchi yaratish
    async createTeacher(data) {
        return this.post('/api/teachers', data);
    },
    
    // O'qituvchini yangilash
    async updateTeacher(id, data) {
        return this.put(`/api/teachers/${id}`, data);
    },
    
    // O'qituvchini o'chirish
    async deleteTeacher(id) {
        return this.delete(`/api/teachers/${id}`);
    },
    
    // ============================================================
    // ⭐ TEACHER LESSONS (O'QITUVCHI DARSLARI)
    // ============================================================
    
    // O'qituvchi darslarini olish
    async getTeacherLessons(params = {}) {
        return this.get('/api/teacherlessons', params);
    },
    
    // Dars qo'shish
    async createTeacherLesson(data) {
        return this.post('/api/teacherlessons', data);
    },
    
    // Darsni yangilash
    async updateTeacherLesson(id, data) {
        return this.put(`/api/teacherlessons/${id}`, data);
    },
    
    // Darsni o'chirish
    async deleteTeacherLesson(id) {
        return this.delete(`/api/teacherlessons/${id}`);
    },
    
    // ============================================================
    // ⭐ STUDENTS (O'QUVCHILAR)
    // ============================================================
    
    // Barcha o'quvchilarni olish
    async getStudents(params = {}) {
        return this.get('/api/students', params);
    },
    
    // Bitta o'quvchini olish
    async getStudent(id) {
        return this.get(`/api/students/${id}`);
    },
    
    // O'quvchi yaratish
    async createStudent(data) {
        return this.post('/api/students', data);
    },
    
    // O'quvchini yangilash
    async updateStudent(id, data) {
        return this.put(`/api/students/${id}`, data);
    },
    
    // O'quvchini o'chirish
    async deleteStudent(id) {
        return this.delete(`/api/students/${id}`);
    },
    
    // ============================================================
    // ⭐ STUDENT SUBJECTS (O'QUVCHI FANLARI)
    // ============================================================
    
    // O'quvchi fanlarini olish
    async getStudentSubjects(params = {}) {
        return this.get('/api/studentsubjects', params);
    },
    
    // O'quvchiga fan qo'shish
    async createStudentSubject(data) {
        return this.post('/api/studentsubjects', data);
    },
    
    // O'quvchidan fanni o'chirish
    async deleteStudentSubject(id) {
        return this.delete(`/api/studentsubjects/${id}`);
    },
    
    // ============================================================
    // ⭐ SUBJECTS (FANLAR)
    // ============================================================
    
    // Barcha fanlarni olish
    async getSubjects() {
        return this.get('/api/subjects');
    },
    
    // Fan yaratish
    async createSubject(data) {
        return this.post('/api/subjects', data);
    },
    
    // Fanni yangilash
    async updateSubject(id, data) {
        return this.put(`/api/subjects/${id}`, data);
    },
    
    // Fanni o'chirish
    async deleteSubject(id) {
        return this.delete(`/api/subjects/${id}`);
    },
    
    // ============================================================
    // ⭐ ATTENDANCES (DAVOMAT)
    // ============================================================
    
    // Davomatlarni olish
    async getAttendances(params = {}) {
        return this.get('/api/attendances', params);
    },
    
    // Davomat qo'shish/yangilash
    async createAttendance(data) {
        return this.post('/api/attendances', data);
    },
    
    // ============================================================
    // ⭐ PAYMENTS (TO'LOVLAR)
    // ============================================================
    
    // Barcha to'lovlarni olish
    async getPayments(params = {}) {
        return this.get('/api/payments', params);
    },
    
    // To'lov yaratish
    async createPayment(data) {
        return this.post('/api/payments', data);
    },
    
    // To'lovni yangilash
    async updatePayment(id, data) {
        return this.put(`/api/payments/${id}`, data);
    },
    
    // To'lovni o'chirish
    async deletePayment(id) {
        return this.delete(`/api/payments/${id}`);
    },

    // ============================================================
    // ⭐ NOTIFICATIONS (XABARLAR) — ADMIN CUSTOMER
    // ============================================================
    
    // Barcha xabarlarni olish (faqat o'ziga kelganlar)
    async getNotifications(params = {}) {
        return this.get('/api/notifications', params);
    },

    // Xabar yuborish (faqat Admin Main uchun, lekin API da bor)
    async createNotification(data = {}) {
        return this.post('/api/notifications', data);
    },

    // Xabarni o'qilgan deb belgilash
    async markNotificationRead(id) {
        return this.post(`/api/notifications/${id}/read`);
    },

    // Barcha xabarlarni o'qilgan deb belgilash
    async markAllNotificationsRead() {
        return this.post('/api/notifications/mark-all-read');
    }
};

console.log('✅ api.js yuklandi (Admin Customer)');
console.log('📡 API baseURL:', API.baseURL);
