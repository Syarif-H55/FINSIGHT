document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    document.getElementById('transactionDate').valueAsDate = new Date();

    loadTransactions();
    loadWalletsForSelect();
    loadCategories();

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
                document.getElementById('transactionDate').valueAsDate = new Date(); // Reset date

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
        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No transactions found.</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(t => `
            <tr>
                <td>${new Date(t.transaction_date).toLocaleDateString()}</td>
                <td>
                    <i class="fas fa-${t.category_icon || 'circle'} me-2"></i>
                    ${t.category_name}
                </td>
                <td>${t.wallet_name}</td>
                <td>${t.description || '-'}</td>
                <td class="text-end ${t.transaction_type === 'income' ? 'text-success' : 'text-danger'}">
                    ${t.transaction_type === 'income' ? '+' : '-'} IDR ${parseFloat(t.amount).toLocaleString('id-ID')}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${t.transaction_id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load transactions.</td></tr>';
    }
}

async function loadWalletsForSelect() {
    const select = document.getElementById('walletSelect');
    const result = await APIClient.get('/wallets');

    if (result.success) {
        select.innerHTML = result.data.map(w => `
            <option value="${w.wallet_id}">${w.wallet_name} (IDR ${parseFloat(w.balance).toLocaleString('id-ID')})</option>
        `).join('');
    }
}

async function loadCategories() {
    const select = document.getElementById('categorySelect');
    const type = document.querySelector('input[name="transaction_type"]:checked').value;

    // Fetch all categories first time, or filter if already loaded?
    // For now, fetch from simple endpoint which returns all, and we screen JS side OR modify backend to filter.
    // Backend `readAll` returns all. Let's filter JS side for simplicity.

    const result = await APIClient.get('/categories');

    if (result.success) {
        const filtered = result.data.filter(c => c.type === type);
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
