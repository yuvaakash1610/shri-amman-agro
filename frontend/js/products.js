document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('product-form');
    const categoryForm = document.getElementById('category-form');
    const unitForm = document.getElementById('unit-form');
    const tableBody = document.getElementById('product-table-body');
    const searchInput = document.getElementById('search-input');
    const companyFilter = document.getElementById('company-filter');
    const categoryFilter = document.getElementById('category-filter');
    const formError = document.getElementById('form-error');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveBtn = form.querySelector('button[type="submit"]');
    const companySelect = document.getElementById('companyId');
    const categorySelect = document.getElementById('categoryId');
    const unitSelect = document.getElementById('unitId');
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
    let products = [];
    let companies = [];
    let categories = [];
    let units = [];
    let editingId = null;

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

    const setFormMode = (isEditing) => {
        formTitle.textContent = isEditing ? 'Edit Product' : 'Add Product';
        cancelEditBtn.classList.toggle('hidden', !isEditing);
        saveBtn.textContent = isEditing ? 'Update Product' : 'Save Product';
    };

    const resetForm = () => {
        form.reset();
        document.getElementById('product-id').value = '';
        editingId = null;
        setFormMode(false);
        clearError();
    };

    const populateSelects = () => {
        companySelect.innerHTML = '<option value="">Select company</option>' + companies.map((company) => `<option value="${company.company_id}">${company.company_name}</option>`).join('');
        categorySelect.innerHTML = '<option value="">Select category</option>' + categories.map((category) => `<option value="${category.category_id}">${category.category_name}</option>`).join('');
        unitSelect.innerHTML = '<option value="">Select unit</option>' + units.map((unit) => `<option value="${unit.unit_id}">${unit.unit_name} (${unit.abbreviation})</option>`).join('');
        companyFilter.innerHTML = '<option value="">All Companies</option>' + companies.map((company) => `<option value="${company.company_id}">${company.company_name}</option>`).join('');
        categoryFilter.innerHTML = '<option value="">All Categories</option>' + categories.map((category) => `<option value="${category.category_id}">${category.category_name}</option>`).join('');
    };

    const renderProducts = () => {
        const search = searchInput.value.trim().toLowerCase();
        const companyValue = companyFilter.value;
        const categoryValue = categoryFilter.value;
        const filtered = products.filter((product) => {
            const haystack = [product.product_code, product.product_name, product.company_name || '', product.category_name || ''].join(' ').toLowerCase();
            const matchesSearch = !search || haystack.includes(search);
            const matchesCompany = !companyValue || String(product.company_id) === companyValue;
            const matchesCategory = !categoryValue || String(product.category_id) === categoryValue;
            return matchesSearch && matchesCompany && matchesCategory;
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No products found.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map((product) => `
            <tr>
                <td>${product.product_code}</td>
                <td><strong>${product.product_name}</strong><br><small>${product.description || ''}</small></td>
                <td>${product.company_name || '—'}</td>
                <td>${product.category_name || '—'}</td>
                <td>${product.unit_name || '—'} (${product.abbreviation || ''})</td>
                <td><span style="font-size:0.85rem; background:#eef7ef; color:#2F6B38; padding:2px 6px; border-radius:4px; font-weight:600;">${product.hsn_code || '—'}</span></td>
                <td><span style="font-size:0.85rem; background:#fef3c7; color:#92400e; padding:2px 6px; border-radius:4px; font-weight:600;">${product.gst_rate || 0}%</span></td>
                <td>${product.status || 'Active'}</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${product.product_id}" type="button">Edit</button>
                    <button class="delete-btn" data-id="${product.product_id}" type="button">Delete</button>
                </td>
            </tr>
        `).join('');
    };

    const fetchLookupData = async () => {
        const [companiesRes, categoriesRes, unitsRes] = await Promise.all([
            fetch(`${apiBaseUrl}/api/companies`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${apiBaseUrl}/api/products/categories`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${apiBaseUrl}/api/products/units`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        companies = await companiesRes.json();
        categories = await categoriesRes.json();
        units = await unitsRes.json();
        populateSelects();
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Unable to load products.');
            products = await response.json();
            renderProducts();
        } catch (error) {
            showError(error.message);
        }
    };

    const saveProduct = async (event) => {
        event.preventDefault();
        clearError();

        const payload = {
            productName: document.getElementById('productName').value.trim(),
            companyId: document.getElementById('companyId').value,
            categoryId: document.getElementById('categoryId').value,
            unitId: document.getElementById('unitId').value,
            description: document.getElementById('description').value.trim(),
            status: document.getElementById('status').value,
            hsnCode: document.getElementById('hsnCode').value.trim(),
            gstRate: document.getElementById('gstRate').value,
        };

        if (!payload.productName || !payload.companyId || !payload.categoryId || !payload.unitId) {
            showError('Product name, company, category, and unit are required.');
            return;
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${apiBaseUrl}/api/products/${editingId}` : `${apiBaseUrl}/api/products`;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save product.');
            resetForm();
            await fetchProducts();
        } catch (error) {
            showError(error.message);
        }
    };

    const createCategory = async (event) => {
        event.preventDefault();
        const payload = {
            categoryName: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim(),
        };
        if (!payload.categoryName) return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/products/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to add category.');
            categoryForm.reset();
            await fetchLookupData();
            await fetchProducts();
        } catch (error) {
            showError(error.message);
        }
    };

    const createUnit = async (event) => {
        event.preventDefault();
        const payload = {
            unitName: document.getElementById('unitName').value.trim(),
            abbreviation: document.getElementById('unitAbbreviation').value.trim(),
        };
        if (!payload.unitName || !payload.abbreviation) return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/products/units`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to add unit.');
            unitForm.reset();
            await fetchLookupData();
            await fetchProducts();
        } catch (error) {
            showError(error.message);
        }
    };

    const startEdit = (id) => {
        const product = products.find((item) => item.product_id === Number(id));
        if (!product) return;
        editingId = product.product_id;
        document.getElementById('product-id').value = product.product_id;
        document.getElementById('productName').value = product.product_name;
        document.getElementById('companyId').value = product.company_id || '';
        document.getElementById('categoryId').value = product.category_id || '';
        document.getElementById('unitId').value = product.unit_id || '';
        document.getElementById('description').value = product.description || '';
        document.getElementById('status').value = product.status || 'Active';
        document.getElementById('hsnCode').value = product.hsn_code || '';
        document.getElementById('gstRate').value = String(product.gst_rate || 0);
        setFormMode(true);
        clearError();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteProduct = async (id) => {
        const confirmed = window.confirm('Delete this product permanently?');
        if (!confirmed) return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete product.');
            await fetchProducts();
        } catch (error) {
            showError(error.message);
        }
    };

    form.addEventListener('submit', saveProduct);
    categoryForm.addEventListener('submit', createCategory);
    unitForm.addEventListener('submit', createUnit);
    cancelEditBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', renderProducts);
    companyFilter.addEventListener('change', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);
    tableBody.addEventListener('click', (event) => {
        const editButton = event.target.closest('.edit-btn');
        const deleteButton = event.target.closest('.delete-btn');
        if (editButton) return startEdit(editButton.dataset.id);
        if (deleteButton) return deleteProduct(deleteButton.dataset.id);
    });

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
    await fetchLookupData();
    await fetchProducts();
});
