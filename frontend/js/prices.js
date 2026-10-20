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

    const renderNav = () => {
        if (window.renderGlobalNav) window.renderGlobalNav();
    };

    const showError = (message) => {
        formError.textContent = message;
        formError.classList.remove('hidden');
    };

    const clearError = () => {
        formError.textContent = '';
        formError.classList.add('hidden');
    };

    const showToast = (message, type = 'success') => {
        let toast = document.getElementById('price-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'price-toast';
            toast.style.cssText = 'position:fixed;bottom:24px;right:24px;padding:14px 24px;border-radius:12px;font-weight:600;font-size:0.95rem;z-index:9999;opacity:0;transition:opacity 0.3s;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.15);';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        if (type === 'success') {
            toast.style.background = '#065f46';
            toast.style.color = '#fff';
        } else if (type === 'error') {
            toast.style.background = '#991b1b';
            toast.style.color = '#fff';
        } else {
            toast.style.background = '#92400e';
            toast.style.color = '#fff';
        }
        toast.style.opacity = '1';
        setTimeout(() => { toast.style.opacity = '0'; }, 3000);
    };

    const populateProducts = () => {
        productSelect.innerHTML = '<option value="">Select product</option>' + products.map((product) => `<option value="${product.product_id}">${product.product_name} (${product.product_code})</option>`).join('');
    };

    const formatCurrency = (val) => {
        const num = Number(val || 0);
        return num.toFixed(2);
    };

    // ── Inline edit handler ──────────────────────────────────────────────────
    const startInlineEdit = (item) => {
        const row = document.getElementById(`price-row-${item.product_id}`);
        if (!row) return;

        const purchasePrice = Number(item.purchase_price || item.latest_purchase_price || 0);
        const sellingPrice = Number(item.selling_price || 0);

        row.innerHTML = `
            <td><strong>${item.product_name}</strong><br><small>${item.product_code}</small></td>
            <td>${item.company_name || '—'}</td>
            <td>
                <input type="number" id="inline-purchase-${item.product_id}" value="${purchasePrice}" min="0" step="0.01"
                    style="width:90px;padding:6px 8px;border:1.5px solid #2F6B38;border-radius:8px;font-family:inherit;font-size:0.9rem;background:#f0fdf4;">
            </td>
            <td>
                <input type="number" id="inline-selling-${item.product_id}" value="${sellingPrice}" min="0" step="0.01"
                    style="width:90px;padding:6px 8px;border:1.5px solid #2F6B38;border-radius:8px;font-family:inherit;font-size:0.9rem;background:#f0fdf4;">
            </td>
            <td style="white-space:nowrap;">
                <button onclick="window.__saveInlinePrice(${item.product_id})" style="padding:5px 12px;background:#2F6B38;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;margin-right:4px;">Save</button>
                <button onclick="window.__cancelInlineEdit()" style="padding:5px 12px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:8px;cursor:pointer;font-weight:600;font-size:0.82rem;">Cancel</button>
            </td>
        `;
    };

    window.__saveInlinePrice = async (productId) => {
        const purchaseInput = document.getElementById(`inline-purchase-${productId}`);
        const sellingInput = document.getElementById(`inline-selling-${productId}`);
        if (!purchaseInput || !sellingInput) return;

        const purchasePrice = purchaseInput.value;
        const sellingPrice = sellingInput.value;

        if (purchasePrice === '' || sellingPrice === '') {
            showToast('Both prices are required.', 'error');
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/prices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId, purchasePrice, sellingPrice }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update price.');
            showToast('✅ Price updated successfully!');
            await fetchPrices();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    window.__cancelInlineEdit = () => {
        renderPrices();
    };

    window.__editPrice = (productId) => {
        const item = prices.find(p => p.product_id === productId);
        if (item) startInlineEdit(item);
    };

    // ── Render prices table ──────────────────────────────────────────────────
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

        tableBody.innerHTML = filtered.map((item) => {
            // Use latest_purchase_price from purchasing if product_prices has no value
            const purchasePrice = Number(item.purchase_price || item.latest_purchase_price || 0);
            const sellingPrice = Number(item.selling_price || 0);
            const hasPrice = item.price_id != null;
            const hasPurchaseData = item.latest_purchase_price != null && Number(item.latest_purchase_price) > 0;

            let statusPill = '';
            if (hasPrice && item.is_active) {
                statusPill = '<span class="pill" style="background:#d1fae5;color:#065f46;">Active</span>';
            } else if (hasPrice) {
                statusPill = '<span class="pill" style="background:#fef3c7;color:#92400e;">Historical</span>';
            } else if (hasPurchaseData) {
                statusPill = '<span class="pill" style="background:#dbeafe;color:#1e40af;">From Purchase</span>';
            } else {
                statusPill = '<span class="pill" style="background:#f3f4f6;color:#6b7280;">No Price</span>';
            }

            // Highlight purchase price source
            let purchaseDisplay = formatCurrency(purchasePrice);
            if (!hasPrice && hasPurchaseData) {
                purchaseDisplay = `<span style="color:#2563eb;font-weight:600;" title="Auto-filled from latest purchase">${formatCurrency(purchasePrice)}</span>`;
            } else if (purchasePrice > 0) {
                purchaseDisplay = `<span style="font-weight:600;">${formatCurrency(purchasePrice)}</span>`;
            }

            return `
            <tr id="price-row-${item.product_id}">
                <td><strong>${item.product_name}</strong><br><small>${item.product_code}</small></td>
                <td>${item.company_name || '—'}</td>
                <td>${purchaseDisplay}</td>
                <td style="font-weight:600;">${formatCurrency(sellingPrice)}</td>
                <td style="white-space:nowrap;">
                    ${statusPill}
                    <button onclick="window.__editPrice(${item.product_id})" title="Edit price"
                        style="margin-left:8px;padding:4px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600;color:#2F6B38;transition:all 0.2s;"
                        onmouseover="this.style.background='#2F6B38';this.style.color='#fff';"
                        onmouseout="this.style.background='#f0fdf4';this.style.color='#2F6B38';">
                        ✏️ Edit
                    </button>
                </td>
            </tr>`;
        }).join('');
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

    // When product is selected in the form, auto-fill the purchase price from the latest data
    productSelect.addEventListener('change', async (event) => {
        const selectedId = event.target.value;
        fetchPriceHistory(selectedId);

        if (selectedId) {
            const item = prices.find(p => String(p.product_id) === String(selectedId));
            const purchaseInput = document.getElementById('purchasePrice');
            if (item) {
                const latestPurchase = Number(item.purchase_price || item.latest_purchase_price || 0);
                if (latestPurchase > 0) {
                    purchaseInput.value = latestPurchase;
                }
                const latestSelling = Number(item.selling_price || 0);
                if (latestSelling > 0) {
                    document.getElementById('sellingPrice').value = latestSelling;
                }
            }
        }
    });

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
            showToast('✅ Price saved successfully!');
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
