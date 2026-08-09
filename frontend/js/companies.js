document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('company-form');
    const tableBody = document.getElementById('company-table-body');
    const searchInput = document.getElementById('search-input');
    const formError = document.getElementById('form-error');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const saveBtn = form.querySelector('button[type="submit"]');
    const companyIdField = document.getElementById('company-id');
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
    let companies = [];
    let editingId = null;

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
            const classes = `nav-link${isActive ? ' active' : ''}`;
            return `<a class="${classes}" href="${item.href}" data-logout="${isLogout}">${item.label}</a>`;
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

    const setFormMode = (isEditing) => {
        formTitle.textContent = isEditing ? 'Edit Company' : 'Add Company';
        cancelEditBtn.classList.toggle('hidden', !isEditing);
        saveBtn.textContent = isEditing ? 'Update Company' : 'Save Company';
    };

    const resetForm = () => {
        form.reset();
        companyIdField.value = '';
        editingId = null;
        setFormMode(false);
        clearError();
    };

    const renderCompanies = () => {
        const search = searchInput.value.trim().toLowerCase();
        const filtered = companies.filter((company) => {
            const haystack = [company.company_name, company.contact_person || '', company.phone || '', company.email || '', company.gstin || ''].join(' ').toLowerCase();
            return !search || haystack.includes(search);
        });

        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No companies found.</td></tr>';
            return;
        }

        tableBody.innerHTML = filtered.map((company) => `
            <tr>
                <td><strong>${company.company_name}</strong><br><small>${company.address || ''}</small></td>
                <td>${company.contact_person || '—'}</td>
                <td>${company.phone || '—'}</td>
                <td>${company.gstin || '—'}</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${company.company_id}" type="button">Edit</button>
                    <button class="delete-btn" data-id="${company.company_id}" type="button">Delete</button>
                </td>
            </tr>
        `).join('');
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/api/companies`, { headers: { Authorization: `Bearer ${token}` } });
            if (!response.ok) throw new Error('Unable to load companies.');
            companies = await response.json();
            renderCompanies();
        } catch (error) {
            showError(error.message);
        }
    };

    const saveCompany = async (event) => {
        event.preventDefault();
        clearError();

        const payload = {
            companyName: document.getElementById('companyName').value.trim(),
            contactPerson: document.getElementById('contactPerson').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            gstin: document.getElementById('gstin').value.trim(),
            address: document.getElementById('address').value.trim(),
        };

        if (!payload.companyName || !payload.address) {
            showError('Company name and address are required.');
            return;
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? `${apiBaseUrl}/api/companies/${editingId}` : `${apiBaseUrl}/api/companies`;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to save company.');
            resetForm();
            await fetchCompanies();
        } catch (error) {
            showError(error.message);
        }
    };

    const startEdit = async (id) => {
        const company = companies.find((item) => item.company_id === Number(id));
        if (!company) return;
        editingId = company.company_id;
        document.getElementById('company-id').value = company.company_id;
        document.getElementById('companyName').value = company.company_name;
        document.getElementById('contactPerson').value = company.contact_person || '';
        document.getElementById('phone').value = company.phone || '';
        document.getElementById('email').value = company.email || '';
        document.getElementById('gstin').value = company.gstin || '';
        document.getElementById('address').value = company.address || '';
        setFormMode(true);
        clearError();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteCompany = async (id) => {
        const confirmed = window.confirm('Delete this company permanently?');
        if (!confirmed) return;
        try {
            const response = await fetch(`${apiBaseUrl}/api/companies/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to delete company.');
            await fetchCompanies();
        } catch (error) {
            showError(error.message);
        }
    };

    form.addEventListener('submit', saveCompany);
    cancelEditBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', renderCompanies);
    tableBody.addEventListener('click', (event) => {
        const editButton = event.target.closest('.edit-btn');
        const deleteButton = event.target.closest('.delete-btn');
        if (editButton) return startEdit(editButton.dataset.id);
        if (deleteButton) return deleteCompany(deleteButton.dataset.id);
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
    await fetchCompanies();
});
