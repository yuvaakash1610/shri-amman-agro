document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('price-form');
    const tableBody = document.getElementById('price-table-body');
    const priceHistory = document.getElementById('price-history');
    const searchInput = document.getElementById('search-input');
    const formError = document.getElementById('form-error');
    const productSelect = document.getElementById('productId');
    const topNav = document.getElementById('top-nav');

    const getApiBaseUrl = () => {
        const configuredApiBase = (window.__API_BASE_URL__ || '').replace(/\/$/, '');
        if (configuredApiBase) return configuredApiBase;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${window.location.protocol}//${window.location.hostname}:3000`;
        }
        return window.location.origin;
    };

    const apiBaseUrl = getApiBaseUrl();
    let prices = [];
    let products = [];

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

    const showError = (message) => {
        formError.textContent = message;
        formError.classList.remove('hidden');
    };

    const clearError = () => {
        formError.textContent = '';
        formError.classList.add('hidden');
    };

    const populateProducts = () => {
        productSelect.innerHTML = '<option value="">Select product</option>' + products.map((product) => `<option value="${product.product_id}">${product.product_name} (${product.product_code})</option>`).join('');
    };

    const renderPrices = () => {
        const search = searchInput.value.trim().toLowerCase();
        const filtered = prices.filter((item) => {
            const haystack = [item.product_name, item.product_code, item.company_name].join(' ').toLowerCase();
            return !search || haystack.includes(search);
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No price records found.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map((item) => `
            <tr>
                <td><strong>${item.product_name}</strong><br><small>${item.product_code}</small></td>
                <td>${item.company_name || '—'}</td>
                <td>${Number(item.purchase_price || 0).toFixed(2)}</td>
                <td>${Number(item.selling_price || 0).toFixed(2)}</td>
                <td><span class="pill">${item.is_active ? 'Active' : 'Historical'}</span></td>
            </tr>
        `).join('');
    };

    const fetchProducts = async () => {
        const response = await fetch(`${apiBaseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
        products = await response.json();
        populateProducts();
    };

    const fetchPrices = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/prices`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Unable to load prices.');
            prices = await response.json();
            renderPrices();
        } catch (error) {
            showError(error.message);
        }
    };

    const fetchPriceHistory = async (productId) => {
        if (!productId) {
            priceHistory.innerHTML = '<p style="color: #6B7280;">Select a product to view price history.</p>';
            return;
        }
        try {
            const response = await fetch(`${apiBaseUrl}/api/prices/${productId}/history`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Unable to load price history.');
            const history = await response.json();
            if (history.length === 0) {
                priceHistory.innerHTML = '<p style="color: #6B7280;">No price history yet.</p>';
                return;
            }
            priceHistory.innerHTML = '<ul>' + history.map((item) => `<li><strong>${Number(item.purchase_price).toFixed(2)}</strong> / <strong>${Number(item.selling_price).toFixed(2)}</strong> — ${item.is_active ? 'Active' : 'Historical'} — ${new Date(item.effective_from).toLocaleString()}</li>`).join('') + '</ul>';
        } catch (error) {
            priceHistory.innerHTML = `<p style="color: #EF4444;">${error.message}</p>`;
        }
    };

    productSelect.addEventListener('change', (event) => fetchPriceHistory(event.target.value));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearError();
        const payload = {
            productId: productSelect.value,
            purchasePrice: document.getElementById('purchasePrice').value,
            sellingPrice: document.getElementById('sellingPrice').value,
        };

        if (!payload.productId || payload.purchasePrice === '' || payload.sellingPrice === '') {
            showError('Please select a product and enter both prices.');
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save price.');
            form.reset();
            await fetchPrices();
            await fetchPriceHistory('');
        } catch (error) {
            showError(error.message);
        }
    });

    searchInput.addEventListener('input', renderPrices);

    topNav.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-logout="true"]');
        if (link) {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    });

    renderNav();
    await fetchProducts();
    await fetchPrices();
});
