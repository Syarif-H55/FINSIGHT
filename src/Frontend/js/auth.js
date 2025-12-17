document.addEventListener('DOMContentLoaded', () => {

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageBox = document.getElementById('message');

            const result = await APIClient.post('/auth/login', { email, password });

            if (result.success) {
                localStorage.setItem('finsight_token', result.data.token);
                localStorage.setItem('finsight_user', JSON.stringify(result.data.user));
                window.location.href = 'dashboard.html';
            } else {
                messageBox.textContent = result.message;
                messageBox.classList.remove('d-none');
            }
        });
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageBox = document.getElementById('message');

            const result = await APIClient.post('/auth/register', { name, email, password });

            if (result.success) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                messageBox.textContent = result.message;
                messageBox.classList.remove('d-none');
            }
        });
    }

    // Logout Helper
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('finsight_token');
            localStorage.removeItem('finsight_user');
            window.location.href = 'login.html';
        });
    }
});
