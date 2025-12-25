let allTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const token = localStorage.getItem('finsight_token');
    const user = JSON.parse(localStorage.getItem('finsight_user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Display User Name in sidebar
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    if (userName && user.name) {
        userName.textContent = user.name;
    }
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }

    // Set default date to today
    document.getElementById('transactionDate').valueAsDate = new Date();

    loadTransactions();
    loadWalletsForSelect();
    loadCategories();

    // Filter change handler
    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', () => {
            renderTransactions(allTransactions);
        });
    }

    // Add Transaction Form
    const addTransactionForm = document.getElementById('addTransactionForm');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const type = document.querySelector('input[name="transaction_type"]:checked').value;
            const walletId = document.getElementById('walletSelect').value;
            const categoryId = document.getElementById('categorySelect').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const date = document.getElementById('transactionDate').value;
            const description = document.getElementById('description').value;

            const result = await APIClient.post('/transactions', {
                wallet_id: walletId,
                category_id: categoryId,
                amount: amount,
                transaction_type: type,
                transaction_date: date,
                description: description
            });

            if (result.success) {
                // Close Modal
                const modalEl = document.getElementById('addTransactionModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                // Reset Form
                addTransactionForm.reset();
                document.getElementById('transactionDate').valueAsDate = new Date();

                loadTransactions();
            } else {
                alert('Failed to save transaction: ' + result.message);
            }
        });
    }
});

async function loadTransactions() {
    const tbody = document.getElementById('transactionsBody');
    const result = await APIClient.get('/transactions');

    if (result.success) {
        allTransactions = result.data;
        renderTransactions(allTransactions);
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load transactions.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactionsBody');
    const filterType = document.getElementById('filterType').value;

    // Filter transactions
    let filtered = transactions;
    if (filterType !== 'all') {
        filtered = transactions.filter(t => t.transaction_type === filterType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>No transactions found.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(t => {
        const isIncome = t.transaction_type === 'income';
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';

        return `
            <tr>
                <td>${new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                <td>
                    <span class="category-badge">
                        <i class="fas fa-${t.category_icon || 'tag'}"></i>
                        ${t.category_name || 'Uncategorized'}
                    </span>
                </td>
                <td>${t.wallet_name || '-'}</td>
                <td>${t.description || '-'}</td>
                <td class="${amountClass} fw-bold">
                    ${amountPrefix} IDR ${parseFloat(t.amount).toLocaleString('id-ID')}
                </td>
                <td>
                    <button class="action-btn delete" onclick="deleteTransaction(${t.transaction_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function loadWalletsForSelect() {
    const select = document.getElementById('walletSelect');
    const result = await APIClient.get('/wallets');

    if (result.success) {
        if (result.data.length === 0) {
            select.innerHTML = '<option value="">No wallets available</option>';
            return;
        }
        select.innerHTML = result.data.map(w => `
            <option value="${w.wallet_id}">${w.wallet_name} (IDR ${parseFloat(w.balance).toLocaleString('id-ID')})</option>
        `).join('');
    }
}

async function loadCategories() {
    const select = document.getElementById('categorySelect');
    const type = document.querySelector('input[name="transaction_type"]:checked').value;

    const result = await APIClient.get('/categories');

    if (result.success) {
        const filtered = result.data.filter(c => c.type === type);
        if (filtered.length === 0) {
            select.innerHTML = '<option value="">No categories available</option>';
            return;
        }
        select.innerHTML = filtered.map(c => `
            <option value="${c.category_id}">${c.name}</option>
        `).join('');
    }
}

async function deleteTransaction(id) {
    if (confirm('Delete this transaction? This will reverse the balance update on your wallet.')) {
        const result = await APIClient.delete(`/transactions/${id}`);
        if (result.success) {
            loadTransactions();
        } else {
            alert('Failed to delete transaction.');
        }
    }
}
