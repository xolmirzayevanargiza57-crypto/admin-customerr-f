// ============================================================
// API - BACKEND BILAN BOG'LANISH (Admin-Customer)
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
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
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
        const query = new URLSearchParams(params).toString();
        const url = query ? `${endpoint}?${query}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    },

    // ⭐ PROFILE - theme.js va i18n.js uchun (MUHIM - BU YO'Q EDI)
    async getProfile() {
        return this.get('/api/auth/me');
    },

    // ⭐ THEME - serverga saqlash (MUHIM - BU YO'Q EDI)
    async updateTheme(theme) {
        return this.put('/api/auth/theme', { theme });
    },

    // ⭐ LANGUAGE - serverga saqlash (MUHIM - BU YO'Q EDI)
    async updateLanguage(language) {
        return this.put('/api/auth/language', { language });
    },

    // ⭐ DASHBOARD STATS
    async getDashboardStats() {
        return this.get('/api/dashboard/stats');
    },

    // TEACHERS
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

    // STUDENTS
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

    // SUBJECTS
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

    // ATTENDANCES
    async getAttendances(params = {}) {
        return this.get('/api/attendances', params);
    },

    async createAttendance(data) {
        return this.post('/api/attendances', data);
    },

    // PAYMENTS
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

    // NOTIFICATIONS
    async createNotification(data = {}) {
        return this.post('/api/notifications', data);
    },

    async getNotifications(params = {}) {
        return this.get('/api/notifications', params);
    },

    // ⭐ NOTIFICATION O'CHIRISH (MUHIM - BU YO'Q EDI)
    async deleteNotification(id) {
        return this.delete(`/api/notifications/${id}`);
    }
};

console.log('✅ api.js yuklandi');
console.log('📡 API baseURL:', API.baseURL);
