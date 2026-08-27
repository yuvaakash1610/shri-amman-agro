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

    const renderNav = () => {
        if (window.renderGlobalNav) {
            window.renderGlobalNav();
        }
    };

    renderNav();

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

    const renderAvailableStockList = (items) => {
        if (!items || items.length === 0) {
            return '<div class="empty-state" style="padding:12px;">No stock details available</div>';
        }
        return items.map(item => {
            const qty = Number(item.quantity || 0);
            let badgeStyle = 'color: #065f46; background: #d1fae5;';
            if (qty === 0) badgeStyle = 'color: #991b1b; background: #fee2e2;';
            else if (qty < 5) badgeStyle = 'color: #92400e; background: #fef3c7;';

            return `
                <div class="popover-item">
                    <div class="popover-item-info">
                        <span class="popover-item-name">${item.product_name}</span>
                        <span class="popover-item-sub">${item.product_code || ''} ${item.category_name ? '&bull; ' + item.category_name : ''}</span>
                    </div>
                    <div class="popover-item-stat">
                        <span class="pill" style="${badgeStyle}">${qty} ${item.unit || ''}</span>
                    </div>
                </div>
            `;
        }).join('');
    };

    const renderStats = (stats, profitData = null, stockDetails = []) => {
        const grid = document.getElementById('stats-grid');
        
        const todayProf = (profitData && profitData.today) ? profitData.today.profit : 0;
        const todayMargin = (profitData && profitData.today) ? profitData.today.margin : 0;
        const monthProf = (profitData && profitData.month) ? profitData.month.profit : 0;
        const monthMargin = (profitData && profitData.month) ? profitData.month.margin : 0;
        const totalProf = (profitData && profitData.total) ? profitData.total.profit : 0;
        const totalMargin = (profitData && profitData.total) ? profitData.total.margin : 0;

        grid.innerHTML = `
            <div class="stat-card clickable-card" id="card-total-products" onclick="window.location.href='products.html'" title="Click to view all products">
                <div class="stat-icon">📦</div>
                <div class="stat-label">Total Products</div>
                <div class="stat-value">${stats.totalProducts}</div>
                <div class="click-hint">View Products &rarr;</div>
            </div>
            <div class="stat-card accent hover-detail-card" id="card-stock-available">
                <div class="stat-icon">✅</div>
                <div class="stat-label">Stock Available</div>
                <div class="stat-value">${stats.totalStockAvailable}</div>
                <div class="hover-hint">🔍 Hover for details</div>
                <div class="hover-popover" id="popover-stock-available">
                    <div class="popover-header">
                        <div class="popover-title">📦 Stock Available Breakdown</div>
                        <span class="popover-badge">${stats.totalStockAvailable} Units</span>
                    </div>
                    <div class="popover-list">
                        ${renderAvailableStockList(stockDetails)}
                    </div>
                </div>
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
            <div class="stat-card success" style="border-top: 4px solid #10B981;">
                <div class="stat-icon">💵</div>
                <div class="stat-label">Today's Profit</div>
                <div class="stat-value money" style="color:#065f46">${formatCurrency(todayProf)}</div>
                <div class="stat-sub">Margin: <strong>${todayMargin}%</strong></div>
            </div>
            <div class="stat-card success" style="border-top: 4px solid #2F6B38;">
                <div class="stat-icon">📊</div>
                <div class="stat-label">This Month's Profit</div>
                <div class="stat-value money" style="color:#2F6B38">${formatCurrency(monthProf)}</div>
                <div class="stat-sub">Margin: <strong>${monthMargin}%</strong></div>
            </div>
            <div class="stat-card accent" style="border-top: 4px solid #E2B93B;">
                <div class="stat-icon">🌟</div>
                <div class="stat-label">Overall Profit</div>
                <div class="stat-value money" style="color:#92400e">${formatCurrency(totalProf)}</div>
                <div class="stat-sub">Margin: <strong>${totalMargin}%</strong></div>
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
            const [stockRes, pvRes, topRes, trendRes, lowStockRes, profitRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/dashboard/stock-by-product`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/purchase-vs-sales`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/top-selling`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/sales-trend`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/low-stock`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/dashboard/profit-analytics`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const stockData = stockRes.ok ? await stockRes.json() : [];
            const pvData = pvRes.ok ? await pvRes.json() : { months: [], purchases: [], sales: [] };
            const topData = topRes.ok ? await topRes.json() : [];
            const trendData = trendRes.ok ? await trendRes.json() : [];
            const lowStockData = lowStockRes.ok ? await lowStockRes.json() : [];
            const profitData = profitRes.ok ? await profitRes.json() : null;

            // Re-render stats cards with profit figures and stock details
            renderStats(stats, profitData, stockData);

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

            // Render Product Profitability Table
            const profitBody = document.getElementById('product-profit-body');
            if (profitData && profitData.products && profitData.products.length > 0) {
                profitBody.innerHTML = profitData.products.map(p => {
                    const m = p.margin;
                    let pillClass = 'low-stock';
                    if (m >= 20) pillClass = 'in-stock';
                    else if (m < 0) pillClass = 'out-stock';

                    return `
                        <tr>
                            <td><strong>${p.product_name}</strong><br><small style="color:#6B7280">${p.product_code}</small></td>
                            <td>${p.category_name || '-'}</td>
                            <td>${p.total_sold}</td>
                            <td>${formatCurrency(p.total_revenue)}</td>
                            <td>${formatCurrency(p.total_cost)}</td>
                            <td style="font-weight: 600; color: ${p.total_profit >= 0 ? '#10B981' : '#EF4444'}">${formatCurrency(p.total_profit)}</td>
                            <td><span class="pill ${pillClass}">${m}%</span></td>
                        </tr>
                    `;
                }).join('');
            } else {
                profitBody.innerHTML = '<tr><td colspan="7" class="empty-state">No profit data available yet. Record some sales to see profitability!</td></tr>';
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

    // ── Toast helper ──────────────────────────────────────────────────────────
    let waToastTimer = null;
    const showWaToast = (message, type = 'info', duration = 3500) => {
        const toast = document.getElementById('wa-toast');
        if (!toast) return;
        clearTimeout(waToastTimer);
        toast.textContent = message;
        toast.className = `show toast-${type}`;
        waToastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    };

    // ── WhatsApp status check ─────────────────────────────────────────────────
    let waUnavailable = false; // set true when server reports unavailable (e.g. Vercel)
    const checkWhatsAppStatus = async (showToast = false) => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/whatsapp/status`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();

            const statusText  = document.getElementById('wa-status-text');
            const qrContainer = document.getElementById('wa-qr-container');
            const qrImg       = document.getElementById('wa-qr-img');
            const refreshBtn  = document.getElementById('wa-refresh-btn');
            const logoutBtn   = document.getElementById('wa-logout-btn');

            // 503: WhatsApp not supported in this environment (e.g. Vercel serverless)
            if (res.status === 503 || data.available === false) {
                waUnavailable = true;
                statusText.innerHTML = '<span style="color: #6B7280;">☁️ Not available in cloud deployment.<br><small style="font-size:0.78em;">WhatsApp works only when running the app locally.</small></span>';
                qrContainer.style.display = 'none';
                if (refreshBtn) { refreshBtn.style.display = 'inline-block'; refreshBtn.disabled = true; }
                if (logoutBtn)  logoutBtn.style.display = 'none';
                if (showToast)  showWaToast('☁️ WhatsApp is not available in this cloud deployment', 'info');
                return;
            }

            if (data.ready) {
                statusText.innerHTML = '<span style="color: #10B981;">✅ Linked and Ready</span>';
                qrContainer.style.display = 'none';
                refreshBtn.style.display = 'inline-block';
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
                if (showToast) showWaToast('✅ WhatsApp Status: Linked and Ready', 'success');
            } else if (data.qr) {
                statusText.innerHTML = '<span style="color: #F59E0B;">⚠️ Scan QR Code to link WhatsApp</span>';
                qrImg.src = data.qr;
                qrContainer.style.display = 'block';
                refreshBtn.style.display = 'inline-block';
                if (logoutBtn) logoutBtn.style.display = 'none';
                if (showToast) showWaToast('⚠️ WhatsApp Status: Not linked — scan QR code', 'warning');
            } else {
                statusText.innerHTML = '<span style="color: #6B7280;">⏳ Initializing WhatsApp...</span>';
                qrContainer.style.display = 'none';
                refreshBtn.style.display = 'inline-block';
                if (logoutBtn) logoutBtn.style.display = 'none';
                if (showToast) showWaToast('⏳ WhatsApp Status: Initializing, please wait...', 'info');
            }
        } catch (error) {
            console.error('Error checking WA status:', error);
            document.getElementById('wa-status-text').innerHTML = '<span style="color: #EF4444;">❌ WhatsApp Service Offline</span>';
            if (showToast) showWaToast('❌ WhatsApp Service Offline', 'error');
        }
    };

    // ── WhatsApp logout ───────────────────────────────────────────────────────
    const logoutWhatsApp = async () => {
        if (!confirm('Are you sure you want to log out of WhatsApp? A new QR code will be generated.')) return;

        const statusText = document.getElementById('wa-status-text');
        const qrContainer = document.getElementById('wa-qr-container');
        const logoutBtn = document.getElementById('wa-logout-btn');
        const refreshBtn = document.getElementById('wa-refresh-btn');

        // Immediately reset UI so user sees change right away
        statusText.innerHTML = '<span style="color: #F59E0B;">⏳ Logging out of WhatsApp...</span>';
        qrContainer.style.display = 'none';
        if (logoutBtn) { logoutBtn.disabled = true; logoutBtn.style.display = 'none'; }
        if (refreshBtn) refreshBtn.style.display = 'none';
        showWaToast('⏳ Logging out of WhatsApp...', 'info', 5000);

        try {
            const res = await fetch(`${apiBaseUrl}/api/whatsapp/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await res.json();
            showWaToast('✅ Logged out of WhatsApp successfully!', 'success', 4000);
            // Poll until QR code appears (backend needs ~2-3s to reinitialize)
            let attempts = 0;
            const pollForQR = setInterval(async () => {
                attempts++;
                await checkWhatsAppStatus(false);
                const currentText = document.getElementById('wa-status-text').innerText;
                if (currentText.includes('Scan') || attempts >= 12) {
                    clearInterval(pollForQR);
                    if (logoutBtn) logoutBtn.disabled = false;
                    if (refreshBtn) refreshBtn.style.display = 'inline-block';
                }
            }, 2500);
        } catch (error) {
            console.error('Logout WhatsApp error:', error);
            statusText.innerHTML = '<span style="color: #EF4444;">❌ Failed to log out of WhatsApp</span>';
            if (logoutBtn) { logoutBtn.disabled = false; logoutBtn.style.display = 'inline-block'; }
            if (refreshBtn) refreshBtn.style.display = 'inline-block';
            showWaToast('❌ Failed to log out of WhatsApp', 'error');
        }
    };

    document.getElementById('wa-refresh-btn').addEventListener('click', () => checkWhatsAppStatus(true));
    const waLogoutBtn = document.getElementById('wa-logout-btn');
    if (waLogoutBtn) waLogoutBtn.addEventListener('click', logoutWhatsApp);

    fetchDashboardData();
    checkWhatsAppStatus(false);

    // Auto-refresh WA status every 5 seconds — only when still initializing/scanning
    // and only when WhatsApp is actually supported in this environment.
    setInterval(() => {
        if (waUnavailable) return; // stop polling when not supported (e.g. Vercel)
        const txt = document.getElementById('wa-status-text').innerText;
        if (txt.includes('Scan') || txt.includes('Initializing')) {
            checkWhatsAppStatus(false);
        }
    }, 5000);
});
