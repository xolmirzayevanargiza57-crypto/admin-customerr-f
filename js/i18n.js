// ============================================================
// I18N - TIL (UZ, RU, EN) - TO'LIQ TARJIMALAR
// ============================================================

const I18N = {
    currentLanguage: localStorage.getItem('admin-language') || 'uz',
    _cache: {},
    _isUpdating: false,
    
    languages: {
        uz: {
            name: "O'zbek",
            flagSvg: `<svg width="24" height="16" viewBox="0 0 24 16">
                        <rect width="24" height="16" fill="#1eb53a"/>
                        <rect y="5.33" width="24" height="5.34" fill="#0099b5"/>
                        <rect y="10.67" width="24" height="5.33" fill="#1eb53a"/>
                        <circle cx="8" cy="8" r="3" fill="#ffffff"/>
                        <circle cx="8" cy="8" r="2" fill="#0099b5"/>
                        <circle cx="8" cy="5.5" r="0.6" fill="#ffffff"/>
                        <circle cx="5.5" cy="8" r="0.6" fill="#ffffff"/>
                        <circle cx="10.5" cy="8" r="0.6" fill="#ffffff"/>
                        <circle cx="8" cy="10.5" r="0.6" fill="#ffffff"/>
                    </svg>`,
            translations: {
                // ============ LOGIN ============
                login: "Tizimga kiring",
                email: "Email",
                password: "Parol",
                login_btn: "Kirish",
                email_placeholder: "customer@example.com",
                password_placeholder: "••••••••",
                copyright: "© 2026 Admin Customer",
                version: "v1.0",
                
                // ============ UMUMIY ============
                loading: "Yuklanmoqda...",
                success: "Muvaffaqiyatli!",
                error: "Xatolik yuz berdi!",
                network_error: "Tarmoq xatosi! Qayta urinib ko'ring.",
                all_fields_required: "Barcha maydonlarni to'ldiring!",
                save: "Saqlash",
                cancel: "Bekor qilish",
                back: "Orqaga",
                search: "Qidirish...",
                no_data: "Ma'lumot yo'q",
                actions: "Amallar",
                view: "Ko'rish",
                edit: "Tahrirlash",
                delete: "O'chirish",
                status: "Holati",
                active: "Faol",
                inactive: "Faol emas",
                blocked: "Bloklangan",
                frozen: "Muzlatilgan",
                total: "Jami",
                average: "O'rtacha",
                
                // ============ NAVIGATION ============
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
                notifications: "Bildirishnomalar",
                
                // ============ SETTINGS ============
                settings_title: "Sozlamalar",
                settings_subtitle: "Tizim sozlamalarini boshqaring",
                full_name: "To'liq ism",
                phone: "Telefon",
                school_name: "O'quv markazi nomi",
                appearance: "Tashqi ko'rinish",
                language: "Til",
                light: "Yorug'",
                dark: "Qorong'u",
                auto: "Avto",
                danger_zone: "Xavfli hudud",
                delete_account_warning: "Hisobingizni o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi!",
                delete_account: "Hisobni o'chirish",
                
                // ============ TEACHERS ============
                teacher_profile: "O'qituvchi profili",
                add_teacher: "Yangi qo'shish",
                teacher_subject: "Fani",
                students_count: "O'quvchilar",
                salary: "Oylik maosh",
                birth_date: "Tug'ilgan sana",
                age: "Yosh",
                monthly_payment: "Oylik to'lov",
                select_teacher: "O'qituvchi tanlang",
                
                // ============ STUDENTS ============
                student_profile: "O'quvchi profili",
                add_student: "Yangi qo'shish",
                student_teacher: "O'qituvchi",
                total_xp_label: "XP",
                group: "Guruh",
                
                // ============ PAYMENTS ============
                add_payment: "Yangi qo'shish",
                payment_amount: "Summa",
                payment_month: "Oy",
                payment_status: "Holati",
                paid: "To'langan",
                pending: "Kutilmoqda",
                unpaid: "To'lanmagan",
                student_fee: "O'quvchi to'lovi",
                teacher_salary: "O'qituvchi maoshi",
                
                // ============ ATTENDANCE ============
                present: "Keldi",
                absent: "Kelmadi",
                absent_reason: "Sababli",
                not_marked: "Belgilanmagan",
                reason_placeholder: "Sabab yozing...",
                teacher_marks_attendance: "Faqat o'qituvchi belgilaydi",
                
                // ============ SUBJECTS ============
                add_subject: "Yangi qo'shish",
                subject_name: "Fan nomi",
                price: "Narxi",
                teacher: "O'qituvchi",
                
                // ============ REPORTS ============
                reports_title: "Hisobotlar",
                teachers_report: "O'qituvchilar hisoboti",
                students_report: "O'quvchilar hisoboti",
                xp_report: "XP hisoboti",
                attendance_report: "Davomat hisoboti",
                reports_desc: "Barcha statistik ma'lumotlar",
                
                // ============ STAFF ============
                add_staff: "Yangi qo'shish",
                staff_profile: "Xodim profili",
                position: "Lavozimi",
                yearly_salary: "Yillik maosh",
                daily_salary: "Kunlik maosh",
                total_staff: "Jami Xodimlar",
                active_staff: "Faol Xodimlar",
                inactive_staff: "Faol emas",
                frozen_staff: "Muzlatilgan",
                
                // ============ DASHBOARD ============
                total_teachers: "Jami O'qituvchilar",
                total_students: "Jami O'quvchilar",
                total_xp: "Jami XP",
                today_attendance: "Bugungi davomat",
                days_left: "Qolgan kun",
                end_date: "Tugash vaqti",
                type: "Turi",
                expired: "Muddati tugagan",
                monthly: "Oylik",
                sixmonths: "6 oylik",
                yearly: "Yillik",
                none: "Yo'q",
                
                // ============ SUBSCRIPTION ============
                subscription_status: "Holati",
                subscription_type: "Turi",
                subscription_end: "Tugash vaqti",
                subscription_days: "Qolgan kun"
            }
        },
        ru: {
            name: "Русский",
            flagSvg: `<svg width="24" height="16" viewBox="0 0 24 16">
                        <rect width="24" height="16" fill="#ffffff"/>
                        <rect y="5.33" width="24" height="5.34" fill="#0039a6"/>
                        <rect y="10.67" width="24" height="5.33" fill="#d52b1e"/>
                    </svg>`,
            translations: {
                // ============ LOGIN ============
                login: "Войти в систему",
                email: "Электронная почта",
                password: "Пароль",
                login_btn: "Войти",
                email_placeholder: "customer@example.com",
                password_placeholder: "••••••••",
                copyright: "© 2026 Admin Customer",
                version: "v1.0",
                
                // ============ UMUMIY ============
                loading: "Загрузка...",
                success: "Успешно!",
                error: "Произошла ошибка!",
                network_error: "Ошибка сети! Попробуйте снова.",
                all_fields_required: "Заполните все поля!",
                save: "Сохранить",
                cancel: "Отмена",
                back: "Назад",
                search: "Поиск...",
                no_data: "Нет данных",
                actions: "Действия",
                view: "Просмотр",
                edit: "Редактировать",
                delete: "Удалить",
                status: "Статус",
                active: "Активный",
                inactive: "Неактивный",
                blocked: "Заблокирован",
                frozen: "Заморожен",
                total: "Всего",
                average: "Среднее",
                
                // ============ NAVIGATION ============
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
                notifications: "Уведомления",
                
                // ============ SETTINGS ============
                settings_title: "Настройки",
                settings_subtitle: "Управление настройками системы",
                full_name: "Полное имя",
                phone: "Телефон",
                school_name: "Название учебного центра",
                appearance: "Внешний вид",
                language: "Язык",
                light: "Светлая",
                dark: "Тёмная",
                auto: "Авто",
                danger_zone: "Опасная зона",
                delete_account_warning: "Вы уверены, что хотите удалить аккаунт? Это действие необратимо!",
                delete_account: "Удалить аккаунт",
                
                // ============ TEACHERS ============
                teacher_profile: "Профиль учителя",
                add_teacher: "Добавить",
                teacher_subject: "Предмет",
                students_count: "Ученики",
                salary: "Зарплата",
                birth_date: "Дата рождения",
                age: "Возраст",
                monthly_payment: "Ежемесячный платёж",
                select_teacher: "Выберите учителя",
                
                // ============ STUDENTS ============
                student_profile: "Профиль ученика",
                add_student: "Добавить",
                student_teacher: "Учитель",
                total_xp_label: "XP",
                group: "Группа",
                
                // ============ PAYMENTS ============
                add_payment: "Добавить",
                payment_amount: "Сумма",
                payment_month: "Месяц",
                payment_status: "Статус",
                paid: "Оплачен",
                pending: "В ожидании",
                unpaid: "Не оплачен",
                student_fee: "Плата ученика",
                teacher_salary: "Зарплата учителя",
                
                // ============ ATTENDANCE ============
                present: "Пришёл",
                absent: "Не пришёл",
                absent_reason: "По причине",
                not_marked: "Не отмечен",
                reason_placeholder: "Напишите причину...",
                teacher_marks_attendance: "Только учитель отмечает",
                
                // ============ SUBJECTS ============
                add_subject: "Добавить",
                subject_name: "Название предмета",
                price: "Цена",
                teacher: "Учитель",
                
                // ============ REPORTS ============
                reports_title: "Отчеты",
                teachers_report: "Отчет по учителям",
                students_report: "Отчет по ученикам",
                xp_report: "Отчет по XP",
                attendance_report: "Отчет по посещаемости",
                reports_desc: "Вся статистическая информация",
                
                // ============ STAFF ============
                add_staff: "Добавить",
                staff_profile: "Профиль сотрудника",
                position: "Должность",
                yearly_salary: "Годовая зарплата",
                daily_salary: "Дневная зарплата",
                total_staff: "Всего сотрудников",
                active_staff: "Активные сотрудники",
                inactive_staff: "Неактивные",
                frozen_staff: "Замороженные",
                
                // ============ DASHBOARD ============
                total_teachers: "Всего учителей",
                total_students: "Всего учеников",
                total_xp: "Всего XP",
                today_attendance: "Посещаемость сегодня",
                days_left: "Осталось дней",
                end_date: "Дата окончания",
                type: "Тип",
                expired: "Истек",
                monthly: "Ежемесячный",
                sixmonths: "6 месяцев",
                yearly: "Годовой",
                none: "Нет",
                
                // ============ SUBSCRIPTION ============
                subscription_status: "Статус",
                subscription_type: "Тип",
                subscription_end: "Дата окончания",
                subscription_days: "Осталось дней"
            }
        },
        en: {
            name: "English",
            flagSvg: `<svg width="24" height="16" viewBox="0 0 24 16">
                        <rect width="24" height="16" fill="#012169"/>
                        <path d="M0 0l24 16M24 0L0 16" stroke="#ffffff" stroke-width="3.2"/>
                        <path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" stroke-width="1.6"/>
                        <path d="M12 0v16M0 8h24" stroke="#ffffff" stroke-width="3.2"/>
                        <path d="M12 0v16M0 8h24" stroke="#c8102e" stroke-width="1.6"/>
                    </svg>`,
            translations: {
                // ============ LOGIN ============
                login: "Login to system",
                email: "Email",
                password: "Password",
                login_btn: "Login",
                email_placeholder: "customer@example.com",
                password_placeholder: "••••••••",
                copyright: "© 2026 Admin Customer",
                version: "v1.0",
                
                // ============ UMUMIY ============
                loading: "Loading...",
                success: "Success!",
                error: "An error occurred!",
                network_error: "Network error! Please try again.",
                all_fields_required: "Please fill in all fields!",
                save: "Save",
                cancel: "Cancel",
                back: "Back",
                search: "Search...",
                no_data: "No data",
                actions: "Actions",
                view: "View",
                edit: "Edit",
                delete: "Delete",
                status: "Status",
                active: "Active",
                inactive: "Inactive",
                blocked: "Blocked",
                frozen: "Frozen",
                total: "Total",
                average: "Average",
                
                // ============ NAVIGATION ============
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
                notifications: "Notifications",
                
                // ============ SETTINGS ============
                settings_title: "Settings",
                settings_subtitle: "Manage system settings",
                full_name: "Full name",
                phone: "Phone",
                school_name: "School name",
                appearance: "Appearance",
                language: "Language",
                light: "Light",
                dark: "Dark",
                auto: "Auto",
                danger_zone: "Danger zone",
                delete_account_warning: "Are you sure you want to delete your account? This action cannot be undone!",
                delete_account: "Delete account",
                
                // ============ TEACHERS ============
                teacher_profile: "Teacher Profile",
                add_teacher: "Add",
                teacher_subject: "Subject",
                students_count: "Students",
                salary: "Salary",
                birth_date: "Birth date",
                age: "Age",
                monthly_payment: "Monthly payment",
                select_teacher: "Select Teacher",
                
                // ============ STUDENTS ============
                student_profile: "Student Profile",
                add_student: "Add",
                student_teacher: "Teacher",
                total_xp_label: "XP",
                group: "Group",
                
                // ============ PAYMENTS ============
                add_payment: "Add",
                payment_amount: "Amount",
                payment_month: "Month",
                payment_status: "Status",
                paid: "Paid",
                pending: "Pending",
                unpaid: "Unpaid",
                student_fee: "Student Fee",
                teacher_salary: "Teacher Salary",
                
                // ============ ATTENDANCE ============
                present: "Present",
                absent: "Absent",
                absent_reason: "Absent with reason",
                not_marked: "Not marked",
                reason_placeholder: "Write reason...",
                teacher_marks_attendance: "Only teacher marks",
                
                // ============ SUBJECTS ============
                add_subject: "Add",
                subject_name: "Subject name",
                price: "Price",
                teacher: "Teacher",
                
                // ============ REPORTS ============
                reports_title: "Reports",
                teachers_report: "Teachers report",
                students_report: "Students report",
                xp_report: "XP report",
                attendance_report: "Attendance report",
                reports_desc: "All statistical information",
                
                // ============ STAFF ============
                add_staff: "Add",
                staff_profile: "Staff Profile",
                position: "Position",
                yearly_salary: "Yearly salary",
                daily_salary: "Daily salary",
                total_staff: "Total Staff",
                active_staff: "Active Staff",
                inactive_staff: "Inactive",
                frozen_staff: "Frozen",
                
                // ============ DASHBOARD ============
                total_teachers: "Total Teachers",
                total_students: "Total Students",
                total_xp: "Total XP",
                today_attendance: "Today's Attendance",
                days_left: "Days Left",
                end_date: "End Date",
                type: "Type",
                expired: "Expired",
                monthly: "Monthly",
                sixmonths: "6 Months",
                yearly: "Yearly",
                none: "None",
                
                // ============ SUBSCRIPTION ============
                subscription_status: "Status",
                subscription_type: "Type",
                subscription_end: "End Date",
                subscription_days: "Days Left"
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
                const lang = el.dataset.lang;
                const langData = this.languages[lang];
                if (langData) {
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

console.log('✅ i18n.js yuklandi (To\'liq tarjimalar bilan)');
