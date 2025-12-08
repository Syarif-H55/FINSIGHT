# FINSIGHT Database Design Document
## Personal Financial Dashboard - AI Powered

---

## 📋 Executive Summary

Dokumen ini berisi desain database lengkap untuk aplikasi FINSIGHT berdasarkan analisis komprehensif terhadap frontend yang sudah dikembangkan. Database dirancang untuk mendukung semua fitur yang ada di frontend sekaligus mempersiapkan fondasi untuk integrasi AI di masa depan.

---

## 🗂️ Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FINSIGHT ERD                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │    USERS     │
                                    ├──────────────┤
                                    │ PK: id       │
                                    │ email        │
                                    │ password     │
                                    │ fullname     │
                                    │ created_at   │
                                    └──────┬───────┘
                                           │
           ┌───────────────┬───────────────┼───────────────┬───────────────┬───────────────┐
           │               │               │               │               │               │
           ▼               ▼               ▼               ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   WALLETS    │ │  CATEGORIES  │ │   BUDGETS    │ │    GOALS     │ │NOTIFICATIONS │ │USER_SETTINGS │
    ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
    │ PK: id       │ │ PK: id       │ │ PK: id       │ │ PK: id       │ │ PK: id       │ │ PK: id       │
    │ FK: user_id  │ │ FK: user_id  │ │ FK: user_id  │ │ FK: user_id  │ │ FK: user_id  │ │ FK: user_id  │
    │ name         │ │ name         │ │ FK: category │ │ name         │ │ title        │ │ theme        │
    │ type         │ │ type         │ │ allocated    │ │ target       │ │ message      │ │ currency     │
    │ balance      │ │ icon         │ │ spent        │ │ current      │ │ type         │ │ language     │
    │ provider     │ │ color        │ │ period       │ │ category     │ │ is_read      │ │ preferences  │
    │ color        │ │ is_default   │ │ start_date   │ │ target_date  │ │ created_at   │ │ updated_at   │
    └──────┬───────┘ └──────┬───────┘ └──────────────┘ └──────┬───────┘ └──────────────┘ └──────────────┘
           │               │                                   │
           │               │                                   │
           ▼               ▼                                   ▼
    ┌──────────────────────────────┐                    ┌──────────────┐
    │        TRANSACTIONS          │                    │GOAL_CONTRIB. │
    ├──────────────────────────────┤                    ├──────────────┤
    │ PK: id                       │                    │ PK: id       │
    │ FK: user_id                  │                    │ FK: goal_id  │
    │ FK: wallet_id                │                    │ amount       │
    │ FK: category_id              │                    │ date         │
    │ type (income/expense)        │                    │ notes        │
    │ amount                       │                    │ created_at   │
    │ description                  │                    └──────────────┘
    │ date                         │
    │ notes                        │
    │ is_recurring                 │
    │ recurring_id (FK, nullable)  │
    │ created_at                   │
    └──────────────────────────────┘
                 │
                 │ (jika is_recurring = true)
                 ▼
    ┌──────────────────────────────┐
    │    RECURRING_TRANSACTIONS    │
    ├──────────────────────────────┤
    │ PK: id                       │
    │ FK: user_id                  │
    │ FK: wallet_id                │
    │ FK: category_id              │
    │ type                         │
    │ amount                       │
    │ description                  │
    │ frequency (daily/weekly/etc) │
    │ start_date                   │
    │ end_date (nullable)          │
    │ next_execution               │
    │ is_active                    │
    │ created_at                   │
    └──────────────────────────────┘

    ┌──────────────────────────────┐          ┌──────────────────────────────┐
    │      WALLET_TRANSFERS        │          │       AI_INSIGHTS            │
    ├──────────────────────────────┤          ├──────────────────────────────┤
    │ PK: id                       │          │ PK: id                       │
    │ FK: user_id                  │          │ FK: user_id                  │
    │ FK: from_wallet_id           │          │ type                         │
    │ FK: to_wallet_id             │          │ title                        │
    │ amount                       │          │ content                      │
    │ notes                        │          │ priority                     │
    │ transfer_date                │          │ category                     │
    │ created_at                   │          │ is_dismissed                 │
    └──────────────────────────────┘          │ generated_at                 │
                                              │ expires_at                   │
    ┌──────────────────────────────┐          └──────────────────────────────┘
    │     WALLET_BUDGETS           │
    ├──────────────────────────────┤
    │ PK: id                       │
    │ FK: wallet_id                │
    │ limit_amount                 │
    │ spent_amount                 │
    │ alert_threshold              │
    │ period_start                 │
    │ period_end                   │
    │ created_at                   │
    └──────────────────────────────┘

    ┌──────────────────────────────┐
    │    FINANCIAL_HEALTH_LOG      │
    ├──────────────────────────────┤
    │ PK: id                       │
    │ FK: user_id                  │
    │ score                        │
    │ savings_rate                 │
    │ spending_ratio               │
    │ emergency_fund_months        │
    │ goals_progress               │
    │ calculated_at                │
    └──────────────────────────────┘
