// Financial Data (will be populated from localStorage or API)
let financialData = {
    income: 0,
    expenses: 0,
    savings: 0,
    budgets: [],
    goals: [],
    transactions: []
};

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate Financial Health Score
function calculateHealthScore() {
    let score = 0;
    const factors = {
        savingsRate: 0,
        spendingRatio: 0,
        emergencyFund: 0,
        goalsProgress: 0
    };

    // Savings Rate (0-30 points)
    if (financialData.income > 0) {
        const savingsRate = (financialData.savings / financialData.income) * 100;
        factors.savingsRate = savingsRate;

        if (savingsRate >= 30) score += 30;
        else if (savingsRate >= 20) score += 25;
        else if (savingsRate >= 10) score += 15;
        else score += Math.round(savingsRate);
    }

    // Spending Ratio (0-25 points)
    if (financialData.income > 0) {
        const spendingRatio = (financialData.expenses / financialData.income) * 100;
        factors.spendingRatio = spendingRatio;

        if (spendingRatio <= 50) score += 25;
        else if (spendingRatio <= 70) score += 20;
        else if (spendingRatio <= 90) score += 10;
        else score += 5;
    }

    // Emergency Fund (0-25 points)
    const monthlyExpenses = financialData.expenses;
    const emergencyMonths = monthlyExpenses > 0 ? financialData.savings / monthlyExpenses : 0;
    factors.emergencyFund = emergencyMonths;

    if (emergencyMonths >= 6) score += 25;
    else if (emergencyMonths >= 3) score += 20;
    else if (emergencyMonths >= 1) score += 10;
    else score += Math.round(emergencyMonths * 10);

    // Goals Progress (0-20 points)
    if (financialData.goals.length > 0) {
        const avgProgress = financialData.goals.reduce((sum, goal) => {
            return sum + ((goal.current / goal.target) * 100);
        }, 0) / financialData.goals.length;

        factors.goalsProgress = avgProgress;
        score += Math.min(20, Math.round(avgProgress / 5));
    }

    return { score: Math.min(100, Math.round(score)), factors };
}

// Update Health Score Display
function updateHealthScore() {
    const { score, factors } = calculateHealthScore();

    // Update score number
    document.getElementById('health-score').textContent = score;

    // Update circular progress
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    document.getElementById('health-score-ring').style.strokeDashoffset = offset;

    // Update status badge
    const statusElement = document.getElementById('health-status');
    let statusText = '';
    let statusClass = '';

    if (score >= 80) {
        statusText = 'Sangat Baik';
        statusClass = 'excellent';
    } else if (score >= 60) {
        statusText = 'Baik';
        statusClass = 'good';
    } else if (score >= 40) {
        statusText = 'Cukup';
        statusClass = 'fair';
    } else {
        statusText = 'Perlu Perbaikan';
        statusClass = 'poor';
    }

    statusElement.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;

    // Update metrics
    document.getElementById('savings-rate').textContent = `${Math.round(factors.savingsRate)}%`;
    document.getElementById('spending-ratio').textContent = `${Math.round(factors.spendingRatio)}%`;
    document.getElementById('emergency-fund').textContent = `${factors.emergencyFund.toFixed(1)} bulan`;
    document.getElementById('goals-progress').textContent = `${Math.round(factors.goalsProgress)}%`;
}

// Generate Spending Insights
function generateSpendingInsights() {
    const container = document.getElementById('spending-insights-list');
    const insights = [];

    if (financialData.expenses === 0) {
        container.innerHTML = `
            <div class="empty-insights">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/>
                </svg>
                <p>Tambahkan transaksi untuk melihat insights pengeluaran</p>
            </div>
        `;
        return;
    }

    const spendingRatio = financialData.income > 0 ? (financialData.expenses / financialData.income) * 100 : 0;

    if (spendingRatio > 90) {
        insights.push({
            type: 'critical',
            title: 'Pengeluaran Sangat Tinggi',
            description: `Anda menghabiskan ${Math.round(spendingRatio)}% dari pendapatan. Segera kurangi pengeluaran non-esensial.`
        });
    } else if (spendingRatio > 70) {
        insights.push({
            type: 'warning',
            title: 'Pengeluaran Cukup Tinggi',
            description: `Pengeluaran mencapai ${Math.round(spendingRatio)}% dari pendapatan. Pertimbangkan untuk mengurangi pengeluaran.`
        });
    } else {
        insights.push({
            type: 'success',
            title: 'Pengeluaran Terkendali',
            description: `Pengeluaran Anda ${Math.round(spendingRatio)}% dari pendapatan. Pertahankan kebiasaan ini!`
        });
    }

    if (financialData.budgets.length > 0) {
        const overBudget = financialData.budgets.filter(b => b.spent > b.allocated);
        if (overBudget.length > 0) {
            insights.push({
                type: 'critical',
                title: 'Beberapa Anggaran Terlampaui',
                description: `${overBudget.length} kategori melebihi anggaran. Segera tinjau dan sesuaikan.`
            });
        }
    }

    renderInsights(container, insights);
}

