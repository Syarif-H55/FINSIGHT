// Initialize Lucide icons
lucide.createIcons();

// Get DOM elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('toggle-password');
const rememberMeCheckbox = document.getElementById('remember-me');
const loginBtn = document.getElementById('login-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    const icon = togglePasswordBtn.querySelector('i');
    icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
    lucide.createIcons();
});

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    lucide.createIcons();
}

// Hide error message
function hideError() {
    errorMessage.classList.add('hidden');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Validation
    if (!email) {
        showError('Email harus diisi');
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showError('Format email tidak valid');
        emailInput.focus();
        return;
    }

    if (!password) {
        showError('Password harus diisi');
        passwordInput.focus();
        return;
    }

    if (password.length < 8) {
        showError('Password minimal 8 karakter');
        passwordInput.focus();
        return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.querySelector('span').textContent = 'Memproses...';

    try {
        // Simulate API call (replace with actual API endpoint)
        await simulateLogin(email, password, rememberMe);

        // Success - redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        // Show error
        showError(error.message || 'Login gagal. Silakan coba lagi.');

        // Reset button state
        loginBtn.disabled = false;
        loginBtn.classList.remove('loading');
        loginBtn.querySelector('span').textContent = 'Masuk';
        lucide.createIcons();
    }
});

// Simulate login API call (replace with actual API integration)
async function simulateLogin(email, password, rememberMe) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Demo credentials (replace with actual API call)
            const demoEmail = 'user@finsight.com';
            const demoPassword = 'password123';

            if (email === demoEmail && password === demoPassword) {
                // Save login state
                if (rememberMe) {
                    localStorage.setItem('finsight_user', JSON.stringify({
                        email: email,
                        loggedIn: true,
                        loginTime: new Date().toISOString()
                    }));
                } else {
                    sessionStorage.setItem('finsight_user', JSON.stringify({
                        email: email,
                        loggedIn: true,
                        loginTime: new Date().toISOString()
                    }));
                }
                resolve();
            } else {
                reject(new Error('Email atau password salah'));
            }
        }, 1500);
    });
}

// Check if user is already logged in
function checkLoginStatus() {
    const user = localStorage.getItem('finsight_user') || sessionStorage.getItem('finsight_user');
    if (user) {
        try {
            const userData = JSON.parse(user);
            if (userData.loggedIn) {
                // Redirect to dashboard if already logged in
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

// Check login status on page load
checkLoginStatus();

// Auto-fill email if remembered
window.addEventListener('DOMContentLoaded', () => {
    const rememberedUser = localStorage.getItem('finsight_user');
    if (rememberedUser) {
        try {
            const userData = JSON.parse(rememberedUser);
            emailInput.value = userData.email;
            rememberMeCheckbox.checked = true;
        } catch (error) {
            console.error('Error parsing remembered user:', error);
        }
    }
});

// Clear error on input
emailInput.addEventListener('input', hideError);
passwordInput.addEventListener('input', hideError);
