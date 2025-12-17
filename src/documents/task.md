# FINSIGHT Project Tasks

Based on PRD v1.0 (Dec 17, 2024).

## Phase 1: Foundation (Week 1)
- [ ] **Project Setup**
    - [ ] Configure `docker-compose.yml` (PHP, MySQL, phpMyAdmin)
    - [ ] Create `Dockerfile` for PHP environment
    - [ ] Setup `.env` configuration
    - [ ] Verify Docker container communication

- [ ] **Database Implementation**
    - [ ] Create `migrations.sql` with all tables (Users, Wallets, Transactions, etc.)
    - [ ] Create `seeds.sql` with default categories and sample data
    - [ ] Implement `Database` class (Singleton/Connection)

- [ ] **Authentication Module**
    - [ ] Implement `User` model
    - [ ] Implement `AuthController` (Register, Login, Profile)
    - [ ] Implement JWT Middleware (`AuthMiddleware`)
    - [ ] Frontend: Login Page (`login.html` + `auth.js`)
    - [ ] Frontend: Register Page (`register.html`)

- [ ] **Core CRUD (Transactions & Wallets)**
    - [ ] Implement `WalletController` (CRUD + Transfer)
    - [ ] Implement `TransactionController` (CRUD with wallet balance update)
    - [ ] Frontend: Wallet UI (`wallets.html`)
    - [ ] Frontend: Transaction UI (`transactions.html`)

## Phase 2: Core Features (Week 2)
- [ ] **Budget Management**
    - [ ] Implement `BudgetController`
    - [ ] Logic for budget status (Active/Warning/Over)
    - [ ] Frontend: Budget UI (`budgets.html`)

- [ ] **Dashboard & Analytics**
    - [ ] Implement `DashboardController`
    - [ ] Calculate Financial Health Score
    - [ ] Backend: Monthly Cash Flow aggregation
    - [ ] Frontend: Dashboard UI with Charts (`dashboard.html`)

- [ ] **Rule-Based Insights**
    - [ ] Implement `InsightController` (Analysis Algorithms)
    - [ ] Frontend: Insights Page (`insights.html`)

## Phase 3: AI Integration (Week 2-3)
- [ ] **AI Advisor**
    - [ ] Implement `AIController` (OpenAI CLI/cURL)
    - [ ] Prompt Engineering (Context construction)
    - [ ] Frontend: Chat UI (`ai-chat.html`)

## Phase 4: Polish & Deployment (Week 3)
- [ ] **Refinement**
    - [ ] Final UI/UX Polish (Consistency, Animations)
    - [ ] Mobile Responsiveness Checks
    - [ ] Comprehensive System Testing
