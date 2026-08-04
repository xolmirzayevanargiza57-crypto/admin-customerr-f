// ============================================================
// API - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
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
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    
    async request(endpoint, options = {}) {
        try {
            const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${normalizedEndpoint}`;
            console.log(`📡 ${options.method || 'GET'} ${url}`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            const response = await fetch(url, {
                ...options,
                mode: 'cors',
                credentials: 'include',
                signal: controller.signal,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers
                }
            });

            clearTimeout(timeoutId);

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
            if (error.name === 'AbortError') {
                console.error('⏱️ API timeout:', endpoint);
                return {
                    success: false,
                    message: 'Server javob bermadi. Iltimos, qayta urinib ko\'ring.',
                    status: 408,
                    timeout: true
                };
            }
            console.error('❌ API xatosi:', error);
            return {
                success: false,
                message: error?.message || 'Tarmoq xatosi!',
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
    // AUTH / PROFILE
    // ============================================================
    
    async getProfile() {
        return this.get('/api/auth/me');
    },
    
    async updateProfile(data) {
        return this.put('/api/auth/profile', data);
    },
    
    async changePassword(data) {
        return this.post('/api/auth/change-password', data);
    },
    
    async updateTheme(theme) {
        return this.put('/api/auth/theme', { theme });
    },
    
    async updateLanguage(lang) {
        return this.put('/api/auth/language', { language: lang });
    },
    
    async getSubscriptionStatus() {
        return this.get('/api/auth/subscription-status');
    },
    
    // ============================================================
    // DASHBOARD
    // ============================================================
    
    async getDashboardStats() {
        return this.get('/api/dashboard/stats');
    },
    
    // ============================================================
    // TEACHERS
    // ============================================================
    
    async getTeachers(params = {}) {
        return this.get('/api/teachers', params);
    },
    
    async getTeacher(id) {
        return this.get(`/api/teachers/${id}`);
    },
    
    async createTeacher(data) {
        return this.post('/api/teachers', data);
    },
    
    async updateTeacher(id, data) {
        return this.put(`/api/teachers/${id}`, data);
    },
    
    async deleteTeacher(id) {
        return this.delete(`/api/teachers/${id}`);
    },
    
    // ============================================================
    // TEACHER LESSONS
    // ============================================================
    
    async getTeacherLessons(params = {}) {
        return this.get('/api/teacherlessons', params);
    },
    
    async createTeacherLesson(data) {
        return this.post('/api/teacherlessons', data);
    },
    
    async updateTeacherLesson(id, data) {
        return this.put(`/api/teacherlessons/${id}`, data);
    },
    
    async deleteTeacherLesson(id) {
        return this.delete(`/api/teacherlessons/${id}`);
    },
    
    // ============================================================
    // STUDENTS
    // ============================================================
    
    async getStudents(params = {}) {
        return this.get('/api/students', params);
    },
    
    async getStudent(id) {
        return this.get(`/api/students/${id}`);
    },
    
    async createStudent(data) {
        return this.post('/api/students', data);
    },
    
    async updateStudent(id, data) {
        return this.put(`/api/students/${id}`, data);
    },
    
    async deleteStudent(id) {
        return this.delete(`/api/students/${id}`);
    },
    
    // ============================================================
    // STUDENT SUBJECTS
    // ============================================================
    
    async getStudentSubjects(params = {}) {
        return this.get('/api/studentsubjects', params);
    },
    
    async createStudentSubject(data) {
        return this.post('/api/studentsubjects', data);
    },
    
    async deleteStudentSubject(id) {
        return this.delete(`/api/studentsubjects/${id}`);
    },
    
    // ============================================================
    // SUBJECTS
    // ============================================================
    
    async getSubjects() {
        return this.get('/api/subjects');
    },
    
    async createSubject(data) {
        return this.post('/api/subjects', data);
    },
    
    async updateSubject(id, data) {
        return this.put(`/api/subjects/${id}`, data);
    },
    
    async deleteSubject(id) {
        return this.delete(`/api/subjects/${id}`);
    },
    
    // ============================================================
    // ATTENDANCES
    // ============================================================
    
    async getAttendances(params = {}) {
        return this.get('/api/attendances', params);
    },
    
    async createAttendance(data) {
        return this.post('/api/attendances', data);
    },
    
    // ============================================================
    // PAYMENTS
    // ============================================================
    
    async getPayments(params = {}) {
        return this.get('/api/payments', params);
    },
    
    async createPayment(data) {
        return this.post('/api/payments', data);
    },
    
    async updatePayment(id, data) {
        return this.put(`/api/payments/${id}`, data);
    },
    
    async deletePayment(id) {
        return this.delete(`/api/payments/${id}`);
    },

    // ============================================================
    // NOTIFICATIONS (TUZATILGAN)
    // ============================================================
    
    async getNotifications(params = {}) {
        try {
            const result = await this.get('/api/notifications', params);
            if (!result.success && result.status === 0) {
                console.warn('⚠️ Server javob bermadi, local xabarlar ko\'rsatiladi');
                return {
                    success: true,
                    data: [],
                    message: 'Server bilan bog\'lanib bo\'lmadi, mahalliy xabarlar ko\'rsatilmoqda'
                };
            }
            return result;
        } catch (error) {
            console.error('❌ Notifications error:', error);
            return {
                success: true,
                data: [],
                message: 'Xabarlar yuklanmadi, mahalliy rejim'
            };
        }
    },

    async createNotification(data = {}) {
        return this.post('/api/notifications', data);
    },

    async markNotificationRead(id) {
        return this.post(`/api/notifications/${id}/read`);
    },

    async markAllNotificationsRead() {
        return this.post('/api/notifications/mark-all-read');
    }
};

console.log('✅ api.js yuklandi (Admin-Customer)');
console.log('📡 API baseURL:', API.baseURL);
