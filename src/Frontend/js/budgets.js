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

    // Set default dates (Start of month to End of month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    document.getElementById('startDate').valueAsDate = firstDay;
    document.getElementById('endDate').valueAsDate = lastDay;

    loadBudgets();
    loadCategories();

    // Add Budget Form
    const addBudgetForm = document.getElementById('addBudgetForm');
    if (addBudgetForm) {
        addBudgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const categoryId = document.getElementById('categorySelect').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            const result = await APIClient.post('/budgets', {
                category_id: categoryId,
                allocated_amount: amount,
                start_date: startDate,
                end_date: endDate
            });

            if (result.success) {
                const modalEl = document.getElementById('addBudgetModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                addBudgetForm.reset();
                // Reset dates again
                document.getElementById('startDate').valueAsDate = firstDay;
                document.getElementById('endDate').valueAsDate = lastDay;

                loadBudgets();
            } else {
                alert('Failed to set budget: ' + result.message);
            }
        });
    }
});

async function loadBudgets() {
    const container = document.getElementById('budgetsContainer');

    try {
        const [budgetsRes, transRes] = await Promise.all([
            APIClient.get('/budgets'),
            APIClient.get('/transactions')
        ]);

        if (budgetsRes.success) {
            if (!budgetsRes.data || budgetsRes.data.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="empty-state">
                            <i class="fas fa-chart-pie"></i>
                            <p>No active budgets. Set one to track your spending!</p>
                        </div>
                    </div>
                `;
                return;
            }

            const transactions = transRes.success && Array.isArray(transRes.data) ? transRes.data : [];

            container.innerHTML = budgetsRes.data.map(b => {
                const limit = parseFloat(b.allocated_amount);
                const startDate = new Date(b.start_date);
                const endDate = new Date(b.end_date);

                // Calculate spent amount
                const spent = transactions.reduce((sum, t) => {
                    const tDate = new Date(t.transaction_date);
                    if (
                        t.category_name === b.category_name &&
                        t.transaction_type === 'expense' &&
                        tDate >= startDate && tDate <= endDate
                    ) {
                        return sum + parseFloat(t.amount);
                    }
                    return sum;
                }, 0);

                const percentage = Math.min((spent / limit) * 100, 100);
                const remaining = limit - spent;

                // Color Logic
                let colorClass = 'success';
                let statusClass = 'status-success';
                let statusText = 'On Track';
                if (percentage > 90) {
                    colorClass = 'danger';
                    statusClass = 'status-danger';
                    statusText = 'Over Budget';
                } else if (percentage > 75) {
                    colorClass = 'warning';
                    statusClass = 'status-warning';
                    statusText = 'Almost There';
                }

                return `
                    <div class="col-lg-6">
                        <div class="glass-card budget-card">
                            <div class="budget-header">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="category-icon">
                                        <i class="fas fa-tag"></i>
                                    </div>
                                    <div>
                                        <h5 class="budget-name mb-0">${b.category_name}</h5>
                                        <span class="budget-period">
                                            ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                                <span class="budget-status-badge ${statusClass}">${statusText}</span>
                            </div>

                            <div class="budget-body">
                                <div class="row mb-3">
                                    <div class="col-6">
                                        <div class="budget-stat">
                                            <span class="budget-stat-label">Spent</span>
                                            <span class="budget-stat-value text-${colorClass}">
                                                IDR ${spent.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="col-6 text-end">
                                        <div class="budget-stat">
                                            <span class="budget-stat-label">Limit</span>
                                            <span class="budget-stat-value">
                                                IDR ${limit.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="progress mb-2">
                                    <div class="progress-bar bg-${colorClass}" role="progressbar"
                                        style="width: ${percentage}%"
                                        aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="budget-period">${Math.round(percentage)}% used</span>
                                    <span class="budget-period ${remaining < 0 ? 'text-danger' : ''}">
                                        ${remaining >= 0 ? 'Remaining: ' : 'Over by: '}
                                        IDR ${Math.abs(remaining).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            <div class="budget-footer">
                                <span class="budget-period">
                                    <i class="fas fa-calendar-check me-1"></i>
                                    Ends: ${endDate.toLocaleDateString('id-ID')}
                                </span>
                                <button class="action-btn delete" onclick="deleteBudget(${b.budget_id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load budgets.</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading budgets:', error);
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading budgets.</p>
                </div>
            </div>
        `;
    }
}

async function loadCategories() {
    const select = document.getElementById('categorySelect');
    const result = await APIClient.get('/categories');

    if (result.success) {
        // Filter only expense categories for budgeting
        const filtered = result.data.filter(c => c.type === 'expense');
        if (filtered.length === 0) {
            select.innerHTML = '<option value="">No categories available</option>';
            return;
        }
        select.innerHTML = filtered.map(c => `
            <option value="${c.category_id}">${c.name}</option>
        `).join('');
    }
}

async function deleteBudget(id) {
    if (confirm('Delete this budget?')) {
        const result = await APIClient.delete(`/budgets/${id}`);
        if (result.success) {
            loadBudgets();
        } else {
            alert('Failed to delete budget.');
        }
    }
}
