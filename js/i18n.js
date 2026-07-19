// ============================================================
// I18N - TIL (UZ, RU, EN) - TO'LIQ TUZATILGAN
// ============================================================

const I18N = {
    currentLanguage: localStorage.getItem('admin-language') || 'uz',
    _cache: {},
    _isUpdating: false,
    
    languages: {
        uz: {
            name: "O'zbek",
            flag: "🇺🇿",
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
                total_teachers: "Jami O'qituvchilar",
                total_students: "Jami O'quvchilar",
                total_xp: "Jami XP",
                today_attendance: "Bugungi davomat",
                present: "Keldi",
                absent: "Kelmadi",
                absent_reason: "Sababli",
                status: "Holati",
                type: "Turi",
                end_date: "Tugash vaqti",
                days_left: "Qolgan kun",
                active: "Faol",
                inactive: "Faol emas",
                expired: "Muddati tugagan",
                monthly: "Oylik",
                sixmonths: "6 oylik",
                yearly: "Yillik",
                none: "Yo'q",
                school_name: "O'quv markazi nomi",
                add_teacher: "Yangi qo'shish",
                edit: "Tahrirlash",
                delete: "O'chirish",
                save: "Saqlash",
                cancel: "Bekor qilish",
                actions: "Amallar",
                search: "Qidirish...",
                no_data: "Ma'lumot yo'q",
                full_name: "To'liq ism",
                phone: "Telefon",
                view: "Ko'rish",
                teacher_profile: "O'qituvchi profili",
                add_student: "Yangi qo'shish",
                student_profile: "O'quvchi profili",
                select_teacher: "O'qituvchi tanlang",
                add_payment: "Yangi qo'shish",
                payment_amount: "Summa",
                payment_month: "Oy",
                payment_status: "Holati",
                paid: "To'langan",
                pending: "Kutilmoqda",
                unpaid: "To'lanmagan",
                student_fee: "O'quvchi to'lovi",
                teacher_salary: "O'qituvchi maoshi",
                blocked: "Bloklangan",
                add_subject: "Yangi qo'shish",
                subject_name: "Fan nomi",
                price: "Narxi",
                teacher: "O'qituvchi",
                back: "Orqaga",
                reports_title: "Hisobotlar",
                total: "Jami",
                average: "O'rtacha",
                settings_title: "Sozlamalar",
                appearance: "Tashqi ko'rinish",
                light: "Yorug'",
                dark: "Qorong'u",
                auto: "Avto",
                language: "Til",
                danger_zone: "Xavfli hudud",
                delete_account_warning: "Hisobingizni o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi!",
                delete_account: "Hisobni o'chirish"
            }
        },
        ru: {
            name: "Русский",
            flag: "🇷🇺",
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
                total_teachers: "Всего учителей",
                total_students: "Всего учеников",
                total_xp: "Всего XP",
                today_attendance: "Посещаемость сегодня",
                present: "Пришел",
                absent: "Не пришел",
                absent_reason: "По причине",
                status: "Статус",
                type: "Тип",
                end_date: "Дата окончания",
                days_left: "Осталось дней",
                active: "Активный",
                inactive: "Неактивный",
                expired: "Истек",
                monthly: "Ежемесячный",
                sixmonths: "6 месяцев",
                yearly: "Годовой",
                none: "Нет",
                school_name: "Название учебного центра",
                add_teacher: "Добавить",
                edit: "Редактировать",
                delete: "Удалить",
                save: "Сохранить",
                cancel: "Отмена",
                actions: "Действия",
                search: "Поиск...",
                no_data: "Нет данных",
                full_name: "Полное имя",
                phone: "Телефон",
                view: "Просмотр",
                teacher_profile: "Профиль учителя",
                add_student: "Добавить",
                student_profile: "Профиль ученика",
                select_teacher: "Выберите учителя",
                add_payment: "Добавить",
                payment_amount: "Сумма",
                payment_month: "Месяц",
                payment_status: "Статус",
                paid: "Оплачен",
                pending: "В ожидании",
                unpaid: "Не оплачен",
                student_fee: "Плата ученика",
                teacher_salary: "Зарплата учителя",
                blocked: "Заблокирован",
                add_subject: "Добавить",
                subject_name: "Название предмета",
                price: "Цена",
                teacher: "Учитель",
                back: "Назад",
                reports_title: "Отчеты",
                total: "Всего",
                average: "Среднее",
                settings_title: "Настройки",
                appearance: "Внешний вид",
                light: "Светлая",
                dark: "Темная",
                auto: "Авто",
                language: "Язык",
                danger_zone: "Опасная зона",
                delete_account_warning: "Вы уверены, что хотите удалить аккаунт? Это действие необратимо!",
                delete_account: "Удалить аккаунт"
            }
        },
        en: {
            name: "English",
            flag: "🇬🇧",
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
                total_teachers: "Total Teachers",
                total_students: "Total Students",
                total_xp: "Total XP",
                today_attendance: "Today's Attendance",
                present: "Present",
                absent: "Absent",
                absent_reason: "Absent with reason",
                status: "Status",
                type: "Type",
                end_date: "End Date",
                days_left: "Days Left",
                active: "Active",
                inactive: "Inactive",
                expired: "Expired",
                monthly: "Monthly",
                sixmonths: "6 Months",
                yearly: "Yearly",
                none: "None",
                school_name: "School Name",
                add_teacher: "Add",
                edit: "Edit",
                delete: "Delete",
                save: "Save",
                cancel: "Cancel",
                actions: "Actions",
                search: "Search...",
                no_data: "No data",
                full_name: "Full Name",
                phone: "Phone",
                view: "View",
                teacher_profile: "Teacher Profile",
                add_student: "Add",
                student_profile: "Student Profile",
                select_teacher: "Select Teacher",
                add_payment: "Add",
                payment_amount: "Amount",
                payment_month: "Month",
                payment_status: "Status",
                paid: "Paid",
                pending: "Pending",
                unpaid: "Unpaid",
                student_fee: "Student Fee",
                teacher_salary: "Teacher Salary",
                blocked: "Blocked",
                add_subject: "Add",
                subject_name: "Subject Name",
                price: "Price",
                teacher: "Teacher",
                back: "Back",
                reports_title: "Reports",
                total: "Total",
                average: "Average",
                settings_title: "Settings",
                appearance: "Appearance",
                light: "Light",
                dark: "Dark",
                auto: "Auto",
                language: "Language",
                danger_zone: "Danger Zone",
                delete_account_warning: "Are you sure you want to delete your account? This action cannot be undone!",
                delete_account: "Delete Account"
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
            document.querySelectorAll('.lang-option').forEach(el => {
                el.classList.toggle('active', el.dataset.lang === this.currentLanguage);
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

    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        Object.keys(this.languages).forEach(lang => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `lang-option ${lang === this.currentLanguage ? 'active' : ''}`;
            btn.dataset.lang = lang;
            btn.innerHTML = `${this.languages[lang].flag} ${this.languages[lang].name}`;
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

document.addEventListener('DOMContentLoaded', async () => {
    await I18N.loadLanguageFromServer();
    I18N.updateUI();
});

console.log('✅ i18n.js yuklandi');
