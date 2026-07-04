// ============================================
// APP - UMUMIY (Yon panel bilan)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const isSidebar = sidebar.contains(e.target);
                const isToggle = menuToggle.contains(e.target);
                if (!isSidebar && !isToggle) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm(getTranslation('confirm_logout') || 'Haqiqatan ham chiqmoqchimisiz?')) {
                Auth.logout();
            }
        });
    }
    
    // User info
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
    
    // Active link
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