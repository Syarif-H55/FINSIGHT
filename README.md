# FINSIGHT 🚀

**FINSIGHT** is a modern, AI-powered personal finance dashboard designed to help users track their financial health with ease. It features multi-wallet management, transaction recording, budgeting, and a comprehensive dashboard.

## 🛠️ Technology Stack

*   **Backend**: Native PHP 8.1 (RESTful API, MVC Architecture)
*   **Database**: MySQL 8.0
*   **Frontend**: HTML5, Vanilla JavaScript, Bootstrap 5
*   **Infrastructure**: Docker & Docker Compose
*   **Security**: JWT Authentication, Password Hashing

## ✨ Features Implemented

### Phase 1: Foundation
*   ✅ **User Authentication**: Secure Register & Login using JWT.
*   ✅ **Project Structure**: Modular Backend (MVC) and Frontend separation.
*   ✅ **Database Schema**: Optimized tables for Users, Wallets, Transactions, and Budgets.

### Phase 2: Core Features
*   ✅ **Dashboard**: Real-time summary of Total Balance, Income vs Expense, and Budget Monitoring.
*   ✅ **Wallets Management**: Create, Edit, and Delete wallets (Bank, E-Wallet, Cash).
*   ✅ **Transactions**: Record Income and Expenses with automatic balance updates (ACID compliant).
*   ✅ **Budget System**: Set monthly spending limits per category and monitor progress via visual bars.

### Phase 3: AI Integration (Coming Soon)
*   🤖 **Financial Advisor**: AI-powered chat interface to analyze spending habits and provide recommendations.

## 🚀 Getting Started

### Prerequisites
*   Docker Desktop installed and running.

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/HilmanAlDwinov/FINSIGHT.git
    cd FINSIGHT
    ```

2.  **Setup Environment**
    Ensure the `.env` file is present (or copy from `.env.example` if available).
    ```env
    DB_HOST=mysql
    DB_NAME=finsight_db
    DB_USER=finsight_user
    DB_PASSWORD=finsight_pass
    JWT_SECRET=your_secret_key
    OPENAI_API_KEY=your_openai_key
    ```

3.  **Run with Docker**
    ```bash
    docker-compose up --build -d
    ```

4.  **Access the Application**
    *   **Frontend**: [http://localhost:8000/frontend/pages/login.html](http://localhost:8000/frontend/pages/login.html)
    *   **Backend API**: [http://localhost:8000/backend/index.php](http://localhost:8000/backend/index.php)
    *   **Database (phpMyAdmin)**: [http://localhost:8081](http://localhost:8081)

## 📂 Project Structure

```
FINSIGHT/
├── src/
│   ├── backend/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Logic (Auth, Wallet, Transaction, Budget)
│   │   ├── models/         # Database interactions
│   │   ├── middleware/     # JWT Auth protection
│   │   └── index.php       # Main API Router
│   ├── frontend/
│   │   ├── css/            # Styles
│   │   ├── js/             # API client & Page logic
│   │   └── pages/          # HTML Views (Login, Dashboard, Wallets...)
│   └── database/           # SQL Migrations & Seeds
├── docker-compose.yml
└── Dockerfile
```

## 🤝 Contribution
Developed by **Hilman Al Dwinov** & **Google DeepMind Antigravity**.
