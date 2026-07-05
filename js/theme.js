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

    document.querySelectorAll('.theme-option[data-theme]').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme) {
                Theme.applyTheme(theme);
            }
        });
    });

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

    // Mobile pull-to-refresh for top-of-page swipe down
    setupPullToRefresh();

    // Hozir saqlangan themeni qo'llash (serverdan ham)
    Theme.applyTheme(Theme.currentTheme);
    await Theme.loadThemeFromServer();
});

function setupPullToRefresh() {
    let touchStartY = 0;
    let pullDistance = 0;
    const threshold = 90;
    let indicator = null;

    const createIndicator = () => {
        if (indicator) return;
        indicator = document.createElement('div');
        indicator.style.cssText = `position: fixed; top: 0; left: 0; right: 0; z-index: 9999; display: flex; justify-content: center; align-items: center; padding-top: 8px; pointer-events: none;`;
        indicator.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:999px;background:rgba(255,255,255,0.96);box-shadow:0 8px 24px rgba(0,0,0,0.14);backdrop-filter:blur(10px);border:1px solid rgba(0,0,0,0.06);transform:translateY(-60px);transition:transform 0.2s ease;">
                <div style="width:18px;height:18px;border:2px solid rgba(0,0,0,0.14);border-top-color:var(--color-purple);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            </div>
        `;
        document.body.appendChild(indicator);
    };

    const updateIndicator = (distance) => {
        if (!indicator) createIndicator();
        const spinnerBox = indicator.querySelector('div > div');
        const content = indicator.querySelector('div');
        const progress = Math.min(distance / threshold, 1);
        const translate = Math.max(-60, -60 + progress * 60);
        if (content) content.style.transform = `translateY(${translate}px)`;
        if (spinnerBox) spinnerBox.style.opacity = distance >= threshold ? '1' : '0.8';
    };

    const resetIndicator = () => {
        if (!indicator) return;
        const content = indicator.querySelector('div');
        if (content) content.style.transform = 'translateY(-60px)';
        setTimeout(() => {
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
                indicator = null;
            }
        }, 220);
    };

    window.addEventListener('touchstart', (event) => {
        if (window.scrollY === 0 && event.touches.length === 1) {
            touchStartY = event.touches[0].clientY;
            pullDistance = 0;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        if (touchStartY <= 0 || event.touches.length !== 1) return;
        const currentY = event.touches[0].clientY;
        pullDistance = currentY - touchStartY;
        if (pullDistance > 10 && window.scrollY === 0) {
            updateIndicator(pullDistance);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        if (pullDistance > threshold && window.scrollY === 0) {
            if (indicator) {
                const spinnerBox = indicator.querySelector('div > div');
                if (spinnerBox) spinnerBox.style.opacity = '1';
            }
            window.location.reload();
        } else {
            resetIndicator();
        }
        touchStartY = 0;
        pullDistance = 0;
    });
}

const pullRefreshStyle = document.createElement('style');
pullRefreshStyle.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(pullRefreshStyle);

console.log('✅ theme.js yuklandi');