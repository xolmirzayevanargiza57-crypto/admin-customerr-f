// ============================================================
// I18N - TIL (UZ, RU, EN) - TO'LIQ
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
                welcome: "Xush kelibsiz",
                total_teachers: "Jami O'qituvchilar",
                total_students: "Jami O'quvchilar",
                total_xp: "Jami XP",
                today_attendance: "Bugungi davomat",
                present: "Keldi",
                absent: "Kelmadi",
                absent_reason: "Sababli",
                weekly_attendance: "Haftalik davomat",
                attendance_distribution: "Davomat taqsimoti",
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
                add_teacher: "Yangi o'qituvchi qo'shish",
                teacher_name: "O'qituvchi ismi",
                teacher_email: "Email",
                teacher_phone: "Telefon",
                teacher_subject: "Fani",
                teacher_status: "Holati",
                students_count: "O'quvchilar soni",
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
                edit_teacher: "O'qituvchini tahrirlash",
                joined: "Qo'shilgan",
                birth_date: "Tug'ilgan kun",
                age: "Yosh",
                salary: "Oylik maosh",
                add_student: "Yangi o'quvchi qo'shish",
                student_name: "O'quvchi ismi",
                student_email: "Email",
                student_phone: "Telefon",
                student_teacher: "O'qituvchi",
                student_status: "Holati",
                total_xp_label: "Jami XP",
                students_desc: "O'quvchilarni boshqarish",
                student_profile: "O'quvchi profili",
                edit_student: "O'quvchini tahrirlash",
                select_teacher: "O'qituvchi tanlang",
                monthly_payment: "Oylik to'lov",
                group: "Guruh",
                add_payment: "Yangi to'lov qo'shish",
                payment_amount: "Summa",
                payment_month: "Oy",
                payment_status: "Holati",
                paid: "To'langan",
                pending: "Kutilmoqda",
                unpaid: "To'lanmagan",
                select_student: "O'quvchi tanlang",
                add_subject: "Yangi fan qo'shish",
                subject_name: "Fan nomi",
                subject_price: "Narxi",
                subjects_desc: "Fanlarni boshqarish",
                price: "Narxi",
                teacher: "O'qituvchi",
                back: "Orqaga",
                reports_title: "Hisobotlar",
                teachers_report: "O'qituvchilar hisoboti",
                students_report: "O'quvchilar hisoboti",
                payments_report: "To'lovlar hisoboti",
                attendance_report: "Davomat hisoboti",
                xp_report: "XP hisoboti",
                total: "Jami",
                average: "O'rtacha",
                settings_title: "Sozlamalar",
                appearance: "Tashqi ko'rinish",
                light: "Yorug'",
                dark: "Qorong'u",
                auto: "Avto",
                language: "Til",
                change_password: "Parolni o'zgartirish",
                old_password: "Eski parol",
                new_password: "Yangi parol",
                confirm_password: "Parolni tasdiqlang",
                change: "O'zgartirish",
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
                welcome: "Добро пожаловать",
                total_teachers: "Всего учителей",
                total_students: "Всего учеников",
                total_xp: "Всего XP",
                today_attendance: "Посещаемость сегодня",
                present: "Пришел",
                absent: "Не пришел",
                absent_reason: "По причине",
                weekly_attendance: "Еженедельная посещаемость",
                attendance_distribution: "Распределение посещаемости",
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
                add_teacher: "Добавить учителя",
                teacher_name: "Имя учителя",
                teacher_email: "Email",
                teacher_phone: "Телефон",
                teacher_subject: "Предмет",
                teacher_status: "Статус",
                students_count: "Количество учеников",
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
                edit_teacher: "Редактировать учителя",
                joined: "Присоединился",
                birth_date: "Дата рождения",
                age: "Возраст",
                salary: "Зарплата",
                add_student: "Добавить ученика",
                student_name: "Имя ученика",
                student_email: "Email",
                student_phone: "Телефон",
                student_teacher: "Учитель",
                student_status: "Статус",
                total_xp_label: "Всего XP",
                students_desc: "Управление учениками",
                student_profile: "Профиль ученика",
                edit_student: "Редактировать ученика",
                select_teacher: "Выберите учителя",
                monthly_payment: "Ежемесячный платеж",
                group: "Группа",
                add_payment: "Добавить платеж",
                payment_amount: "Сумма",
                payment_month: "Месяц",
                payment_status: "Статус",
                paid: "Оплачен",
                pending: "В ожидании",
                unpaid: "Не оплачен",
                select_student: "Выберите ученика",
                add_subject: "Добавить предмет",
                subject_name: "Название предмета",
                subject_price: "Цена",
                subjects_desc: "Управление предметами",
                price: "Цена",
                teacher: "Учитель",
                back: "Назад",
                reports_title: "Отчеты",
                teachers_report: "Отчет по учителям",
                students_report: "Отчет по ученикам",
                payments_report: "Отчет по платежам",
                attendance_report: "Отчет по посещаемости",
                xp_report: "Отчет по XP",
                total: "Всего",
                average: "Среднее",
                settings_title: "Настройки",
                appearance: "Внешний вид",
                light: "Светлая",
                dark: "Темная",
                auto: "Авто",
                language: "Язык",
                change_password: "Изменить пароль",
                old_password: "Старый пароль",
                new_password: "Новый пароль",
                confirm_password: "Подтвердите пароль",
                change: "Изменить",
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
                welcome: "Welcome",
                total_teachers: "Total Teachers",
                total_students: "Total Students",
                total_xp: "Total XP",
                today_attendance: "Today's Attendance",
                present: "Present",
                absent: "Absent",
                absent_reason: "Absent with reason",
                weekly_attendance: "Weekly Attendance",
                attendance_distribution: "Attendance Distribution",
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
                add_teacher: "Add Teacher",
                teacher_name: "Teacher Name",
                teacher_email: "Email",
                teacher_phone: "Phone",
                teacher_subject: "Subject",
                teacher_status: "Status",
                students_count: "Students Count",
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
                edit_teacher: "Edit Teacher",
                joined: "Joined",
                birth_date: "Birth Date",
                age: "Age",
                salary: "Salary",
                add_student: "Add Student",
                student_name: "Student Name",
                student_email: "Email",
                student_phone: "Phone",
                student_teacher: "Teacher",
                student_status: "Status",
                total_xp_label: "Total XP",
                students_desc: "Manage Students",
                student_profile: "Student Profile",
                edit_student: "Edit Student",
                select_teacher: "Select Teacher",
                monthly_payment: "Monthly Payment",
                group: "Group",
                add_payment: "Add Payment",
                payment_amount: "Amount",
                payment_month: "Month",
                payment_status: "Status",
                paid: "Paid",
                pending: "Pending",
                unpaid: "Unpaid",
                select_student: "Select Student",
                add_subject: "Add Subject",
                subject_name: "Subject Name",
                subject_price: "Price",
                subjects_desc: "Manage Subjects",
                price: "Price",
                teacher: "Teacher",
                back: "Back",
                reports_title: "Reports",
                teachers_report: "Teachers Report",
                students_report: "Students Report",
                payments_report: "Payments Report",
                attendance_report: "Attendance Report",
                xp_report: "XP Report",
                total: "Total",
                average: "Average",
                settings_title: "Settings",
                appearance: "Appearance",
                light: "Light",
                dark: "Dark",
                auto: "Auto",
                language: "Language",
                change_password: "Change Password",
                old_password: "Old Password",
                new_password: "New Password",
                confirm_password: "Confirm Password",
                change: "Change",
                danger_zone: "Danger Zone",
                delete_account_warning: "Are you sure you want to delete your account? This action cannot be undone!",
                delete_account: "Delete Account"
            }
        }
    },

    // ============================================================
    // METODLAR
    // ============================================================
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
            document.querySelectorAll('.lang-option').forEach(el => {
                el.classList.toggle('active', el.dataset.lang === this.currentLanguage);
            });
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                const icon = loginBtn.querySelector('i');
                loginBtn.innerHTML = '';
                if (icon) loginBtn.appendChild(icon);
                loginBtn.appendChild(document.createTextNode(' ' + this.t('login_btn')));
            }
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
            btn.className = `lang-option ${lang === this.currentLanguage ? 'active' : ''}`;
            btn.dataset.lang = lang;
            btn.innerHTML = `${this.languages[lang].flag} ${this.languages[lang].name}`;
            btn.addEventListener('click', () => this.setLanguage(lang));
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