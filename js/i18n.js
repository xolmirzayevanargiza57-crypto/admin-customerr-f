// ============================================================
// I18N - TIL (UZ, RU, EN) - BAYROQLAR BILAN
// ============================================================

const I18N = {
    currentLanguage: localStorage.getItem('admin-language') || 'uz',
    _cache: {},
    _isUpdating: false,
    
    languages: {
        uz: {
            name: "O'zbek",
            flag: "🇺🇿",  // ⭐ Unicode flag
            flagSvg: '<svg width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" fill="#1eb53a"/><rect y="4" width="24" height="4" fill="#0099b5"/><rect y="12" width="24" height="4" fill="#1eb53a"/><circle cx="8" cy="8" r="3" fill="#ffffff"/><circle cx="8" cy="8" r="2" fill="#0099b5"/></svg>',
            translations: {
                login: "Tizimga kiring",
                email: "Email",
                password: "Parol",
                login_btn: "Kirish",
                email_placeholder: "customer@example.com",
                password_placeholder: "••••••••",
                copyright: "© 2026 Admin Customer",
                version: "v1.0",
                loading: "Yuklanmoqda...",
                success: "Muvaffaqiyatli!",
                error: "Xatolik yuz berdi!",
                network_error: "Tarmoq xatosi! Qayta urinib ko'ring.",
                all_fields_required: "Barcha maydonlarni to'ldiring!",
                dashboard: "Dashboard",
                teachers: "O'qituvchilar",
                students: "O'quvchilar",
                payments: "To'lovlar",
                reports: "Hisobotlar",
                subjects: "Fanlar",
                settings: "Sozlamalar",
                logout: "Chiqish",
                all: "Barchasi",
                attendance: "Davomat",
                profile: "Profil",
                staff: "Xodimlar",
                notifications: "Bildirishnomalar"
            }
        },
        ru: {
            name: "Русский",
            flag: "🇷🇺",
            flagSvg: '<svg width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" fill="#ffffff"/><rect y="5.33" width="24" height="5.34" fill="#0039a6"/><rect y="10.67" width="24" height="5.33" fill="#d52b1e"/></svg>',
            translations: {
                login: "Войти в систему",
                email: "Электронная почта",
                password: "Пароль",
                login_btn: "Войти",
                email_placeholder: "customer@example.com",
                password_placeholder: "••••••••",
                copyright: "© 2026 Admin Customer",
                version: "v1.0",
                loading: "Загрузка...",
                success: "Успешно!",
                error: "Произошла ошибка!",
                network_error: "Ошибка сети! Попробуйте снова.",
                all_fields_required: "Заполните все поля!",
                dashboard: "Панель управления",
                teachers: "Учителя",
                students: "Ученики",
                payments: "Платежи",
                reports: "Отчеты",
                subjects: "Предметы",
                settings: "Настройки",
                logout: "Выйти",
                all: "Все",
                attendance: "Посещаемость",
                profile: "Профиль",
                staff: "Сотрудники",
                notifications: "Уведомления"
            }
        },
        en: {
            name: "English",
            flag: "🇬🇧",
            flagSvg: '<svg width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" fill="#012169"/><path d="M0 0l24 16M24 0L0 16" stroke="#ffffff" stroke-width="3.2"/><path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" stroke-width="1.6"/><path d="M12 0v16M0 8h24" stroke="#ffffff" stroke-width="3.2"/><path d="M12 0v16M0 8h24" stroke="#c8102e" stroke-width="1.6"/></svg>',
            translations: {
                login: "Login to system",
                email: "Email",
                password: "Password",
                login_btn: "Login",
                email_placeholder: "customer@example.com",
                password_placeholder: "••••••••",
                copyright: "© 2026 Admin Customer",
                version: "v1.0",
                loading: "Loading...",
                success: "Success!",
                error: "An error occurred!",
                network_error: "Network error! Please try again.",
                all_fields_required: "Please fill in all fields!",
                dashboard: "Dashboard",
                teachers: "Teachers",
                students: "Students",
                payments: "Payments",
                reports: "Reports",
                subjects: "Subjects",
                settings: "Settings",
                logout: "Logout",
                all: "All",
                attendance: "Attendance",
                profile: "Profile",
                staff: "Staff",
                notifications: "Notifications"
            }
        }
    },

    getLanguage() { return this.currentLanguage; },

    t(key) {
        if (this._cache[key]) {
            return this._cache[key];
        }
        const translations = this.languages[this.currentLanguage]?.translations || this.languages.uz.translations;
        const result = translations[key] || key;
        this._cache[key] = result;
        return result;
    },

    setLanguage(lang) {
        if (!this.languages[lang] || this._isUpdating) return;
        if (lang === this.currentLanguage) return;
        this._isUpdating = true;
        this.currentLanguage = lang;
        localStorage.setItem('admin-language', lang);
        this._cache = {};
        this.updateUI();
        document.dispatchEvent(new CustomEvent('i18n:language-changed', { detail: { language: lang } }));
        this.saveLanguageToServer(lang);
        setTimeout(() => { this._isUpdating = false; }, 100);
    },

    updateUI() {
        requestAnimationFrame(() => {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                const translation = this.t(key);
                if (translation && el.textContent !== translation) {
                    el.textContent = translation;
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.dataset.i18nPlaceholder;
                const translation = this.t(key);
                if (translation) {
                    el.placeholder = translation;
                }
            });
            document.querySelectorAll('select option').forEach(option => {
                const key = option.dataset.i18n || option.value;
                const translation = this.t(key);
                if (translation !== key && option.textContent.trim() !== translation) {
                    option.textContent = translation;
                }
            });
            
            // ⭐ BAYROQLARNI YANGILASH
            document.querySelectorAll('.lang-option').forEach(el => {
                const lang = el.dataset.lang;
                const langData = this.languages[lang];
                if (langData) {
                    // ⭐ SVG bayroqni ko'rsatish
                    const flagContainer = el.querySelector('.flag-container');
                    if (flagContainer) {
                        flagContainer.innerHTML = langData.flagSvg || langData.flag;
                    }
                    const nameSpan = el.querySelector('.lang-name');
                    if (nameSpan) {
                        nameSpan.textContent = langData.name;
                    }
                }
                el.classList.toggle('active', lang === this.currentLanguage);
            });
            
            document.documentElement.lang = this.currentLanguage;
        });
    },

    async saveLanguageToServer(lang) {
        try {
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;
            await API.updateLanguage(lang);
        } catch (error) {
            console.error('❌ Til serverga saqlashda xatolik:', error);
        }
    },

    async loadLanguageFromServer() {
        try {
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;
            const data = await API.getProfile();
            if (data.success && data.user?.language) {
                const lang = data.user.language;
                if (lang !== this.currentLanguage) {
                    this.currentLanguage = lang;
                    localStorage.setItem('admin-language', lang);
                    this._cache = {};
                    this.updateUI();
                    document.dispatchEvent(new CustomEvent('i18n:language-changed', { detail: { language: lang } }));
                }
            }
        } catch (error) {
            console.error('❌ Til serverdan yuklashda xatolik:', error);
        }
    },

    // ⭐ CHIROYLI BAYROQLAR BILAN SELECTOR YARATISH
    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        
        Object.keys(this.languages).forEach(lang => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `lang-option ${lang === this.currentLanguage ? 'active' : ''}`;
            btn.dataset.lang = lang;
            
            const langData = this.languages[lang];
            
            btn.innerHTML = `
                <span class="flag-container">${langData.flagSvg || langData.flag}</span>
                <span class="lang-name">${langData.name}</span>
            `;
            
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.setLanguage(lang);
            });
            
            container.appendChild(btn);
        });
        
        return container;
    }
};

// ⭐ BAYROQ STILLARI
const style = document.createElement('style');
style.textContent = `
    .language-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding: 4px 0;
    }
    
    .lang-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 2px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    
    .lang-option .flag-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 20px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    }
    
    .lang-option .flag-container svg {
        width: 100%;
        height: 100%;
        display: block;
    }
    
    .lang-option .flag-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .lang-option .lang-name {
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .lang-option:hover {
        border-color: var(--text-muted);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .lang-option.active {
        border-color: var(--text-primary);
        background: var(--bg-active);
        font-weight: 600;
    }
    
    [data-theme="dark"] .lang-option.active {
        background: var(--bg-active);
        border-color: var(--text-primary);
    }
    
    [data-theme="dark"] .lang-option:hover {
        box-shadow: 0 4px 12px rgba(255,255,255,0.05);
    }
    
    @media (max-width: 480px) {
        .lang-option {
            padding: 6px 12px;
            font-size: 0.75rem;
        }
        
        .lang-option .flag-container {
            width: 24px;
            height: 16px;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', async () => {
    await I18N.loadLanguageFromServer();
    I18N.updateUI();
});

console.log('✅ i18n.js yuklandi (Bayroqlar bilan)');
