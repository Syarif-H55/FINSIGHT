-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    dark_mode BOOLEAN DEFAULT FALSE,
    currency VARCHAR(10) DEFAULT 'IDR',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    monthly_income DECIMAL(15, 2) DEFAULT 0,
    average_expense DECIMAL(15, 2) DEFAULT 0,
    risk_appetite ENUM('low', 'moderate', 'high') DEFAULT 'moderate',
    financial_goals TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    wallet_name VARCHAR(50) NOT NULL,
    type ENUM('cash', 'bank', 'ewallet') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- NULL for default categories
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    icon VARCHAR(50) DEFAULT 'default-icon',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type ENUM('income', 'expense') NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    budget_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    wallet_id INT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE SET NULL
);

-- Wallet Transfers Table
CREATE TABLE IF NOT EXISTS wallet_transfers (
    transfer_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    from_wallet_id INT NOT NULL,
    to_wallet_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (from_wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE,
    FOREIGN KEY (to_wallet_id) REFERENCES wallets(wallet_id) ON DELETE CASCADE
);
