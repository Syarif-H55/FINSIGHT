document.addEventListener('DOMContentLoaded', () => {

    // Check Auth
    const token = localStorage.getItem('finsight_token');
    const user = JSON.parse(localStorage.getItem('finsight_user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Display User Name
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${user.name}`;
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
                container.innerHTML = '<p class="text-muted text-center">No active budgets. <a href="budgets.html">Set a budget</a> to see progress here.</p>';
                return;
            }

            let html = '<div class="row">';

            budgets.forEach(budget => {
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
                if (percentage > 90) colorClass = 'danger';
                else if (percentage > 75) colorClass = 'warning';

                html += `
                    <div class="col-md-6 mb-4">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="fw-bold">${budget.category_name}</span>
                            <span class="small text-muted">${formatCurrency(spent)} / ${formatCurrency(limit)}</span>
                        </div>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-${colorClass}" role="progressbar" style="width: ${percentage}%" 
                                aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                                ${Math.round(percentage)}%
                            </div>
                        </div>
                        <small class="text-muted">Ends: ${endDate.toLocaleDateString()}</small>
                    </div>
                `;
            });

            html += '</div>';
            container.innerHTML = html;

        } else {
            container.innerHTML = '<p class="text-danger text-center">Failed to load budget data.</p>';
        }

    } catch (error) {
        console.error("Budget Progress Error:", error);
        container.innerHTML = '<p class="text-danger text-center">Error calculating budgets.</p>';
    }
}

function formatCurrency(amount) {
    return 'IDR ' + amount.toLocaleString('id-ID');
}