```

---

## 📊 Database Schema (SQL)

### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk optimasi query
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### 2. User Settings Table
```sql
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
    currency VARCHAR(10) DEFAULT 'IDR',
    language VARCHAR(10) DEFAULT 'id',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT TRUE,
    notification_budget_alert BOOLEAN DEFAULT TRUE,
    notification_goal_reminder BOOLEAN DEFAULT TRUE,
    notification_bill_reminder BOOLEAN DEFAULT TRUE,
    risk_appetite VARCHAR(20) DEFAULT 'moderate', -- 'conservative', 'moderate', 'aggressive'
    financial_profile JSONB, -- Flexible untuk menyimpan preferensi tambahan
    dashboard_widgets JSONB, -- Konfigurasi widget dashboard
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

### 3. Wallets Table
```sql
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'bank', 'ewallet', 'cash', 'investment', 'other'
    provider VARCHAR(50), -- 'BCA', 'Mandiri', 'GoPay', 'OVO', dll
    account_number VARCHAR(50),
    balance DECIMAL(15, 2) DEFAULT 0,
    color VARCHAR(7) DEFAULT '#6366F1', -- Hex color
    icon VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_type ON wallets(type);
CREATE INDEX idx_wallets_is_active ON wallets(is_active);
```

### 4. Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6366F1',
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- Untuk sub-kategori
    is_default BOOLEAN DEFAULT FALSE, -- Kategori bawaan sistem
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Insert default categories
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
-- Expense Categories
(NULL, 'Makanan & Minuman', 'expense', 'utensils', '#EF4444', TRUE),
(NULL, 'Transportasi', 'expense', 'car', '#F59E0B', TRUE),
(NULL, 'Belanja', 'expense', 'shopping-bag', '#EC4899', TRUE),
(NULL, 'Tagihan', 'expense', 'file-text', '#8B5CF6', TRUE),
(NULL, 'Hiburan', 'expense', 'film', '#06B6D4', TRUE),
(NULL, 'Kesehatan', 'expense', 'heart', '#10B981', TRUE),
(NULL, 'Pendidikan', 'expense', 'book', '#3B82F6', TRUE),
(NULL, 'Lainnya', 'expense', 'more-horizontal', '#6B7280', TRUE),
-- Income Categories
(NULL, 'Gaji', 'income', 'briefcase', '#22C55E', TRUE),
(NULL, 'Bonus', 'income', 'gift', '#14B8A6', TRUE),
(NULL, 'Investasi', 'income', 'trending-up', '#6366F1', TRUE),
(NULL, 'Freelance', 'income', 'laptop', '#8B5CF6', TRUE),
(NULL, 'Lainnya', 'income', 'plus-circle', '#6B7280', TRUE);
```

### 5. Transactions Table
```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    notes TEXT,
    attachment_url VARCHAR(500), -- Untuk lampiran struk/bukti
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_id INTEGER, -- FK ke recurring_transactions jika dari recurring
    location VARCHAR(255),
    tags JSONB, -- Array of tags untuk filtering tambahan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_date_range ON transactions(user_id, transaction_date);
```

### 6. Recurring Transactions Table
```sql
CREATE TABLE recurring_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    notes TEXT,
    frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'
    frequency_interval INTEGER DEFAULT 1, -- Setiap berapa kali (misal: setiap 2 minggu)
    day_of_week INTEGER, -- 0-6 untuk weekly (0=Minggu)
    day_of_month INTEGER, -- 1-31 untuk monthly
    month_of_year INTEGER, -- 1-12 untuk yearly
    start_date DATE NOT NULL,
    end_date DATE, -- NULL = tidak ada batas
    next_execution_date DATE NOT NULL,
    last_execution_date DATE,
    execution_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_execution ON recurring_transactions(next_execution_date);
