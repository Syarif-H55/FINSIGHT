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
    loadDashboardInsights();
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

// Load Dashboard Insights Widget
async function loadDashboardInsights() {
    const container = document.getElementById('dashboardInsightsContainer');
    if (!container) return;

    try {
        const [budgetsRes, transRes, walletsRes] = await Promise.all([
            APIClient.get('/budgets'),
            APIClient.get('/transactions'),
            APIClient.get('/wallets')
        ]);

        const data = {
            budgets: budgetsRes.success && Array.isArray(budgetsRes.data) ? budgetsRes.data : [],
            transactions: transRes.success && Array.isArray(transRes.data) ? transRes.data : [],
            wallets: walletsRes.success && Array.isArray(walletsRes.data) ? walletsRes.data : []
        };

        const insights = generateDashboardInsights(data);

        if (insights.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle text-success"></i>
                    <p>Keuangan Anda dalam kondisi baik! Tidak ada peringatan saat ini.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="dashboard-insights-list">
                ${insights.slice(0, 3).map(insight => `
                    <div class="dashboard-insight-item ${insight.type}">
                        <div class="dashboard-insight-icon ${insight.type}">
                            <i class="fas ${insight.icon}"></i>
                        </div>
                        <div class="dashboard-insight-content">
                            <div class="dashboard-insight-title">${insight.title}</div>
                            <div class="dashboard-insight-message">${insight.message}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('Error loading dashboard insights:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Gagal memuat insights.</p>
            </div>
        `;
    }
}

function generateDashboardInsights(data) {
    const insights = [];
    const today = new Date();

    // Check budgets
    data.budgets.forEach(budget => {
        const limit = parseFloat(budget.allocated_amount);
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);

        const spent = data.transactions.reduce((sum, t) => {
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

        const percentage = (spent / limit) * 100;

        if (percentage > 100) {
            insights.push({
                type: 'critical',
                icon: 'fa-exclamation-circle',
                title: `Budget ${budget.category_name} Terlampaui!`,
                message: `Melebihi budget sebesar IDR ${Math.abs(limit - spent).toLocaleString('id-ID')}`
            });
        } else if (percentage > 90) {
            insights.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                title: `Budget ${budget.category_name} Hampir Habis`,
                message: `${Math.round(percentage)}% dari budget telah terpakai`
            });
        }
    });

    // Check low wallet balance
    data.wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance);
        if (balance < 0) {
            insights.push({
                type: 'critical',
                icon: 'fa-wallet',
                title: `Saldo ${wallet.wallet_name} Negatif!`,
                message: `Deficit: IDR ${Math.abs(balance).toLocaleString('id-ID')}`
            });
        } else if (balance < 100000) {
            insights.push({
                type: 'warning',
                icon: 'fa-wallet',
                title: `Saldo ${wallet.wallet_name} Rendah`,
                message: `Saldo: IDR ${balance.toLocaleString('id-ID')}`
            });
        }
    });

    // Check spending ratio
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const thisMonthTrans = data.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const income = thisMonthTrans
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expense = thisMonthTrans
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    if (income > 0 && expense > income * 0.8) {
        insights.push({
            type: 'warning',
            icon: 'fa-balance-scale',
            title: 'Rasio Pengeluaran Tinggi',
            message: `${Math.round(expense/income*100)}% pendapatan terpakai bulan ini`
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return insights;
}
