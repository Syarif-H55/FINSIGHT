document.addEventListener('DOMContentLoaded', () => {
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
    const result = await APIClient.get('/budgets');

    if (result.success) {
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No active budgets. Set one to track your spending!</div>';
            return;
        }

        container.innerHTML = result.data.map(b => `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title text-primary"><i class="fas fa-wallet me-2"></i>${b.category_name}</h5>
                            <span class="badge bg-secondary">Until ${new Date(b.end_date).toLocaleDateString()}</span>
                        </div>
                        <h3 class="mb-3">Limit: IDR ${parseFloat(b.allocated_amount).toLocaleString('id-ID')}</h3>
                        <p class="text-muted small">Period: ${new Date(b.start_date).toLocaleDateString()} - ${new Date(b.end_date).toLocaleDateString()}</p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0 text-end">
                         <button class="btn btn-sm btn-outline-danger" onclick="deleteBudget(${b.budget_id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div class="col-12 text-center text-danger">Failed to load budgets.</div>';
    }
}

async function loadCategories() {
    const select = document.getElementById('categorySelect');
    const result = await APIClient.get('/categories');

    if (result.success) {
        // Filter only expense categories for budgeting usually
        const filtered = result.data.filter(c => c.type === 'expense');
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
