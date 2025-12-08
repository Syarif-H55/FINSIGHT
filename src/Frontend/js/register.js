// Initialize Lucide icons
lucide.createIcons();

// Get DOM elements
const registerForm = document.getElementById('register-form');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const togglePasswordBtn = document.getElementById('toggle-password');
const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
const termsCheckbox = document.getElementById('terms');
const registerBtn = document.getElementById('register-btn');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const successMessage = document.getElementById('success-message');
const successText = document.getElementById('success-text');
const passwordStrength = document.getElementById('password-strength');
const strengthProgress = document.getElementById('strength-progress');
const strengthText = document.getElementById('strength-text');

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    const icon = togglePasswordBtn.querySelector('i');
    icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
    lucide.createIcons();
});

toggleConfirmPasswordBtn.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);

    const icon = toggleConfirmPasswordBtn.querySelector('i');
    icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
    lucide.createIcons();
});

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
    lucide.createIcons();
}

// Show success message
function showSuccess(message) {
    successText.textContent = message;
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    lucide.createIcons();
}

// Hide messages
function hideMessages() {
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
    if (!password) {
        passwordStrength.classList.remove('active');
        return;
    }

    passwordStrength.classList.add('active');
    const strength = calculatePasswordStrength(password);

    strengthProgress.className = 'strength-progress';
    strengthText.className = 'strength-text';

    if (strength <= 2) {
        strengthProgress.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Lemah';
    } else if (strength <= 3) {
        strengthProgress.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Sedang';
    } else {
        strengthProgress.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Kuat';
    }
}

// Password input event listener
passwordInput.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
    hideMessages();
});

// Validate password requirements
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /\d/.test(password)
    };

    if (!requirements.length) {
        return { valid: false, message: 'Password minimal 8 karakter' };
    }

    if (!requirements.hasLetter) {
        return { valid: false, message: 'Password harus mengandung huruf' };
    }

    if (!requirements.hasNumber) {
        return { valid: false, message: 'Password harus mengandung angka' };
    }

    return { valid: true };
}

// Handle form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const termsAccepted = termsCheckbox.checked;

    // Validation
    if (!fullname) {
        showError('Nama lengkap harus diisi');
        fullnameInput.focus();
        return;
    }

    if (fullname.length < 3) {
        showError('Nama lengkap minimal 3 karakter');
        fullnameInput.focus();
        return;
    }

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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        showError(passwordValidation.message);
        passwordInput.focus();
        return;
    }

    if (!confirmPassword) {
        showError('Konfirmasi password harus diisi');
        confirmPasswordInput.focus();
        return;
    }

    if (password !== confirmPassword) {
        showError('Password dan konfirmasi password tidak cocok');
        confirmPasswordInput.focus();
        return;
    }

    if (!termsAccepted) {
        showError('Anda harus menyetujui Syarat & Ketentuan');
        return;
    }

    // Show loading state
    registerBtn.disabled = true;
    registerBtn.classList.add('loading');
    registerBtn.querySelector('span').textContent = 'Mendaftar...';

    try {
        // Simulate API call (replace with actual API endpoint)
        await simulateRegister(fullname, email, password);

        // Success
        showSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');

        // Reset form
        registerForm.reset();
        passwordStrength.classList.remove('active');

        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        // Show error
        showError(error.message || 'Pendaftaran gagal. Silakan coba lagi.');

        // Reset button state
        registerBtn.disabled = false;
        registerBtn.classList.remove('loading');
        registerBtn.querySelector('span').textContent = 'Daftar Sekarang';
        lucide.createIcons();
    }
});

// Simulate register API call (replace with actual API integration)
async function simulateRegister(fullname, email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check if email already exists (demo)
            const existingUser = localStorage.getItem('finsight_registered_' + email);

            if (existingUser) {
                reject(new Error('Email sudah terdaftar'));
                return;
            }

            // Save user data (demo - in production, this should be done on the server)
            localStorage.setItem('finsight_registered_' + email, JSON.stringify({
                fullname: fullname,
                email: email,
                registeredAt: new Date().toISOString()
            }));

            resolve();
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

// Clear messages on input
fullnameInput.addEventListener('input', hideMessages);
emailInput.addEventListener('input', hideMessages);
confirmPasswordInput.addEventListener('input', hideMessages);

// Real-time password match validation
confirmPasswordInput.addEventListener('input', () => {
    hideMessages();

    if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.style.borderColor = 'var(--danger-red)';
    } else if (confirmPasswordInput.value) {
        confirmPasswordInput.style.borderColor = 'var(--success-green)';
    } else {
        confirmPasswordInput.style.borderColor = '';
    }
});
