// ============================================================
// THEME - 1 CLICKDA ISHLAYDI (TO'LIQ TUZATILGAN)
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

    // ⭐ 1 CLICKDA ISHLAYDI - LIGHT <-> DARK
    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
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

    document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme) {
                Theme.applyTheme(theme);
            }
        });
    });

    // ⭐ Hamburger menu
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar && sidebarOverlay) {
        const freshToggle = menuToggle.cloneNode(true);
        const freshOverlay = sidebarOverlay.cloneNode(true);
        menuToggle.parentNode.replaceChild(freshToggle, menuToggle);
        sidebarOverlay.parentNode.replaceChild(freshOverlay, sidebarOverlay);

        freshToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            freshOverlay.classList.toggle('show');
        });

        freshOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            freshOverlay.classList.remove('show');
        });
    }

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

console.log('✅ theme.js yuklandi');
