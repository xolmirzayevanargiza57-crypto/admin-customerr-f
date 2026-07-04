// ============================================================
// THEME - QORONG'U / YORUG' / AVTO
// ⭐ HAMBURGER MENU - BIR MARTA BOSISHDA ISHLAYDI
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
        this.updateServerTheme(theme);
    },

    updateToggleIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const current = document.documentElement.getAttribute('data-theme');
        const moon = themeToggle.querySelector('.moon');
        const sun  = themeToggle.querySelector('.sun');

        if (current === 'dark') {
            if (moon) moon.style.display = 'none';
            if (sun)  sun.style.display  = 'block';
        } else {
            if (moon) moon.style.display = 'block';
            if (sun)  sun.style.display  = 'none';
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
        const themes = ['light', 'dark', 'auto'];
        const idx = themes.indexOf(this.currentTheme);
        this.applyTheme(themes[(idx + 1) % themes.length]);
    }
};

// ============================================================
// ⭐ DOM YUKLANGANDA - BARCHA LISTENER BIR MARTA ULANADI
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {

    // ── Theme toggle ──────────────────────────────────────────
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        // Eski listenerlar bo'lmasligi uchun replace trick
        const newBtn = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newBtn, themeToggle);
        newBtn.addEventListener('click', () => Theme.toggle());
    }

    // ── Hamburger menu ────────────────────────────────────────
    // ⭐ HAR BIR SAHIFADA BU KOD ISHLAYDI (global)
    // Sahifaga xos setupListeners() bilan mos ishlashi uchun
    // faqat tema.js dan boshqaramiz — duplicate bo'lmasligi uchun
    // setupListeners() ichida ALOHIDA ulash SHART EMAS.
    const menuToggle     = document.getElementById('menuToggle');
    const sidebar        = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar && sidebarOverlay) {
        // ⭐ Sahifaga xos JS da ham boshqarilsa conflict bo'lmasligi uchun
        // cloneNode bilan eski listenerlarni tozalaymiz
        const freshToggle   = menuToggle.cloneNode(true);
        const freshOverlay  = sidebarOverlay.cloneNode(true);
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

    // Hozir saqlangan themeni qo'llash (serverdan ham)
    Theme.applyTheme(Theme.currentTheme);
    await Theme.loadThemeFromServer();
});

console.log('✅ theme.js yuklandi');