// Generate Savings Insights
function generateSavingsInsights() {
    const container = document.getElementById('savings-insights-list');
    const insights = [];

    const savingsRate = financialData.income > 0 ? (financialData.savings / financialData.income) * 100 : 0;

    if (savingsRate >= 30) {
        insights.push({
            type: 'success',
            title: 'Tabungan Sangat Baik',
            description: `Anda menabung ${Math.round(savingsRate)}% dari pendapatan. Pertahankan kebiasaan hebat ini!`
        });
    } else if (savingsRate >= 20) {
        insights.push({
            type: 'success',
            title: 'Tabungan Baik',
            description: `Anda menabung ${Math.round(savingsRate)}% dari pendapatan. Coba tingkatkan menjadi 30% untuk hasil optimal.`
        });
    } else if (savingsRate >= 10) {
        insights.push({
            type: 'warning',
            title: 'Tabungan Perlu Ditingkatkan',
            description: `Anda menabung ${Math.round(savingsRate)}% dari pendapatan. Target ideal adalah 20-30%.`
        });
    } else {
        insights.push({
            type: 'critical',
            title: 'Tabungan Sangat Rendah',
            description: `Anda hanya menabung ${Math.round(savingsRate)}% dari pendapatan. Mulai sisihkan minimal 10%.`
        });
    }

    const potentialSavings = financialData.expenses * 0.1;
    if (potentialSavings > 0) {
        insights.push({
            type: 'info',
            title: 'Peluang Penghematan',
            description: `Dengan mengurangi 10% pengeluaran, Anda bisa menabung ${formatCurrency(potentialSavings)} lebih banyak.`
        });
    }

    renderInsights(container, insights);
}

// Generate Budget Insights
function generateBudgetInsights() {
    const container = document.getElementById('budget-insights-list');
    const insights = [];

    if (financialData.budgets.length === 0) {
        container.innerHTML = `
            <div class="empty-insights">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <p>Buat anggaran untuk mendapatkan rekomendasi</p>
            </div>
        `;
        return;
    }

    const totalBudget = financialData.budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = financialData.budgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetUtilization = (totalSpent / totalBudget) * 100;

    if (budgetUtilization > 100) {
        insights.push({
            type: 'critical',
            title: 'Anggaran Total Terlampaui',
            description: 'Total pengeluaran melebihi anggaran. Segera tinjau dan batasi pengeluaran.'
        });
    } else if (budgetUtilization > 80) {
        insights.push({
            type: 'warning',
            title: 'Mendekati Batas Anggaran',
            description: `Anda telah menggunakan ${Math.round(budgetUtilization)}% dari total anggaran.`
        });
    }

    insights.push({
        type: 'info',
        title: 'Rekomendasi Alokasi',
        description: 'Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan.'
    });

    renderInsights(container, insights);
}

// Generate Goals Insights
function generateGoalsInsights() {
    const container = document.getElementById('goals-insights-list');
    const insights = [];

    if (financialData.goals.length === 0) {
        container.innerHTML = `
            <div class="empty-insights">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
                <p>Buat tujuan keuangan untuk tracking progress</p>
            </div>
        `;
        return;
    }

    const completedGoals = financialData.goals.filter(g => (g.current / g.target) >= 1);
    if (completedGoals.length > 0) {
        insights.push({
            type: 'success',
            title: 'Goals Tercapai',
            description: `Selamat! Anda telah mencapai ${completedGoals.length} tujuan keuangan.`
        });
    }

    const activeGoals = financialData.goals.filter(g => (g.current / g.target) < 1);
    if (activeGoals.length > 0) {
        const avgProgress = activeGoals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / activeGoals.length;
        insights.push({
            type: 'info',
            title: 'Progress Goals',
            description: `Rata-rata progress ${activeGoals.length} goals aktif adalah ${Math.round(avgProgress)}%.`
        });
    }

    insights.push({
        type: 'info',
        title: 'Tips Goals',
        description: 'Tetapkan target realistis dan review progress secara berkala untuk hasil optimal.'
    });

    renderInsights(container, insights);
}

