document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('customer-form');
    const tableBody = document.getElementById('customer-table-body');
    const searchInput = document.getElementById('search-input');
    const typeFilter = document.getElementById('type-filter');
    const customerCount = document.getElementById('customer-count');
    const filterLabel = document.getElementById('filter-label');
    const formError = document.getElementById('form-error');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveBtn = form.querySelector('button[type="submit"]');
    const customerIdField = document.getElementById('customer-id');

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
    let customers = [];
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
    let editingId = null;

    const showError = (message) => {
        formError.textContent = message;
        formError.classList.remove('hidden');
    };

    const clearError = () => {
        formError.textContent = '';
        formError.classList.add('hidden');
    };

    const setFormMode = (isEditing) => {
        formTitle.textContent = isEditing ? 'Edit Customer' : 'Add Customer';
        cancelEditBtn.classList.toggle('hidden', !isEditing);
        saveBtn.textContent = isEditing ? 'Update Customer' : 'Save Customer';
    };

    const resetForm = () => {
        form.reset();
        customerIdField.value = '';
        editingId = null;
        setFormMode(false);
        clearError();
    };

    const renderCustomers = () => {
        const search = searchInput.value.trim().toLowerCase();
        const type = typeFilter.value;
        const filtered = customers.filter((customer) => {
            const matchesSearch = !search || [customer.customer_id, customer.customer_name, customer.phone_number, customer.aadhaar_number, customer.email || '', customer.customer_type]
                .join(' ')
                .toLowerCase()
                .includes(search);
            const matchesType = !type || customer.customer_type === type;
            return matchesSearch && matchesType;
        });

        customerCount.textContent = filtered.length;
        filterLabel.textContent = type || 'All';

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No customers found.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map((customer) => `
            <tr>
                <td>${customer.customer_id}</td>
                <td>${customer.customer_name}</td>
                <td>${customer.phone_number}</td>
                <td>${customer.aadhaar_number}</td>
                <td><span class="pill">${customer.customer_type}</span></td>
                <td class="actions">
                    <button class="edit-btn" data-id="${customer.id}" type="button">Edit</button>
                    <button class="delete-btn" data-id="${customer.id}" type="button">Delete</button>
                </td>
            </tr>
        `).join('');
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/customers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Unable to load customers.');
            customers = await response.json();
            renderCustomers();
        } catch (error) {
            showError(error.message);
        }
    };

    const saveCustomer = async (event) => {
        event.preventDefault();
        clearError();

        const payload = {
            customerName: document.getElementById('customerName').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            aadhaarNumber: document.getElementById('aadhaarNumber').value.trim(),
            email: document.getElementById('email').value.trim(),
            customerType: document.getElementById('customerType').value,
            address: document.getElementById('address').value.trim(),
        };

        if (!payload.customerName || !payload.phoneNumber || !payload.aadhaarNumber || !payload.address || !payload.customerType) {
            showError('Please fill in all required fields.');
            return;
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${apiBaseUrl}/api/customers/${editingId}` : `${apiBaseUrl}/api/customers`;
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save customer.');
            resetForm();
            await fetchCustomers();
        } catch (error) {
            showError(error.message);
        }
    };

    const startEdit = async (id) => {
        const customer = customers.find((item) => item.id === Number(id));
        if (!customer) return;
        editingId = customer.id;
        document.getElementById('customer-id').value = customer.id;
        document.getElementById('customerName').value = customer.customer_name;
        document.getElementById('phoneNumber').value = customer.phone_number;
        document.getElementById('aadhaarNumber').value = customer.aadhaar_number;
        document.getElementById('email').value = customer.email || '';
        document.getElementById('customerType').value = customer.customer_type;
        document.getElementById('address').value = customer.address;
        setFormMode(true);
        clearError();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteCustomer = async (id) => {
        const confirmed = window.confirm('Delete this customer permanently?');
        if (!confirmed) return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/customers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete customer.');
            await fetchCustomers();
        } catch (error) {
            showError(error.message);
        }
    };

    form.addEventListener('submit', saveCustomer);
    cancelEditBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', renderCustomers);
    typeFilter.addEventListener('change', renderCustomers);

    tableBody.addEventListener('click', (event) => {
        const editButton = event.target.closest('.edit-btn');
        const deleteButton = event.target.closest('.delete-btn');
        if (editButton) return startEdit(editButton.dataset.id);
        if (deleteButton) return deleteCustomer(deleteButton.dataset.id);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
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
    await fetchCustomers();
});
