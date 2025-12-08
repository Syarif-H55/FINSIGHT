-- ============================================================
-- FINSIGHT Database Migration Script - MySQL Version
-- Version: 1.0
-- Description: Complete database schema for FINSIGHT
-- Personal Financial Dashboard with AI-Powered Insights
-- Compatible with: MySQL 8.0+ / MariaDB 10.4+
-- ============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS finsight 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE finsight;

-- ============================================================
-- Disable Foreign Key Checks for Clean Migration
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if exist (for development only)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS export_history;
DROP TABLE IF EXISTS import_history;
DROP TABLE IF EXISTS financial_health_logs;
DROP TABLE IF EXISTS ai_insights;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS wallet_budgets;
DROP TABLE IF EXISTS wallet_transfers;
DROP TABLE IF EXISTS goal_contributions;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS recurring_transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    phone VARCHAR(20) NULL,
    is_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    last_login_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. USER SETTINGS TABLE
-- ============================================================
CREATE TABLE user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light' COMMENT 'light, dark, auto',
    currency VARCHAR(10) DEFAULT 'IDR',
    language VARCHAR(10) DEFAULT 'id',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    notification_email TINYINT(1) DEFAULT 1,
    notification_push TINYINT(1) DEFAULT 1,
    notification_budget_alert TINYINT(1) DEFAULT 1,
    notification_goal_reminder TINYINT(1) DEFAULT 1,
    notification_bill_reminder TINYINT(1) DEFAULT 1,
    risk_appetite VARCHAR(20) DEFAULT 'moderate' COMMENT 'conservative, moderate, aggressive',
    financial_profile JSON NULL,
    dashboard_widgets JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_settings_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. WALLETS TABLE
