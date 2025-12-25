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

    loadDashboardData();
});

async function loadDashboardData() {
    try {
        // 1. Fetch Wallets for Total Balance
        const walletRes = await APIClient.get('/wallets');
        if (walletRes.success) {
            if (Array.isArray(walletRes.data)) {
                const totalBalance = walletRes.data.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
                document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
            } else {
                console.error("Wallet data is not (array):", walletRes.data);
            }
        } else {
            console.error("Failed to load wallets:", walletRes.message);
        }

        // 2. Fetch Transactions for Income/Expense
        const transRes = await APIClient.get('/transactions');
        if (transRes.success) {
            if (Array.isArray(transRes.data)) {
                let income = 0;
                let expense = 0;

                transRes.data.forEach(t => {
                    const amount = parseFloat(t.amount);
                    if (t.transaction_type === 'income') {
                        income += amount;
                    } else {
                        expense += amount;
                    }
                });

                document.getElementById('totalIncome').textContent = formatCurrency(income);
                document.getElementById('totalExpense').textContent = formatCurrency(expense);

                // Load recent transactions
                loadRecentTransactions(transRes.data);
            } else {
                console.error("Transaction data is not an array:", transRes.data);
            }
        } else {
            console.error("Failed to load transactions:", transRes.message);
        }

    } catch (error) {
        console.error("Dashboard Error:", error);
    }

    loadBudgetProgress();
}

async function loadBudgetProgress() {
    const container = document.getElementById('budgetProgressContainer');

    try {
        const [budgetsRes, transRes] = await Promise.all([
            APIClient.get('/budgets'),
            APIClient.get('/transactions')
        ]);

        if (budgetsRes.success && transRes.success) {
            const budgets = Array.isArray(budgetsRes.data) ? budgetsRes.data : [];
            const transactions = Array.isArray(transRes.data) ? transRes.data : [];

            if (budgets.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-chart-pie"></i>
                        <p>No active budgets. <a href="budgets.html" class="text-primary-custom">Set a budget</a> to track your spending.</p>
                    </div>
                `;
                return;
            }

            let html = '';

            budgets.slice(0, 4).forEach(budget => {
                const limit = parseFloat(budget.allocated_amount);

                // Calculate spent amount for this budget's category within date range
                const startDate = new Date(budget.start_date);
                const endDate = new Date(budget.end_date);

                const spent = transactions.reduce((sum, t) => {
                    const tDate = new Date(t.transaction_date);
                    if (
                        t.category_name === budget.category_name &&
                        t.transaction_type === 'expense' &&
                        tDate >= startDate && tDate <= endDate
                    ) {
                        return sum + parseFloat(t.amount);
                    }
                    return sum;
                }, 0);

                const percentage = Math.min((spent / limit) * 100, 100);

                // Color Logic
                let colorClass = 'success';
                let statusClass = 'status-success';
                if (percentage > 90) {
                    colorClass = 'danger';
                    statusClass = 'status-danger';
                } else if (percentage > 75) {
                    colorClass = 'warning';
                    statusClass = 'status-warning';
                }

                html += `
                    <div class="budget-progress-item">
                        <div class="budget-progress-header">
                            <div class="d-flex align-items-center gap-3">
                                <div class="category-icon" style="width: 40px; height: 40px; font-size: 1rem;">
                                    <i class="fas fa-tag"></i>
                                </div>
                                <div>
                                    <div class="budget-progress-name">${budget.category_name}</div>
                                    <span class="budget-period">Ends: ${endDate.toLocaleDateString('id-ID')}</span>
                                </div>
                            </div>
                            <span class="budget-status-badge ${statusClass}">${Math.round(percentage)}%</span>
                        </div>
                        <div class="budget-progress-amount mb-2">
                            ${formatCurrency(spent)} / ${formatCurrency(limit)}
                        </div>
                        <div class="progress">
                            <div class="progress-bar bg-${colorClass}" role="progressbar" style="width: ${percentage}%"
                                aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load budget data.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Budget Progress Error:", error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error calculating budgets.</p>
            </div>
        `;
    }
}

function loadRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactionsContainer');

    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet. <a href="transactions.html" class="text-primary-custom">Add your first transaction</a>.</p>
            </div>
        `;
        return;
    }

    // Sort by date and take latest 5
    const recent = transactions
        .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
        .slice(0, 5);

    let html = '<div class="table-responsive"><table class="table"><thead><tr>';
    html += '<th>Date</th><th>Category</th><th>Description</th><th>Amount</th>';
    html += '</tr></thead><tbody>';

    recent.forEach(t => {
        const isIncome = t.transaction_type === 'income';
        const amountClass = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';

        html += `
            <tr>
                <td>${new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                <td>
                    <span class="category-badge">
                        <i class="fas fa-tag"></i>
                        ${t.category_name || 'Uncategorized'}
                    </span>
                </td>
                <td>${t.description || '-'}</td>
                <td class="${amountClass} fw-bold">${amountPrefix} ${formatCurrency(parseFloat(t.amount))}</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function formatCurrency(amount) {
    return 'IDR ' + amount.toLocaleString('id-ID');
}
