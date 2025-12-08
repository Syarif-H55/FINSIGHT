// Budget Data
let budgets = [];

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function calculatePercentage(spent, allocated) {
    return Math.round((spent / allocated) * 100);
}

function getBudgetStatus(percentage) {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'on-track';
}

// Update Summary Cards
function updateSummaryCards() {
    const totalBudget = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    const remainingPercentage = totalBudget > 0 ? Math.round((remaining / totalBudget) * 100) : 0;

    // Calculate average daily spending (assuming 30 days in a month)
    const avgDaily = totalSpent / 30;

    document.getElementById('total-budget').textContent = formatCurrency(totalBudget);
    document.getElementById('total-spent').textContent = formatCurrency(totalSpent);
    document.getElementById('remaining-budget').textContent = formatCurrency(remaining);
    document.getElementById('remaining-percentage').textContent = `${remainingPercentage}% tersisa`;
    document.getElementById('avg-daily-spending').textContent = formatCurrency(avgDaily);
}

// Update Budget Overview
function updateBudgetOverview() {
    const overviewCard = document.getElementById('budget-overview-card');

    if (budgets.length === 0) {
        overviewCard.style.display = 'none';
        return;
    }

    overviewCard.style.display = 'block';

    // Count budgets by status
    const onTrack = budgets.filter(b => getBudgetStatus(calculatePercentage(b.spent, b.allocated)) === 'on-track').length;
    const warning = budgets.filter(b => getBudgetStatus(calculatePercentage(b.spent, b.allocated)) === 'warning').length;
    const danger = budgets.filter(b => getBudgetStatus(calculatePercentage(b.spent, b.allocated)) === 'danger').length;

    // Update stats pills
    const statsContainer = document.getElementById('overview-stats');
    statsContainer.innerHTML = '';

    if (onTrack > 0) {
        statsContainer.innerHTML += `<span class="stat-pill on-track">${onTrack} On Track</span>`;
    }
    if (warning > 0) {
        statsContainer.innerHTML += `<span class="stat-pill warning">${warning} Mendekati Limit</span>`;
    }
    if (danger > 0) {
        statsContainer.innerHTML += `<span class="stat-pill danger">${danger} Melebihi</span>`;
    }

    // Calculate percentages for progress bar
    const total = budgets.length;
    const onTrackPercentage = (onTrack / total) * 100;
    const warningPercentage = (warning / total) * 100;
    const dangerPercentage = (danger / total) * 100;

    // Update progress bar
    const progressContainer = document.getElementById('progress-bar-container');
    progressContainer.innerHTML = '';

    if (onTrack > 0) {
        progressContainer.innerHTML += `<div class="progress-bar-fill on-track" style="width: ${onTrackPercentage}%"></div>`;
    }
    if (warning > 0) {
        progressContainer.innerHTML += `<div class="progress-bar-fill warning" style="width: ${warningPercentage}%"></div>`;
    }
    if (danger > 0) {
        progressContainer.innerHTML += `<div class="progress-bar-fill danger" style="width: ${dangerPercentage}%"></div>`;
    }
}

