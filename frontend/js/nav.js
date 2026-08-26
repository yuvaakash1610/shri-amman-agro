/**
 * Shri Amman Agro Traders - Universal Responsive Navigation Component
 * Handles both Desktop horizontal navbar and Mobile touch drawer menu.
 */

window.renderGlobalNav = function() {
    const topNav = document.getElementById('top-nav');
    if (!topNav) return;

    const navItems = [
        { label: 'Dashboard', href: 'dashboard.html' },
        { label: 'Customers', href: 'customers.html' },
        { label: 'Companies', href: 'companies.html' },
        { label: 'Products', href: 'products.html' },
        { label: 'Stock Management', href: 'stock.html' },
        { label: 'Purchasing', href: 'purchasing.html' },
        { label: 'Selling', href: 'selling.html' },
        { label: 'Price Management', href: 'prices.html' },
        { label: 'Logout', href: '#' }
    ];

    const rawPath = window.location.pathname.split('/').pop();
    const currentPage = rawPath || 'dashboard.html';

    topNav.innerHTML = `
        <div class="navbar-header">
            <a href="dashboard.html" class="navbar-brand">
                <img src="images/logo.png" alt="Logo">
                <span>Shri Amman Agro</span>
            </a>
            <button class="nav-toggle" id="nav-toggle-btn" aria-label="Toggle navigation menu">
                <svg class="icon-hamburger" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                <svg class="icon-close hidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div class="navbar-menu" id="navbar-menu">
            ${navItems.map(item => {
                const isActive = currentPage === item.href || (currentPage === '' && item.href === 'dashboard.html');
                const isLogout = item.label === 'Logout';
                const classes = `nav-link${isActive ? ' active' : ''}${isLogout ? ' logout' : ''}`;
                return `<a class="${classes}" href="${item.href}" data-logout="${isLogout}">${item.label}</a>`;
            }).join('')}
        </div>
    `;

    const toggleBtn = document.getElementById('nav-toggle-btn');
    const navMenu = document.getElementById('navbar-menu');

    if (toggleBtn && navMenu) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('open');
            const hamburger = toggleBtn.querySelector('.icon-hamburger');
            const closeIcon = toggleBtn.querySelector('.icon-close');
            if (hamburger) hamburger.classList.toggle('hidden', isOpen);
            if (closeIcon) closeIcon.classList.toggle('hidden', !isOpen);
        };

        // Close on link click
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const hamburger = toggleBtn.querySelector('.icon-hamburger');
                const closeIcon = toggleBtn.querySelector('.icon-close');
                if (hamburger) hamburger.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!topNav.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                const hamburger = toggleBtn.querySelector('.icon-hamburger');
                const closeIcon = toggleBtn.querySelector('.icon-close');
                if (hamburger) hamburger.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
            }
        });
    }

    // Attach global logout handler
    const logoutLinks = topNav.querySelectorAll('[data-logout="true"]');
    logoutLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        };
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('top-nav')) {
        window.renderGlobalNav();
    }
});
