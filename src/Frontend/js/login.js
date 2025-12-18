document.addEventListener('DOMContentLoaded', () => {

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('message');

    // Auto-fill Email if Saved
    const savedEmail = localStorage.getItem('finsight_saved_email');
    if (savedEmail) {
        const emailInput = document.getElementById('email');
        const rememberCheckbox = document.getElementById('remember');
        if (emailInput) emailInput.value = savedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            messageBox.classList.add('d-none');
            messageBox.textContent = '';

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const loginBtn = loginForm.querySelector('button[type="submit"]');

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Basic Validation
            if (!email || !password) {
                showError('Email and Password are required.');
                return;
            }

            // Remember Me Logic (Save Email)
            const rememberCheckbox = document.getElementById('remember');
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('finsight_saved_email', email);
            } else {
                localStorage.removeItem('finsight_saved_email');
            }

            // UI Loading State
            const originalBtnText = loginBtn.textContent;
            loginBtn.disabled = true;
            loginBtn.textContent = 'Signing In...';

            try {
                // Actual API Call
                const result = await APIClient.post('/auth/login', { email, password });

                if (result.success) {
                    // Success: Store Token & User
                    localStorage.setItem('finsight_token', result.data.token);
                    localStorage.setItem('finsight_user', JSON.stringify(result.data.user));

                    // Redirect to Dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    // API Error (e.g. Wrong password)
                    showError(result.message || 'Login failed.');
                }
            } catch (error) {
                console.error("Login Error:", error);
                showError('An error occurred. Please try again.');
            } finally {
                // Reset UI
                loginBtn.disabled = false;
                loginBtn.textContent = originalBtnText;
            }
        });
    }

    function showError(msg) {
        messageBox.textContent = msg;
        messageBox.classList.remove('d-none');
    }

    // Check Auto-Login
    const token = localStorage.getItem('finsight_token');
    if (token) {
        // Optional: Validate token with backend if needed, or just redirect
        // window.location.href = 'dashboard.html'; 
    }
});
