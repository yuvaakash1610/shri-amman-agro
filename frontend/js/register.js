document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const errorAlert = document.getElementById('error-message');
    const submitBtn = document.getElementById('register-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');

    const showError = (message) => {
        errorAlert.textContent = message;
        errorAlert.classList.remove('hidden');
    };

    const hideError = () => {
        errorAlert.classList.add('hidden');
        errorAlert.textContent = '';
    };

    const setLoading = (isLoading) => {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }
        
        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please try again.');
            }

            // Save token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';

        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    });
});
