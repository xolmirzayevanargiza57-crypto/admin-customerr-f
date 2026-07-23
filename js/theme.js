// ============================================================
// THEME - ADMIN-CUSTOMER (TO'LIQ TUZATILGAN)
// Loyiha: Admin-Customer Frontend
// Fayl: js/theme.js
// ============================================================

const Theme = {
    currentTheme: localStorage.getItem('theme') || 'auto',

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

    updateThemeOptionButtons() {
        document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
            const theme = button.dataset.theme;
            button.classList.toggle('active', theme === this.currentTheme);
        });
    },

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

    async updateServerTheme(theme) {
        try {
            const token = localStorage.getItem('customerToken') || sessionStorage.getItem('customerToken');
            if (!token) return;
            await API.updateTheme(theme);
        } catch (error) {
            console.error('❌ Theme serverga saqlashda xatolik:', error);
        }
    },

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

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    // ⭐ HAMBURGER MENU - TO'G'RI
    initSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (!menuToggle || !sidebar) {
            console.warn('⚠️ Sidebar yoki menuToggle topilmadi');
            return;
        }

        // Eski eventlarni tozalash
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);

        // Hamburger bosilganda
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
                console.log('🔒 Sidebar yopildi');
            } else {
                sidebar.classList.add('open');
                if (overlay) overlay.classList.add('show');
                console.log('🍔 Sidebar ochildi');
            }
        });

        // Overlay bosilganda yopish
        if (overlay) {
            const newOverlay = overlay.cloneNode(true);
            overlay.parentNode.replaceChild(newOverlay, overlay);
            
            newOverlay.addEventListener('click', function() {
                sidebar.classList.remove('open');
                this.classList.remove('show');
                console.log('🔒 Sidebar closed via overlay');
            });
        }

        // ESC tugmasi bosilganda yopish
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
                console.log('🔒 Sidebar closed via ESC');
            }
        });

        console.log('✅ Sidebar init complete');
    }
};

// ============================================================
// DOM YUKLANGANDA
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const newBtn = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newBtn, themeToggle);
        newBtn.addEventListener('click', () => Theme.toggle());
    }

    document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme) {
                Theme.applyTheme(theme);
            }
        });
    });

    Theme.initSidebar();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (Theme.currentTheme === 'auto') {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            Theme.updateToggleIcon();
        }
    });

    Theme.applyTheme(Theme.currentTheme);
    await Theme.loadThemeFromServer();
});

console.log('✅ theme.js yuklandi (Admin-Customer)');
