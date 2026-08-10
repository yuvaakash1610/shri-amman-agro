document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('sale-form');
    const tableBody = document.getElementById('sale-table-body');
    const searchInput = document.getElementById('search-input');
    const customerFilter = document.getElementById('customer-filter');
    const formError = document.getElementById('form-error');
    const formSuccess = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    
    // Customer Search UI
    const searchType = document.getElementById('searchType');
    const searchValue = document.getElementById('searchValue');
    const searchCustomerBtn = document.getElementById('search-customer-btn');
    const customerSearchResults = document.getElementById('customer-search-results');
    const customerSearchArea = document.getElementById('customer-search-area');
    const selectedCustomerCard = document.getElementById('selected-customer-card');
    const clearCustomerBtn = document.getElementById('clear-customer-btn');
    
    // Selected Customer Fields
    const customerSelect = document.getElementById('customerId'); // hidden input now
    const selCustName = document.getElementById('sel-cust-name');
    const selCustId = document.getElementById('sel-cust-id');
    const selCustPhone = document.getElementById('sel-cust-phone');
    const selCustAadhaar = document.getElementById('sel-cust-aadhaar');


    // Sale Details Fields
    const productSelect = document.getElementById('productId');
    const stockIndicator = document.getElementById('stockIndicator');
    const qtyInput = document.getElementById('quantity');
    const priceInput = document.getElementById('sellingPrice');
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
    document.getElementById('saleDate').valueAsDate = new Date();

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
        topNav.innerHTML = navItems.map((item) => {
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
            const [custRes, prodRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            if (custRes.ok) {
                const customers = await custRes.json();
                customerFilter.innerHTML = '<option value="">All Customers</option>' + customers.map(c => `<option value="${c.id}">${c.customer_name}</option>`).join('');
            }
            if (prodRes.ok) {
                const products = await prodRes.json();
                productSelect.innerHTML = '<option value="">Select Product</option>' + products.map(p => `<option value="${p.product_id}">${p.product_name} (${p.product_code})</option>`).join('');
            }
        } catch (error) {
            showMsg('Failed to load products/customers.', true);
        }
    };

    // --- Customer Search & Selection ---

    searchCustomerBtn.addEventListener('click', async () => {
        const type = searchType.value;
        const val = searchValue.value.trim();
        if (!val) {
            customerSearchResults.innerHTML = '<span style="color:red">Please enter search value.</span>';
            return;
        }

        customerSearchResults.innerHTML = 'Searching...';
        try {
            const res = await fetch(`${apiBaseUrl}/api/customers/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ searchType: type, searchValue: val })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Search failed');
            
            if (data.length === 0) {
                customerSearchResults.innerHTML = '<span style="color:#6b7280">No customer found. Try different details or add a new customer.</span>';
                return;
            }

            customerSearchResults.innerHTML = data.map(c => `
                <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>${c.customer_name}</strong> (${c.customer_id})<br>
                        <small>Phone: ${c.phone_number} | Aadhaar: ${c.masked_aadhaar}</small>
                    </div>
                    <button type="button" class="primary-btn select-cust-btn" data-id="${c.id}" data-name="${c.customer_name}" data-cid="${c.customer_id}" data-phone="${c.phone_number}" data-aadhaar="${c.masked_aadhaar}" style="padding:4px 10px; font-size:0.8rem;">Select</button>
                </div>
            `).join('');

            document.querySelectorAll('.select-cust-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    selectCustomer(e.target.dataset);
                });
            });
        } catch (e) {
            customerSearchResults.innerHTML = `<span style="color:red">${e.message}</span>`;
        }
    });

    const selectCustomer = (dataset) => {
        customerSelect.value = dataset.id;
        selCustName.textContent = dataset.name;
        selCustId.textContent = dataset.cid;
        selCustPhone.textContent = dataset.phone;
        selCustAadhaar.textContent = dataset.aadhaar;
        
        customerSearchArea.classList.add('hidden');
        selectedCustomerCard.classList.remove('hidden');
        checkSaleReady();
    };

    clearCustomerBtn.addEventListener('click', () => {
        customerSelect.value = '';
        customerSearchArea.classList.remove('hidden');
        selectedCustomerCard.classList.add('hidden');
        customerSearchResults.innerHTML = '';
        searchValue.value = '';
        checkSaleReady();
    });


    // --- Product Selection & Stock Check ---
    productSelect.addEventListener('change', async () => {
        const pid = productSelect.value;
        if (!pid) {
            stockIndicator.textContent = 'Select a product to check stock.';
            stockIndicator.className = 'stock-indicator';
            qtyInput.disabled = true;
            qtyInput.value = '';
            qtyInput.removeAttribute('max');
            checkSaleReady();
            return;
        }

        stockIndicator.textContent = 'Checking stock...';
        stockIndicator.className = 'stock-indicator';
        
        try {
            const stockRes = await fetch(`${apiBaseUrl}/api/stock/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (stockRes.ok) {
                const stock = await stockRes.json();
                const available = Number(stock.quantity);
                
                if (available === 0) {
                    stockIndicator.textContent = 'OUT OF STOCK!';
                    stockIndicator.className = 'stock-indicator out-stock';
                    qtyInput.disabled = true;
                    qtyInput.value = '';
                } else if (available < 5) {
                    stockIndicator.textContent = `Available Stock: ${available} - (LOW STOCK WARNING)`;
                    stockIndicator.className = 'stock-indicator out-stock'; // reuse red color for warning
                    qtyInput.disabled = false;
                    qtyInput.max = available;
                } else {
                    stockIndicator.textContent = `Available Stock: ${available} (IN STOCK)`;
                    stockIndicator.className = 'stock-indicator in-stock';
                    qtyInput.disabled = false;
                    qtyInput.max = available;
                }
            } else if (stockRes.status === 404) {
                stockIndicator.textContent = 'OUT OF STOCK (No stock record)!';
                stockIndicator.className = 'stock-indicator out-stock';
                qtyInput.disabled = true;
                qtyInput.value = '';
            }

            // Fetch Selling Price
            const priceRes = await fetch(`${apiBaseUrl}/api/prices/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (priceRes.ok) {
                const priceData = await priceRes.json();
                if (priceData && priceData.selling_price) {
                    priceInput.value = priceData.selling_price;
                }
            }
            calculateTotal();
            checkSaleReady();
        } catch (e) {
            stockIndicator.textContent = 'Error checking stock.';
            stockIndicator.className = 'stock-indicator out-stock';
            qtyInput.disabled = true;
            checkSaleReady();
        }
    });

    const checkSaleReady = () => {
        if (customerSelect.value && productSelect.value && !qtyInput.disabled) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    };


    // --- Sale Submission & Invoice ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const q = parseInt(qtyInput.value);
        const max = parseInt(qtyInput.max);
        if (q > max) {
            showMsg(`Cannot sell more than available stock (${max}).`, true);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Recording...';
        showMsg('');

        const payload = {
            customerId: customerSelect.value,
            productId: productSelect.value,
            saleDate: document.getElementById('saleDate').value,
            invoiceNumber: document.getElementById('invoiceNumber').value.trim(),
            quantity: qtyInput.value,
            sellingPrice: priceInput.value,
            notes: document.getElementById('notes').value.trim()
        };

        try {
            const res = await fetch(`${apiBaseUrl}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to record sale');
            
            showMsg(`Sale recorded successfully! Stock has been updated.`);
            showMsg('Sale recorded successfully! Stock has been updated.');

            // Reset form details
            form.reset();
            document.getElementById('saleDate').valueAsDate = new Date();
            clearCustomerBtn.click(); // resets customer selection
            
            // Re-trigger product change to refresh stock
            const event = new Event('change');
            productSelect.dispatchEvent(event);
            
            calculateTotal();
            loadSales();
        } catch (err) {
            showMsg(err.message, true);
            submitBtn.disabled = false;
        } finally {
            submitBtn.textContent = 'Record Sale';
        }
    });


    // --- Sales History ---
    const loadSales = async () => {
        try {
            const params = new URLSearchParams();
            if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
            if (customerFilter.value) params.append('customerId', customerFilter.value);

            const res = await fetch(`${apiBaseUrl}/api/sales?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error();
            const data = await res.json();
            
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">No sales found.</td></tr>';
                return;
            }

            tableBody.innerHTML = data.map(s => `
                <tr>
                    <td>
                        <strong>${new Date(s.sale_date).toLocaleDateString()}</strong><br>
                        <small style="color:#6b7280">${s.invoice_number ? 'Inv: ' + s.invoice_number : 'No Invoice'}</small>
                    </td>
                    <td>
                        <strong>${s.product_name}</strong> <small>(${s.product_code})</small><br>
                        <span style="color:#6b7280; font-size:0.85rem">${s.customer_name}</span>
                    </td>
                    <td>${s.quantity} x ${formatCurrency(s.selling_price)}</td>
                    <td style="font-weight:600; color:#2F6B38">${formatCurrency(s.total_amount)}</td>
                </tr>
            `).join('');

        } catch (e) {
            tableBody.innerHTML = '<tr><td colspan="4" class="empty-state" style="color:red">Failed to load sales.</td></tr>';
        }
    };

    searchInput.addEventListener('input', () => { clearTimeout(window.searchTimeout); window.searchTimeout = setTimeout(loadSales, 300); });
    customerFilter.addEventListener('change', loadSales);

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
    await loadSales();
});
