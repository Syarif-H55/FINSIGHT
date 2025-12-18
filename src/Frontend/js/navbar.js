document.addEventListener('DOMContentLoaded', () => {
    // 1. Load User Info
    const userStr = localStorage.getItem('finsight_user');
    const navUserName = document.getElementById('navUserName');

    if (userStr && navUserName) {
        try {
            const user = JSON.parse(userStr);
            navUserName.textContent = user.name || 'User';
        } catch (e) {
            console.error('Error parsing user data', e);
        }
    }

    // 2. Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Clear Session
            localStorage.removeItem('finsight_token');
            localStorage.removeItem('finsight_user');
            localStorage.removeItem('finsight_saved_email'); // Optional: Keep or remove based on preference, keeping email is usually friendly.

            // Redirect
            window.location.href = 'login.html';
        });
    }

    // 3. Highlight Active Link (Optional Auto-Highlight)
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
