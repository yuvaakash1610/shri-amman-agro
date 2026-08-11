document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('purchase-form');
    const tableBody = document.getElementById('purchase-table-body');
    const searchInput = document.getElementById('search-input');
    const companyFilter = document.getElementById('company-filter');
    const formError = document.getElementById('form-error');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    
    const companySelect = document.getElementById('companyId');
    const productSelect = document.getElementById('productId');
    const qtyInput = document.getElementById('quantity');
    const priceInput = document.getElementById('purchasePrice');
    const totalDisplay = document.getElementById('totalAmountDisplay');
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
    let allProducts = [];

    // Setup Date
    document.getElementById('purchaseDate').valueAsDate = new Date();

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
        topNav.innerHTML = `<div class="navbar-brand" style="display:flex; align-items:center; gap:8px;"><img src="images/logo.png" style="height:32px; width:32px; object-fit:contain;"> Shri Amman Agro</div>` + navItems.map((item) => {
            const isActive = currentPage === item.href || (currentPage === '' && item.href === 'dashboard.html');
            const isLogout = item.label === 'Logout';
            return `<a class="nav-link${isActive ? ' active' : ''}" href="${item.href}" data-logout="${isLogout}">${item.label}</a>`;
        }).join('');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const calculateTotal = () => {
        const q = parseFloat(qtyInput.value) || 0;
        const p = parseFloat(priceInput.value) || 0;
        totalDisplay.textContent = formatCurrency(q * p);
    };

    qtyInput.addEventListener('input', calculateTotal);
    priceInput.addEventListener('input', calculateTotal);

    const showMsg = (msg, isError = false) => {
        formError.classList.add('hidden');
        formSuccess.classList.add('hidden');
        if (isError) {
            formError.textContent = msg;
            formError.classList.remove('hidden');
        } else {
            formSuccess.textContent = msg;
            formSuccess.classList.remove('hidden');
            setTimeout(() => formSuccess.classList.add('hidden'), 5000);
        }
    };

    const loadFormData = async () => {
        try {
            const [compRes, prodRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/companies`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            if (compRes.ok) {
                const companies = await compRes.json();
                const opts = '<option value="">Select Company</option>' + companies.map(c => `<option value="${c.company_id}">${c.company_name}</option>`).join('');
                companySelect.innerHTML = opts;
                companyFilter.innerHTML = '<option value="">All Companies</option>' + companies.map(c => `<option value="${c.company_id}">${c.company_name}</option>`).join('');
            }
            if (prodRes.ok) {
                allProducts = await prodRes.json();
            }
        } catch (error) {
            showMsg('Failed to load companies/products.', true);
        }
    };

    companySelect.addEventListener('change', () => {
        const cid = companySelect.value;
        if (!cid) {
            productSelect.innerHTML = '<option value="">Select Company First</option>';
            productSelect.disabled = true;
            return;
        }
        const filtered = allProducts.filter(p => p.company_id == cid);
        productSelect.innerHTML = '<option value="">Select Product</option>' + filtered.map(p => `<option value="${p.product_id}">${p.product_name} (${p.product_code})</option>`).join('');
        productSelect.disabled = false;
    });

    // Auto-fill recent price when product selected
    productSelect.addEventListener('change', async () => {
        const pid = productSelect.value;
        if (!pid) return;
        try {
            const res = await fetch(`${apiBaseUrl}/api/prices/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                if (data && data.purchase_price) {
                    priceInput.value = data.purchase_price;
                    calculateTotal();
                }
            }
        } catch (e) {} // ignore errors
    });

    const loadPurchases = async () => {
        try {
            const params = new URLSearchParams();
            if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
            if (companyFilter.value) params.append('companyId', companyFilter.value);

            const res = await fetch(`${apiBaseUrl}/api/purchases?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No purchases found.</td></tr>';
                return;
            }

            tableBody.innerHTML = data.map(p => `
                <tr>
                    <td>
                        <strong>${new Date(p.purchase_date).toLocaleDateString()}</strong><br>
                        <small style="color:#6b7280">${p.invoice_number ? 'Inv: ' + p.invoice_number : 'No Invoice'}</small>
                    </td>
                    <td>
                        <strong>${p.product_name}</strong> <small>(${p.product_code})</small><br>
                        <span style="color:#6b7280; font-size:0.85rem">${p.company_name}</span>
                    </td>
                    <td>${p.quantity} x ${formatCurrency(p.purchase_price)}</td>
                    <td style="font-weight:600; color:#2F6B38">${formatCurrency(p.total_amount)}</td>
                </tr>
            `).join('');

        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="4" class="empty-state" style="color:red">Failed to load purchases.</td></tr>';
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Recording...';
        showMsg('');

        const payload = {
            companyId: companySelect.value,
            productId: productSelect.value,
            purchaseDate: document.getElementById('purchaseDate').value,
            invoiceNumber: document.getElementById('invoiceNumber').value.trim(),
            quantity: qtyInput.value,
            purchasePrice: priceInput.value,
            notes: document.getElementById('notes').value.trim()
        };

        try {
            const res = await fetch(`${apiBaseUrl}/api/purchases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to record purchase');
            
            showMsg(`Purchase recorded successfully! Stock has been updated. (ID: ${data.purchaseId})`);
            form.reset();
            document.getElementById('purchaseDate').valueAsDate = new Date();
            productSelect.innerHTML = '<option value="">Select Company First</option>';
            productSelect.disabled = true;
            calculateTotal();
            loadPurchases();
        } catch (err) {
            showMsg(err.message, true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Record Purchase';
        }
    });

    searchInput.addEventListener('input', () => { clearTimeout(window.searchTimeout); window.searchTimeout = setTimeout(loadPurchases, 300); });
    companyFilter.addEventListener('change', loadPurchases);

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
    await loadFormData();
    await loadPurchases();
});
