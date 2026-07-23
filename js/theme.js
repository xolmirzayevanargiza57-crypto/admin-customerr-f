// ============================================================
// THEME - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
// Loyiha: Admin-Customer Frontend
// Fayl: js/theme.js
// ============================================================

const Theme = {
    currentTheme: localStorage.getItem('theme') || 'auto',

    // ============================================================
    // THEME QO'LLASH
    // ============================================================
    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);

        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        this.updateToggleIcon();
        this.updateThemeOptionButtons();
        this.updateServerTheme(theme);
    },

    // ============================================================
    // THEME OPTION TUGMALARINI YANGILASH
    // ============================================================
    updateThemeOptionButtons() {
        document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
            const theme = button.dataset.theme;
            button.classList.toggle('active', theme === this.currentTheme);
        });
    },

    // ============================================================
    // TOGGLE ICON YANGILASH
    // ============================================================
    updateToggleIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const current = document.documentElement.getAttribute('data-theme');
        const moon = themeToggle.querySelector('.moon');
        const sun = themeToggle.querySelector('.sun');

        if (current === 'dark') {
            if (moon) moon.style.display = 'none';
            if (sun) sun.style.display = 'block';
        } else {
            if (moon) moon.style.display = 'block';
            if (sun) sun.style.display = 'none';
        }
    },

    // ============================================================
    // SERVERGA THEME SAQLASH
    // ============================================================
    async updateServerTheme(theme) {
        try {
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;
            await API.updateTheme(theme);
        } catch (error) {
            console.error('❌ Theme serverga saqlashda xatolik:', error);
        }
    },

    // ============================================================
    // SERVERDAN THEME YUKLASH
    // ============================================================
    async loadThemeFromServer() {
        try {
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;

            const data = await API.getProfile();
            if (data.success && data.user?.theme) {
                const theme = data.user.theme;
                if (theme !== this.currentTheme) {
                    this.applyTheme(theme);
                }
            }
        } catch (error) {
            console.error('❌ Theme serverdan yuklashda xatolik:', error);
        }
    },

    // ============================================================
    // 1 CLICK THEME TOGGLE - LIGHT <-> DARK
    // ============================================================
    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    // ============================================================
    // ⭐ HAMBURGER MENU - TO'G'RI (OCHILADI, YOPILADI, OUTSIDE CLICK)
    // ============================================================
    initSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!menuToggle || !sidebar) {
            console.warn('⚠️ Sidebar yoki menuToggle topilmadi');
            return;
        }

        // ============================================================
        // 1. ESKI EVENTLARNI TOZALASH
        // ============================================================
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);

        // ============================================================
        // 2. HAMBURGER BOSILGANDA - OCHISH/YOPISH
        // ============================================================
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
                console.log('🔒 Sidebar yopildi (hamburger)');
            } else {
                sidebar.classList.add('open');
                if (overlay) overlay.classList.add('show');
                console.log('🍔 Sidebar ochildi (hamburger)');
            }
        });

        // ============================================================
        // 3. OVERLAY BOSILGANDA YOPISH
        // ============================================================
        if (overlay) {
            const newOverlay = overlay.cloneNode(true);
            overlay.parentNode.replaceChild(newOverlay, overlay);
            
            newOverlay.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.remove('open');
                this.classList.remove('show');
                console.log('🔒 Sidebar yopildi (overlay)');
            });
        }

        // ============================================================
        // 4. EKRAN CHEGASIGA (OUTSIDE) BOSILGANDA YOPISH
        // ============================================================
        document.addEventListener('click', function(e) {
            // Sidebar ochiq bo'lsa
            if (sidebar.classList.contains('open')) {
                const target = e.target;
                
                // Agar bosilgan joy sidebar ichida bo'lmasa VA menuToggle ichida bo'lmasa
                if (!sidebar.contains(target) && !menuToggle.contains(target)) {
                    sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('show');
                    console.log('🔒 Sidebar yopildi (outside click)');
                }
            }
        });

        // ============================================================
        // 5. ESC TUGMASI BOSILGANDA YOPISH
        // ============================================================
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
                console.log('🔒 Sidebar yopildi (ESC)');
            }
        });

        // ============================================================
        // 6. WINDOW RESIZE DA YOPISH (MOBILE -> DESKTOP)
        // ============================================================
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
                console.log('🔒 Sidebar yopildi (resize)');
            }
        });

        // ============================================================
        // 7. TOUCH EVENT - MOBIL UCHUN QO'SHIMCHA
        // ============================================================
        document.addEventListener('touchstart', function(e) {
            if (sidebar.classList.contains('open')) {
                const target = e.target;
                if (!sidebar.contains(target) && !menuToggle.contains(target)) {
                    sidebar.classList.remove('open');
                    if (overlay) overlay.classList.remove('show');
                    console.log('🔒 Sidebar yopildi (touch outside)');
                }
            }
        }, { passive: true });

        console.log('✅ Sidebar init complete');
    }
};

// ============================================================
// DOM YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

    // ============================================================
    // 1. THEME TOGGLE - 1 CLICK
    // ============================================================
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const newBtn = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newBtn, themeToggle);
        newBtn.addEventListener('click', () => Theme.toggle());
    }

    // ============================================================
    // 2. THEME OPTIONS (SETTINGS SAHIFASI)
    // ============================================================
    document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme) {
                Theme.applyTheme(theme);
            }
        });
    });

    // ============================================================
    // 3. HAMBURGER MENU - INIT
    // ============================================================
    Theme.initSidebar();

    // ============================================================
    // 4. SYSTEM THEME O'ZGARISHI
    // ============================================================
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (Theme.currentTheme === 'auto') {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            Theme.updateToggleIcon();
        }
    });

    // ============================================================
    // 5. HOZIR SAQLANGAN THEMENI QO'LLASH
    // ============================================================
    Theme.applyTheme(Theme.currentTheme);
    await Theme.loadThemeFromServer();
});

console.log('✅ theme.js yuklandi (Admin-Customer)');