-- ============================================================
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('bank', 'ewallet', 'cash', 'investment', 'other') NOT NULL,
    provider VARCHAR(50) NULL COMMENT 'BCA, Mandiri, GoPay, OVO, dll',
    account_number VARCHAR(50) NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    color VARCHAR(7) DEFAULT '#6366F1' COMMENT 'Hex color',
    icon VARCHAR(50) NULL,
    notes TEXT NULL,
    is_active TINYINT(1) DEFAULT 1,
    is_default TINYINT(1) DEFAULT 0,
    last_synced_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallets_user_id (user_id),
    INDEX idx_wallets_type (type),
    INDEX idx_wallets_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'NULL for default system categories',
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    parent_id INT NULL COMMENT 'For sub-categories',
    is_default TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_categories_user_id (user_id),
    INDEX idx_categories_type (type),
    INDEX idx_categories_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. RECURRING TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE recurring_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NULL,
    category_id INT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NULL,
    notes TEXT NULL,
    frequency ENUM('daily', 'weekly', 'biweekly', 'monthly', 'yearly') NOT NULL,
    frequency_interval INT DEFAULT 1 COMMENT 'Every X periods',
    day_of_week TINYINT NULL COMMENT '0-6, 0=Sunday',
    day_of_month TINYINT NULL COMMENT '1-31',
    month_of_year TINYINT NULL COMMENT '1-12',
    start_date DATE NOT NULL,
    end_date DATE NULL COMMENT 'NULL = no end date',
    next_execution_date DATE NOT NULL,
    last_execution_date DATE NULL,
    execution_count INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_recurring_user_id (user_id),
    INDEX idx_recurring_next_execution (next_execution_date),
    INDEX idx_recurring_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NULL,
    category_id INT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NULL,
    transaction_date DATE NOT NULL,
    notes TEXT NULL,
    attachment_url VARCHAR(500) NULL,
    is_recurring TINYINT(1) DEFAULT 0,
    recurring_id INT NULL,
    location VARCHAR(255) NULL,
    tags JSON NULL COMMENT 'Array of tags',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (recurring_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL,
    INDEX idx_transactions_user_id (user_id),
    INDEX idx_transactions_wallet_id (wallet_id),
    INDEX idx_transactions_category_id (category_id),
    INDEX idx_transactions_type (type),
    INDEX idx_transactions_date (transaction_date),
    INDEX idx_transactions_user_date (user_id, transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. BUDGETS TABLE
-- ============================================================
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    name VARCHAR(100) NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    period ENUM('weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'monthly',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alert_threshold INT DEFAULT 80 COMMENT 'Percentage for warning',
    notes TEXT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_budgets_user_id (user_id),
    INDEX idx_budgets_category_id (category_id),
    INDEX idx_budgets_period (period_start, period_end),
    INDEX idx_budgets_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. GOALS TABLE
-- ============================================================
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('emergency', 'vacation', 'investment', 'house', 'car', 'education', 'wedding', 'business', 'gadget', 'other') NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    notes TEXT NULL,
    icon VARCHAR(50) NULL,
    color VARCHAR(7) NULL,
    status ENUM('in_progress', 'completed', 'overdue', 'cancelled') DEFAULT 'in_progress',
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user_id (user_id),
    INDEX idx_goals_status (status),
    INDEX idx_goals_target_date (target_date),
    INDEX idx_goals_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. GOAL CONTRIBUTIONS TABLE
-- ============================================================
CREATE TABLE goal_contributions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goal_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    notes VARCHAR(255) NULL,
    source_wallet_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (source_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    INDEX idx_goal_contrib_goal_id (goal_id),
    INDEX idx_goal_contrib_date (contribution_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. WALLET TRANSFERS TABLE
-- ============================================================
CREATE TABLE wallet_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    from_wallet_id INT NULL,
    to_wallet_id INT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    notes VARCHAR(255) NULL,
    transfer_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    FOREIGN KEY (to_wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    INDEX idx_wallet_transfers_user_id (user_id),
    INDEX idx_wallet_transfers_from (from_wallet_id),
    INDEX idx_wallet_transfers_to (to_wallet_id),
    INDEX idx_wallet_transfers_date (transfer_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. WALLET BUDGETS TABLE
-- ============================================================
CREATE TABLE wallet_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0.00,
    alert_threshold INT DEFAULT 80,
    categories JSON NULL COMMENT 'Array of category_ids',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    INDEX idx_wallet_budgets_wallet_id (wallet_id),
    INDEX idx_wallet_budgets_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('budget_warning', 'budget_exceeded', 'goal_reminder', 'goal_achieved', 'bill_reminder', 'insight', 'system') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(50) NULL,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    action_url VARCHAR(500) NULL,
    related_entity_type VARCHAR(50) NULL,
    related_entity_id INT NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at DATETIME NULL,
    expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. AI INSIGHTS TABLE
-- ============================================================
CREATE TABLE ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('spending_pattern', 'savings_opportunity', 'budget_recommendation', 'goal_insight', 'risk_warning', 'general_tip') NOT NULL,
    category VARCHAR(50) NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
    data_context JSON NULL COMMENT 'Data used to generate insight',
    is_dismissed TINYINT(1) DEFAULT 0,
    dismissed_at DATETIME NULL,
    is_actionable TINYINT(1) DEFAULT 1,
    action_type VARCHAR(50) NULL,
    action_data JSON NULL,
    confidence_score DECIMAL(3, 2) NULL COMMENT '0.00 - 1.00',
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ai_insights_user_id (user_id),
    INDEX idx_ai_insights_type (type),
    INDEX idx_ai_insights_is_dismissed (is_dismissed),
    INDEX idx_ai_insights_generated (generated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. FINANCIAL HEALTH LOGS TABLE
-- ============================================================
CREATE TABLE financial_health_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score INT NOT NULL COMMENT '0-100',
    savings_rate DECIMAL(5, 2) NULL,
    spending_ratio DECIMAL(5, 2) NULL,
    debt_ratio DECIMAL(5, 2) NULL,
    emergency_fund_months DECIMAL(4, 2) NULL,
    goals_progress DECIMAL(5, 2) NULL,
    total_income DECIMAL(15, 2) NULL,
    total_expense DECIMAL(15, 2) NULL,
    total_savings DECIMAL(15, 2) NULL,
    breakdown JSON NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_health_logs_user_id (user_id),
    INDEX idx_health_logs_calculated (calculated_at DESC),
    INDEX idx_health_logs_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. IMPORT HISTORY TABLE
-- ============================================================
CREATE TABLE import_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size INT NULL,
    source VARCHAR(50) NULL COMMENT 'bank_bca, gopay, manual, etc',
    total_rows INT NULL,
    success_rows INT NULL,
    failed_rows INT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_details JSON NULL,
    wallet_id INT NULL,
    imported_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL,
    INDEX idx_import_history_user_id (user_id),
    INDEX idx_import_history_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. EXPORT HISTORY TABLE
-- ============================================================
CREATE TABLE export_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    export_type ENUM('csv', 'excel', 'pdf') NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    filename VARCHAR(255) NULL,
    file_url VARCHAR(500) NULL,
    filters JSON NULL,
    date_range_start DATE NULL,
    date_range_end DATE NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    file_size INT NULL,
    expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_export_history_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL COMMENT 'create, update, delete, login, logout',
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_entity (entity_type, entity_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT DEFAULT CATEGORIES
-- ============================================================
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
-- Expense Categories
(NULL, 'Makanan & Minuman', 'expense', 'utensils', '#EF4444', 1),
(NULL, 'Transportasi', 'expense', 'car', '#F59E0B', 1),
(NULL, 'Belanja', 'expense', 'shopping-bag', '#EC4899', 1),
(NULL, 'Tagihan', 'expense', 'file-text', '#8B5CF6', 1),
(NULL, 'Hiburan', 'expense', 'film', '#06B6D4', 1),
(NULL, 'Kesehatan', 'expense', 'heart', '#10B981', 1),
(NULL, 'Pendidikan', 'expense', 'book', '#3B82F6', 1),
(NULL, 'Lainnya', 'expense', 'more-horizontal', '#6B7280', 1),
-- Income Categories
(NULL, 'Gaji', 'income', 'briefcase', '#22C55E', 1),
(NULL, 'Bonus', 'income', 'gift', '#14B8A6', 1),
(NULL, 'Investasi', 'income', 'trending-up', '#6366F1', 1),
(NULL, 'Freelance', 'income', 'laptop', '#8B5CF6', 1),
(NULL, 'Lainnya', 'income', 'plus-circle', '#6B7280', 1);

-- ============================================================
-- INSERT DEMO USER (Password: password123)
-- ============================================================
INSERT INTO users (email, password_hash, fullname, is_verified, is_active) VALUES
('demo@finsight.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 1, 1);

-- Insert default settings for demo user
INSERT INTO user_settings (user_id, theme, currency, language) VALUES
(1, 'light', 'IDR', 'id');

-- ============================================================
-- VIEWS
-- ============================================================

-- Monthly Cash Flow View
CREATE OR REPLACE VIEW v_monthly_cash_flow AS
SELECT 
    user_id,
    DATE_FORMAT(transaction_date, '%Y-%m-01') AS month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_flow
FROM transactions
GROUP BY user_id, DATE_FORMAT(transaction_date, '%Y-%m-01')
ORDER BY month DESC;

-- Budget Progress View
CREATE OR REPLACE VIEW v_budget_progress AS
SELECT 
    b.id,
    b.user_id,
    b.name,
    c.name AS category_name,
    b.allocated_amount,
    COALESCE(SUM(t.amount), 0) AS actual_spent,
    b.allocated_amount - COALESCE(SUM(t.amount), 0) AS remaining_amount,
    ROUND((COALESCE(SUM(t.amount), 0) / b.allocated_amount * 100), 2) AS percentage_used,
    b.alert_threshold,
    CASE 
        WHEN COALESCE(SUM(t.amount), 0) >= b.allocated_amount THEN 'exceeded'
        WHEN COALESCE(SUM(t.amount), 0) >= b.allocated_amount * (b.alert_threshold / 100.0) THEN 'warning'
        ELSE 'on_track'
    END AS status,
    b.period_start,
    b.period_end
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN transactions t ON t.category_id = b.category_id 
    AND t.user_id = b.user_id 
    AND t.type = 'expense'
    AND t.transaction_date BETWEEN b.period_start AND b.period_end
WHERE b.is_active = 1
GROUP BY b.id, b.user_id, b.name, c.name, b.allocated_amount, b.alert_threshold, b.period_start, b.period_end;

-- Goals Progress View
CREATE OR REPLACE VIEW v_goals_progress AS
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
    DATEDIFF(g.target_date, CURDATE()) AS days_remaining,
    CASE 
        WHEN g.current_amount >= g.target_amount THEN 'completed'
        WHEN g.target_date < CURDATE() THEN 'overdue'
        WHEN DATEDIFF(g.target_date, CURDATE()) <= 30 THEN 'soon'
        ELSE 'on_track'
    END AS calculated_status,
    CASE 
        WHEN DATEDIFF(g.target_date, CURDATE()) > 0 
        THEN ROUND((g.target_amount - g.current_amount) / GREATEST(1, CEIL(DATEDIFF(g.target_date, CURDATE()) / 30)), 2)
        ELSE 0
    END AS monthly_saving_needed,
    g.priority,
    g.status
FROM goals g
WHERE g.status != 'cancelled';

-- Wallet Summary View
CREATE OR REPLACE VIEW v_wallet_summary AS
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

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Update wallet balance on transaction insert
DELIMITER //

CREATE TRIGGER trg_transaction_insert_balance
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    UPDATE wallets SET 
        balance = balance + CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END
    WHERE id = NEW.wallet_id;
END//

-- Trigger: Update wallet balance on transaction delete
CREATE TRIGGER trg_transaction_delete_balance
AFTER DELETE ON transactions
FOR EACH ROW
BEGIN
    UPDATE wallets SET 
        balance = balance - CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END
    WHERE id = OLD.wallet_id;
END//

-- Trigger: Update wallet balance on transaction update
CREATE TRIGGER trg_transaction_update_balance
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    -- Revert old amount
    UPDATE wallets SET 
        balance = balance - CASE WHEN OLD.type = 'income' THEN OLD.amount ELSE -OLD.amount END
    WHERE id = OLD.wallet_id;
    
    -- Apply new amount
    UPDATE wallets SET 
        balance = balance + CASE WHEN NEW.type = 'income' THEN NEW.amount ELSE -NEW.amount END
    WHERE id = NEW.wallet_id;
END//

-- Trigger: Update goal current_amount on contribution insert
CREATE TRIGGER trg_goal_contribution_insert
AFTER INSERT ON goal_contributions
FOR EACH ROW
BEGIN
    UPDATE goals SET 
        current_amount = current_amount + NEW.amount,
        status = CASE 
            WHEN current_amount + NEW.amount >= target_amount THEN 'completed'
            ELSE status
        END,
        completed_at = CASE 
            WHEN current_amount + NEW.amount >= target_amount THEN NOW()
            ELSE completed_at
        END
    WHERE id = NEW.goal_id;
END//

-- Trigger: Update goal current_amount on contribution delete
CREATE TRIGGER trg_goal_contribution_delete
AFTER DELETE ON goal_contributions
FOR EACH ROW
BEGIN
    UPDATE goals SET 
        current_amount = current_amount - OLD.amount,
        status = CASE 
            WHEN current_amount - OLD.amount < target_amount AND status = 'completed' THEN 'in_progress'
            ELSE status
        END
    WHERE id = OLD.goal_id;
END//

DELIMITER ;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Procedure: Calculate Financial Health Score
CREATE PROCEDURE sp_calculate_financial_health(IN p_user_id INT)
BEGIN
    DECLARE v_income DECIMAL(15,2) DEFAULT 0;
    DECLARE v_expense DECIMAL(15,2) DEFAULT 0;
    DECLARE v_savings DECIMAL(15,2) DEFAULT 0;
    DECLARE v_total_balance DECIMAL(15,2) DEFAULT 0;
    DECLARE v_score INT DEFAULT 0;
    DECLARE v_savings_rate DECIMAL(5,2) DEFAULT 0;
    DECLARE v_spending_ratio DECIMAL(5,2) DEFAULT 0;
    DECLARE v_emergency_months DECIMAL(4,2) DEFAULT 0;
    DECLARE v_goals_avg DECIMAL(5,2) DEFAULT 0;
    
    -- Get monthly income and expense
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
    INTO v_income, v_expense
    FROM transactions 
    WHERE user_id = p_user_id 
    AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01');
    
    -- Get total wallet balance
    SELECT COALESCE(SUM(balance), 0) INTO v_total_balance
    FROM wallets WHERE user_id = p_user_id AND is_active = 1;
    
    -- Calculate savings
    SET v_savings = v_income - v_expense;
    
    -- Savings Rate (0-30 points)
    IF v_income > 0 THEN
        SET v_savings_rate = (v_savings / v_income) * 100;
        IF v_savings_rate >= 30 THEN SET v_score = v_score + 30;
        ELSEIF v_savings_rate >= 20 THEN SET v_score = v_score + 25;
        ELSEIF v_savings_rate >= 10 THEN SET v_score = v_score + 15;
        ELSE SET v_score = v_score + GREATEST(0, FLOOR(v_savings_rate));
        END IF;
    END IF;
    
    -- Spending Ratio (0-25 points)
    IF v_income > 0 THEN
        SET v_spending_ratio = (v_expense / v_income) * 100;
        IF v_spending_ratio <= 50 THEN SET v_score = v_score + 25;
        ELSEIF v_spending_ratio <= 70 THEN SET v_score = v_score + 20;
        ELSEIF v_spending_ratio <= 90 THEN SET v_score = v_score + 10;
        ELSE SET v_score = v_score + 5;
        END IF;
    END IF;
    
    -- Emergency Fund (0-25 points)
    IF v_expense > 0 THEN
        SET v_emergency_months = v_total_balance / v_expense;
        IF v_emergency_months >= 6 THEN SET v_score = v_score + 25;
        ELSEIF v_emergency_months >= 3 THEN SET v_score = v_score + 20;
        ELSEIF v_emergency_months >= 1 THEN SET v_score = v_score + 10;
        ELSE SET v_score = v_score + LEAST(10, FLOOR(v_emergency_months * 10));
        END IF;
    END IF;
    
    -- Goals Progress (0-20 points)
    SELECT COALESCE(AVG((current_amount / target_amount) * 100), 0) INTO v_goals_avg
    FROM goals WHERE user_id = p_user_id AND status = 'in_progress';
    
    SET v_score = v_score + LEAST(20, FLOOR(v_goals_avg / 5));
    
    -- Insert to log
    INSERT INTO financial_health_logs (
        user_id, score, savings_rate, spending_ratio, 
        emergency_fund_months, goals_progress,
        total_income, total_expense, total_savings,
        period_start, period_end
    ) VALUES (
        p_user_id, LEAST(100, v_score), ROUND(v_savings_rate, 2), ROUND(v_spending_ratio, 2),
        ROUND(v_emergency_months, 2), ROUND(v_goals_avg, 2),
        v_income, v_expense, v_savings,
        DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE())
    );
    
    -- Return result
    SELECT 
        LEAST(100, v_score) AS score,
        ROUND(v_savings_rate, 2) AS savings_rate,
        ROUND(v_spending_ratio, 2) AS spending_ratio,
        ROUND(v_emergency_months, 2) AS emergency_fund_months,
        ROUND(v_goals_avg, 2) AS goals_progress,
        v_income AS total_income,
        v_expense AS total_expense,
        v_savings AS total_savings;
END//

-- Procedure: Process Recurring Transactions
CREATE PROCEDURE sp_process_recurring_transactions()
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_id INT;
    DECLARE v_user_id INT;
    DECLARE v_wallet_id INT;
    DECLARE v_category_id INT;
    DECLARE v_type VARCHAR(20);
    DECLARE v_amount DECIMAL(15,2);
    DECLARE v_description VARCHAR(255);
    DECLARE v_notes TEXT;
    DECLARE v_frequency VARCHAR(20);
    DECLARE v_frequency_interval INT;
    DECLARE v_next_date DATE;
    DECLARE v_end_date DATE;
    
    DECLARE cur CURSOR FOR 
        SELECT id, user_id, wallet_id, category_id, type, amount, 
               description, notes, frequency, frequency_interval, 
               next_execution_date, end_date
        FROM recurring_transactions 
        WHERE is_active = 1 
        AND next_execution_date <= CURDATE()
        AND (end_date IS NULL OR next_execution_date <= end_date);
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_id, v_user_id, v_wallet_id, v_category_id, v_type, 
                       v_amount, v_description, v_notes, v_frequency, 
                       v_frequency_interval, v_next_date, v_end_date;
        
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        -- Insert transaction
        INSERT INTO transactions (
            user_id, wallet_id, category_id, type, amount, 
            description, transaction_date, is_recurring, recurring_id, notes
        ) VALUES (
            v_user_id, v_wallet_id, v_category_id, v_type, v_amount,
            v_description, v_next_date, 1, v_id, v_notes
        );
        
        -- Calculate next execution date
        SET v_next_date = CASE v_frequency
            WHEN 'daily' THEN DATE_ADD(v_next_date, INTERVAL v_frequency_interval DAY)
            WHEN 'weekly' THEN DATE_ADD(v_next_date, INTERVAL (v_frequency_interval * 7) DAY)
            WHEN 'biweekly' THEN DATE_ADD(v_next_date, INTERVAL 14 DAY)
            WHEN 'monthly' THEN DATE_ADD(v_next_date, INTERVAL v_frequency_interval MONTH)
            WHEN 'yearly' THEN DATE_ADD(v_next_date, INTERVAL v_frequency_interval YEAR)
        END;
        
        -- Update recurring transaction
        UPDATE recurring_transactions SET
            last_execution_date = next_execution_date,
            execution_count = execution_count + 1,
            next_execution_date = v_next_date,
            is_active = CASE 
                WHEN v_end_date IS NOT NULL AND v_next_date > v_end_date THEN 0
                ELSE 1
            END
        WHERE id = v_id;
        
        SET v_count = v_count + 1;
    END LOOP;
    
    CLOSE cur;
    
    SELECT v_count AS processed_count;
END//

DELIMITER ;

-- ============================================================
-- COMPLETED
-- ============================================================
-- Run this script in phpMyAdmin:
-- 1. Open phpMyAdmin
-- 2. Click "Import" tab
-- 3. Choose this file
-- 4. Click "Go"
-- 
-- Or via command line:
-- mysql -u root -p < finsight_mysql.sql
-- ============================================================