// Generate Insights
function generateInsights() {
    const insightsSection = document.getElementById('insights-section');
    const insightsGrid = document.getElementById('insights-grid');

    if (budgets.length === 0) {
        insightsSection.style.display = 'none';
        return;
    }

    const insights = [];

    budgets.forEach(budget => {
        const percentage = calculatePercentage(budget.spent, budget.allocated);
        const status = getBudgetStatus(percentage);
        const remaining = budget.allocated - budget.spent;

        if (status === 'danger') {
            insights.push({
                type: 'danger',
                title: `Anggaran ${budget.name} Terlampaui`,
                message: `Pengeluaran ${budget.name} Anda melebihi ${formatCurrency(Math.abs(remaining))} dari anggaran. Sebaiknya kurangi pengeluaran untuk kategori ini.`
            });
        } else if (status === 'warning') {
            insights.push({
                type: 'warning',
                title: `Peringatan Anggaran ${budget.name}`,
                message: `Anda telah menggunakan ${percentage}% dari anggaran ${budget.name}. Pertimbangkan untuk mengurangi penggunaan atau sesuaikan anggaran.`
            });
        } else if (percentage < 50) {
            insights.push({
                type: 'success',
                title: `Anggaran ${budget.name} Terkendali`,
                message: `Pengeluaran ${budget.name} Anda masih dalam batas wajar. Pertahankan pola pengeluaran ini!`
            });
        }
    });

    if (insights.length === 0) {
        insightsSection.style.display = 'none';
        return;
    }

    insightsSection.style.display = 'block';
    insightsGrid.innerHTML = insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="insight-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${getInsightIcon(insight.type)}
                </svg>
            </div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
            </div>
        </div>
    `).join('');
}

function getInsightIcon(type) {
    const icons = {
        warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
        danger: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
    };
    return icons[type] || icons.success;
}

// Render Budget Cards
function renderBudgetCards(filter = 'all') {
    const container = document.getElementById('budgets-grid');

    const filteredBudgets = filter === 'all'
        ? budgets
        : budgets.filter(b => b.status === filter);

    if (filteredBudgets.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-500);">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 64px; height: 64px; margin: 0 auto 1rem; color: var(--gray-300);">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Tidak ada anggaran</p>
                <p>Klik "Buat Anggaran" untuk memulai</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBudgets.map(budget => {
        const percentage = calculatePercentage(budget.spent, budget.allocated);
        const remaining = budget.allocated - budget.spent;
        const status = getBudgetStatus(percentage);

        return `
            <div class="budget-card ${status}">
                <div class="budget-card-header">
                    <div class="budget-category">
                        <div class="category-icon ${budget.category}">
                            ${getCategoryIcon(budget.category)}
                        </div>
                        <div class="category-info">
                            <h4>${budget.name}</h4>
                            <p>${budget.transactions} transaksi bulan ini</p>
                        </div>
                    </div>
                    <button class="budget-menu-btn" onclick="openBudgetMenu(${budget.id})">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                    </button>
                </div>
                <div class="budget-amount-info">
                    <div class="amount-spent">
                        <span class="amount-label">Terpakai</span>
                        <span class="amount-value">${formatCurrency(budget.spent)}</span>
                    </div>
                    <div class="amount-total">
                        <span class="amount-label">dari</span>
                        <span class="amount-value">${formatCurrency(budget.allocated)}</span>
                    </div>
                </div>
                <div class="budget-progress-bar">
                    <div class="progress-fill ${status}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-footer">
                    <span class="budget-percentage">${percentage}% terpakai</span>
                    <span class="budget-remaining ${remaining < 0 ? 'over' : ''}">
                        ${remaining >= 0 ? formatCurrency(remaining) + ' tersisa' : formatCurrency(Math.abs(remaining)) + ' melebihi'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function getCategoryIcon(category) {
    const icons = {
        food: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>',
        transport: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>',
        shopping: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
        bills: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        entertainment: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        health: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>',
        education: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>',
        other: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'
    };
    return icons[category] || icons.other;
}

// Modal Functions
function openBudgetModal() {
    const modal = document.getElementById('budget-modal');
    modal.classList.add('active');
    document.getElementById('budget-form').reset();
    document.getElementById('modal-title').textContent = 'Buat Anggaran Baru';

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('budget-start-date').value = today;
}

function closeBudgetModal() {
    const modal = document.getElementById('budget-modal');
    modal.classList.remove('active');
}

function openBudgetMenu(budgetId) {
    // Implement budget menu functionality (edit, delete, view details)
    console.log('Opening menu for budget:', budgetId);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    updateSummaryCards();
    updateBudgetOverview();
    renderBudgetCards();
    generateInsights();

    // Add Budget Button
    const addBudgetBtn = document.getElementById('add-budget-btn');
    if (addBudgetBtn) {
        addBudgetBtn.addEventListener('click', openBudgetModal);
    }

    // Close Modal Buttons
    const modalCloses = document.querySelectorAll('.modal-close, #cancel-btn');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', closeBudgetModal);
    });

    // Modal Overlay Click
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeBudgetModal);
    }

    // Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            renderBudgetCards(filter);
        });
    });

    // Budget Form Submit
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const categorySelect = document.getElementById('budget-category');
            const category = categorySelect.value;
            const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
            const amount = parseInt(document.getElementById('budget-amount').value);
            const period = document.getElementById('budget-period').value;
            const startDate = document.getElementById('budget-start-date').value;
            const alert = parseInt(document.getElementById('budget-alert').value);
            const notes = document.getElementById('budget-notes').value;

            // Create new budget
            const newBudget = {
                id: budgets.length + 1,
                category: category,
                name: categoryName,
                allocated: amount,
                spent: 0,
                transactions: 0,
                period: period,
                alert: alert,
                status: 'on-track',
                startDate: startDate,
                notes: notes
            };

            budgets.push(newBudget);

            // Update UI
            updateSummaryCards();
            updateBudgetOverview();
            renderBudgetCards();
            generateInsights();
            closeBudgetModal();

            // Show success message
            alert('Anggaran berhasil dibuat!');
        });
    }

    // Download Report Button
    const downloadReportBtn = document.getElementById('download-report-btn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', function() {
            alert('Fitur download laporan akan segera hadir!');
        });
    }

    // Period Selector
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            const period = this.value;
            console.log('Period changed to:', period);
            // Implement period change logic here
        });
    }
});

// Export functions for use in HTML
window.openBudgetModal = openBudgetModal;
window.closeBudgetModal = closeBudgetModal;
window.openBudgetMenu = openBudgetMenu;