// Render Insights
function renderInsights(container, insights) {
    if (insights.length === 0) {
        container.innerHTML = `
            <div class="empty-insights">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Tidak ada insights untuk saat ini</p>
            </div>
        `;
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="insight-item ${insight.type}">
            <div class="insight-title">${insight.title}</div>
            <div class="insight-description">${insight.description}</div>
        </div>
    `).join('');
}

// Generate Financial Tips
function generateFinancialTips() {
    const tips = [
        {
            title: 'Buat Dana Darurat',
            description: 'Sisihkan 3-6 bulan pengeluaran untuk menghadapi situasi tak terduga.'
        },
        {
            title: 'Gunakan Aturan 50/30/20',
            description: '50% untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan dan investasi.'
        },
        {
            title: 'Kurangi Pengeluaran Impulsif',
            description: 'Tunggu 24 jam sebelum membeli barang non-esensial untuk menghindari pembelian impulsif.'
        },
        {
            title: 'Tracking Pengeluaran',
            description: 'Catat semua pengeluaran harian untuk mengidentifikasi pola pemborosan.'
        },
        {
            title: 'Otomasi Tabungan',
            description: 'Set auto-debet untuk tabungan setiap kali menerima gaji.'
        },
        {
            title: 'Review Bulanan',
            description: 'Evaluasi keuangan setiap bulan untuk memastikan tetap on track dengan goals.'
        },
        {
            title: 'Investasi Sejak Dini',
            description: 'Mulai investasi sedini mungkin untuk memanfaatkan compound interest.'
        },
        {
            title: 'Hindari Utang Konsumtif',
            description: 'Prioritaskan melunasi utang dengan bunga tinggi terlebih dahulu.'
        }
    ];

    const container = document.getElementById('tips-grid');
    container.innerHTML = tips.map((tip, index) => `
        <div class="tip-card">
            <div class="tip-number">${index + 1}</div>
            <div class="tip-title">${tip.title}</div>
            <div class="tip-description">${tip.description}</div>
        </div>
    `).join('');
}

// Load Financial Data (simulate from localStorage or API)
function loadFinancialData() {
    // Try to load from localStorage
    try {
        const savedBudgets = localStorage.getItem('budgets');
        const savedGoals = localStorage.getItem('goals');

        if (savedBudgets) {
            financialData.budgets = JSON.parse(savedBudgets);
        }

        if (savedGoals) {
            financialData.goals = JSON.parse(savedGoals);
        }

        // Calculate totals from budgets
        if (financialData.budgets.length > 0) {
            financialData.expenses = financialData.budgets.reduce((sum, b) => sum + b.spent, 0);
        }

        // Calculate totals from goals
        if (financialData.goals.length > 0) {
            financialData.savings = financialData.goals.reduce((sum, g) => sum + g.current, 0);
        }

        // Simulate income (should come from actual data)
        financialData.income = financialData.expenses + financialData.savings;

    } catch (error) {
        console.error('Error loading financial data:', error);
    }
}

// Refresh All Insights
function refreshInsights() {
    loadFinancialData();
    updateHealthScore();
    generateSpendingInsights();
    generateSavingsInsights();
    generateBudgetInsights();
    generateGoalsInsights();
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Load data and generate insights
    loadFinancialData();
    updateHealthScore();
    generateSpendingInsights();
    generateSavingsInsights();
    generateBudgetInsights();
    generateGoalsInsights();
    generateFinancialTips();

    // Refresh button
    const refreshBtn = document.getElementById('refresh-insights-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            refreshInsights();

            // Show loading animation
            this.disabled = true;
            this.style.opacity = '0.6';

            setTimeout(() => {
                this.disabled = false;
                this.style.opacity = '1';
            }, 1000);
        });
    }

    // Period select
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            // In real app, this would filter data by period
            console.log('Period changed to:', this.value);
            refreshInsights();
        });
    }
});
