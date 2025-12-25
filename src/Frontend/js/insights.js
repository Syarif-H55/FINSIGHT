// =====================================================
// FINSIGHT - Financial Insights Engine (Rule-Based)
// =====================================================

let insightsData = {
    budgets: [],
    transactions: [],
    wallets: []
};

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth - TEMPORARILY DISABLED FOR TESTING
    // const token = localStorage.getItem('finsight_token');
    // const user = JSON.parse(localStorage.getItem('finsight_user'));

    // if (!token || !user) {
    //     window.location.href = 'login.html';
    //     return;
    // }

    // Display User Name in sidebar
    const user = JSON.parse(localStorage.getItem('finsight_user')) || {};
    const userName = document.querySelector('.user-name');
    const userEmail = document.querySelector('.user-email');
    if (userName && user.name) {
        userName.textContent = user.name;
    }
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }

    loadInsightsData();
});

// =====================================================
// Data Loading
// =====================================================
async function loadInsightsData() {
    const container = document.getElementById('insightsContainer');

    try {
        const [budgetsRes, transRes, walletsRes] = await Promise.all([
            APIClient.get('/budgets'),
            APIClient.get('/transactions'),
            APIClient.get('/wallets')
        ]);

        insightsData.budgets = budgetsRes.success && Array.isArray(budgetsRes.data) ? budgetsRes.data : [];
        insightsData.transactions = transRes.success && Array.isArray(transRes.data) ? transRes.data : [];
        insightsData.wallets = walletsRes.success && Array.isArray(walletsRes.data) ? walletsRes.data : [];

        // Generate all insights
        const insights = generateAllInsights();
        renderInsights(insights);
        renderInsightsSummary(insights);

    } catch (error) {
        console.error('Error loading insights data:', error);
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error loading financial data.</p>
                    </div>
                </div>
            `;
        }
    }
}

// =====================================================
// Insights Generation Engine (Rule-Based)
// =====================================================
function generateAllInsights() {
    const insights = [];

    // Budget Insights
    insights.push(...generateBudgetInsights());

    // Spending Pattern Insights
    insights.push(...generateSpendingInsights());

    // Savings Insights
    insights.push(...generateSavingsInsights());

    // Wallet Health Insights
    insights.push(...generateWalletInsights());

    // Sort by priority (critical first)
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return insights;
}

// =====================================================
// Budget Insights
// =====================================================
function generateBudgetInsights() {
    const insights = [];
    const today = new Date();

    insightsData.budgets.forEach(budget => {
        const limit = parseFloat(budget.allocated_amount);
        const startDate = new Date(budget.start_date);
        const endDate = new Date(budget.end_date);

        // Calculate spent amount
        const spent = insightsData.transactions.reduce((sum, t) => {
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
        const remaining = limit - spent;
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysPassed = totalDays - daysLeft;
        const expectedPercentage = totalDays > 0 ? (daysPassed / totalDays) * 100 : 0;

        // Rule 1: Over Budget
        if (percentage > 100) {
            insights.push({
                type: 'critical',
                icon: 'fa-exclamation-circle',
                title: `Budget ${budget.category_name} Terlampaui!`,
                message: `Anda telah melebihi budget sebesar IDR ${Math.abs(remaining).toLocaleString('id-ID')}. Pertimbangkan untuk mengurangi pengeluaran di kategori ini.`,
                category: 'budget',
                action: 'Lihat Budget',
                actionUrl: 'budgets.html'
            });
        }
        // Rule 2: Near Budget Limit (>90%)
        else if (percentage > 90) {
            insights.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                title: `Budget ${budget.category_name} Hampir Habis`,
                message: `Anda telah menggunakan ${Math.round(percentage)}% dari budget. Tersisa IDR ${remaining.toLocaleString('id-ID')} untuk ${Math.max(0, daysLeft)} hari ke depan.`,
                category: 'budget',
                action: 'Lihat Budget',
                actionUrl: 'budgets.html'
            });
        }
        // Rule 3: Spending faster than expected
        else if (percentage > expectedPercentage + 20 && daysLeft > 5) {
            const dailyBudget = remaining / Math.max(1, daysLeft);
            insights.push({
                type: 'warning',
                icon: 'fa-chart-line',
                title: `Pengeluaran ${budget.category_name} Terlalu Cepat`,
                message: `Anda menghabiskan lebih cepat dari rata-rata. Batasi pengeluaran harian maksimal IDR ${Math.round(dailyBudget).toLocaleString('id-ID')} agar tidak melebihi budget.`,
                category: 'budget',
                action: 'Lihat Transaksi',
                actionUrl: 'transactions.html'
            });
        }
        // Rule 4: Good budget management
        else if (percentage < 50 && daysPassed > totalDays * 0.5) {
            insights.push({
                type: 'success',
                icon: 'fa-check-circle',
                title: `Budget ${budget.category_name} Terkendali`,
                message: `Bagus! Anda mengelola budget dengan baik. Masih tersisa ${Math.round(100 - percentage)}% dari budget.`,
                category: 'budget'
            });
        }
    });

    // Rule 5: No budget set
    if (insightsData.budgets.length === 0 && insightsData.transactions.length > 0) {
        insights.push({
            type: 'info',
            icon: 'fa-lightbulb',
            title: 'Belum Ada Budget',
            message: 'Buat budget untuk kategori pengeluaran Anda agar dapat mengontrol keuangan dengan lebih baik.',
            category: 'budget',
            action: 'Buat Budget',
            actionUrl: 'budgets.html'
        });
    }

    return insights;
}

// =====================================================
// Spending Pattern Insights
// =====================================================
function generateSpendingInsights() {
    const insights = [];
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Get this month's transactions
    const thisMonthTrans = insightsData.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    // Get last month's transactions
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthTrans = insightsData.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
    });

    // Calculate totals
    const thisMonthExpense = thisMonthTrans
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const lastMonthExpense = lastMonthTrans
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const thisMonthIncome = thisMonthTrans
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Rule 6: Spending increased significantly
    if (lastMonthExpense > 0 && thisMonthExpense > lastMonthExpense * 1.3) {
        const increase = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense * 100).toFixed(0);
        insights.push({
            type: 'warning',
            icon: 'fa-arrow-trend-up',
            title: 'Pengeluaran Meningkat',
            message: `Pengeluaran bulan ini naik ${increase}% dari bulan lalu. Periksa kategori mana yang meningkat signifikan.`,
            category: 'spending',
            action: 'Lihat Transaksi',
            actionUrl: 'transactions.html'
        });
    }

    // Rule 7: Spending decreased
    if (lastMonthExpense > 0 && thisMonthExpense < lastMonthExpense * 0.8) {
        const decrease = ((lastMonthExpense - thisMonthExpense) / lastMonthExpense * 100).toFixed(0);
        insights.push({
            type: 'success',
            icon: 'fa-arrow-trend-down',
            title: 'Pengeluaran Menurun',
            message: `Bagus! Pengeluaran bulan ini turun ${decrease}% dari bulan lalu. Terus pertahankan!`,
            category: 'spending'
        });
    }

    // Rule 8: High expense ratio (spending > 80% of income)
    if (thisMonthIncome > 0 && thisMonthExpense > thisMonthIncome * 0.8) {
        const ratio = (thisMonthExpense / thisMonthIncome * 100).toFixed(0);
        insights.push({
            type: 'warning',
            icon: 'fa-balance-scale',
            title: 'Rasio Pengeluaran Tinggi',
            message: `Anda menghabiskan ${ratio}% dari pendapatan bulan ini. Idealnya simpan minimal 20% untuk tabungan.`,
            category: 'spending'
        });
    }

    // Rule 9: Good savings ratio
    if (thisMonthIncome > 0 && thisMonthExpense < thisMonthIncome * 0.5) {
        const savings = thisMonthIncome - thisMonthExpense;
        insights.push({
            type: 'success',
            icon: 'fa-piggy-bank',
            title: 'Tingkat Tabungan Bagus',
            message: `Anda berhasil menyisihkan IDR ${savings.toLocaleString('id-ID')} bulan ini. Pertahankan kebiasaan baik ini!`,
            category: 'spending'
        });
    }

    // Rule 10: Identify top spending category
    const categorySpending = {};
    thisMonthTrans
        .filter(t => t.transaction_type === 'expense')
        .forEach(t => {
            const cat = t.category_name || 'Uncategorized';
            categorySpending[cat] = (categorySpending[cat] || 0) + parseFloat(t.amount);
        });

    const topCategory = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])[0];

    if (topCategory && thisMonthExpense > 0) {
        const percentage = (topCategory[1] / thisMonthExpense * 100).toFixed(0);
        if (percentage > 40) {
            insights.push({
                type: 'info',
                icon: 'fa-chart-pie',
                title: `Pengeluaran Terbesar: ${topCategory[0]}`,
                message: `${percentage}% dari total pengeluaran bulan ini untuk kategori ${topCategory[0]} (IDR ${topCategory[1].toLocaleString('id-ID')}). Pertimbangkan untuk mengurangi jika memungkinkan.`,
                category: 'spending'
            });
        }
    }

    return insights;
}

// =====================================================
// Savings Tips Insights
// =====================================================
function generateSavingsInsights() {
    const insights = [];
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Get this month's expense transactions
    const thisMonthExpenses = insightsData.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === thisMonth &&
               tDate.getFullYear() === thisYear &&
               t.transaction_type === 'expense';
    });

    // Rule 11: Frequent small transactions
    const smallTrans = thisMonthExpenses.filter(t => parseFloat(t.amount) < 50000);
    if (smallTrans.length > 15) {
        const totalSmall = smallTrans.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        insights.push({
            type: 'info',
            icon: 'fa-coins',
            title: 'Tips Hemat: Transaksi Kecil',
            message: `Anda memiliki ${smallTrans.length} transaksi kecil (<IDR 50.000) dengan total IDR ${totalSmall.toLocaleString('id-ID')}. Pertimbangkan untuk mengurangi pembelian impulsif.`,
            category: 'tips'
        });
    }

    // Rule 12: Weekend spending pattern
    const weekendTrans = thisMonthExpenses.filter(t => {
        const day = new Date(t.transaction_date).getDay();
        return day === 0 || day === 6;
    });
    const weekdayTrans = thisMonthExpenses.filter(t => {
        const day = new Date(t.transaction_date).getDay();
        return day !== 0 && day !== 6;
    });

    const avgWeekend = weekendTrans.length > 0
        ? weekendTrans.reduce((sum, t) => sum + parseFloat(t.amount), 0) / weekendTrans.length
        : 0;
    const avgWeekday = weekdayTrans.length > 0
        ? weekdayTrans.reduce((sum, t) => sum + parseFloat(t.amount), 0) / weekdayTrans.length
        : 0;

    if (avgWeekend > avgWeekday * 1.5 && weekendTrans.length >= 4) {
        insights.push({
            type: 'info',
            icon: 'fa-calendar-week',
            title: 'Tips Hemat: Pengeluaran Weekend',
            message: 'Pengeluaran Anda cenderung lebih tinggi di akhir pekan. Rencanakan aktivitas weekend yang lebih hemat.',
            category: 'tips'
        });
    }

    // Rule 13: No income recorded
    const thisMonthIncome = insightsData.transactions.filter(t => {
        const tDate = new Date(t.transaction_date);
        return tDate.getMonth() === thisMonth &&
               tDate.getFullYear() === thisYear &&
               t.transaction_type === 'income';
    });

    if (thisMonthIncome.length === 0 && thisMonthExpenses.length > 0) {
        insights.push({
            type: 'info',
            icon: 'fa-wallet',
            title: 'Catat Pendapatan',
            message: 'Belum ada pendapatan tercatat bulan ini. Catat pendapatan Anda untuk analisis keuangan yang lebih akurat.',
            category: 'tips',
            action: 'Tambah Transaksi',
            actionUrl: 'transactions.html'
        });
    }

    return insights;
}

// =====================================================
// Wallet Health Insights
// =====================================================
function generateWalletInsights() {
    const insights = [];

    // Rule 14: Low wallet balance
    insightsData.wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance);
        if (balance < 100000 && balance >= 0) {
            insights.push({
                type: 'warning',
                icon: 'fa-wallet',
                title: `Saldo ${wallet.wallet_name} Rendah`,
                message: `Saldo wallet "${wallet.wallet_name}" hanya IDR ${balance.toLocaleString('id-ID')}. Pertimbangkan untuk menambah dana.`,
                category: 'wallet',
                action: 'Lihat Wallet',
                actionUrl: 'wallets.html'
            });
        }
    });

    // Rule 15: Negative balance
    insightsData.wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance);
        if (balance < 0) {
            insights.push({
                type: 'critical',
                icon: 'fa-exclamation-circle',
                title: `Saldo ${wallet.wallet_name} Negatif!`,
                message: `Wallet "${wallet.wallet_name}" memiliki saldo negatif IDR ${Math.abs(balance).toLocaleString('id-ID')}. Segera seimbangkan keuangan Anda.`,
                category: 'wallet',
                action: 'Lihat Wallet',
                actionUrl: 'wallets.html'
            });
        }
    });

    // Rule 16: Total balance info
    const totalBalance = insightsData.wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    if (totalBalance > 0 && insightsData.wallets.length > 0) {
        // Calculate average monthly expense
        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        const thisMonthExpense = insightsData.transactions
            .filter(t => {
                const tDate = new Date(t.transaction_date);
                return tDate.getMonth() === thisMonth &&
                       tDate.getFullYear() === thisYear &&
                       t.transaction_type === 'expense';
            })
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        if (thisMonthExpense > 0) {
            const monthsCovered = totalBalance / thisMonthExpense;
            if (monthsCovered < 3) {
                insights.push({
                    type: 'info',
                    icon: 'fa-shield-alt',
                    title: 'Dana Darurat Kurang',
                    message: `Total saldo Anda hanya cukup untuk ${monthsCovered.toFixed(1)} bulan pengeluaran. Idealnya siapkan dana darurat 3-6 bulan.`,
                    category: 'wallet'
                });
            } else {
                insights.push({
                    type: 'success',
                    icon: 'fa-shield-alt',
                    title: 'Dana Darurat Aman',
                    message: `Total saldo mencukupi untuk ${monthsCovered.toFixed(1)} bulan pengeluaran. Dana darurat Anda dalam kondisi baik!`,
                    category: 'wallet'
                });
            }
        }
    }

    // Rule 17: No wallets
    if (insightsData.wallets.length === 0) {
        insights.push({
            type: 'info',
            icon: 'fa-plus-circle',
            title: 'Buat Wallet Pertama',
            message: 'Anda belum memiliki wallet. Buat wallet untuk mulai mencatat keuangan Anda.',
            category: 'wallet',
            action: 'Buat Wallet',
            actionUrl: 'wallets.html'
        });
    }

    return insights;
}

// =====================================================
// Render Functions
// =====================================================
function renderInsights(insights) {
    const container = document.getElementById('insightsContainer');
    if (!container) return;

    if (!insights || insights.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>Belum ada insights. Mulai catat transaksi untuk mendapatkan analisis keuangan.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = insights.map(insight => `
        <div class="col-lg-6">
            <div class="glass-card insight-card insight-${insight.type}">
                <div class="insight-header">
                    <div class="insight-icon ${insight.type}">
                        <i class="fas ${insight.icon}"></i>
                    </div>
                    <span class="insight-badge ${insight.type}">
                        ${getCategoryLabel(insight.category)}
                    </span>
                </div>
                <div class="insight-body">
                    <h5 class="insight-title">${insight.title}</h5>
                    <p class="insight-message">${insight.message}</p>
                </div>
                ${insight.action ? `
                    <div class="insight-footer">
                        <a href="${insight.actionUrl}" class="insight-action">
                            ${insight.action} <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}


function renderInsightsSummary(insights) {
    const critical = insights.filter(i => i.type === 'critical').length;
    const warning = insights.filter(i => i.type === 'warning').length;
    const info = insights.filter(i => i.type === 'info').length;
    const success = insights.filter(i => i.type === 'success').length;

    const criticalEl = document.getElementById('criticalCount');
    const warningEl = document.getElementById('warningCount');
    const infoEl = document.getElementById('infoCount');
    const successEl = document.getElementById('successCount');

    if (criticalEl) criticalEl.textContent = critical;
    if (warningEl) warningEl.textContent = warning;
    if (infoEl) infoEl.textContent = info;
    if (successEl) successEl.textContent = success;

    // Update health score
    const healthScore = calculateHealthScore(insights);
    const healthScoreEl = document.getElementById('healthScore');
    const healthScoreBarEl = document.getElementById('healthScoreBar');

    if (healthScoreEl) healthScoreEl.textContent = healthScore;
    if (healthScoreBarEl) healthScoreBarEl.style.width = `${healthScore}%`;

    // Update health status
    const healthStatus = document.getElementById('healthStatus');
    if (healthStatus) {
        if (healthScore >= 80) {
            healthStatus.textContent = 'Sangat Baik';
            healthStatus.className = 'health-status success';
        } else if (healthScore >= 60) {
            healthStatus.textContent = 'Baik';
            healthStatus.className = 'health-status info';
        } else if (healthScore >= 40) {
            healthStatus.textContent = 'Perlu Perhatian';
            healthStatus.className = 'health-status warning';
        } else {
            healthStatus.textContent = 'Kritis';
            healthStatus.className = 'health-status critical';
        }
    }
}

function calculateHealthScore(insights) {
    // Base score
    let score = 100;

    // Deduct points based on insight types
    insights.forEach(insight => {
        switch (insight.type) {
            case 'critical':
                score -= 20;
                break;
            case 'warning':
                score -= 10;
                break;
            case 'info':
                // Info doesn't affect score
                break;
            case 'success':
                score += 5;
                break;
        }
    });

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
}

function getCategoryLabel(category) {
    const labels = {
        budget: 'Budget',
        spending: 'Pengeluaran',
        tips: 'Tips Hemat',
        wallet: 'Wallet'
    };
    return labels[category] || category;
}

// =====================================================
// Dashboard Widget Function (exported for dashboard.js)
// =====================================================
async function loadDashboardInsightsWidget() {
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

        // Generate insights with the data
        const insights = generateDashboardInsightsFromData(data);
        return insights.slice(0, 3); // Return top 3 insights

    } catch (error) {
        console.error('Error loading dashboard insights:', error);
        return [];
    }
}

function generateDashboardInsightsFromData(data) {
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
                message: `${Math.round(percentage)}% terpakai`
            });
        }
    });

    // Check low wallet balance
    data.wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance);
        if (balance < 100000 && balance >= 0) {
            insights.push({
                type: 'warning',
                icon: 'fa-wallet',
                title: `Saldo ${wallet.wallet_name} Rendah`,
                message: `Saldo: IDR ${balance.toLocaleString('id-ID')}`
            });
        } else if (balance < 0) {
            insights.push({
                type: 'critical',
                icon: 'fa-exclamation-circle',
                title: `Saldo ${wallet.wallet_name} Negatif!`,
                message: `Deficit: IDR ${Math.abs(balance).toLocaleString('id-ID')}`
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
            message: `${Math.round(expense/income*100)}% pendapatan terpakai`
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return insights;
}

// Make functions available globally for dashboard
window.loadDashboardInsightsWidget = loadDashboardInsightsWidget;
