document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const getApiBaseUrl = () => {
        const configuredApiBase = (window.__API_BASE_URL__ || '').replace(/\/$/, '');
        if (configuredApiBase) {
            return configuredApiBase;
        }

        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${window.location.protocol}//${window.location.hostname}:3000`;
        }

        return window.location.origin;
    };

    const apiBaseUrl = getApiBaseUrl();
    const topNav = document.getElementById('top-nav');
    const navItems = [
        { label: 'Dashboard', href: 'dashboard.html' },
        { label: 'Customers', href: 'customers.html' },
        { label: 'Companies', href: 'companies.html' },
        { label: 'Products', href: 'products.html' },
        { label: 'Stock Management', href: 'stock.html' },
        { label: 'Price Management', href: 'prices.html' },
        { label: 'Logout', href: '#' }
    ];

    const renderNav = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        topNav.innerHTML = navItems.map((item) => {
            const isActive = currentPage === item.href || (currentPage === '' && item.href === 'dashboard.html');
            const isLogout = item.label === 'Logout';
            return `<a class="nav-link${isActive ? ' active' : ''}" href="${item.href}" data-logout="${isLogout}">${item.label}</a>`;
        }).join('');
    };

    renderNav();

    topNav.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-logout="true"]');
        if (link) {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    });

    try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const data = await response.json();
        const user = data.user;

        document.getElementById('user-name').textContent = user.fullName;
        document.getElementById('user-role').textContent = user.role;
        document.getElementById('api-data').textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
});
