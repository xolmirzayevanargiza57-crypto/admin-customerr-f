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
    // ⭐ HAMBURGER MENU - TO'G'RI VA ISHONCHLI
    // ============================================================
    initSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (!menuToggle || !sidebar) return;

        // Eski event listenerlarni tozalash
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);

        // Hamburger bosilganda
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show');
            }
        });

        // Overlay bosilganda yopish
        if (sidebarOverlay) {
            const newOverlay = sidebarOverlay.cloneNode(true);
            sidebarOverlay.parentNode.replaceChild(newOverlay, sidebarOverlay);
            
            newOverlay.addEventListener('click', function() {
                sidebar.classList.remove('open');
                this.classList.remove('show');
            });
        }

        // Document bosilganda yopish (mobile)
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                const sidebarEl = document.getElementById('sidebar');
                const menuToggleEl = document.getElementById('menuToggle');
                if (sidebarEl && menuToggleEl) {
                    const isSidebar = sidebarEl.contains(e.target);
                    const isToggle = menuToggleEl.contains(e.target);
                    if (!isSidebar && !isToggle) {
                        sidebarEl.classList.remove('open');
                        const overlay = document.getElementById('sidebarOverlay');
                        if (overlay) overlay.classList.remove('show');
                    }
                }
            }
        });
    }
};

// ============================================================
// DOM YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

    // ⭐ Theme toggle - 1 click
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const newBtn = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newBtn, themeToggle);
        newBtn.addEventListener('click', () => Theme.toggle());
    }

    // ⭐ Theme options (settings sahifasi)
    document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme) {
                Theme.applyTheme(theme);
            }
        });
    });

    // ⭐ Hamburger menu - init
    Theme.initSidebar();

    // System theme o'zgarishi
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (Theme.currentTheme === 'auto') {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            Theme.updateToggleIcon();
        }
    });

    // Hozir saqlangan themeni qo'llash
    Theme.applyTheme(Theme.currentTheme);
    await Theme.loadThemeFromServer();
});

console.log('✅ theme.js yuklandi (Admin-Customer)');
