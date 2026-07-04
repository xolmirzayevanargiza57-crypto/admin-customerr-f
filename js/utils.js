// ============================================================
// UTILS - YORDAMCHI FUNKSIYALAR (TO'LIQ)
// ============================================================

const Utils = {
    // ============================================================
    // PULNI FORMATLASH
    // ============================================================
    formatMoney(amount, currency = 'UZS') {
        if (amount === undefined || amount === null) return '0 ' + this.getCurrencySymbol(currency);
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return '0 ' + this.getCurrencySymbol(currency);
        
        const formatter = new Intl.NumberFormat('uz-UZ', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(num) + ' ' + this.getCurrencySymbol(currency);
    },
    
    // ============================================================
    // VALYUTA SIMVOLINI OLISH
    // ============================================================
    getCurrencySymbol(currency) {
        const symbols = {
            'UZS': 'so\'m',
            'USD': '$',
            'EUR': '€',
            'RUB': '₽',
            'GBP': '£',
            'CNY': '¥',
            'JPY': '¥',
            'KRW': '₩',
            'TRY': '₺',
            'INR': '₹'
        };
        return symbols[currency] || currency;
    },
    
    // ============================================================
    // VALYUTA RO'YXATI
    // ============================================================
    getCurrencies() {
        return [
            { code: 'UZS', name: 'O\'zbek so\'mi', symbol: 'so\'m' },
            { code: 'USD', name: 'AQSH dollari', symbol: '$' },
            { code: 'EUR', name: 'Yevro', symbol: '€' },
            { code: 'RUB', name: 'Rossiya rubli', symbol: '₽' },
            { code: 'GBP', name: 'Britaniya funti', symbol: '£' },
            { code: 'CNY', name: 'Xitoy yuani', symbol: '¥' },
            { code: 'JPY', name: 'Yapon iyenasi', symbol: '¥' },
            { code: 'KRW', name: 'Koreya voni', symbol: '₩' },
            { code: 'TRY', name: 'Turk lirasi', symbol: '₺' },
            { code: 'INR', name: 'Hind rupiyasi', symbol: '₹' }
        ];
    },
    
    // ============================================================
    // PULNI PARSLASH
    // ============================================================
    parseMoney(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const cleaned = value.replace(/[^0-9]/g, '');
            return parseInt(cleaned) || 0;
        }
        return 0;
    },
    
    // ============================================================
    // SANANI FORMATLASH
    // ============================================================
    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('uz', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // ============================================================
    // VAQTNI FORMATLASH
    // ============================================================
    formatTime(time) {
        if (!time) return '-';
        return time;
    },
    
    // ============================================================
    // YOSH HISOBI
    // ============================================================
    calculateAge(birthDate) {
        if (!birthDate) return '-';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },
    
    // ============================================================
    // HOLATNI FORMATLASH
    // ============================================================
    formatStatus(status) {
        const map = {
            'active': '✅ Faol',
            'inactive': '⛔ Faol emas',
            'blocked': '🚫 Bloklangan',
            'present': '✅ Keldi',
            'absent': '❌ Kelmadi',
            'absent_reason': '⚠️ Sababli',
            'paid': '✅ To\'langan',
            'pending': '⏳ Kutilmoqda',
            'unpaid': '❌ To\'lanmagan'
        };
        return map[status] || status;
    },
    
    // ============================================================
    // HOLAT KLASSI
    // ============================================================
    getStatusClass(status) {
        const map = {
            'active': 'active',
            'inactive': 'inactive',
            'blocked': 'blocked',
            'present': 'present',
            'absent': 'absent',
            'absent_reason': 'absent-reason',
            'paid': 'paid',
            'pending': 'pending',
            'unpaid': 'unpaid'
        };
        return map[status] || 'inactive';
    },
    
    // ============================================================
    // KUNLAR RO'YXATI
    // ============================================================
    getDays() {
        return ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
    },
    
    // ============================================================
    // KUN QISQARTMASI
    // ============================================================
    getShortDays() {
        return ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
    }
};

console.log('✅ utils.js yuklandi');