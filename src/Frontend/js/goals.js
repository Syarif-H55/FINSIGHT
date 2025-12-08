// Goals Data
let goals = [];
let currentView = 'grid';
let currentFilter = 'all';
let currentSort = 'newest';

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function calculateProgress(current, target) {
    return Math.round((current / target) * 100);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function getDaysRemaining(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function getGoalStatus(goal) {
    const progress = calculateProgress(goal.current, goal.target);
    const daysRemaining = getDaysRemaining(goal.targetDate);

    if (progress >= 100) return 'completed';
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 30) return 'soon';
    return 'on-track';
}

function getCategoryName(category) {
    const categories = {
        emergency: 'Dana Darurat',
        vacation: 'Liburan',
        investment: 'Investasi',
        house: 'Rumah',
        car: 'Kendaraan',
        education: 'Pendidikan',
        wedding: 'Pernikahan',
        business: 'Bisnis',
        gadget: 'Gadget',
        other: 'Lainnya'
    };
    return categories[category] || category;
}

// Update Summary Cards
function updateSummaryCards() {
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
    const avgProgress = totalGoals > 0
        ? Math.round(goals.reduce((sum, g) => sum + calculateProgress(g.current, g.target), 0) / totalGoals)
        : 0;

    document.getElementById('total-goals').textContent = totalGoals;
    document.getElementById('total-target').textContent = formatCurrency(totalTarget);
    document.getElementById('total-saved').textContent = formatCurrency(totalSaved);
    document.getElementById('avg-progress').textContent = `${avgProgress}%`;
}

// Calculate Suggested Saving
function calculateSuggestedSaving() {
    const targetAmount = parseInt(document.getElementById('goal-target').value) || 0;
    const currentAmount = parseInt(document.getElementById('goal-current').value) || 0;
    const targetDate = document.getElementById('goal-target-date').value;
    const startDate = document.getElementById('goal-start-date').value;

    if (!targetAmount || !targetDate || !startDate) {
        document.getElementById('suggested-saving').style.display = 'none';
        return;
    }

    const remaining = targetAmount - currentAmount;
    const daysRemaining = getDaysRemaining(targetDate);
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

    if (daysRemaining < 0) {
        document.getElementById('suggested-saving').style.display = 'none';
        return;
    }

    const perMonth = Math.ceil(remaining / monthsRemaining);
    const perDay = Math.ceil(remaining / daysRemaining);

    document.getElementById('suggestion-text').innerHTML = `
        Untuk mencapai target Anda, sisihkan sekitar <strong>${formatCurrency(perMonth)}</strong> per bulan
        atau <strong>${formatCurrency(perDay)}</strong> per hari selama <strong>${monthsRemaining} bulan</strong>.
    `;
    document.getElementById('suggested-saving').style.display = 'flex';
}

// Render Goals
function renderGoals() {
    const container = document.getElementById('goals-grid');

    // Apply filters
    let filteredGoals = goals;

    if (currentFilter !== 'all') {
        filteredGoals = goals.filter(goal => {
            const status = getGoalStatus(goal);
            if (currentFilter === 'in-progress') return status === 'on-track' || status === 'soon';
            return status === currentFilter;
        });
    }

    // Apply sorting
    filteredGoals.sort((a, b) => {
        switch (currentSort) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'highest':
                return b.target - a.target;
            case 'lowest':
                return a.target - b.target;
            case 'progress':
                return calculateProgress(b.current, b.target) - calculateProgress(a.current, a.target);
            default:
                return 0;
        }
    });

    // Apply view
    if (currentView === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }

    // Render
    if (filteredGoals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                <h3>Belum Ada Goal</h3>
                <p>Mulai rencanakan tujuan keuangan Anda dengan klik "Tambah Goal"</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredGoals.map(goal => {
        const progress = calculateProgress(goal.current, goal.target);
        const remaining = goal.target - goal.current;
        const status = getGoalStatus(goal);
        const daysRemaining = getDaysRemaining(goal.targetDate);

        let deadlineText = '';
        let deadlineClass = '';

        if (status === 'completed') {
            deadlineText = 'Selesai';
            deadlineClass = 'on-track';
        } else if (status === 'overdue') {
            deadlineText = `Terlambat ${Math.abs(daysRemaining)} hari`;
            deadlineClass = 'overdue';
        } else if (status === 'soon') {
            deadlineText = `${daysRemaining} hari lagi`;
            deadlineClass = 'soon';
        } else {
            deadlineText = formatDate(goal.targetDate);
            deadlineClass = 'on-track';
        }

        return `
            <div class="goal-card ${goal.category} ${status}">
                ${goal.priority !== 'low' ? `<span class="priority-badge ${goal.priority}">${goal.priority}</span>` : ''}
                <div class="goal-header">
                    <div class="goal-title-section">
                        <h3 class="goal-name">${goal.name}</h3>
                        <span class="goal-category-badge">${getCategoryName(goal.category)}</span>
                    </div>
                    <div class="goal-menu">
                        <button class="goal-action-btn" onclick="editGoal(${goal.id})" title="Edit">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button class="goal-action-btn" onclick="deleteGoal(${goal.id})" title="Hapus">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="goal-amounts">
                    <div class="amount-item">
                        <span class="amount-label">Terkumpul</span>
                        <span class="amount-value">${formatCurrency(goal.current)}</span>
                    </div>
                    <div class="amount-item">
                        <span class="amount-label">Target</span>
                        <span class="amount-value">${formatCurrency(goal.target)}</span>
                    </div>
                </div>

                <div class="goal-progress">
                    <div class="progress-bar-wrapper">
                        <div class="progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="progress-info">
                        <span class="progress-percentage">${progress}% tercapai</span>
                        <span class="progress-remaining">${formatCurrency(remaining)} lagi</span>
                    </div>
                </div>

                <div class="goal-footer">
                    <div class="goal-deadline">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="deadline-status ${deadlineClass}">${deadlineText}</span>
                    </div>
                    ${status !== 'completed' ? `
                        <button class="goal-add-btn" onclick="openContributionModal(${goal.id})">
                            + Tambah
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Modal Functions
function openGoalModal() {
    const modal = document.getElementById('goal-modal');
    modal.classList.add('active');
    document.getElementById('goal-form').reset();
    document.getElementById('modal-title').textContent = 'Tambah Goal Baru';

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('goal-start-date').value = today;

    document.getElementById('suggested-saving').style.display = 'none';
}

function closeGoalModal() {
    const modal = document.getElementById('goal-modal');
    modal.classList.remove('active');
}

function openContributionModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const modal = document.getElementById('contribution-modal');
    modal.classList.add('active');

    document.getElementById('contribution-goal-id').value = goalId;
    document.getElementById('contribution-goal-name').textContent = goal.name;
    document.getElementById('contribution-current').textContent = formatCurrency(goal.current);
    document.getElementById('contribution-target').textContent = formatCurrency(goal.target);

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('contribution-date').value = today;

    document.getElementById('contribution-form').reset();
    document.getElementById('contribution-goal-id').value = goalId;
    document.getElementById('contribution-date').value = today;
}

function closeContributionModal() {
    const modal = document.getElementById('contribution-modal');
    modal.classList.remove('active');
}

function editGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    // Populate form with goal data
    document.getElementById('goal-name').value = goal.name;
    document.getElementById('goal-category').value = goal.category;
    document.getElementById('goal-target').value = goal.target;
    document.getElementById('goal-current').value = goal.current;
    document.getElementById('goal-start-date').value = goal.startDate;
    document.getElementById('goal-target-date').value = goal.targetDate;
    document.getElementById('goal-priority').value = goal.priority;
    document.getElementById('goal-notes').value = goal.notes || '';

    // Change modal title and store goal id
    document.getElementById('modal-title').textContent = 'Edit Goal';
    document.getElementById('goal-form').dataset.editId = goalId;

    openGoalModal();
}

function deleteGoal(goalId) {
    if (!confirm('Apakah Anda yakin ingin menghapus goal ini?')) return;

    goals = goals.filter(g => g.id !== goalId);
    updateSummaryCards();
    renderGoals();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    updateSummaryCards();
    renderGoals();

    // Add Goal Button
    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', openGoalModal);
    }

    // Close Modal Buttons
    const modalCloses = document.querySelectorAll('.modal-close, #cancel-btn, #cancel-contribution-btn');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            closeGoalModal();
            closeContributionModal();
        });
    });

    // Modal Overlay Click
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function() {
            closeGoalModal();
            closeContributionModal();
        });
    });

    // View Toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            renderGoals();
        });
    });

    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.status;
            renderGoals();
        });
    });

    // Sort Select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            renderGoals();
        });
    }

    // Calculate suggested saving on input change
    ['goal-target', 'goal-current', 'goal-target-date', 'goal-start-date'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateSuggestedSaving);
            element.addEventListener('change', calculateSuggestedSaving);
        }
    });

    // Goal Form Submit
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const editId = this.dataset.editId;
            const goalData = {
                name: document.getElementById('goal-name').value,
                category: document.getElementById('goal-category').value,
                target: parseInt(document.getElementById('goal-target').value),
                current: parseInt(document.getElementById('goal-current').value),
                startDate: document.getElementById('goal-start-date').value,
                targetDate: document.getElementById('goal-target-date').value,
                priority: document.getElementById('goal-priority').value,
                notes: document.getElementById('goal-notes').value
            };

            if (editId) {
                // Edit existing goal
                const goal = goals.find(g => g.id === parseInt(editId));
                if (goal) {
                    Object.assign(goal, goalData);
                }
                delete this.dataset.editId;
            } else {
                // Create new goal
                const newGoal = {
                    id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
                    ...goalData,
                    createdAt: new Date().toISOString()
                };
                goals.push(newGoal);
            }

            updateSummaryCards();
            renderGoals();
            closeGoalModal();

            alert('Goal berhasil disimpan!');
        });
    }

    // Contribution Form Submit
    const contributionForm = document.getElementById('contribution-form');
    if (contributionForm) {
        contributionForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const goalId = parseInt(document.getElementById('contribution-goal-id').value);
            const amount = parseInt(document.getElementById('contribution-amount').value);

            const goal = goals.find(g => g.id === goalId);
            if (goal) {
                goal.current += amount;
                updateSummaryCards();
                renderGoals();
                closeContributionModal();
                alert('Kontribusi berhasil ditambahkan!');
            }
        });
    }

    // Export Goals
    const exportBtn = document.getElementById('export-goals-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            alert('Fitur export akan segera hadir!');
        });
    }
});

// Export functions for use in HTML
window.openGoalModal = openGoalModal;
window.closeGoalModal = closeGoalModal;
window.openContributionModal = openContributionModal;
window.closeContributionModal = closeContributionModal;
window.editGoal = editGoal;
window.deleteGoal = deleteGoal;
