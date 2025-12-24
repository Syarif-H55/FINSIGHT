document.addEventListener('DOMContentLoaded', () => {
    loadInsights();
});

async function loadInsights() {
    const container = document.getElementById('insightsContainer');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');

    // Show loading
    loadingState.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';

    try {
        const result = await APIClient.get('/insights');

        // Hide loading
        loadingState.style.display = 'none';

        if (result.success && result.data.insights && result.data.insights.length > 0) {
            renderInsights(result.data.insights);
        } else {
            emptyState.style.display = 'block';
        }
    } catch (error) {
        loadingState.style.display = 'none';
        console.error('Error loading insights:', error);
        container.innerHTML = '<div class="col-12 alert alert-danger">Failed to load insights. Please try again.</div>';
    }
}

function renderInsights(insights) {
    const container = document.getElementById('insightsContainer');

    // Group insights by type
    const grouped = {
        budget_warning: [],
        spending_pattern: [],
        savings_opportunity: []
    };

    insights.forEach(insight => {
        if (grouped[insight.insight_type]) {
            grouped[insight.insight_type].push(insight);
        }
    });

    // Render each group
    let html = '';

    if (grouped.budget_warning.length > 0) {
        html += '<div class="col-12 mb-3"><h5><i class="fas fa-exclamation-triangle text-warning"></i> Budget Warnings</h5></div>';
        grouped.budget_warning.forEach(insight => {
            html += renderInsightCard(insight);
        });
    }

    if (grouped.spending_pattern.length > 0) {
        html += '<div class="col-12 mb-3 mt-4"><h5><i class="fas fa-chart-line text-info"></i> Spending Patterns</h5></div>';
        grouped.spending_pattern.forEach(insight => {
            html += renderInsightCard(insight);
        });
    }

    if (grouped.savings_opportunity.length > 0) {
        html += '<div class="col-12 mb-3 mt-4"><h5><i class="fas fa-piggy-bank text-success"></i> Savings Opportunities</h5></div>';
        grouped.savings_opportunity.forEach(insight => {
            html += renderInsightCard(insight);
        });
    }

    container.innerHTML = html;
}

function renderInsightCard(insight) {
    const severityConfig = {
        danger: {
            bgClass: 'bg-danger',
            textClass: 'text-danger',
            borderClass: 'border-danger',
            icon: 'fa-times-circle'
        },
        warning: {
            bgClass: 'bg-warning',
            textClass: 'text-warning',
            borderClass: 'border-warning',
            icon: 'fa-exclamation-triangle'
        },
        info: {
            bgClass: 'bg-info',
            textClass: 'text-info',
            borderClass: 'border-info',
            icon: 'fa-info-circle'
        },
        success: {
            bgClass: 'bg-success',
            textClass: 'text-success',
            borderClass: 'border-success',
            icon: 'fa-check-circle'
        }
    };

    const config = severityConfig[insight.severity] || severityConfig.info;
    const date = new Date(insight.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100 border-start border-4 ${config.borderClass}">
                <div class="card-body">
                    <div class="d-flex align-items-start mb-2">
                        <i class="fas ${config.icon} ${config.textClass} fa-2x me-3"></i>
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1">${insight.title}</h6>
                            <small class="text-muted">${date}</small>
                        </div>
                    </div>
                    <p class="card-text">${insight.message}</p>
                </div>
            </div>
        </div>
    `;
}