CREATE INDEX idx_recurring_is_active ON recurring_transactions(is_active);
```

### 7. Budgets Table
```sql
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100),
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    period VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'weekly', 'monthly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alert_threshold INTEGER DEFAULT 80, -- Persentase untuk notifikasi warning
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);
CREATE INDEX idx_budgets_is_active ON budgets(is_active);
```

### 8. Goals Table
```sql
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'emergency', 'vacation', 'investment', 'house', 'car', 'education', 'wedding', 'business', 'gadget', 'other'
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    notes TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'overdue', 'cancelled'
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goals_category ON goals(category);
```

### 9. Goal Contributions Table
```sql
CREATE TABLE goal_contributions (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    notes VARCHAR(255),
    source_wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goal_contrib_goal_id ON goal_contributions(goal_id);
CREATE INDEX idx_goal_contrib_date ON goal_contributions(contribution_date);
```

### 10. Wallet Transfers Table
```sql
CREATE TABLE wallet_transfers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    from_wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
    to_wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    notes VARCHAR(255),
    transfer_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transfers_user_id ON wallet_transfers(user_id);
CREATE INDEX idx_wallet_transfers_from ON wallet_transfers(from_wallet_id);
CREATE INDEX idx_wallet_transfers_to ON wallet_transfers(to_wallet_id);
CREATE INDEX idx_wallet_transfers_date ON wallet_transfers(transfer_date);
```

### 11. Wallet Budgets Table (Budget per Wallet)
```sql
CREATE TABLE wallet_budgets (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE CASCADE,
    limit_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    alert_threshold INTEGER DEFAULT 80,
    categories JSONB, -- Array of category_ids yang termasuk dalam budget ini
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_budgets_wallet_id ON wallet_budgets(wallet_id);
CREATE INDEX idx_wallet_budgets_period ON wallet_budgets(period_start, period_end);
```

### 12. Notifications Table
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'budget_warning', 'budget_exceeded', 'goal_reminder', 'goal_achieved', 'bill_reminder', 'insight', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    action_url VARCHAR(500), -- Deep link ke halaman terkait
    related_entity_type VARCHAR(50), -- 'budget', 'goal', 'transaction', etc
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 13. AI Insights Table
```sql
CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'spending_pattern', 'savings_opportunity', 'budget_recommendation', 'goal_insight', 'risk_warning', 'general_tip'
    category VARCHAR(50), -- 'spending', 'savings', 'budget', 'goals'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    data_context JSONB, -- Data yang digunakan untuk generate insight
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissed_at TIMESTAMP,
    is_actionable BOOLEAN DEFAULT TRUE,
    action_type VARCHAR(50), -- 'create_budget', 'adjust_spending', 'review_category', etc
    action_data JSONB, -- Data untuk action button
    confidence_score DECIMAL(3, 2), -- 0.00 - 1.00 untuk akurasi AI
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(type);
CREATE INDEX idx_ai_insights_is_dismissed ON ai_insights(is_dismissed);
CREATE INDEX idx_ai_insights_generated ON ai_insights(generated_at DESC);
```

### 14. Financial Health Log Table
```sql
CREATE TABLE financial_health_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL, -- 0-100
    savings_rate DECIMAL(5, 2), -- Persentase
    spending_ratio DECIMAL(5, 2), -- Persentase
    debt_ratio DECIMAL(5, 2), -- Persentase (untuk future feature)
    emergency_fund_months DECIMAL(4, 2), -- Berapa bulan pengeluaran
    goals_progress DECIMAL(5, 2), -- Persentase rata-rata progress goals
    total_income DECIMAL(15, 2),
    total_expense DECIMAL(15, 2),
    total_savings DECIMAL(15, 2),
    breakdown JSONB, -- Detail breakdown per kategori
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_logs_user_id ON financial_health_logs(user_id);
CREATE INDEX idx_health_logs_calculated ON financial_health_logs(calculated_at DESC);
CREATE INDEX idx_health_logs_period ON financial_health_logs(period_start, period_end);
```

### 15. Import History Table (untuk Bulk Upload CSV)
```sql
CREATE TABLE import_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    source VARCHAR(50), -- 'bank_bca', 'bank_mandiri', 'gopay', 'ovo', 'manual', etc
    total_rows INTEGER,
    success_rows INTEGER,
    failed_rows INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_details JSONB, -- Array of errors dengan row number
    wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL,
    imported_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_import_history_user_id ON import_history(user_id);
CREATE INDEX idx_import_history_status ON import_history(status);
```

### 16. Export History Table
```sql
CREATE TABLE export_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(20) NOT NULL, -- 'csv', 'excel', 'pdf'
    entity_type VARCHAR(50) NOT NULL, -- 'transactions', 'budgets', 'goals', 'report'
    filename VARCHAR(255),
    file_url VARCHAR(500),
    filters JSONB, -- Filter yang digunakan saat export
    date_range_start DATE,
    date_range_end DATE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    file_size INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_export_history_user_id ON export_history(user_id);
```

### 17. Audit Log Table (untuk tracking aktivitas)
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc
    entity_type VARCHAR(50) NOT NULL, -- 'transaction', 'budget', 'goal', 'wallet', etc
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

## 🔗 Relationship Summary

| Parent Table | Child Table | Relationship | Foreign Key |
|--------------|-------------|--------------|-------------|
| users | wallets | 1:N | user_id |
| users | categories | 1:N | user_id |
| users | transactions | 1:N | user_id |
| users | budgets | 1:N | user_id |
| users | goals | 1:N | user_id |
| users | notifications | 1:N | user_id |
| users | ai_insights | 1:N | user_id |
| users | user_settings | 1:1 | user_id |
| users | financial_health_logs | 1:N | user_id |
| wallets | transactions | 1:N | wallet_id |
| wallets | wallet_transfers (from) | 1:N | from_wallet_id |
| wallets | wallet_transfers (to) | 1:N | to_wallet_id |
| wallets | wallet_budgets | 1:N | wallet_id |
| categories | transactions | 1:N | category_id |
| categories | budgets | 1:N | category_id |
| categories | categories (self) | 1:N | parent_id |
| goals | goal_contributions | 1:N | goal_id |
| recurring_transactions | transactions | 1:N | recurring_id |

---

## 📈 Views untuk Dashboard

### 1. Monthly Cash Flow View
```sql
CREATE VIEW v_monthly_cash_flow AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_flow
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;
```

### 2. Budget Progress View
```sql
CREATE VIEW v_budget_progress AS
SELECT 
    b.id,
    b.user_id,
    b.name,
    c.name AS category_name,
    b.allocated_amount,
    COALESCE(SUM(t.amount), 0) AS spent_amount,
    b.allocated_amount - COALESCE(SUM(t.amount), 0) AS remaining_amount,
    ROUND((COALESCE(SUM(t.amount), 0) / b.allocated_amount * 100), 2) AS percentage_used,
    b.alert_threshold,
    CASE 
        WHEN COALESCE(SUM(t.amount), 0) >= b.allocated_amount THEN 'exceeded'
        WHEN COALESCE(SUM(t.amount), 0) >= b.allocated_amount * (b.alert_threshold / 100.0) THEN 'warning'
        ELSE 'on_track'
    END AS status
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = b.category_id 
    AND t.user_id = b.user_id 
    AND t.type = 'expense'
    AND t.transaction_date BETWEEN b.period_start AND b.period_end
WHERE b.is_active = TRUE
GROUP BY b.id, b.user_id, b.name, c.name, b.allocated_amount, b.alert_threshold;
```

### 3. Goals Progress View
```sql
CREATE VIEW v_goals_progress AS
SELECT 
    g.id,
    g.user_id,
    g.name,
    g.category,
    g.target_amount,
    g.current_amount,
    g.target_amount - g.current_amount AS remaining_amount,
    ROUND((g.current_amount / g.target_amount * 100), 2) AS percentage_complete,
    g.start_date,
    g.target_date,
    (g.target_date - CURRENT_DATE) AS days_remaining,
    CASE 
        WHEN g.current_amount >= g.target_amount THEN 'completed'
        WHEN g.target_date < CURRENT_DATE THEN 'overdue'
        WHEN (g.target_date - CURRENT_DATE) <= 30 THEN 'soon'
        ELSE 'on_track'
    END AS status,
    -- Kalkulasi monthly saving needed
    CASE 
        WHEN (g.target_date - CURRENT_DATE) > 0 
        THEN ROUND((g.target_amount - g.current_amount) / GREATEST(1, CEIL((g.target_date - CURRENT_DATE) / 30.0)), 2)
        ELSE 0
    END AS monthly_saving_needed,
    g.priority,
    g.notes
FROM goals g
WHERE g.status != 'cancelled';
```

### 4. Wallet Summary View
```sql
CREATE VIEW v_wallet_summary AS
SELECT 
    w.id,
    w.user_id,
    w.name,
    w.type,
    w.provider,
    w.balance,
    w.color,
    w.is_active,
    COUNT(t.id) AS total_transactions,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
    w.last_synced_at,
    w.updated_at
FROM wallets w
LEFT JOIN transactions t ON w.id = t.wallet_id
GROUP BY w.id;
```

---

## 🔧 Stored Procedures / Functions

### 1. Calculate Financial Health Score
```sql
CREATE OR REPLACE FUNCTION calculate_financial_health(p_user_id INTEGER)
RETURNS TABLE (
    score INTEGER,
    savings_rate DECIMAL,
    spending_ratio DECIMAL,
    emergency_fund_months DECIMAL,
    goals_progress DECIMAL
) AS $$
DECLARE
    v_income DECIMAL;
    v_expense DECIMAL;
    v_savings DECIMAL;
    v_score INTEGER := 0;
    v_savings_rate DECIMAL := 0;
    v_spending_ratio DECIMAL := 0;
    v_emergency_months DECIMAL := 0;
    v_goals_avg DECIMAL := 0;
BEGIN
    -- Get monthly income and expense
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO v_income, v_expense
    FROM transactions 
    WHERE user_id = p_user_id 
    AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE);
    
    -- Calculate savings
    v_savings := v_income - v_expense;
    
    -- Savings Rate (0-30 points)
    IF v_income > 0 THEN
        v_savings_rate := (v_savings / v_income) * 100;
        IF v_savings_rate >= 30 THEN v_score := v_score + 30;
        ELSIF v_savings_rate >= 20 THEN v_score := v_score + 25;
        ELSIF v_savings_rate >= 10 THEN v_score := v_score + 15;
        ELSE v_score := v_score + GREATEST(0, v_savings_rate::INTEGER);
        END IF;
    END IF;
    
    -- Spending Ratio (0-25 points)
    IF v_income > 0 THEN
        v_spending_ratio := (v_expense / v_income) * 100;
        IF v_spending_ratio <= 50 THEN v_score := v_score + 25;
        ELSIF v_spending_ratio <= 70 THEN v_score := v_score + 20;
        ELSIF v_spending_ratio <= 90 THEN v_score := v_score + 10;
        ELSE v_score := v_score + 5;
        END IF;
    END IF;
    
    -- Emergency Fund (0-25 points)
    IF v_expense > 0 THEN
        SELECT COALESCE(SUM(balance), 0) / v_expense INTO v_emergency_months
        FROM wallets WHERE user_id = p_user_id AND is_active = TRUE;
        
        IF v_emergency_months >= 6 THEN v_score := v_score + 25;
        ELSIF v_emergency_months >= 3 THEN v_score := v_score + 20;
        ELSIF v_emergency_months >= 1 THEN v_score := v_score + 10;
        ELSE v_score := v_score + LEAST(10, (v_emergency_months * 10)::INTEGER);
        END IF;
    END IF;
    
    -- Goals Progress (0-20 points)
    SELECT COALESCE(AVG((current_amount / target_amount) * 100), 0) INTO v_goals_avg
    FROM goals WHERE user_id = p_user_id AND status = 'in_progress';
    
    v_score := v_score + LEAST(20, (v_goals_avg / 5)::INTEGER);
    
    RETURN QUERY SELECT 
        LEAST(100, v_score),
        ROUND(v_savings_rate, 2),
        ROUND(v_spending_ratio, 2),
        ROUND(v_emergency_months, 2),
        ROUND(v_goals_avg, 2);
END;
$$ LANGUAGE plpgsql;
```

### 2. Process Recurring Transactions
```sql
CREATE OR REPLACE FUNCTION process_recurring_transactions()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT * FROM recurring_transactions 
        WHERE is_active = TRUE 
        AND next_execution_date <= CURRENT_DATE
    LOOP
        -- Insert transaction
        INSERT INTO transactions (
            user_id, wallet_id, category_id, type, amount, 
            description, transaction_date, is_recurring, recurring_id
        ) VALUES (
            rec.user_id, rec.wallet_id, rec.category_id, rec.type, rec.amount,
            rec.description, rec.next_execution_date, TRUE, rec.id
        );
        
        -- Update wallet balance
        UPDATE wallets SET 
            balance = balance + CASE WHEN rec.type = 'income' THEN rec.amount ELSE -rec.amount END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = rec.wallet_id;
        
        -- Calculate next execution date
        UPDATE recurring_transactions SET
            last_execution_date = next_execution_date,
            execution_count = execution_count + 1,
            next_execution_date = CASE rec.frequency
                WHEN 'daily' THEN next_execution_date + (rec.frequency_interval || ' days')::INTERVAL
                WHEN 'weekly' THEN next_execution_date + (rec.frequency_interval * 7 || ' days')::INTERVAL
                WHEN 'biweekly' THEN next_execution_date + '14 days'::INTERVAL
                WHEN 'monthly' THEN next_execution_date + (rec.frequency_interval || ' months')::INTERVAL
                WHEN 'yearly' THEN next_execution_date + (rec.frequency_interval || ' years')::INTERVAL
            END,
            -- Deactivate if end_date reached
            is_active = CASE 
                WHEN rec.end_date IS NOT NULL AND next_execution_date > rec.end_date THEN FALSE
                ELSE TRUE
            END
        WHERE id = rec.id;
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

### 3. Update Budget Spent Amount Trigger
```sql
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.type = 'expense' THEN
        UPDATE budgets SET
            spent_amount = spent_amount + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = NEW.category_id
        AND user_id = NEW.user_id
        AND NEW.transaction_date BETWEEN period_start AND period_end
        AND is_active = TRUE;
    ELSIF TG_OP = 'DELETE' AND OLD.type = 'expense' THEN
        UPDATE budgets SET
            spent_amount = spent_amount - OLD.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = OLD.category_id
        AND user_id = OLD.user_id
        AND OLD.transaction_date BETWEEN period_start AND period_end
        AND is_active = TRUE;
    ELSIF TG_OP = 'UPDATE' AND OLD.type = 'expense' THEN
        -- Remove old amount
        UPDATE budgets SET spent_amount = spent_amount - OLD.amount
        WHERE category_id = OLD.category_id AND user_id = OLD.user_id
        AND OLD.transaction_date BETWEEN period_start AND period_end AND is_active = TRUE;
        -- Add new amount
        IF NEW.type = 'expense' THEN
            UPDATE budgets SET spent_amount = spent_amount + NEW.amount
            WHERE category_id = NEW.category_id AND user_id = NEW.user_id
            AND NEW.transaction_date BETWEEN period_start AND period_end AND is_active = TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_spent
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_budget_spent();
```

---

## 🔐 Security Considerations

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY user_wallets_policy ON wallets
    FOR ALL USING (user_id = current_setting('app.current_user_id')::INTEGER);

CREATE POLICY user_transactions_policy ON transactions
    FOR ALL USING (user_id = current_setting('app.current_user_id')::INTEGER);

CREATE POLICY user_budgets_policy ON budgets
    FOR ALL USING (user_id = current_setting('app.current_user_id')::INTEGER);

CREATE POLICY user_goals_policy ON goals
    FOR ALL USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

---

## 📝 Data Types & Constraints Summary

| Field Type | PostgreSQL Type | Notes |
|------------|-----------------|-------|
| Primary Key | SERIAL | Auto-increment |
| Foreign Key | INTEGER | With REFERENCES |
| Money | DECIMAL(15, 2) | Supports up to 999 trillion |
| Percentage | DECIMAL(5, 2) | 0.00 - 100.00 |
| Score | INTEGER | 0 - 100 |
| Email | VARCHAR(255) | With UNIQUE constraint |
| Names | VARCHAR(100-255) | Depends on use case |
| Colors | VARCHAR(7) | Hex format #RRGGBB |
| Dates | DATE | YYYY-MM-DD |
| Timestamps | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| JSON Data | JSONB | For flexible structures |
| Boolean | BOOLEAN | DEFAULT FALSE |

---

## 🚀 Next Steps

1. **Implementasi Database**
   - Setup PostgreSQL database
   - Run migration scripts
   - Seed default categories

2. **Backend Development**
   - Create RESTful API endpoints
   - Implement authentication (JWT)
   - Create service layer untuk business logic

3. **Frontend Integration**
   - Connect existing frontend dengan API
   - Replace localStorage dengan API calls
   - Implement real-time updates

4. **AI Features**
   - Implement financial health calculation
   - Build insight generation engine
   - Create recommendation algorithms

---

*Document Version: 1.0*
*Created: December 2024*
*Project: FINSIGHT - Personal Financial Dashboard*
