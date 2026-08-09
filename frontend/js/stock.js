document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('stock-form');
    const tableBody = document.getElementById('stock-table-body');
    const movementHistory = document.getElementById('movement-history');
    const searchInput = document.getElementById('search-input');
    const lowStockFilter = document.getElementById('low-stock-filter');
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
    let stockItems = [];
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

    const renderStock = () => {
        const search = searchInput.value.trim().toLowerCase();
        const filtered = stockItems.filter((item) => {
            const haystack = [item.product_code, item.product_name].join(' ').toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            const matchesLowStock = !lowStockFilter.checked || Number(item.quantity) <= Number(item.reorder_level);
            return matchesSearch && matchesLowStock;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No stock records found.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map((item) => `
            <tr>
                <td><strong>${item.product_name}</strong><br><small>${item.unit_name || ''} ${item.abbreviation || ''}</small></td>
                <td>${item.product_code}</td>
                <td>${item.quantity}</td>
                <td>${item.reorder_level}</td>
                <td><span class="pill">${item.stock_status}</span></td>
            </tr>
        `).join('');
    };

    const fetchProducts = async () => {
        const response = await fetch(`${apiBaseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
        products = await response.json();
        populateProducts();
    };

    const fetchStock = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/stock`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Unable to load stock.');
            stockItems = await response.json();
            renderStock();
        } catch (error) {
            showError(error.message);
        }
    };

    const fetchMovementHistory = async (productId) => {
        if (!productId) {
            movementHistory.innerHTML = '<p style="color: #6B7280;">Select a product to view movement history.</p>';
            return;
        }
        try {
            const response = await fetch(`${apiBaseUrl}/api/stock/${productId}/movements`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Unable to load movement history.');
            const history = await response.json();
            if (history.length === 0) {
                movementHistory.innerHTML = '<p style="color: #6B7280;">No movement history yet.</p>';
                return;
            }
            movementHistory.innerHTML = '<ul>' + history.map((item) => `<li><strong>${item.movement_type}</strong> — Qty ${item.quantity} — ${item.reason || 'No reason'} — ${new Date(item.created_at).toLocaleString()}</li>`).join('') + '</ul>';
        } catch (error) {
            movementHistory.innerHTML = `<p style="color: #EF4444;">${error.message}</p>`;
        }
    };

    productSelect.addEventListener('change', (event) => fetchMovementHistory(event.target.value));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearError();
        const payload = {
            productId: productSelect.value,
            movementType: document.getElementById('movementType').value,
            quantity: document.getElementById('quantity').value,
            reason: document.getElementById('reason').value.trim(),
        };

        if (!payload.productId || payload.quantity === '') {
            showError('Please select a product and enter a quantity.');
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/stock/movement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to update stock.');
            form.reset();
            await fetchStock();
            await fetchMovementHistory('');
        } catch (error) {
            showError(error.message);
        }
    });

    searchInput.addEventListener('input', renderStock);
    lowStockFilter.addEventListener('change', renderStock);

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
    await fetchStock();
});
