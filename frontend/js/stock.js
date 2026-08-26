document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const tableBody = document.getElementById('stock-table-body');
    const searchInput = document.getElementById('search-input');
    const companyFilter = document.getElementById('company-filter');
    const categoryFilter = document.getElementById('category-filter');
    const lowStockFilter = document.getElementById('low-stock-filter');
    const outStockFilter = document.getElementById('out-stock-filter');
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

    const renderNav = () => {
        if (window.renderGlobalNav) window.renderGlobalNav();
    };

    const fetchFilters = async () => {
        try {
            const [compRes, catRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/companies`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/products/categories`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            if (compRes.ok) {
                const companies = await compRes.json();
                companyFilter.innerHTML = '<option value="">All Companies</option>' + 
                    companies.map(c => `<option value="${c.company_id}">${c.company_name}</option>`).join('');
            }
            if (catRes.ok) {
                const categories = await catRes.json();
                categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
                    categories.map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join('');
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const fetchStock = async () => {
        try {
            const params = new URLSearchParams();
            if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
            if (companyFilter.value) params.append('companyId', companyFilter.value);
            if (categoryFilter.value) params.append('categoryId', categoryFilter.value);
            if (lowStockFilter.checked) params.append('lowStock', 'true');
            if (outStockFilter.checked) params.append('outOfStock', 'true');

            const response = await fetch(`${apiBaseUrl}/api/stock?${params.toString()}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            if (!response.ok) throw new Error('Unable to load stock.');
            const stockItems = await response.json();
            renderStock(stockItems);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="empty-state" style="color:red;">Error: ${error.message}</td></tr>`;
        }
    };

    const renderStock = (items) => {
        if (items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No stock records found matching filters.</td></tr>';
            return;
        }

        tableBody.innerHTML = items.map((item) => {
            let statusClass = 'pill';
            let valClass = 'stock-val success';
            
            if (item.stock_status === 'Out of Stock') {
                statusClass += ' out-stock';
                valClass = 'stock-val danger';
            } else if (item.stock_status === 'Low Stock') {
                statusClass += ' low-stock';
                valClass = 'stock-val warning';
            }

            const updatedStr = item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Never';

            return `
            <tr>
                <td>
                    <strong>${item.product_name}</strong>
                    <span class="meta-text">Code: ${item.product_code}</span>
                </td>
                <td>
                    ${item.company_name || '-'}
                    <span class="meta-text">${item.category_name || '-'}</span>
                </td>
                <td>
                    <span class="${valClass}">${item.quantity}</span> ${item.abbreviation || ''}
                </td>
                <td>${item.reorder_level}</td>
                <td><span class="${statusClass}">${item.stock_status}</span></td>
                <td><span class="meta-text">${updatedStr}</span></td>
            </tr>
        `}).join('');
    };

    // Event listeners
    searchInput.addEventListener('input', () => { clearTimeout(window.searchTimeout); window.searchTimeout = setTimeout(fetchStock, 300); });
    companyFilter.addEventListener('change', fetchStock);
    categoryFilter.addEventListener('change', fetchStock);
    lowStockFilter.addEventListener('change', fetchStock);
    outStockFilter.addEventListener('change', fetchStock);

    topNav.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-logout="true"]');
        if (link) {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    });

    // Initialize
    renderNav();
    await fetchFilters();
    await fetchStock();
});
