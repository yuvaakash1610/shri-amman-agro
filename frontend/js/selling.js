document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'index.html'; return; }

    // ── DOM Refs ──────────────────────────────────────────────────────────────
    const tableBody     = document.getElementById('sale-table-body');
    const searchInput   = document.getElementById('search-input');
    const customerFilter = document.getElementById('customer-filter');
    const formError     = document.getElementById('form-error');
    const formSuccess   = document.getElementById('form-success');
    const submitSaleBtn = document.getElementById('submit-sale-btn');
    const topNav        = document.getElementById('top-nav');

    // Customer search
    const searchType          = document.getElementById('searchType');
    const searchValue         = document.getElementById('searchValue');
    const searchCustomerBtn   = document.getElementById('search-customer-btn');
    const customerSearchResults = document.getElementById('customer-search-results');
    const customerSearchArea  = document.getElementById('customer-search-area');
    const selectedCustomerCard = document.getElementById('selected-customer-card');
    const clearCustomerBtn    = document.getElementById('clear-customer-btn');
    const customerIdInput     = document.getElementById('customerId');
    const selCustName         = document.getElementById('sel-cust-name');
    const selCustPhone        = document.getElementById('sel-cust-phone');

    // Cart inputs
    const cartProductSelect   = document.getElementById('cartProductId');
    const cartStockIndicator  = document.getElementById('cartStockIndicator');
    const cartQtyInput        = document.getElementById('cartQty');
    const cartPriceInput      = document.getElementById('cartPrice');
    const cartGstSelect       = document.getElementById('cartGst');
    const addToCartBtn        = document.getElementById('add-to-cart-btn');

    // Cart UI
    const cartEmpty           = document.getElementById('cart-empty');
    const cartTableWrap       = document.getElementById('cart-table-wrap');
    const cartTbody           = document.getElementById('cart-tbody');
    const cartSummary         = document.getElementById('cart-summary');
    const cartCountBadge      = document.getElementById('cart-count-badge');

    // ── State ─────────────────────────────────────────────────────────────────
    let cartItems       = [];      // { productId, productName, productCode, hsnCode, quantity, sellingPrice, gstRate, cgst, sgst, lineTotal }
    let productMap      = {};      // productId -> product object (with stock, price, gstRate, hsnCode)
    let currentSalesData = [];

    // ── API Base ──────────────────────────────────────────────────────────────
    const getApiBaseUrl = () => {
        const cfg = (window.__API_BASE_URL__ || '').replace(/\/$/, '');
        if (cfg) return cfg;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            return `${window.location.protocol}//${window.location.hostname}:3000`;
        return window.location.origin;
    };
    const apiBaseUrl = getApiBaseUrl();

    // ── Helpers ───────────────────────────────────────────────────────────────
    const fmt = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

    const showMsg = (msg, isError = false) => {
        formError.classList.add('hidden');
        formSuccess.classList.add('hidden');
        if (!msg) return;
        if (isError) { formError.textContent = msg; formError.classList.remove('hidden'); }
        else { formSuccess.textContent = msg; formSuccess.classList.remove('hidden'); setTimeout(() => formSuccess.classList.add('hidden'), 5000); }
    };

    // ── Navbar ────────────────────────────────────────────────────────────────
    const renderNav = () => {
        if (window.renderGlobalNav) window.renderGlobalNav();
    };

    // ── Load Form Data ────────────────────────────────────────────────────────
    const loadFormData = async () => {
        try {
            const [custRes, prodRes] = await Promise.all([
                fetch(`${apiBaseUrl}/api/customers`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${apiBaseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (custRes.ok) {
                const customers = await custRes.json();
                customerFilter.innerHTML = '<option value="">All Customers</option>' +
                    customers.map(c => `<option value="${c.id}">${c.customer_name}</option>`).join('');
            }
            if (prodRes.ok) {
                const products = await prodRes.json();
                products.forEach(p => { productMap[p.product_id] = p; });
                cartProductSelect.innerHTML = '<option value="">Select product...</option>' +
                    products.map(p => `<option value="${p.product_id}">${p.product_name} (${p.product_code})</option>`).join('');
            }
        } catch { showMsg('Failed to load products/customers.', true); }
    };

    // ── Set today's date ──────────────────────────────────────────────────────
    document.getElementById('saleDate').valueAsDate = new Date();

    // ── Customer Search ───────────────────────────────────────────────────────
    searchCustomerBtn.addEventListener('click', async () => {
        const type = searchType.value;
        const val  = searchValue.value.trim();
        if (!val) { customerSearchResults.innerHTML = '<span style="color:red">Please enter a search value.</span>'; return; }
        customerSearchResults.innerHTML = 'Searching...';
        try {
            const res  = await fetch(`${apiBaseUrl}/api/customers/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ searchType: type, searchValue: val })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Search failed');
            if (data.length === 0) { customerSearchResults.innerHTML = '<span style="color:#6b7280">No customer found.</span>'; return; }
            customerSearchResults.innerHTML = data.map(c => `
                <div style="border:1px solid #ddd; padding:10px; margin-bottom:8px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                    <div><strong>${c.customer_name}</strong> (${c.customer_id})<br><small>Phone: ${c.phone_number} | Aadhaar: ${c.masked_aadhaar}</small></div>
                    <button type="button" class="primary-btn select-cust-btn" data-id="${c.id}" data-name="${c.customer_name}" data-phone="${c.phone_number}" style="padding:4px 10px; font-size:0.8rem;">Select</button>
                </div>`).join('');
            document.querySelectorAll('.select-cust-btn').forEach(btn =>
                btn.addEventListener('click', e => selectCustomer(e.target.dataset))
            );
        } catch (e) { customerSearchResults.innerHTML = `<span style="color:red">${e.message}</span>`; }
    });

    const selectCustomer = (dataset) => {
        customerIdInput.value = dataset.id;
        selCustName.textContent  = dataset.name;
        selCustPhone.textContent = dataset.phone;
        customerSearchArea.classList.add('hidden');
        selectedCustomerCard.classList.remove('hidden');
        checkSubmitReady();
    };

    clearCustomerBtn.addEventListener('click', () => {
        customerIdInput.value = '';
        customerSearchArea.classList.remove('hidden');
        selectedCustomerCard.classList.add('hidden');
        customerSearchResults.innerHTML = '';
        searchValue.value = '';
        checkSubmitReady();
    });

    // ── Product Selection → Auto-fill price + GST ─────────────────────────────
    cartProductSelect.addEventListener('change', async () => {
        const pid = cartProductSelect.value;
        cartStockIndicator.textContent = '';
        cartStockIndicator.className   = 'stock-indicator';
        cartQtyInput.disabled = true;
        cartQtyInput.value    = '';
        cartPriceInput.value  = '';
        cartQtyInput.removeAttribute('max');
        addToCartBtn.disabled = true;

        if (!pid) return;

        // Pre-fill GST rate from product definition
        const prod = productMap[pid];
        if (prod && prod.gst_rate) {
            const gstVal = String(parseFloat(prod.gst_rate));
            const opt    = cartGstSelect.querySelector(`option[value="${gstVal}"]`);
            if (opt) cartGstSelect.value = gstVal;
            else      cartGstSelect.value = '0';
        } else {
            cartGstSelect.value = '0';
        }

        try {
            // Stock check
            const stockRes = await fetch(`${apiBaseUrl}/api/stock/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (stockRes.ok) {
                const stock = await stockRes.json();
                const available = Number(stock.quantity);
                if (available === 0) {
                    cartStockIndicator.textContent = 'OUT OF STOCK!';
                    cartStockIndicator.className   = 'stock-indicator out-stock';
                } else {
                    cartStockIndicator.textContent = `In Stock: ${available}${available < 5 ? ' (LOW)' : ''}`;
                    cartStockIndicator.className   = available < 5 ? 'stock-indicator out-stock' : 'stock-indicator in-stock';
                    cartQtyInput.disabled = false;
                    cartQtyInput.max      = available;
                    addToCartBtn.disabled = false;
                }
            } else {
                cartStockIndicator.textContent = 'OUT OF STOCK!';
                cartStockIndicator.className   = 'stock-indicator out-stock';
            }

            // Auto-fill default selling price from Price Management
            const priceRes = await fetch(`${apiBaseUrl}/api/prices/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
            if (priceRes.ok) {
                const pricesData = await priceRes.json();
                let activePriceRecord = null;

                if (Array.isArray(pricesData) && pricesData.length > 0) {
                    activePriceRecord = pricesData.find(p => p.is_active === true || p.is_active === 'true') || pricesData[0];
                } else if (pricesData && typeof pricesData === 'object') {
                    activePriceRecord = pricesData;
                }

                if (activePriceRecord && activePriceRecord.selling_price !== undefined && activePriceRecord.selling_price !== null) {
                    cartPriceInput.value = parseFloat(activePriceRecord.selling_price);
                } else if (prod && prod.selling_price !== undefined && prod.selling_price !== null) {
                    cartPriceInput.value = parseFloat(prod.selling_price);
                }
            } else if (prod && prod.selling_price !== undefined && prod.selling_price !== null) {
                cartPriceInput.value = parseFloat(prod.selling_price);
            }
        } catch (err) {
            console.error('Error fetching stock or price:', err);
            cartStockIndicator.textContent = 'Error checking stock/price.';
            cartStockIndicator.className = 'stock-indicator out-stock';
        }
    });

    // ── Add to Cart ───────────────────────────────────────────────────────────
    addToCartBtn.addEventListener('click', () => {
        const pid   = cartProductSelect.value;
        const qty   = parseInt(cartQtyInput.value, 10);
        const price = parseFloat(cartPriceInput.value);
        const gst   = parseFloat(cartGstSelect.value) || 0;
        const max   = parseInt(cartQtyInput.max, 10);

        if (!pid)            return showMsg('Please select a product.', true);
        if (!qty || qty < 1) return showMsg('Quantity must be at least 1.', true);
        if (qty > max)       return showMsg(`Cannot add more than available stock (${max}).`, true);
        if (!price || price < 0) return showMsg('Enter a valid selling price.', true);

        const prod    = productMap[pid] || {};
        const subTotal = qty * price;
        const halfGst  = gst / 2;
        const cgst     = parseFloat(((subTotal * halfGst) / 100).toFixed(2));
        const sgst     = parseFloat(((subTotal * halfGst) / 100).toFixed(2));
        const lineTotal = parseFloat((subTotal + cgst + sgst).toFixed(2));

        // Check if product already in cart — merge
        const existing = cartItems.findIndex(i => i.productId == pid);
        if (existing >= 0) {
            const ex = cartItems[existing];
            const newQty = ex.quantity + qty;
            if (newQty > max) return showMsg(`Total cart quantity for this product would exceed stock (${max}).`, true);
            const newSub  = newQty * price;
            const newCgst = parseFloat(((newSub * halfGst) / 100).toFixed(2));
            const newSgst = parseFloat(((newSub * halfGst) / 100).toFixed(2));
            cartItems[existing] = { ...ex, quantity: newQty, cgst: newCgst, sgst: newSgst, lineTotal: parseFloat((newSub + newCgst + newSgst).toFixed(2)) };
        } else {
            cartItems.push({
                productId:   parseInt(pid),
                productName: prod.product_name || 'Unknown',
                productCode: prod.product_code || '',
                hsnCode:     prod.hsn_code || '',
                quantity:    qty,
                sellingPrice: price,
                gstRate:     gst,
                cgst, sgst,
                lineTotal
            });
        }

        showMsg('');
        renderCart();
        // Reset cart inputs
        cartProductSelect.value = '';
        cartQtyInput.value      = '';
        cartPriceInput.value    = '';
        cartGstSelect.value     = '0';
        cartQtyInput.disabled   = true;
        addToCartBtn.disabled   = true;
        cartStockIndicator.textContent = '';
    });

    // ── Render Cart Table ─────────────────────────────────────────────────────
    const renderCart = () => {
        cartCountBadge.textContent = `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`;

        if (cartItems.length === 0) {
            cartEmpty.classList.remove('hidden');
            cartTableWrap.classList.add('hidden');
            submitSaleBtn.disabled = true;
            return;
        }
        cartEmpty.classList.add('hidden');
        cartTableWrap.classList.remove('hidden');

        let subTotalAll = 0, cgstAll = 0, sgstAll = 0;
        cartItems.forEach(item => {
            subTotalAll += item.quantity * item.sellingPrice;
            cgstAll     += item.cgst;
            sgstAll     += item.sgst;
        });
        const grandTotal = subTotalAll + cgstAll + sgstAll;

        cartTbody.innerHTML = cartItems.map((item, idx) => `
            <tr>
                <td>
                    <strong style="font-size:0.83rem;">${item.productName}</strong>
                    ${item.hsnCode ? `<br><small style="color:#9ca3af;">HSN: ${item.hsnCode}</small>` : ''}
                </td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">${fmt(item.sellingPrice)}</td>
                <td style="text-align:right; font-size:0.8rem; color:#92400e;">
                    ${item.gstRate > 0 ? `${item.gstRate}%<br><small>C+S: ${fmt(item.cgst + item.sgst)}</small>` : '0%'}
                </td>
                <td style="text-align:right; font-weight:700; color:#2F6B38;">${fmt(item.lineTotal)}</td>
                <td><button class="remove-item-btn" data-idx="${idx}">✕</button></td>
            </tr>`).join('');

        // Remove buttons
        cartTbody.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                cartItems.splice(parseInt(btn.dataset.idx), 1);
                renderCart();
            });
        });

        // Summary
        const hasTax = cgstAll > 0 || sgstAll > 0;
        cartSummary.innerHTML = `
            <div class="summary-row"><span>Sub-total</span><span>${fmt(subTotalAll)}</span></div>
            ${hasTax ? `<div class="summary-row"><span>CGST</span><span>${fmt(cgstAll)}</span></div>
                        <div class="summary-row"><span>SGST</span><span>${fmt(sgstAll)}</span></div>` : ''}
            <div class="summary-row grand"><span>Grand Total</span><span>${fmt(grandTotal)}</span></div>`;

        checkSubmitReady();
    };

    // ── Check if sale can be submitted ────────────────────────────────────────
    const checkSubmitReady = () => {
        submitSaleBtn.disabled = !(customerIdInput.value && cartItems.length > 0);
    };

    // ── Submit Sale ───────────────────────────────────────────────────────────
    submitSaleBtn.addEventListener('click', async () => {
        if (!customerIdInput.value) return showMsg('Please select a customer.', true);
        if (cartItems.length === 0)  return showMsg('Cart is empty. Add at least one product.', true);

        submitSaleBtn.disabled   = true;
        submitSaleBtn.textContent = '⏳ Recording...';
        showMsg('');

        const payload = {
            customerId:    customerIdInput.value,
            saleDate:      document.getElementById('saleDate').value,
            invoiceNumber: document.getElementById('invoiceNumber').value.trim() || null,
            notes:         document.getElementById('notes').value.trim() || null,
            items: cartItems.map(item => ({
                productId:    item.productId,
                quantity:     item.quantity,
                sellingPrice: item.sellingPrice,
                gstRate:      item.gstRate
            }))
        };

        try {
            const res  = await fetch(`${apiBaseUrl}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to record sale');

            showMsg(`✓ Sale recorded! Invoice: ${data.invoiceNumber}`);
            cartItems = [];
            renderCart();
            clearCustomerBtn.click();
            document.getElementById('saleDate').valueAsDate = new Date();
            document.getElementById('notes').value = '';
            await loadSales();
        } catch (err) {
            showMsg(err.message, true);
        } finally {
            submitSaleBtn.textContent = '✓ Record Sale & Generate Invoice';
            checkSubmitReady();
        }
    });

    // ── Sales History ─────────────────────────────────────────────────────────
    const loadSales = async () => {
        try {
            const params = new URLSearchParams();
            if (searchInput.value.trim()) params.append('search', searchInput.value.trim());
            if (customerFilter.value)    params.append('customerId', customerFilter.value);

            const res  = await fetch(`${apiBaseUrl}/api/sales?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error();
            const data = await res.json();

            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No sales found.</td></tr>';
                currentSalesData = [];
                return;
            }
            currentSalesData = data;

            tableBody.innerHTML = data.map(s => {
                const items   = Array.isArray(s.items) ? s.items : [];
                const preview = items.slice(0, 2).map(i => `${i.product_name} x${i.quantity}`).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '');
                return `
                <tr>
                    <td>
                        <strong>${new Date(s.sale_date).toLocaleDateString('en-IN')}</strong><br>
                        <small style="color:#6b7280;">${s.invoice_number ? 'Inv: ' + s.invoice_number : 'No Invoice'}</small>
                    </td>
                    <td><strong>${s.customer_name}</strong></td>
                    <td style="font-size:0.85rem; color:#4b5563;">${preview}</td>
                    <td style="font-weight:700; color:#2F6B38;">${fmt(s.total_amount)}</td>
                    <td>
                        <div class="action-btns">
                            <button type="button" class="primary-btn generate-pdf-btn" data-id="${s.sale_id}" style="padding:4px 8px; font-size:0.78rem; background:#4B5563; border-color:#4B5563;">🖨️ PDF</button>
                            <button type="button" class="primary-btn thermal-btn" data-id="${s.sale_id}" style="padding:4px 8px; font-size:0.78rem; background:#7C3AED; border-color:#7C3AED;">🧾 Thermal</button>
                            <button type="button" class="primary-btn send-wa-btn" data-id="${s.sale_id}" style="padding:4px 8px; font-size:0.78rem; background:#10B981; border-color:#10B981;">💬 WA</button>
                        </div>
                    </td>
                </tr>`;
            }).join('');

            document.querySelectorAll('.generate-pdf-btn').forEach(btn => btn.addEventListener('click', e => handleGeneratePDF(e.target.dataset.id)));
            document.querySelectorAll('.thermal-btn').forEach(btn => btn.addEventListener('click', e => handleThermalPrint(e.target.dataset.id)));
            document.querySelectorAll('.send-wa-btn').forEach(btn => btn.addEventListener('click', e => handleSendWA(e.target.dataset.id)));

        } catch {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state" style="color:red">Failed to load sales.</td></tr>';
        }
    };

    // ── Populate A4 Invoice Template ──────────────────────────────────────────
    const populateInvoiceTemplate = (sale) => {
        document.getElementById('inv-number').textContent = sale.invoice_number || 'N/A';
        document.getElementById('inv-date').textContent   = new Date(sale.sale_date).toLocaleDateString('en-IN');
        document.getElementById('inv-cust-name').textContent  = sale.customer_name || '';
        document.getElementById('inv-cust-phone').textContent = sale.phone_number  || 'N/A';
        document.getElementById('inv-notes').textContent  = sale.notes || 'None';

        const items = Array.isArray(sale.items) ? sale.items : [];
        let subTotal = 0, totalCgst = 0, totalSgst = 0;

        document.getElementById('inv-items-tbody').innerHTML = items.map(item => {
            const sub  = parseFloat(item.quantity) * parseFloat(item.selling_price);
            const gst  = parseFloat(item.gst_rate) || 0;
            const cgst = parseFloat(item.cgst_amount) || 0;
            const sgst = parseFloat(item.sgst_amount) || 0;
            const tot  = parseFloat(item.total_amount) || (sub + cgst + sgst);
            subTotal   += sub;
            totalCgst  += cgst;
            totalSgst  += sgst;
            return `
            <tr>
                <td style="padding:9px 12px; border:1px solid #E5E7EB;"><strong>${item.product_name}</strong><br><small style="color:#6B7280;">${item.product_code}</small></td>
                <td style="padding:9px 12px; border:1px solid #E5E7EB; text-align:center;">${item.hsn_code || '—'}</td>
                <td style="padding:9px 12px; border:1px solid #E5E7EB; text-align:center;">${item.quantity}</td>
                <td style="padding:9px 12px; border:1px solid #E5E7EB; text-align:right;">${fmt(item.selling_price)}</td>
                <td style="padding:9px 12px; border:1px solid #E5E7EB; text-align:right;">${gst}%</td>
                <td style="padding:9px 12px; border:1px solid #E5E7EB; text-align:right;">${fmt(cgst + sgst)}</td>
                <td style="padding:9px 12px; border:1px solid #E5E7EB; text-align:right; font-weight:700;">${fmt(tot)}</td>
            </tr>`;
        }).join('');

        const grandTotal = subTotal + totalCgst + totalSgst;
        const hasTax     = totalCgst > 0 || totalSgst > 0;
        document.getElementById('inv-summary-tbody').innerHTML = `
            <tr><td style="padding:5px 10px; color:#4B5563;">Sub-total</td><td style="padding:5px 10px; text-align:right;">${fmt(subTotal)}</td></tr>
            ${hasTax ? `
            <tr><td style="padding:5px 10px; color:#4B5563;">CGST</td><td style="padding:5px 10px; text-align:right;">${fmt(totalCgst)}</td></tr>
            <tr><td style="padding:5px 10px; color:#4B5563;">SGST</td><td style="padding:5px 10px; text-align:right;">${fmt(totalSgst)}</td></tr>` : ''}
            <tr style="border-top:2px solid #2F6B38; font-weight:800; font-size:1.05em; color:#2F6B38;">
                <td style="padding:8px 10px;">Grand Total</td>
                <td style="padding:8px 10px; text-align:right;">${fmt(grandTotal)}</td>
            </tr>`;
    };

    // ── Generate A4 PDF ───────────────────────────────────────────────────────
    const generatePdfBlob = async (sale) => {
        populateInvoiceTemplate(sale);
        const element = document.getElementById('invoice-template').cloneNode(true);
        element.style.display = 'block';
        const opt = {
            margin:      0,
            filename:    `${sale.invoice_number || 'Invoice_' + sale.sale_id}.pdf`,
            image:       { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF:       { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        return { element, opt };
    };

    const handleGeneratePDF = async (saleId) => {
        const sale = currentSalesData.find(s => s.sale_id == saleId);
        if (!sale) return;
        const { element, opt } = await generatePdfBlob(sale);
        try { await html2pdf().set(opt).from(element).save(); }
        catch { alert('Failed to generate PDF.'); }
    };

    // ── Thermal Print ─────────────────────────────────────────────────────────
    const handleThermalPrint = (saleId) => {
        const sale = currentSalesData.find(s => s.sale_id == saleId);
        if (!sale) return;

        const items = Array.isArray(sale.items) ? sale.items : [];
        document.getElementById('th-inv-number').textContent  = sale.invoice_number || 'N/A';
        document.getElementById('th-inv-date').textContent    = new Date(sale.sale_date).toLocaleDateString('en-IN');
        document.getElementById('th-cust-name').textContent   = sale.customer_name || '';
        document.getElementById('th-cust-phone').textContent  = sale.phone_number  || '';

        let subTotal = 0, totalTax = 0;
        document.getElementById('th-items-tbody').innerHTML = items.map(item => {
            const sub = parseFloat(item.quantity) * parseFloat(item.selling_price);
            const tax = parseFloat(item.cgst_amount || 0) + parseFloat(item.sgst_amount || 0);
            const tot = parseFloat(item.total_amount) || (sub + tax);
            subTotal += sub; totalTax += tax;
            return `
            <tr>
                <td style="padding:2px 0;">${item.product_name}</td>
                <td style="text-align:center; padding:2px 2px;">${item.quantity}</td>
                <td style="text-align:right; padding:2px 2px;">₹${parseFloat(item.selling_price).toFixed(0)}</td>
                <td style="text-align:right; padding:2px 0;">₹${tot.toFixed(0)}</td>
            </tr>`;
        }).join('');

        const grandTotal = subTotal + totalTax;
        document.getElementById('th-summary').innerHTML = `
            <div style="display:flex; justify-content:space-between;"><span>Sub-total</span><span>₹${subTotal.toFixed(2)}</span></div>
            ${totalTax > 0 ? `<div style="display:flex; justify-content:space-between;"><span>GST</span><span>₹${totalTax.toFixed(2)}</span></div>` : ''}
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px;"><span>TOTAL</span><span>₹${grandTotal.toFixed(2)}</span></div>`;

        // Make thermal template visible for print, hide after
        const thermal = document.getElementById('thermal-template');
        thermal.style.display = 'block';
        window.print();
        thermal.style.display = 'none';
    };

    // ── WhatsApp availability cache ───────────────────────────────────────────
    let isWhatsAppAvailable = null;

    const checkWhatsAppAvailability = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/api/whatsapp/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 503 || res.status === 404) {
                isWhatsAppAvailable = false;
                return false;
            }
            const data = await res.json();
            if (data.available === false) {
                isWhatsAppAvailable = false;
                return false;
            }
            isWhatsAppAvailable = true;
            return true;
        } catch {
            isWhatsAppAvailable = false;
            return false;
        }
    };

    // ── Send WhatsApp ─────────────────────────────────────────────────────────
    const handleSendWA = async (saleId) => {
        const sale = currentSalesData.find(s => s.sale_id == saleId);
        if (!sale) return;
        if (!sale.phone_number) { alert('Customer has no phone number.'); return; }

        // Fast-fail if WhatsApp is known to be unavailable (e.g. on Vercel)
        if (isWhatsAppAvailable === false) {
            alert('WhatsApp sending is unavailable in cloud deployment. Please run the WhatsApp service locally.');
            return;
        }

        // Check availability if not yet cached
        if (isWhatsAppAvailable === null) {
            const avail = await checkWhatsAppAvailability();
            if (!avail) {
                alert('WhatsApp sending is unavailable in cloud deployment. Please run the WhatsApp service locally.');
                return;
            }
        }

        const btn = document.querySelector(`.send-wa-btn[data-id="${saleId}"]`);
        const origText = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = '⏳ Sending...';
            btn.disabled  = true;
        }

        try {
            populateInvoiceTemplate(sale);
            const element = document.getElementById('invoice-template').cloneNode(true);
            element.style.display = 'block';
            const opt = {
                margin: 0, filename: `${sale.invoice_number || 'Invoice_' + sale.sale_id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            const base64Pdf = await html2pdf().set(opt).from(element).outputPdf('datauristring');
            const message = `Hello ${sale.customer_name},\n\nThank you for your purchase at Shri Amman Agro Traders.\n\nInvoice: ${sale.invoice_number || 'N/A'}\nTotal Amount: ${fmt(sale.total_amount)}\n\nRegards,\nShri Amman Agro Traders`;
            const res = await fetch(`${apiBaseUrl}/api/whatsapp/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ phoneNumber: sale.phone_number, base64Pdf, filename: opt.filename, message })
            });

            // 503 / 404: WhatsApp not available in this deployment (e.g. Vercel serverless)
            if (res.status === 503 || res.status === 404) {
                isWhatsAppAvailable = false;
                alert('WhatsApp sending is unavailable in cloud deployment. Please run the WhatsApp service locally.');
                return;
            }

            const contentType = res.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await res.json() : {};

            if (data.available === false) {
                isWhatsAppAvailable = false;
                alert('WhatsApp sending is unavailable in cloud deployment. Please run the WhatsApp service locally.');
                return;
            }

            if (!res.ok) {
                const errMsg = data.error || data.message || 'Send failed';
                if (errMsg.includes('API endpoint not found') || errMsg.includes('serverless') || errMsg.includes('unavailable')) {
                    isWhatsAppAvailable = false;
                    alert('WhatsApp sending is unavailable in cloud deployment. Please run the WhatsApp service locally.');
                    return;
                }
                throw new Error(errMsg);
            }

            alert('\u2713 WhatsApp invoice sent!');
        } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('API endpoint not found') || errMsg.includes('serverless') || errMsg.includes('unavailable')) {
                alert('WhatsApp sending is unavailable in cloud deployment. Please run the WhatsApp service locally.');
            } else {
                alert(`Failed: ${errMsg}`);
            }
        } finally {
            if (btn) {
                btn.innerHTML = origText;
                btn.disabled  = false;
            }
        }
    };

    // ── Event Listeners ───────────────────────────────────────────────────────
    searchInput.addEventListener('input', () => {
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(loadSales, 300);
    });
    customerFilter.addEventListener('change', loadSales);
    topNav.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-logout="true"]');
        if (link) { event.preventDefault(); localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html'; }
    });

    // ── Init ──────────────────────────────────────────────────────────────────
    renderNav();
    await loadFormData();
    await loadSales();
    checkWhatsAppAvailability();
});
