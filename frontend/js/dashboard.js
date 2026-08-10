document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const getApiBaseUrl = () => {
        const configuredApiBase = (window.__API_BASE_URL__ || '').replace(/\/$/, '');
        if (configuredApiBase) return configuredApiBase;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${window.location.protocol}//${window.location.hostname}:3000`;
        }
        return window.location.origin;
    };

    const apiBaseUrl = getApiBaseUrl();
    const topNav = document.getElementById('top-nav');

    // Navigation setup
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

    const renderNav = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        
        topNav.innerHTML = `<div class="navbar-brand">🌾 Shri Amman Agro</div>` + 
        navItems.map((item) => {
            const isActive = currentPage === item.href || (currentPage === '' && item.href === 'dashboard.html');
            const isLogout = item.label === 'Logout';
            const classes = `nav-link ${isActive ? 'active' : ''} ${isLogout ? 'logout' : ''}`;
            return `<a class="${classes}" href="${item.href}" data-logout="${isLogout}">${item.label}</a>`;
        }).join('');
    };

    renderNav();

    // Event listener for logout
    topNav.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-logout="true"]');
        if (link) {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Chart instances to destroy before redrawing if needed
    let charts = {};

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const renderStats = (stats) => {
        const grid = document.getElementById('stats-grid');
        grid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-label">Total Products</div>
                <div class="stat-value">${stats.totalProducts}</div>
            </div>
            <div class="stat-card accent">
                <div class="stat-icon">✅</div>
                <div class="stat-label">Stock Available</div>
                <div class="stat-value">${stats.totalStockAvailable}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">🛒</div>
                <div class="stat-label">Stock Sold</div>
                <div class="stat-value">${stats.totalStockSold}</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon">⚠️</div>
                <div class="stat-label">Low Stock</div>
                <div class="stat-value">${stats.productsLowStock}</div>
            </div>
            <div class="stat-card danger">
                <div class="stat-icon">❌</div>
                <div class="stat-label">Out of Stock</div>
                <div class="stat-value">${stats.productsOutOfStock}</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-label">Purchase Value</div>
                <div class="stat-value money">${formatCurrency(stats.totalPurchaseValue)}</div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">📈</div>
                <div class="stat-label">Sales Value</div>
                <div class="stat-value money">${formatCurrency(stats.totalSalesValue)}</div>
            </div>
        `;
    };

    const initChart = (id, type, data, options) => {
        const ctx = document.getElementById(id);
        if (charts[id]) charts[id].destroy();
        charts[id] = new Chart(ctx, { type, data, options: { ...options, responsive: true, maintainAspectRatio: false } });
    };

    const fetchDashboardData = async () => {
        try {
            // User info
            const meRes = await fetch(`${apiBaseUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!meRes.ok) throw new Error('Authentication failed');
            const userData = await meRes.json();
            document.getElementById('user-name').textContent = userData.user.fullName;
            document.getElementById('user-role').textContent = userData.user.role;

            // Dashboard stats
            const statsRes = await fetch(`${apiBaseUrl}/api/dashboard/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
            const stats = await statsRes.json();
            renderStats(stats);

            // Fetch chart & table data in parallel
            const [stockRes, pvRes, topRes, trendRes, lowStockRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/dashboard/stock-by-product`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/purchase-vs-sales`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/top-selling`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/sales-trend`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/low-stock`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const stockData = await stockRes.json();
            const pvData = await pvRes.json();
            const topData = await topRes.json();
            const trendData = await trendRes.json();
            const lowStockData = await lowStockRes.json();

            // 1. Stock Chart (Doughnut)
            if (stockData.length > 0) {
                initChart('stockChart', 'doughnut', {
                    labels: stockData.map(d => d.product_name),
                    datasets: [{
                        data: stockData.map(d => d.quantity),
                        backgroundColor: ['#2F6B38', '#E2B93B', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'],
                        borderWidth: 0
                    }]
                }, { plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } });
            }

            // 2. Purchase vs Sales (Bar)
            if (pvData.months.length > 0) {
                initChart('pvChart', 'bar', {
                    labels: pvData.months,
                    datasets: [
                        { label: 'Purchases', data: pvData.purchases, backgroundColor: '#E2B93B', borderRadius: 4 },
                        { label: 'Sales', data: pvData.sales, backgroundColor: '#2F6B38', borderRadius: 4 }
                    ]
                }, { plugins: { tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } }, scales: { y: { beginAtZero: true } } });
            }

            // 3. Top Selling Products Chart (Horizontal Bar)
            if (topData.length > 0) {
                initChart('topChart', 'bar', {
                    labels: topData.map(d => d.product_name),
                    datasets: [{
                        label: 'Quantity Sold',
                        data: topData.map(d => d.total_sold),
                        backgroundColor: '#10B981',
                        borderRadius: 4
                    }]
                }, { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } });
            }

            // 4. Sales Trend Chart (Line)
            if (trendData.length > 0) {
                initChart('trendChart', 'line', {
                    labels: trendData.map(d => new Date(d.sale_day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
                    datasets: [{
                        label: 'Daily Revenue',
                        data: trendData.map(d => d.daily_revenue),
                        borderColor: '#2F6B38',
                        backgroundColor: 'rgba(47, 107, 56, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                }, { plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` Revenue: ${formatCurrency(ctx.raw)}` } } }, scales: { y: { beginAtZero: true } } });
            }

            // Render Top Selling Table
            const topBody = document.getElementById('top-selling-body');
            if (topData.length > 0) {
                topBody.innerHTML = topData.map((p, i) => `
                    <tr>
                        <td class="rank ${i < 3 ? 'top' : ''}">#${i + 1}</td>
                        <td><strong>${p.product_name}</strong><br><small>${p.product_code}</small></td>
                        <td>${p.category_name || '-'}</td>
                        <td>${p.total_sold}</td>
                        <td style="font-weight: 600;">${formatCurrency(p.total_revenue)}</td>
                    </tr>
                `).join('');
            } else {
                topBody.innerHTML = '<tr><td colspan="5" class="empty-state">No sales data available.</td></tr>';
            }

            // Render Low Stock Table
            const lowBody = document.getElementById('low-stock-body');
            if (lowStockData.length > 0) {
                lowBody.innerHTML = lowStockData.map(p => {
                    const isOut = p.current_stock === 0;
                    return `
                        <tr>
                            <td><strong>${p.product_name}</strong></td>
                            <td>${p.product_code}</td>
                            <td style="font-weight: 600; color: ${isOut ? '#EF4444' : '#F59E0B'}">${p.current_stock}</td>
                            <td>${p.reorder_level}</td>
                            <td><span class="pill ${isOut ? 'out-stock' : 'low-stock'}">${p.stock_status}</span></td>
                        </tr>
                    `;
                }).join('');
            } else {
                lowBody.innerHTML = '<tr><td colspan="5" class="empty-state">All products are well stocked! 🎉</td></tr>';
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.message === 'Authentication failed') {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
            } else {
                document.getElementById('stats-grid').innerHTML = `<div class="loading-state" style="grid-column: 1 / -1; color: #EF4444;">Failed to load dashboard data. Please try refreshing.</div>`;
            }
        }
    };

    fetchDashboardData();
});
