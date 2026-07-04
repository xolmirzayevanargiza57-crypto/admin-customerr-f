// ============================================================
// API - BACKEND BILAN BOG'LANISH (TO'LIQ)
// ============================================================

const API = {
    baseURL: 'https://admin-customerr.onrender.com',
    
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
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error(`❌ ${response.status} ${url}`, data);
            }
            
            return data;
        } catch (error) {
            console.error('❌ API xatosi:', error);
            return { success: false, message: error.message };
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
    
    // ============================================================
    // AUTH
    // ============================================================
    async login(email, password) {
        return this.post('/api/auth/login', { email, password });
    },
    
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
    
    async updateLanguage(language) {
        return this.put('/api/auth/language', { language });
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
    // TEACHER LESSONS - O'QITUVCHI DARSLARI
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
    // STUDENT SUBJECTS - O'QUVCHI FANLARI
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
    }
};

console.log('✅ api.js yuklandi');
console.log('📡 API baseURL:', API.baseURL);