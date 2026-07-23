// ============================================
// APP - ADMIN-CUSTOMER (TO'LIQ)
// Loyiha: Admin-Customer Frontend
// Fayl: js/app.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // SIDEBAR TOGGLE (HAMBURGER)
    // ============================================================
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar) {
        // Eski event listenerlarni tozalash
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newToggle, menuToggle);

        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('show');
            }
        });
    }

    // Overlay bosilganda yopish
    if (sidebarOverlay && sidebar) {
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

    // ============================================================
    // LOGOUT
    // ============================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }

    // ============================================================
    // USER INFO
    // ============================================================
    const userName = document.getElementById('userName');
    const userInitial = document.getElementById('userInitial');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) {
        userName.textContent = Auth.getUserName();
    }

    if (userInitial) {
        userInitial.textContent = Auth.getUserInitial();
    }

    if (userAvatar) {
        userAvatar.style.background = getColorFromName(Auth.getUserName());
    }

    // ============================================================
    // ACTIVE LINK
    // ============================================================
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// ============================================================
// YORDAMCHI FUNKSIYALAR
// ============================================================
function getColorFromName(name) {
    const colors = [
        '#007aff', '#34c759', '#ff9500', '#ff3b30',
        '#7c3aed', '#e83e8c', '#00c7be', '#6c5ce7'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function formatDate(date) {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('uz', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatNumber(num) {
    return num?.toLocaleString() || '0';
}

console.log('✅ app.js yuklandi (Admin-Customer)');
