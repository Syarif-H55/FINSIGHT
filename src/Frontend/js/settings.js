document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    const token = localStorage.getItem('finsight_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Load User Name for Navbar (from LocalStorage for speed, then update from API)
    const userStr = localStorage.getItem('finsight_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('navUserName').textContent = user.name;
    }

    // Elements
    const form = document.getElementById('profileForm');
    const alertBox = document.getElementById('alertMessage');

    // Fetch Profile Data
    try {
        const result = await APIClient.get('/profile');
        if (result.success) {
            const { user, profile } = result.data;

            // Populate Account Info
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('navUserName').textContent = user.name; // Ensure fresh name

            // Populate Profile Info (if exists)
            if (profile) {
                document.getElementById('monthlyIncome').value = profile.monthly_income || 0;
                document.getElementById('avgExpense').value = profile.average_expense || 0;
                document.getElementById('riskAppetite').value = profile.risk_appetite || 'moderate';
                document.getElementById('financialGoals').value = profile.financial_goals || '';
            }
        } else {
            showAlert('danger', 'Failed to load profile data.');
        }
    } catch (error) {
        console.error(error);
        showAlert('danger', 'Error connecting to server.');
    }

    // Handle Save
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById('userName').value, // Allow updating name
            monthly_income: document.getElementById('monthlyIncome').value,
            average_expense: document.getElementById('avgExpense').value,
            risk_appetite: document.getElementById('riskAppetite').value,
            financial_goals: document.getElementById('financialGoals').value
        };

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

        try {
            const result = await APIClient.post('/profile', data);

            if (result.success) {
                showAlert('success', 'Profile updated successfully!');
            } else {
                showAlert('danger', result.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error(error);
            showAlert('danger', 'An error occurred.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    function showAlert(type, msg) {
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = msg;
        alertBox.classList.remove('d-none');

        if (type === 'success') {
            setTimeout(() => alertBox.classList.add('d-none'), 3000);
        }
    }
});
